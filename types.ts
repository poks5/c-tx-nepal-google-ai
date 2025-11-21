
// This file defines the core data structures and enumerations used throughout the TransplantFlow application.

// --- Enumerations ---

/**
 * Defines the role of a patient in the transplant process.
 */
export enum PatientType {
  Donor = 'Donor',
  Recipient = 'Recipient',
}

/**
 * Represents the various states an evaluation phase can be in.
 */
export enum PhaseStatus {
  Completed = 'completed',
  InProgress = 'in_progress',
  Available = 'available',
  Locked = 'locked',
  ReviewNeeded = 'review_needed',
}

// --- Core Data Models ---

/**
 * Base interface for patient data.
 */
export interface BasePatient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: string;
  type: PatientType;
  registrationDate: string;
  phone: string;
  email: string;
  address: string;
  medicalHistory: string[];
  medications: string[];
  allergies: string[];
}

/**
 * Represents a kidney donor, extending the base patient properties.
 */
export interface Donor extends BasePatient {
  type: PatientType.Donor;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  relationshipToRecipient?: string;
  motivationForDonation?: string;
}

/**
 * Represents a kidney recipient, extending the base patient properties.
 */
export interface Recipient extends BasePatient {
  type: PatientType.Recipient;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  primaryKidneyDisease?: string;
  dialysisMode?: 'HD' | 'PD' | 'Preemptive';
}

/**
 * A union type representing any patient in the system.
 */
export type Patient = Donor | Recipient;

/**
 * Represents a pairing between a donor and a recipient.
 */
export interface DonorRecipientPair {
  id: string;
  donorId: string;
  recipientId: string;
  compatibilityStatus: 'Compatible' | 'Incompatible' | 'Pending';
  creationDate: string;
}

// --- Workflow & Phase-Specific Models ---

/**
 * Represents a single test result within a lab test group (Phase 1 Legacy).
 */
export interface LabTestResult {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  flag: 'Normal' | 'Abnormal' | null;
  isCompleted: boolean;
}

/**
 * A group of related lab tests (Phase 1 Legacy).
 */
export interface LabTestGroup {
    groupName: string;
    tests: LabTestResult[];
}

/**
 * Represents results for miscellaneous tests (Phase 1 Legacy).
 */
export interface OtherTestResult {
    name: string;
    result: string;
    isCompleted: boolean;
}

/**
 * Represents an individual medical test in the comprehensive checklist views.
 */
export interface MedicalTestItem {
  id: string;
  name: string;
  value: string;
  conditionalValue?: string;
  unit?: string;
  normalRange?: string;
  isAbnormal: boolean;
  isCompleted: boolean;
  category: string;
  inputType: 'text' | 'number' | 'dropdown';
  dropdownOptions?: string[];
  placeholder?: string;
  conditionalInput?: {
    onValue: string;
    placeholder: string;
  };
  conditional?: {
    type: 'age' | 'gender' | 'both';
    condition: { min?: number; max?: number } | 'Male' | 'Female';
    genderCondition?: 'Male' | 'Female';
  };
  isExempt?: boolean;
  exemptionReason?: string;
  exemptionDate?: string;
  exemptedBy?: string;
}

/**
 * Data model for imaging test results (Phase 2 Recipient).
 */
export interface ImagingTestResult {
    name: string;
    status: 'Pending' | 'Completed' | 'Requires Review';
    reportSummary: string;
    isCompleted: boolean;
}

/**
 * Detailed data model for CT Angiogram results (Phase 2 Donor).
 */
export interface CTAngiogram {
    isCompleted: boolean;
    datePerformed: string;
    leftKidneyLength: string;
    leftKidneyWidth: string;
    leftKidneyVolume: string;
    leftMainArteryDiameter: string;
    rightKidneyLength: string;
    rightKidneyWidth: string;
    rightKidneyVolume: string;
    rightMainArteryDiameter: string;
    leftRenalArteries: string;
    leftRenalVeins: string;
    rightRenalArteries: string;
    rightRenalVeins: string;
    accessoryVessels: string;
    corticalThickness: string;
    parenchymalQuality: string;
    calcificationAtherosclerosis: string;
    anatomicalVariations: string;
    clinicalInterpretation: string;
    recommendedKidney: 'Left' | 'Right' | 'Either' | '';
    recommendedApproach: 'Open' | 'Laparoscopic' | 'Robotic' | '';
    reportFileName: string;
    reportUploaded: boolean;
}

/**
 * Detailed data model for DTPA Renogram results (Phase 2 Donor).
 */
export interface DTPARenogram {
    isCompleted: boolean;
    datePerformed: string;
    leftKidneyGfr: string;
    rightKidneyGfr: string;
    totalGfr: string;
    functionalAsymmetry: boolean;
    leftT12: string;
    rightT12: string;
    obstructionPresent: boolean;
    notes: string;
    reportFileName: string;
    reportUploaded: boolean;
}


/**
 * Data model for surgical planning details.
 */
export interface SurgicalPlan {
    notes?: string; // For Recipient
    isCompleted: boolean;
    // For Donor from Phase2DonorEvaluation
    finalKidneySelection?: 'Left' | 'Right' | 'Undecided' | '';
    finalSurgicalApproach?: 'Open' | 'Laparoscopic' | 'Robotic' | '';
    vascularComplexity?: 'Simple' | 'Moderate' | 'Complex' | '';
    anesthesiaRisk?: 'Low Risk' | 'Moderate Risk' | 'High Risk' | '';
    estimatedTimeMinutes?: string;
    anticipatedDifficulties?: string;
    postOpConsiderations?: string;
    teamAssignment?: string;
    generalNotes?: string;
    // Risk Stratification
    donorBmi?: string;
    donorAgeCategory?: 'Young (18-39)' | 'Middle-aged (40-59)' | 'Elderly (60+)' | '';
    smokingHistory?: 'Yes' | 'No' | '';
    hypertensionHistory?: 'Yes' | 'No' | '';
    diabetesHistory?: 'Yes' | 'No' | '';
    calculatedRisk?: 'Low' | 'Medium' | 'High' | 'Not Calculated';
}

/**
 * Data model for a multi-disciplinary consultation (Phase 3).
 */
export interface Consultation {
    id: string;
    department: string;
    isApplicable: boolean;
    status: 'Pending' | 'In Progress' | 'Cleared' | 'Not Required';
    clearanceDate: string;
    doctorName: string;
    notes: string;
    reportFileName: string;
    justification: string;
}

/**
 * Data model for a legal document and committee approval (Phase 4).
 */
export interface LegalClearance {
  status: 'Pending' | 'In Progress' | 'Cleared';
  clearanceDate: string;
  officerName: string;
  notes: string;
  fileName: string;
}

// --- Phase 5: HLA & Crossmatch Models ---

/**
 * Represents the HLA typing for a patient.
 */
export interface HLATyping {
  A: [string, string];
  B: [string, string];
  C: [string, string];
  DR: [string, string];
  DQ: [string, string];
  DP: [string, string];
}

/**
 * Represents the results of various crossmatch tests.
 */
export interface CrossmatchResults {
  cdc: 'Pending' | 'Negative' | 'Positive';
  flow: 'Pending' | 'Negative' | 'Positive';
  dsa: 'Pending' | 'Absent' | 'Present';
  dsaInterpretation?: string;
}

/**
 * Represents the final sign-off assessment.
 */
export interface FinalAssessment {
  finalResult: 'Pending' | 'Compatible' | 'Incompatible' | 'Requires further testing';
  date: string;
  lab: string;
  notes: string;
}

/**
 * Represents an uploaded document for Phase 5.
 */
export interface Phase5Document {
  fileName: string;
  uploadedBy: string;
  uploadDate: string;
}

/**
 * Stores the detailed breakdown of HLA mismatches.
 */
export interface HLAMismatchResult {
  total: number;
  class1: number; // A, B, C
  class2: number; // DR, DQ, DP
  details: {
    A: number;
    B: number;
    C: number;
    DR: number;
    DQ: number;
    DP: number;
  };
}

/**
 * Stores the comprehensive, calculated compatibility result.
 */
export interface HLACompatibility {
  mismatchResult: HLAMismatchResult;
  matchRatio: string; // e.g., "8/12"
  riskLevel: 'Identical' | 'Low' | 'Moderate' | 'High' | 'Pending';
}


/**
 * The complete data model for the pair-based Phase 5.
 */
export interface Phase5Data {
  donorHla: HLATyping;
  recipientHla: HLATyping;
  crossmatch: CrossmatchResults;
  hlaCompatibility: HLACompatibility;
  finalAssessment: FinalAssessment;
  documents: Phase5Document[];
}

// --- Phase 6: Final Review & Readiness ---

/**
 * Represents a single clearance item for the final review phase.
 */
export interface ClearanceItem {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Cleared' | 'Not Required';
  notes: string;
  clearedBy: string;
  clearanceDate: string;
}

/**
 * The complete data model for the Phase 6 final review.
 */
export interface FinalReviewData {
  clearanceItems: ClearanceItem[];
}

// --- Phase 7: Transplant Team Review ---

/**
 * Represents a single item in the transplant team review checklist.
 */
export interface ReviewItem {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  completedBy: string;
  completionDate: string;
}

/**
 * The complete data model for the Phase 7 team review.
 */
export interface TransplantTeamReviewData {
  reviewItems: ReviewItem[];
  finalNotes: string;
  surgeryDate?: string;
}

// --- Phase 8: Surgery Preparation & Admission ---

export interface SurgeryPreparationItem {
  id: string;
  title: string;
  description: string;
  category: 'medical' | 'administrative' | 'surgical' | 'anesthesia';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  assignedTo: string;
  deadline: string;
  dependencies: string[];
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

export interface OperativeSchedule {
  donorSurgeryTime: string;
  recipientSurgeryTime: string;
  orRoom: string;
  surgicalTeam: {
    primarySurgeon: string;
    assistingSurgeon: string;
    anesthesiologist: string;
    nurses: string[]; // Stored as a comma-separated string in UI
    coordinator: string;
  };
  estimatedDuration: {
    donorProcedure: string; // in minutes
    organTransport: string; // in minutes
    recipientProcedure: string; // in minutes
  };
  contingencyPlans: string[]; // Stored as a comma-separated string in UI
}

export interface PreoperativeAssessment {
  patientId: string;
  assessmentDate: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
    weight: string;
  };
  laboratoryResults: {
    hemoglobin: string;
    creatinine: string;
    potassium: string;
    glucose: string;
    coagulation: {
      pt: string;
      ptt: string;
      inr: string;
    };
  };
  clearances: {
    cardiology: boolean;
    pulmonology: boolean;
    anesthesia: boolean;
    surgery: boolean;
  };
  riskAssessment: 'low' | 'moderate' | 'high' | 'pending';
  specialPrecautions: string[]; // Stored as a comma-separated string in UI
}

export interface Phase8Data {
    operativeSchedule: OperativeSchedule;
    donorPreparation: {
        items: SurgeryPreparationItem[];
        assessment: PreoperativeAssessment;
    };
    recipientPreparation: {
        items: SurgeryPreparationItem[];
        assessment: PreoperativeAssessment;
    };
}


/**
 * The core data structure for a single phase in the evaluation workflow.
 * Contains optional properties for data specific to each phase.
 */
export interface EvaluationPhase {
  id: number;
  name: string;
  description: string;
  status: PhaseStatus;
  progress: number;
  abnormalFindings?: number;
  
  // Phase 1 (Legacy view)
  labTestGroups?: LabTestGroup[];
  otherTests?: OtherTestResult[];

  // Phase 2 (Recipient)
  imagingTests?: ImagingTestResult[];

  // Phase 2 (Donor)
  ctAngiogram?: CTAngiogram;
  dtpaRenogram?: DTPARenogram;

  // Shared Phase 2
  surgicalPlan?: SurgicalPlan;
  
  // Phase 3
  consultations?: Consultation[];

  // Phase 4
  legalClearance?: LegalClearance;

  // Phase 5
  phase5Data?: Phase5Data;

  // Phase 6
  finalReviewData?: FinalReviewData;

  // Phase 7
  transplantTeamReviewData?: TransplantTeamReviewData;

  // Phase 8
  phase8Data?: Phase8Data;
}
