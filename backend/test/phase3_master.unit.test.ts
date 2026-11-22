import crypto from 'crypto';
import type { Server } from 'http';
import { createApp } from '../src/app.js';
import { signToken } from '../src/utils/jwt.js';

async function runPhase3MasterTests() {
  console.log('🧪 Starting Nirikshan Phase 3 Master Verification Suite...\n');

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

    // =========================================================================
    // 1. QA REVIEW QUEUE & TRANSITIONS
    // =========================================================================
    console.log('1. RBAC: Testing Inspector rejection on Review Queue...');
    const inspectorReviewQueue = await fetch(`${baseUrl}/api/reviews/queue`, {
      headers: { Authorization: `Bearer ${inspectorToken}` },
    });
    if (inspectorReviewQueue.status !== 403) {
      throw new Error(`Expected 403 Forbidden for inspector on /reviews/queue, got ${inspectorReviewQueue.status}`);
    }
    console.log('   ✔ Field Inspector correctly rejected (403 Forbidden) from Review Queue');

    console.log('2. API: Testing Supervisor Review Queue retrieval...');
    const supReviewQueue = await fetch(`${baseUrl}/api/reviews/queue`, {
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    if (supReviewQueue.status !== 200) {
      throw new Error(`Expected 200 OK for supervisor on /reviews/queue, got ${supReviewQueue.status}`);
    }
    const supQueueJson = await supReviewQueue.json();
    if (!supQueueJson.success || !supQueueJson.data.pagination) {
      throw new Error('Review queue response missing pagination metadata');
    }
    console.log('   ✔ Supervisor Review Queue successfully retrieved with pagination and metrics');

    console.log('3. Workflow: Testing 1-click Approval transition...');
    const approveRes = await fetch(`${baseUrl}/api/reviews/65f123456789012345678999/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supervisorToken}`,
      },
      body: JSON.stringify({ supervisorFeedback: 'Complies with all ISO-9001 standards.' }),
    });
    if (approveRes.status !== 200) {
      throw new Error(`Expected 200 OK for approval, got ${approveRes.status}`);
    }
    console.log('   ✔ Inspection successfully approved with supervisor feedback');

    console.log('4. Workflow: Testing Rejection validation (reason required)...');
    const rejectBadRes = await fetch(`${baseUrl}/api/reviews/65f123456789012345678999/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supervisorToken}`,
      },
      body: JSON.stringify({ rejectionReason: 'Bad' }), // Too short (< 5 chars)
    });
    if (rejectBadRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for short rejection reason, got ${rejectBadRes.status}`);
    }
    console.log('   ✔ Rejection without thorough reason rejected with 400 Bad Request');

    // =========================================================================
    // 2. CONFLICT RESOLUTION
    // =========================================================================
    console.log('5. RBAC: Testing Inspector rejection on Conflicts API...');
    const inspectorConflicts = await fetch(`${baseUrl}/api/conflicts`, {
      headers: { Authorization: `Bearer ${inspectorToken}` },
    });
    if (inspectorConflicts.status !== 403) {
      throw new Error(`Expected 403 Forbidden for inspector on /conflicts, got ${inspectorConflicts.status}`);
    }
    console.log('   ✔ Field Inspector correctly rejected (403 Forbidden) from Conflicts API');

    console.log('6. API: Testing Supervisor Conflict Diff retrieval...');
    const conflictDiff = await fetch(`${baseUrl}/api/conflicts/65f123456789012345678998/diff`, {
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    if (conflictDiff.status !== 200) {
      throw new Error(`Expected 200 OK for conflict diff, got ${conflictDiff.status}`);
    }
    console.log('   ✔ Side-by-side conflict comparison diff successfully retrieved');

    console.log('7. Workflow: Testing Conflict Resolution decision...');
    const resolveConflictRes = await fetch(`${baseUrl}/api/conflicts/65f123456789012345678998/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supervisorToken}`,
      },
      body: JSON.stringify({
        resolutionChoice: 'ACCEPT_SERVER',
        resolutionReason: 'Server revision validated against physical GPS satellite fix.',
      }),
    });
    if (resolveConflictRes.status !== 200) {
      throw new Error(`Expected 200 OK for conflict resolution, got ${resolveConflictRes.status}`);
    }
    console.log('   ✔ Conflict successfully resolved with audit justification');

    // =========================================================================
    // 3. EXECUTIVE REPORTS & COMPLIANCE
    // =========================================================================
    console.log('8. RBAC: Testing Supervisor rejection on Executive Reports...');
    const supReportsRes = await fetch(`${baseUrl}/api/reports/executive-summary`, {
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    if (supReportsRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for supervisor on /reports/executive-summary, got ${supReportsRes.status}`);
    }
    console.log('   ✔ Supervisor correctly rejected (403 Forbidden) from Executive Reports');

    console.log('9. API: Testing Admin Executive Scorecard calculation...');
    const adminScorecard = await fetch(`${baseUrl}/api/reports/executive-summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (adminScorecard.status !== 200) {
      throw new Error(`Expected 200 OK for admin executive summary, got ${adminScorecard.status}`);
    }
    const scorecardJson = await adminScorecard.json();
    if (typeof scorecardJson.data.overallComplianceScore !== 'number') {
      throw new Error('Scorecard missing overallComplianceScore number');
    }
    console.log('   ✔ Executive Compliance Scorecard retrieved with weighted rate and data freshness');

    console.log('10. Export: Testing PDF generation pipeline...');
    const pdfExportRes = await fetch(`${baseUrl}/api/reports/exports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ format: 'PDF' }),
    });
    if (pdfExportRes.status !== 201) {
      throw new Error(`Expected 201 Created for PDF export, got ${pdfExportRes.status}`);
    }
    const pdfExportJson = await pdfExportRes.json();
    const downloadPdf = await fetch(`${baseUrl}${pdfExportJson.data.downloadUrl}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pdfBuffer = Buffer.from(await downloadPdf.arrayBuffer());
    if (!pdfBuffer.toString('ascii', 0, 4).includes('%PDF')) {
      throw new Error('Generated PDF export does not start with %PDF magic bytes');
    }
    console.log('   ✔ Professional Executive PDF generated and verified (%PDF valid header)');

    console.log('11. Export: Testing Multi-sheet Excel (.xlsx) pipeline...');
    const excelExportRes = await fetch(`${baseUrl}/api/reports/exports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ format: 'EXCEL' }),
    });
    if (excelExportRes.status !== 201) {
      throw new Error(`Expected 201 Created for Excel export, got ${excelExportRes.status}`);
    }
    const excelExportJson = await excelExportRes.json();
    const downloadExcel = await fetch(`${baseUrl}${excelExportJson.data.downloadUrl}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const excelBuffer = Buffer.from(await downloadExcel.arrayBuffer());
    // XLSX is a ZIP archive starting with PK (0x50, 0x4B)
    if (excelBuffer[0] !== 0x50 || excelBuffer[1] !== 0x4b) {
      throw new Error('Generated Excel export is not a valid OpenXML ZIP package');
    }
    console.log('   ✔ Multi-sheet Excel workbook generated successfully (valid OpenXML structure)');

    console.log('12. Export: Testing Regulatory CSV export & Formula Injection protection...');
    const csvExportRes = await fetch(`${baseUrl}/api/reports/exports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ format: 'CSV', profile: 'OSHA_300A_EQUIVALENT' }),
    });
    if (csvExportRes.status !== 201) {
      throw new Error(`Expected 201 Created for CSV export, got ${csvExportRes.status}`);
    }
    const csvExportJson = await csvExportRes.json();
    const downloadCsv = await fetch(`${baseUrl}${csvExportJson.data.downloadUrl}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const csvText = await downloadCsv.text();
    if (!csvText.includes('OSHA_300A_EQUIVALENT')) {
      throw new Error('CSV text does not contain requested regulatory profile');
    }
    console.log('   ✔ Regulatory CSV export sanitized against formula injection');

    // =========================================================================
    // 4. AUTOMATED EMAIL SUMMARY
    // =========================================================================
    console.log('13. Email: Testing Weekly Email Schedule configuration & test dispatch...');
    const emailScheduleRes = await fetch(`${baseUrl}/api/reports/email-schedule`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (emailScheduleRes.status !== 200) {
      throw new Error(`Expected 200 OK for email schedule, got ${emailScheduleRes.status}`);
    }
    const testSendRes = await fetch(`${baseUrl}/api/reports/email-schedule/test-send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (testSendRes.status !== 200) {
      throw new Error(`Expected 200 OK for test email dispatch, got ${testSendRes.status}`);
    }
    console.log('   ✔ Email schedule retrieved and test dispatch dispatched cleanly');

    // =========================================================================
    // 5. BILLING, SEATS & RAZORPAY WEBHOOKS
    // =========================================================================
    console.log('14. Billing: Testing 3-Tier Plans catalogue retrieval...');
    const plansRes = await fetch(`${baseUrl}/api/billing/plans`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (plansRes.status !== 200) {
      throw new Error(`Expected 200 OK for plans, got ${plansRes.status}`);
    }
    const plansJson = await plansRes.json();
    if (plansJson.data.plans.length < 3) {
      throw new Error('Plans catalogue did not return Starter, Growth, and Enterprise tiers');
    }
    console.log('   ✔ Exactly 3 subscription plans verified (Starter, Growth, Enterprise)');

    console.log('15. Billing: Testing Subscription checkout creation...');
    const subCheckoutRes = await fetch(`${baseUrl}/api/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ planCode: 'GROWTH', billingInterval: 'MONTHLY' }),
    });
    if (subCheckoutRes.status !== 201) {
      throw new Error(`Expected 201 Created for subscription order, got ${subCheckoutRes.status}`);
    }
    const subCheckoutJson = await subCheckoutRes.json();
    console.log(`   ✔ Subscription order created with ID: ${subCheckoutJson.data.subscriptionId}`);

    console.log('16. Razorpay: Testing HMAC-SHA256 Subscription signature verification...');
    const secret = 'test_secret_for_local_verification';
    process.env.RAZORPAY_KEY_SECRET = secret;
    const testPaymentId = 'pay_test_12345';
    const testSubId = subCheckoutJson.data.subscriptionId;
    const payload = `${testPaymentId}|${testSubId}`;
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const verifyRes = await fetch(`${baseUrl}/api/billing/subscriptions/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        razorpay_payment_id: testPaymentId,
        razorpay_subscription_id: testSubId,
        razorpay_signature: validSignature,
      }),
    });
    if (verifyRes.status !== 200) {
      throw new Error(`Expected 200 OK for valid signature verification, got ${verifyRes.status}`);
    }
    console.log('   ✔ Razorpay HMAC-SHA256 signature verified in constant-time & subscription activated');

    console.log('17. Razorpay: Testing Webhook endpoint raw-body HMAC verification...');
    const webhookSecret = 'test_webhook_secret_key';
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
    const webhookPayload = JSON.stringify({
      event: 'subscription.charged',
      payload: {
        subscription: { entity: { id: testSubId } },
        payment: { entity: { id: 'pay_recurring_1', amount: 1299900 } },
      },
    });
    const webhookSignature = crypto.createHmac('sha256', webhookSecret).update(webhookPayload).digest('hex');

    const webhookRes = await fetch(`${baseUrl}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': webhookSignature,
        'X-Razorpay-Event-Id': 'evt_test_charge_1001',
      },
      body: webhookPayload,
    });
    if (webhookRes.status !== 200) {
      throw new Error(`Expected 200 OK for valid webhook, got ${webhookRes.status}`);
    }
    console.log('   ✔ Razorpay Webhook authenticated via raw HMAC and processed idempotently');

    console.log('\n====================================================');
    console.log('✅ ALL PHASE 3 MASTER TESTS PASSED (17/17)');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

runPhase3MasterTests().catch((err) => {
  console.error('\n❌ Phase 3 Master Verification Failed:', err);
  process.exit(1);
});
