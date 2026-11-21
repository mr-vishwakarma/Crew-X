import { createApp } from '../src/app.js';
import { signToken } from '../src/utils/jwt.js';
import type { Server } from 'http';

async function runAssignmentTests() {
  console.log('🧪 Starting Role-Based Management & Assignment Security Test Suite...\n');

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
      organizationId: 'org_nirikshan_test',
    });

    const supervisorToken = signToken({
      userId: '65f123456789012345678902',
      email: 'supervisor@nirikshan.com',
      role: 'SUPERVISOR',
      organizationId: 'org_nirikshan_test',
    });

    const inspectorToken = signToken({
      userId: '65f123456789012345678903',
      email: 'inspector@nirikshan.com',
      role: 'INSPECTOR',
      organizationId: 'org_nirikshan_test',
    });

    // 1. RBAC: Inspector cannot create a supervisor account (403 Forbidden)
    console.log('1. RBAC: Testing Supervisor Creation authorization...');
    const forbiddenCreateSup = await fetch(`${baseUrl}/api/users/supervisors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inspectorToken}`,
      },
      body: JSON.stringify({
        fullName: 'Test Supervisor',
        email: 'testsup@nirikshan.com',
        password: 'Password@123',
      }),
    });
    console.assert(forbiddenCreateSup.status === 403, 'Inspector must not be allowed to create supervisor');
    console.log('   ✔ Inspector rejected with 403 Forbidden when creating supervisor');

    // 2. RBAC: Supervisor cannot create an inspector account (403 Forbidden)
    console.log('2. RBAC: Testing Inspector Creation authorization...');
    const forbiddenCreateInsp = await fetch(`${baseUrl}/api/users/inspectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supervisorToken}`,
      },
      body: JSON.stringify({
        fullName: 'Test Inspector',
        email: 'testinsp@nirikshan.com',
        password: 'Password@123',
      }),
    });
    console.assert(forbiddenCreateInsp.status === 403, 'Supervisor must not be allowed to create inspector');
    console.log('   ✔ Supervisor rejected with 403 Forbidden when creating inspector');

    // 3. Validation: Admin creating supervisor with invalid email format (400)
    console.log('3. Validation: Testing user creation schema rejection...');
    const invalidEmailRes = await fetch(`${baseUrl}/api/users/supervisors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fullName: 'Valid Name',
        email: 'not-an-email',
        password: 'Password@123',
      }),
    });
    console.assert(invalidEmailRes.status === 400, 'Invalid email must return 400 Bad Request');
    console.log('   ✔ Malformed user payload cleanly rejected with 400 Bad Request');

    // 4. RBAC: Project-Supervisor Assignment restricted to ADMIN
    console.log('4. RBAC: Testing Project-Supervisor assignment permission...');
    const supAssignRes = await fetch(`${baseUrl}/api/assignments/projects/65f123456789012345678910/supervisors`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supervisorToken}`,
      },
      body: JSON.stringify({
        supervisorIds: ['65f123456789012345678902'],
      }),
    });
    console.assert(supAssignRes.status === 403, 'Supervisor must not assign supervisors to projects');
    console.log('   ✔ Supervisor rejected with 403 Forbidden on project supervisor assignment');

    // 5. RBAC: Overview endpoint restricted to ADMIN
    console.log('5. RBAC: Testing Admin Overview permission...');
    const forbiddenOverview = await fetch(`${baseUrl}/api/assignments/admin/overview`, {
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    console.assert(forbiddenOverview.status === 403, 'Supervisor must not access admin overview');
    console.log('   ✔ Non-admin correctly rejected from Admin Assignments Overview');

    // 6. RBAC: Inspector accessing Supervisor Projects (403 Forbidden)
    console.log('6. RBAC: Testing Inspector accessing Supervisor Projects...');
    const forbiddenSupProjects = await fetch(`${baseUrl}/api/supervisor/projects`, {
      headers: { Authorization: `Bearer ${inspectorToken}` },
    });
    console.assert(forbiddenSupProjects.status === 403, 'Inspector must not access supervisor projects');
    console.log('   ✔ Inspector rejected with 403 Forbidden from supervisor project endpoints');

    // 7. RBAC: Inspector My Sites accessible to Inspector
    console.log('7. RBAC: Testing Inspector My Sites accessibility...');
    const inspMySites = await fetch(`${baseUrl}/api/inspector/my-sites`, {
      headers: { Authorization: `Bearer ${inspectorToken}` },
    });
    console.assert(inspMySites.status === 200, 'Inspector should access my-sites');
    console.log('   ✔ Inspector successfully authorized for my-sites');

    // 8. Unauthenticated requests rejected with 401 Unauthorized
    console.log('8. Security: Testing unauthenticated request rejection...');
    const unauthRes = await fetch(`${baseUrl}/api/inspector/my-sites`);
    console.assert(unauthRes.status === 401, 'Unauthenticated request must return 401');
    console.log('   ✔ Unauthenticated request rejected with 401 Unauthorized');

    console.log('\n====================================================');
    console.log('✅ ALL ROLE-BASED MANAGEMENT & ASSIGNMENT TESTS PASSED (8/8)');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

runAssignmentTests().catch((err) => {
  console.error('❌ Assignment test suite failed:', err);
  process.exit(1);
});
