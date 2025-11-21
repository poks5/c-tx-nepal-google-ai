import { EvaluationPhase, PhaseStatus } from './types';
import { RECIPIENT_CONSULTATIONS_TEMPLATE } from './consultation_constants';
import { RECIPIENT_CLEARANCE_TEMPLATE } from './clearance_constants';
import { TRANSPLANT_REVIEW_ITEMS_TEMPLATE } from './transplant_review_constants';
import { INITIAL_PHASE_8_DATA } from './surgery_preparation_constants';

export const RECIPIENT_WORKFLOW_TEMPLATE: EvaluationPhase[] = [
  {
    id: 1,
    name: 'Phase 1: Initial Screening & Comprehensive Lab Work',
    description: 'Comprehensive blood work, urine tests, and baseline health checks for the recipient.',
    status: PhaseStatus.Available,
    progress: 0,
  },
  {
    id: 2,
    name: 'Phase 2: Cardiac & Vascular Assessment',
    description: 'Evaluation of cardiovascular fitness for surgery and assessment of iliac vessels.',
    status: PhaseStatus.Available,
    progress: 0,
    imagingTests: [
        { name: 'Echocardiogram (ECHO)', status: 'Pending', reportSummary: '', isCompleted: false },
        { name: 'USG Doppler of Iliac Vessels', status: 'Pending', reportSummary: '', isCompleted: false },
        { name: 'Coronary Angiography (if indicated)', status: 'Pending', reportSummary: '', isCompleted: false },
    ],
    surgicalPlan: { notes: '', isCompleted: false },
  },
  {
    id: 3,
    name: 'Phase 3: Multi-Disciplinary Consultations',
    description: 'Clearance from various medical specialists including Nephrology, Cardiology, and Psychiatry.',
    status: PhaseStatus.Available,
    progress: 0,
    consultations: RECIPIENT_CONSULTATIONS_TEMPLATE,
  },
  {
    id: 4,
    name: 'Phase 4: Legal Clearance',
    description: 'Review and approval of legal documentation for the transplant pair.',
    status: PhaseStatus.Available,
    progress: 0,
    legalClearance: { status: 'Pending', clearanceDate: '', officerName: '', notes: '', fileName: '' },
  },
   {
    id: 5,
    name: 'Phase 5: HLA Typing & Crossmatch',
    description: 'Pair-based tissue typing and compatibility testing.',
    status: PhaseStatus.Available,
    progress: 0,
    phase5Data: {
      donorHla: { A: ['', ''], B: ['', ''], C: ['', ''], DR: ['', ''], DQ: ['', ''], DP: ['', ''] },
      recipientHla: { A: ['', ''], B: ['', ''], C: ['', ''], DR: ['', ''], DQ: ['', ''], DP: ['', ''] },
      crossmatch: { cdc: 'Pending', flow: 'Pending', dsa: 'Pending', dsaInterpretation: '' },
      hlaCompatibility: {
        mismatchResult: { total: 0, class1: 0, class2: 0, details: { A: 0, B: 0, C: 0, DR: 0, DQ: 0, DP: 0 } },
        matchRatio: '0/12',
        riskLevel: 'Pending',
      },
      finalAssessment: { finalResult: 'Pending', date: '', lab: '', notes: '' },
      documents: [],
    }
  },
  {
    id: 6,
    name: 'Phase 6: Final Review & Readiness',
    description: 'Final cross-match, pre-operative checks, and confirmation of readiness for surgery.',
    status: PhaseStatus.Available,
    progress: 0,
    finalReviewData: {
        clearanceItems: RECIPIENT_CLEARANCE_TEMPLATE,
    }
  },
  {
    id: 7,
    name: 'Phase 7: Transplant Team Review & Meeting',
    description: 'Final case presentation, team discussion, and official approval for transplant.',
    status: PhaseStatus.Available,
    progress: 0,
    transplantTeamReviewData: {
      reviewItems: TRANSPLANT_REVIEW_ITEMS_TEMPLATE,
      finalNotes: '',
    }
  },
  {
    id: 8,
    name: 'Phase 8: Surgery Preparation & Admission',
    description: 'Final medical optimization, pre-operative checks, and hospital admission for the recipient.',
    status: PhaseStatus.Available,
    progress: 0,
    phase8Data: INITIAL_PHASE_8_DATA,
  },
];
