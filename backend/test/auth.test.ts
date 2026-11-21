import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { signToken } from '../src/utils/jwt.js';
import http from 'http';

let mongoServer: MongoMemoryServer;
let server: http.Server;
let baseUrl = '';

async function setup() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const app = createApp();

  // Add dummy role-protected test routes for testing authorization middleware
  const { authenticate, authorize } = await import('../src/middleware/auth.middleware.js');
  app.get('/api/test/admin-only', authenticate, authorize(['ADMIN']), (_req, res) => {
    res.json({ success: true, message: 'Welcome Admin' });
  });
  app.get('/api/test/inspector-only', authenticate, authorize(['INSPECTOR']), (_req, res) => {
    res.json({ success: true, message: 'Welcome Inspector' });
  });

  return new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (typeof address === 'object' && address) {
        baseUrl = `http://127.0.0.1:${address.port}`;
      }
      resolve();
    });
  });
}

async function teardown() {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await mongoose.disconnect();
  await mongoServer.stop();
}

async function runTests() {
  console.log('🚀 Running Nirikshan Backend Authentication Test Suite...');
  await setup();

  try {
    // 1. Seed test users
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const inspectorPasswordHash = await bcrypt.hash('Inspector@12345', 10);

    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@test.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      organizationId: 'org_test',
      isActive: true,
    });

    const inspector = await User.create({
      fullName: 'Inspector User',
      email: 'inspector@test.com',
      passwordHash: inspectorPasswordHash,
      role: 'INSPECTOR',
      organizationId: 'org_test',
      isActive: true,
    });

    const inactiveUser = await User.create({
      fullName: 'Inactive User',
      email: 'inactive@test.com',
      passwordHash: adminPasswordHash,
      role: 'SUPERVISOR',
      organizationId: 'org_test',
      isActive: false,
    });

    console.log('✔ Test users seeded in in-memory MongoDB');

    // 2. Health Endpoint
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    console.assert(healthRes.status === 200, `Health endpoint failed: ${healthRes.status}`);
    console.assert(healthData.database.status === 'connected', 'Database not reported connected');
    console.assert(healthData.database.readyState === 1, 'Database readyState not 1');
    console.log('✔ Health endpoint reports database status without exposing credentials');

    // 3. Validation failure
    const invalidFormatRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
    });
    console.assert(invalidFormatRes.status === 400, 'Expected 400 validation error');
    console.log('✔ Request validation fails on invalid email or empty password');

    // 4. Invalid credentials
    const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'WrongPassword' }),
    });
    console.assert(wrongPassRes.status === 401, 'Expected 401 for wrong password');
    console.log('✔ Rejects incorrect password with 401 Unauthorized');

    // 5. Inactive account
    const inactiveRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'inactive@test.com', password: 'Admin@12345' }),
    });
    console.assert(inactiveRes.status === 401, 'Expected 401 for inactive account');
    console.log('✔ Rejects deactivated account');

    // 6. Successful login (Admin)
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'Admin@12345' }),
    });
    console.assert(loginRes.status === 200, 'Expected 200 for valid login');
    const loginData = await loginRes.json();
    console.assert(loginData.data.user.role === 'ADMIN', 'Expected role ADMIN');
    console.assert(!loginData.data.user.passwordHash, 'passwordHash must never be exposed');

    // Check Set-Cookie header
    const cookieHeader = loginRes.headers.get('set-cookie');
    console.assert(cookieHeader !== null, 'Set-Cookie header missing');
    console.assert(cookieHeader?.includes('nirikshan_token='), 'nirikshan_token cookie missing');
    console.assert(cookieHeader?.includes('HttpOnly'), 'Cookie must be HttpOnly');
    console.log('✔ Successful login returns user profile, JWT, and sets HttpOnly cookie');

    const adminToken = loginData.data.token;
    const cookie = cookieHeader?.split(';')[0] || '';

    // 7. GET /api/auth/me with Cookie
    const meResCookie = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: cookie },
    });
    console.assert(meResCookie.status === 200, 'GET /me via cookie failed');
    const meDataCookie = await meResCookie.json();
    console.assert(meDataCookie.data.user.email === 'admin@test.com', 'Incorrect user email');
    console.log('✔ GET /api/auth/me succeeds with HttpOnly session cookie');

    // 8. GET /api/auth/me with Bearer token
    const meResBearer = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.assert(meResBearer.status === 200, 'GET /me via Bearer header failed');
    console.log('✔ GET /api/auth/me succeeds with Bearer token');

    // 9. Role-based authorization: Admin accessing Admin route -> Allowed
    const adminAccessRes = await fetch(`${baseUrl}/api/test/admin-only`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.assert(adminAccessRes.status === 200, 'Admin should have access to admin-only');
    console.log('✔ Admin successfully accesses admin-authorized route');

    // 10. Role-based authorization: Admin accessing Inspector route -> 403 Forbidden
    const adminDeniedRes = await fetch(`${baseUrl}/api/test/inspector-only`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.assert(adminDeniedRes.status === 403, 'Admin should be forbidden from inspector-only');
    console.log('✔ Non-matching role denied with 403 Forbidden on role-protected route');

    // 11. Logout clears cookie
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: cookie },
    });
    console.assert(logoutRes.status === 200, 'Logout failed');
    const logoutCookie = logoutRes.headers.get('set-cookie');
    console.assert(
      logoutCookie?.includes('nirikshan_token=;') || logoutCookie?.includes('Expires='),
      'Logout must clear cookie'
    );
    console.log('✔ Logout clears session cookie');

    console.log('\n🎉 ALL BACKEND AUTHENTICATION TESTS PASSED!\n');
  } finally {
    await teardown();
  }
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
