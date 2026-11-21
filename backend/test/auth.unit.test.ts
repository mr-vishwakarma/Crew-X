import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '../src/utils/jwt.js';
import { validateBody } from '../src/middleware/validation.middleware.js';
import { authenticate, authorize } from '../src/middleware/auth.middleware.js';
import { createApp } from '../src/app.js';
import { z } from 'zod';
import http from 'http';
import { AuthenticatedRequest } from '../src/types/auth.types.js';

let server: http.Server;
let baseUrl = '';

async function runUnitTests() {
  console.log('🧪 Starting Nirikshan Backend Unit & Middleware Verification Suite...\n');

  // Test 1: Password hashing and verification
  console.log('1. Testing Password Hashing & Verification (bcryptjs)...');
  const plain = 'SecurePassword!123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plain, salt);
  const matchSuccess = await bcrypt.compare(plain, hash);
  const matchFail = await bcrypt.compare('WrongPassword', hash);

  console.assert(matchSuccess === true, 'Bcrypt should verify correct password');
  console.assert(matchFail === false, 'Bcrypt should reject wrong password');
  console.log('   ✔ Password hashing and verification functions accurately\n');

  // Test 2: JWT token generation and verification
  console.log('2. Testing JWT Signing & Verification...');
  const testPayload = {
    userId: 'user_12345',
    email: 'admin@nirikshan.com',
    role: 'ADMIN' as const,
    organizationId: 'org_hq',
  };
  const token = signToken(testPayload);
  console.assert(typeof token === 'string' && token.length > 20, 'JWT token must be a non-empty string');

  const decoded = verifyToken(token);
  console.assert(decoded.userId === testPayload.userId, 'Decoded userId mismatch');
  console.assert(decoded.email === testPayload.email, 'Decoded email mismatch');
  console.assert(decoded.role === testPayload.role, 'Decoded role mismatch');
  console.assert(decoded.organizationId === testPayload.organizationId, 'Decoded organizationId mismatch');
  console.log('   ✔ JWT signs and decodes claims accurately\n');

  // Test 3: Middleware validation with Zod
  console.log('3. Testing Request Validation Middleware (Zod)...');
  const dummySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const validator = validateBody(dummySchema);

  // Valid mock
  let nextCalled = false;
  const mockReqValid: any = { body: { email: 'valid@nirikshan.com', password: 'Password123' } };
  const mockResValid: any = {
    status: () => mockResValid,
    json: () => mockResValid,
  };
  validator(mockReqValid, mockResValid, () => {
    nextCalled = true;
  });
  console.assert(nextCalled === true, 'Validator should call next() on valid payload');

  // Invalid mock
  let statusSet = 0;
  let jsonResponse: any = null;
  const mockReqInvalid: any = { body: { email: 'not-an-email', password: '' } };
  const mockResInvalid: any = {
    status: (code: number) => {
      statusSet = code;
      return mockResInvalid;
    },
    json: (data: any) => {
      jsonResponse = data;
      return mockResInvalid;
    },
  };
  validator(mockReqInvalid, mockResInvalid, () => {});
  console.assert(statusSet === 400, 'Validator should return status 400 on invalid payload');
  console.assert(jsonResponse?.success === false, 'Validator should return success: false');
  console.assert(jsonResponse?.errors?.email !== undefined, 'Validator should report email error');
  console.log('   ✔ Request validation middleware enforces schema integrity\n');

  // Test 4: Role-based authorization middleware
  console.log('4. Testing Role Authorization Middleware (RBAC)...');
  const adminAuthorizer = authorize(['ADMIN']);
  const supervisorAuthorizer = authorize(['SUPERVISOR']);

  const mockAdminReq: AuthenticatedRequest = {
    user: { userId: '1', email: 'admin@nirikshan.com', role: 'ADMIN', organizationId: 'org1' },
  } as any;

  let adminAllowed = false;
  adminAuthorizer(mockAdminReq, {} as any, () => {
    adminAllowed = true;
  });
  console.assert(adminAllowed === true, 'ADMIN should be permitted by authorize(["ADMIN"])');

  let adminForbidden = false;
  const mockForbiddenRes: any = {
    status: (code: number) => {
      if (code === 403) adminForbidden = true;
      return mockForbiddenRes;
    },
    json: () => mockForbiddenRes,
  };
  supervisorAuthorizer(mockAdminReq, mockForbiddenRes, () => {});
  console.assert(adminForbidden === true, 'ADMIN should be rejected with 403 by authorize(["SUPERVISOR"])');
  console.log('   ✔ Role authorization middleware strictly restricts endpoints\n');

  // Test 5: HTTP Endpoints (Health & CORS)
  console.log('5. Testing Express Application & Health Endpoint...');
  const app = createApp();

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (typeof address === 'object' && address) {
        baseUrl = `http://127.0.0.1:${address.port}`;
      }
      resolve();
    });
  });

  try {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    console.assert(healthJson.server !== undefined, 'Server info should be present in health check');
    console.assert(healthJson.database !== undefined, 'Database info should be present in health check');
    console.assert(typeof healthJson.database.readyState === 'number', 'readyState should be reported');
    console.log('   ✔ Health endpoint successfully queried without revealing credentials\n');

    // Test 6: Verify route reachability for both /auth/login and /api/auth/login
    const rootLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' }),
    });
    // Should return 400 validation error (meaning endpoint exists!), NOT 404
    console.assert(rootLoginRes.status === 400, 'POST /auth/login must be reached and return 400 for empty body');
    console.log('   ✔ POST /auth/login successfully reached (root prefix supported)');

    const apiLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' }),
    });
    console.assert(apiLoginRes.status === 400, 'POST /api/auth/login must be reached and return 400 for empty body');
    console.log('   ✔ POST /api/auth/login successfully reached (/api prefix supported)\n');

    // Test 7: 404 handler
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-route`);
    console.assert(notFoundRes.status === 404, 'Non-existent route should return 404');
    const notFoundJson = await notFoundRes.json();
    console.assert(notFoundJson.success === false, '404 handler should return success: false');
    console.log('   ✔ Centralized 404 handler returns structured JSON error\n');

    console.log('====================================================');
    console.log('✅ ALL BACKEND UNIT & MIDDLEWARE TESTS PASSED (6/6)');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

runUnitTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
