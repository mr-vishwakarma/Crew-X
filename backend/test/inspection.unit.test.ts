import { createApp } from '../src/app.js';
import { signToken } from '../src/utils/jwt.js';
import type { Server } from 'http';

async function runInspectionTests() {
  console.log('🧪 Starting Offline Inspection & Sync Verification Suite...\n');

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
    const inspectorToken = signToken({
      userId: '65f123456789012345678903',
      email: 'inspector@nirikshan.com',
      role: 'INSPECTOR',
      organizationId: 'org_nirikshan_test',
    });

    const supervisorToken = signToken({
      userId: '65f123456789012345678902',
      email: 'supervisor@nirikshan.com',
      role: 'SUPERVISOR',
      organizationId: 'org_nirikshan_test',
    });

    // 1. Unauthenticated request rejection
    console.log('1. Security: Testing unauthenticated sync rejection...');
    const unauthSync = await fetch(`${baseUrl}/api/inspections/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspectionId: 'local_1', siteId: 'site_1' }),
    });
    if (unauthSync.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for unauthenticated sync, got ${unauthSync.status}`);
    }
    console.log('   ✔ Unauthenticated sync rejected with 401 Unauthorized');

    // 2. Supervisor cannot submit inspector sync (role check)
    console.log('2. RBAC: Testing supervisor role rejection on inspector sync...');
    const forbiddenSync = await fetch(`${baseUrl}/api/inspections/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supervisorToken}`,
      },
      body: JSON.stringify({ inspectionId: 'local_1', siteId: 'site_1' }),
    });
    if (forbiddenSync.status !== 403) {
      throw new Error(`Expected 403 Forbidden for supervisor submitting inspector sync, got ${forbiddenSync.status}`);
    }
    console.log('   ✔ Supervisor rejected with 403 Forbidden from inspector sync');

    // 3. Schema validation rejection (missing siteId or inspectionId)
    console.log('3. Validation: Testing malformed sync payload rejection...');
    const badPayloadSync = await fetch(`${baseUrl}/api/inspections/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inspectorToken}`,
      },
      body: JSON.stringify({ notes: 'Incomplete payload' }),
    });
    if (badPayloadSync.status !== 400) {
      throw new Error(`Expected 400 Bad Request for malformed sync payload, got ${badPayloadSync.status}`);
    }
    console.log('   ✔ Missing required fields rejected with 400 Bad Request');

    // 4. Valid offline inspection sync
    console.log('4. Sync: Testing valid offline inspection sync endpoint...');
    const validSync = await fetch(`${baseUrl}/api/inspections/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inspectorToken}`,
      },
      body: JSON.stringify({
        inspectionId: 'local_insp_test_101',
        siteId: 'site_test_metro_01',
        answers: {
          q1_ppe_compliance: 'compliant',
          q2_scaffolding_stability: 'compliant',
        },
        notes: 'Offline audit completed with GPS coordinates stamp.',
        latitude: 28.6139,
        longitude: 77.209,
        gpsAccuracy: 3.5,
        workflowStatus: 'SUBMITTED',
      }),
    });

    const syncJson = await validSync.json() as any;
    if (validSync.status !== 200 && validSync.status !== 201) {
      throw new Error(`Expected 200/201 for valid inspection sync, got ${validSync.status}: ${JSON.stringify(syncJson)}`);
    }
    if (!syncJson.data?.syncedId || syncJson.data?.localId !== 'local_insp_test_101') {
      throw new Error(`Unexpected sync response format: ${JSON.stringify(syncJson)}`);
    }
    console.log('   ✔ Inspection successfully acknowledged and synchronized with backend');

    // 5. Query my inspections
    console.log('5. API: Testing inspector my-inspections retrieval...');
    const myInspectionsRes = await fetch(`${baseUrl}/api/inspections/my-inspections`, {
      headers: { Authorization: `Bearer ${inspectorToken}` },
    });
    if (myInspectionsRes.status !== 200) {
      throw new Error(`Expected 200 OK for my-inspections, got ${myInspectionsRes.status}`);
    }
    console.log('   ✔ My inspections list retrieved successfully');

    console.log('\n====================================================');
    console.log('✅ ALL OFFLINE INSPECTION & SYNC TESTS PASSED (5/5)');
    console.log('====================================================\n');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runInspectionTests().catch((err) => {
  console.error('\n❌ INSPECTION TEST SUITE FAILED:', err);
  process.exit(1);
});
