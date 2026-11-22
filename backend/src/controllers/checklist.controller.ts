import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { ChecklistTemplate, IChecklistTemplateDocument } from '../models/checklist-template.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const STANDARD_TEMPLATES: Partial<IChecklistTemplateDocument>[] = [
  {
    templateCode: 'TPL-CIVIL-01',
    title: 'ISO-9001 Civil Structure & Quality Compliance',
    version: 1,
    industry: 'Construction & Civil Works',
    isPublished: true,
    sections: [
      {
        id: 'sec_structural',
        title: 'Structural Reinforcement & Concreting',
        description: 'Quality verification for structural framing and concrete pours.',
        questions: [
          {
            id: 'q_rebar_clearance',
            category: 'Reinforcement',
            question: 'Are rebar spacing and concrete cover blocks aligned with structural design?',
            description: 'Check minimum cover distance, bar overlaps, and tie wire tightness.',
            answerType: 'COMPLIANT_DEFECT_NA',
            isMandatory: true,
            evidenceRequired: true,
            locationRequired: false,
          },
          {
            id: 'q_formwork_rigidity',
            category: 'Formwork',
            question: 'Is formwork rigid, leak-tight, and properly braced against lateral pressure?',
            description: 'Verify prop alignment, diagonal bracing, and joint foam seals.',
            answerType: 'COMPLIANT_DEFECT_NA',
            isMandatory: true,
            evidenceRequired: true,
            locationRequired: false,
          },
          {
            id: 'q_slump_test',
            category: 'Concrete Mix',
            question: 'Has concrete slump test and cube sampling been recorded for this pour batch?',
            description: 'Record slump measurement in mm and verify delivery ticket batch time.',
            answerType: 'COMPLIANT_DEFECT_NA',
            isMandatory: true,
            evidenceRequired: false,
            locationRequired: true,
          },
        ],
      },
      {
        id: 'sec_site_safety',
        title: 'Workplace Safety & Hazard Control',
        description: 'Daily field occupational health and hazard compliance check.',
        questions: [
          {
            id: 'q_ppe_inspection',
            category: 'Safety PPE',
            question: 'Are all workers and supervisors equipped with required PPE in active zones?',
            description: 'Hard hat, high-vis jacket, safety shoes, eye protection where required.',
            answerType: 'COMPLIANT_DEFECT_NA',
            isMandatory: true,
            evidenceRequired: true,
            locationRequired: false,
          },
          {
            id: 'q_scaffold_tagging',
            category: 'Working at Heights',
            question: 'Is scaffolding inspected, tagged with a valid Green safety tag, and anchored?',
            description: 'Toe-boards, double guardrails, base plates, and current tag signature.',
            answerType: 'COMPLIANT_DEFECT_NA',
            isMandatory: true,
            evidenceRequired: true,
            locationRequired: true,
          },
          {
            id: 'q_perimeter_barriers',
            category: 'Site Protection',
            question: 'Are excavation edges and open floor slabs protected by standard barriers?',
            description: 'Rigid barriers at least 1.1m high with warning boards and lighting.',
            answerType: 'COMPLIANT_DEFECT_NA',
            isMandatory: true,
            evidenceRequired: true,
            locationRequired: false,
          },
        ],
      },
    ],
  },
  {
    templateCode: 'TPL-EHS-02',
    title: 'ISO-45001 Construction Environmental & EHS Audit',
    version: 1,
    industry: 'Environment, Health & Safety',
    isPublished: true,
    sections: [
      {
        id: 'sec_fire_safety',
        title: 'Emergency Preparedness & Fire Safety',
        questions: [
          {
            id: 'q_fire_extinguishers',
            category: 'Fire Safety',
            question: 'Are dry-chemical and CO2 fire extinguishers inspected and unblocked?',
            description: 'Verify pressure gauge, inspection tag within 30 days, unobstructed access.',
            answerType: 'COMPLIANT_DEFECT_NA',
            isMandatory: true,
            evidenceRequired: true,
            locationRequired: true,
          },
          {
            id: 'q_emergency_egress',
            category: 'Evacuation',
            question: 'Are emergency evacuation routes illuminated and clear of debris?',
            description: 'Verify clear pathways to designated site assembly points.',
            answerType: 'COMPLIANT_DEFECT_NA',
            isMandatory: true,
            evidenceRequired: true,
            locationRequired: false,
          },
        ],
      },
      {
        id: 'sec_environmental',
        title: 'Dust Suppression & Waste Management',
        questions: [
          {
            id: 'q_dust_mitigation',
            category: 'Air Quality',
            question: 'Is active water misting or sprinkling deployed on excavation dust zones?',
            description: 'Verify ambient dust mitigation and wheel washing bay operation.',
            answerType: 'COMPLIANT_DEFECT_NA',
            isMandatory: true,
            evidenceRequired: false,
            locationRequired: false,
          },
          {
            id: 'q_hazmat_storage',
            category: 'Hazardous Materials',
            question: 'Are chemical containers stored inside secondary containment with MSDS?',
            description: 'Check bund capacity 110% of largest container and spill kit availability.',
            answerType: 'COMPLIANT_DEFECT_NA',
            isMandatory: true,
            evidenceRequired: true,
            locationRequired: true,
          },
        ],
      },
    ],
  },
];

export class ChecklistController {
  /**
   * GET /api/checklists/templates
   * List available published checklist templates
   */
  static async getTemplates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, STANDARD_TEMPLATES, 'Checklist templates retrieved (offline/test mode)');
        return;
      }

      const templates = await ChecklistTemplate.find({
        organizationId: orgId,
        isPublished: true,
      }).lean();

      if (templates.length === 0) {
        // Return standard templates seeded for this organization
        sendSuccess(res, STANDARD_TEMPLATES, 'Standard checklist templates retrieved');
        return;
      }

      sendSuccess(res, templates, 'Checklist templates retrieved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve templates';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/checklists/templates/:id
   * Get specific checklist template by ID or templateCode
   */
  static async getTemplateById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      if (!orgId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      // Check standard templates first
      const standard = STANDARD_TEMPLATES.find(
        (t) => t.templateCode === id || t.title === id || (t as any)._id?.toString() === id
      );
      if (standard) {
        sendSuccess(res, standard, 'Checklist template retrieved');
        return;
      }

      if (mongoose.connection.readyState === 1) {
        let template = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
          template = await ChecklistTemplate.findOne({
            _id: id,
            organizationId: orgId,
          }).lean();
        }
        if (!template) {
          template = await ChecklistTemplate.findOne({
            templateCode: id,
            organizationId: orgId,
          }).lean();
        }
        if (template) {
          sendSuccess(res, template, 'Checklist template retrieved');
          return;
        }
      }

      // Fallback to default civil template
      sendSuccess(res, STANDARD_TEMPLATES[0], 'Default checklist template retrieved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve template';
      sendError(res, message, 500);
    }
  }
}
