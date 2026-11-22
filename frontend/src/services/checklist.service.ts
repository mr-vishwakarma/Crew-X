import { apiClient } from './api';
import {
  getLocalChecklistTemplate,
  saveChecklistTemplate,
} from '../database/databaseHelpers';
import type { LocalChecklistTemplate } from '../database/schema';

export interface ChecklistQuestion {
  id: string;
  category: string;
  question: string;
  description: string;
  answerType: 'COMPLIANT_DEFECT_NA' | 'YES_NO_NA' | 'TEXT' | 'NUMBER' | 'SINGLE_CHOICE';
  options?: string[];
  isMandatory: boolean;
  evidenceRequired: boolean;
  locationRequired: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  description?: string;
  questions: ChecklistQuestion[];
}

export interface ChecklistTemplateData {
  id?: string;
  templateCode: string;
  title: string;
  version: number;
  industry?: string;
  sections: ChecklistSection[];
}

export const FALLBACK_STANDARD_SECTIONS: ChecklistSection[] = [
  {
    id: 'sec_civil_structural',
    title: 'Civil & Structural Safety',
    description: 'Mandatory structural integrity and framing checks.',
    questions: [
      {
        id: 'q_rebar_clearance',
        category: 'Reinforcement',
        question: 'Are rebar spacing and concrete cover blocks aligned with structural design?',
        description: 'Verify cover block thickness, rebar overlap, and tie wire tightness.',
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
];

export const checklistService = {
  /**
   * Retrieve checklist template by code or ID with automatic Dexie caching
   */
  async getTemplate(idOrCode = 'TPL-CIVIL-01'): Promise<ChecklistTemplateData> {
    // 1. Try local IndexedDB first
    const cached = await getLocalChecklistTemplate(idOrCode);
    if (cached) {
      return {
        id: cached.id,
        templateCode: cached.templateCode,
        title: cached.title,
        version: cached.version,
        sections: cached.sections,
      };
    }

    // 2. If online, fetch from backend API
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const response = await apiClient.get<{ success: boolean; data: ChecklistTemplateData }>(
          `/checklists/templates/${encodeURIComponent(idOrCode)}`
        );
        if (response.data && response.data.data) {
          const t = response.data.data;
          // Cache in Dexie
          const localItem: LocalChecklistTemplate = {
            id: t.id || t.templateCode,
            templateCode: t.templateCode,
            title: t.title,
            version: t.version || 1,
            sections: t.sections,
            updatedAt: new Date().toISOString(),
          };
          await saveChecklistTemplate(localItem);
          return t;
        }
      } catch (err) {
        console.warn('[ChecklistService] API fetch failed, falling back to offline defaults:', err);
      }
    }

    // 3. Fallback standard civil template
    return {
      templateCode: 'TPL-CIVIL-01',
      title: 'ISO-9001 Civil Structure & Quality Compliance',
      version: 1,
      industry: 'Construction & Civil Works',
      sections: FALLBACK_STANDARD_SECTIONS,
    };
  },
};
