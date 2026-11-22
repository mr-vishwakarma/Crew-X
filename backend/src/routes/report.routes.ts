import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { EmailScheduleController } from '../controllers/email-schedule.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Executive Reports are strictly restricted to ADMIN role
router.use(authenticate, authorize(['ADMIN']));

router.get('/executive-summary', ReportController.getExecutiveSummary);
router.get('/compliance-scorecard', ReportController.getComplianceScorecard);
router.get('/inspection-trends', ReportController.getInspectionTrends);
router.get('/site-risk-heatmap', ReportController.getSiteRiskHeatmap);
router.get('/project-performance', ReportController.getProjectPerformance);

// Export pipelines
router.post('/exports', ReportController.createExport);
router.get('/exports', ReportController.listExports);
router.get('/exports/:id/download', ReportController.downloadExport);

// Automated Weekly Email Summaries
router.get('/email-schedule', EmailScheduleController.getSchedule);
router.put('/email-schedule', EmailScheduleController.updateSchedule);
router.post('/email-schedule/test-send', EmailScheduleController.testSend);

export default router;
