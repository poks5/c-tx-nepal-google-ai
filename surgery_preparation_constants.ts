import type { SurgeryPreparationItem, OperativeSchedule, PreoperativeAssessment, Phase8Data } from './types';

const BASE_PREP_ITEM: Omit<SurgeryPreparationItem, 'id' | 'title' | 'description' | 'category' | 'priority'> = {
    status: 'pending',
    assignedTo: '',
    deadline: '',
    dependencies: [],
};

const DONOR_PREPARATION_ITEMS_TEMPLATE: SurgeryPreparationItem[] = [
    { id: 'donor_final_crossmatch', title: 'Final Crossmatch', description: 'Final compatibility test before surgery.', category: 'medical', priority: 'critical', ...BASE_PREP_ITEM },
    { id: 'donor_pre_admit_testing', title: 'Pre-admission Testing (PAT)', description: 'Final blood work and ECG.', category: 'medical', priority: 'high', ...BASE_PREP_ITEM },
    { id: 'donor_anesthesia_consult', title: 'Anesthesia Pre-Op Consult', description: 'Final assessment by the anesthesiologist.', category: 'anesthesia', priority: 'high', ...BASE_PREP_ITEM },
    { id: 'donor_surgical_consent', title: 'Surgical Consent Signed', description: 'Informed consent for nephrectomy confirmed and signed.', category: 'administrative', priority: 'critical', ...BASE_PREP_ITEM },
    { id: 'donor_admission_scheduled', title: 'Hospital Admission Scheduled', description: 'Bed and admission time confirmed.', category: 'administrative', priority: 'medium', ...BASE_PREP_ITEM },
    { id: 'donor_npo_verified', title: 'NPO Status Verified', description: 'Confirmation of "nothing by mouth" status.', category: 'surgical', priority: 'critical', ...BASE_PREP_ITEM },
];

const RECIPIENT_PREPARATION_ITEMS_TEMPLATE: SurgeryPreparationItem[] = [
    { id: 'rec_final_crossmatch', title: 'Final Crossmatch', description: 'Final compatibility test before surgery.', category: 'medical', priority: 'critical', ...BASE_PREP_ITEM },
    { id: 'rec_pre_op_dialysis', title: 'Pre-operative Dialysis', description: 'Final dialysis session completed as scheduled.', category: 'medical', priority: 'high', ...BASE_PREP_ITEM },
    { id: 'rec_immuno_protocol', title: 'Immunosuppression Protocol Initiated', description: 'First dose of induction immunosuppressants administered.', category: 'medical', priority: 'critical', ...BASE_PREP_ITEM },
    { id: 'rec_anesthesia_consult', title: 'Anesthesia Pre-Op Consult', description: 'Final assessment by the anesthesiologist.', category: 'anesthesia', priority: 'high', ...BASE_PREP_ITEM },
    { id: 'rec_surgical_consent', title: 'Surgical Consent Signed', description: 'Informed consent for transplantation confirmed and signed.', category: 'administrative', priority: 'critical', ...BASE_PREP_ITEM },
    { id: 'rec_blood_products', title: 'Blood Products Availability Confirmed', description: 'Availability of matched blood products confirmed.', category: 'surgical', priority: 'high', ...BASE_PREP_ITEM },
];

const INITIAL_OPERATIVE_SCHEDULE: OperativeSchedule = {
  donorSurgeryTime: '',
  recipientSurgeryTime: '',
  orRoom: '',
  surgicalTeam: {
    primarySurgeon: '',
    assistingSurgeon: '',
    anesthesiologist: '',
    nurses: [],
    coordinator: '',
  },
  estimatedDuration: {
    donorProcedure: '',
    organTransport: '',
    recipientProcedure: '',
  },
  contingencyPlans: [],
};

const BASE_ASSESSMENT: Omit<PreoperativeAssessment, 'patientId'> = {
  assessmentDate: '',
  vitalSigns: { bloodPressure: '', heartRate: '', temperature: '', oxygenSaturation: '', weight: '' },
  laboratoryResults: {
    hemoglobin: '', creatinine: '', potassium: '', glucose: '',
    coagulation: { pt: '', ptt: '', inr: '' },
  },
  clearances: { cardiology: false, pulmonology: false, anesthesia: false, surgery: false },
  riskAssessment: 'pending',
  specialPrecautions: [],
};

export const INITIAL_PHASE_8_DATA: Phase8Data = {
    operativeSchedule: INITIAL_OPERATIVE_SCHEDULE,
    donorPreparation: {
        items: DONOR_PREPARATION_ITEMS_TEMPLATE,
        assessment: { ...BASE_ASSESSMENT, patientId: 'donor' }
    },
    recipientPreparation: {
        items: RECIPIENT_PREPARATION_ITEMS_TEMPLATE,
        assessment: { ...BASE_ASSESSMENT, patientId: 'recipient' }
    }
};
