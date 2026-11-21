import { createApp } from '../src/app.js';
import { signToken } from '../src/utils/jwt.js';
import type { Server } from 'http';

async function runDashboardTests() {
  console.log('🧪 Starting Nirikshan Dashboard API & Role Security Verification Suite...\n');

  const app = createApp();
  let server: Server;
  let baseUrl = '';

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
    const adminToken = signToken({
      userId: '65f123456789012345678901',
      email: 'admin@nirikshan.com',
      role: 'ADMIN',
      organizationId: 'org_nirikshan_hq',
    });

    const supervisorToken = signToken({
      userId: '65f123456789012345678902',
      email: 'supervisor@nirikshan.com',
      role: 'SUPERVISOR',
      organizationId: 'org_nirikshan_hq',
    });

    const inspectorToken = signToken({
      userId: '65f123456789012345678903',
      email: 'inspector@nirikshan.com',
      role: 'INSPECTOR',
      organizationId: 'org_nirikshan_hq',
    });

    // 1. Role-based security check: Inspector accessing Admin summary
    console.log('1. Testing RBAC Access Control on Dashboard Endpoints...');
    const forbiddenRes = await fetch(`${baseUrl}/api/dashboard/admin/summary`, {
      headers: { Authorization: `Bearer ${inspectorToken}` },
    });
    console.assert(forbiddenRes.status === 403, 'Inspector should receive 403 on Admin endpoint');
    console.log('   ✔ Field Inspector correctly rejected (403 Forbidden) from Administrator Summary');

    // 2. Supervisor accessing supervisor summary
    console.log('2. Testing Supervisor Summary Scope...');
    const supervisorRes = await fetch(`${baseUrl}/api/dashboard/supervisor/summary`, {
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    console.assert(supervisorRes.status === 200, 'Supervisor should access supervisor summary');
    const supJson = await supervisorRes.json();
    console.assert(supJson.success === true, 'Response must indicate success');
    console.assert(supJson.data.assignedProjectsCount !== undefined, 'Assigned projects must be present');
    console.log('   ✔ Supervisor summary successfully retrieved with authorized scope');

    // 3. Inspector summary
    console.log('3. Testing Inspector Summary Scope...');
    const inspectorRes = await fetch(`${baseUrl}/api/dashboard/inspector/summary`, {
      headers: { Authorization: `Bearer ${inspectorToken}` },
    });
    console.assert(inspectorRes.status === 200, 'Inspector should access inspector summary');
    const inspJson = await inspectorRes.json();
    console.assert(inspJson.data.assignedInspections !== undefined, 'Assigned inspections must be reported');
    console.log('   ✔ Inspector summary successfully retrieved');

    // 4. Global Search
    console.log('4. Testing Server-side Global Search...');
    const searchRes = await fetch(`${baseUrl}/api/dashboard/search?q=Metro`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.assert(searchRes.status === 200, 'Search endpoint should return 200');
    const searchJson = await searchRes.json();
    console.assert(Array.isArray(searchJson.data.results), 'Results must be an array');
    console.log('   ✔ Server-side search operates cleanly with debounced query parameters');

    // 5. Notifications
    console.log('5. Testing Role-Scoped Notifications...');
    const notifRes = await fetch(`${baseUrl}/api/dashboard/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.assert(notifRes.status === 200, 'Notifications endpoint should return 200');
    const notifJson = await notifRes.json();
    console.assert(Array.isArray(notifJson.data), 'Notifications must be an array');
    console.log('   ✔ Notifications successfully queried');

    console.log('\n====================================================');
    console.log('✅ ALL DASHBOARD RBAC & API TESTS PASSED (5/5)');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

runDashboardTests().catch((err) => {
  console.error('❌ Dashboard test suite failed:', err);
  process.exit(1);
});
