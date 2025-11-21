import { EvaluationPhase, PhaseStatus } from './types';
import { DONOR_CONSULTATIONS_TEMPLATE } from './consultation_constants';
import { DONOR_CLEARANCE_TEMPLATE } from './clearance_constants';
import { TRANSPLANT_REVIEW_ITEMS_TEMPLATE } from './transplant_review_constants';
import { INITIAL_PHASE_8_DATA } from './surgery_preparation_constants';

export const DONOR_WORKFLOW_TEMPLATE: EvaluationPhase[] = [
  {
    id: 1,
    name: 'Phase 1: Initial Screening & Comprehensive Lab Work',
    description: 'Comprehensive blood work, urine tests, and baseline health checks for the potential donor.',
    status: PhaseStatus.Available,
    progress: 0,
  },
  {
    id: 2,
    name: 'Phase 2: Advanced Imaging & Surgical Assessment',
    description: 'Detailed anatomical and functional imaging of the kidneys and surgical planning.',
    status: PhaseStatus.Available,
    progress: 0,
    ctAngiogram: {
      isCompleted: false, datePerformed: '', leftKidneyLength: '', leftKidneyWidth: '', leftKidneyVolume: '', leftMainArteryDiameter: '', rightKidneyLength: '', rightKidneyWidth: '', rightKidneyVolume: '', rightMainArteryDiameter: '', leftRenalArteries: '', leftRenalVeins: '', rightRenalArteries: '', rightRenalVeins: '', accessoryVessels: 'None', corticalThickness: '', parenchymalQuality: 'Normal', calcificationAtherosclerosis: 'None', anatomicalVariations: 'None', clinicalInterpretation: '', recommendedKidney: '', recommendedApproach: '', reportFileName: '', reportUploaded: false
    },
    dtpaRenogram: {
      isCompleted: false, datePerformed: '', leftKidneyGfr: '', rightKidneyGfr: '', totalGfr: '', functionalAsymmetry: false, leftT12: '', rightT12: '', obstructionPresent: false, notes: '', reportFileName: '', reportUploaded: false
    },
    surgicalPlan: {
      isCompleted: false, finalKidneySelection: '', finalSurgicalApproach: '', vascularComplexity: '', anesthesiaRisk: '', estimatedTimeMinutes: '', anticipatedDifficulties: '', postOpConsiderations: '', teamAssignment: '', generalNotes: '', donorBmi: '', donorAgeCategory: '', smokingHistory: '', hypertensionHistory: '', diabetesHistory: '', calculatedRisk: 'Not Calculated'
    },
  },
  {
    id: 3,
    name: 'Phase 3: Multi-Disciplinary Consultations',
    description: 'Clearance from various medical specialists including Urology, Cardiology, and Psychiatry.',
    status: PhaseStatus.Available,
    progress: 0,
    consultations: DONOR_CONSULTATIONS_TEMPLATE,
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
        clearanceItems: DONOR_CLEARANCE_TEMPLATE,
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
    description: 'Final pre-operative checks, scheduling, and hospital admission procedures for the donor.',
    status: PhaseStatus.Available,
    progress: 0,
    phase8Data: INITIAL_PHASE_8_DATA,
  },
];
