import type { Consultation } from './types';

const BASE_CONSULTATIONS: Omit<Consultation, 'id' | 'department' | 'isApplicable'> = {
    status: 'Pending',
    clearanceDate: '',
    doctorName: '',
    notes: '',
    reportFileName: '',
    justification: '',
};

export const DONOR_CONSULTATIONS_TEMPLATE: Consultation[] = [
    { id: 'donor_uro', department: 'Urology', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'donor_cardio', department: 'Cardiology', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'donor_pulmo', department: 'Pulmonology', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'donor_psych', department: 'Psychiatry/Social Worker', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'donor_dental', department: 'Dental', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'donor_ent', department: 'ENT', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'donor_gyno', department: 'Gynecology', ...BASE_CONSULTATIONS, isApplicable: false }, // Conditional
    { id: 'donor_anesth', department: 'Anesthesiology (PAC)', ...BASE_CONSULTATIONS, isApplicable: true },
];

export const RECIPIENT_CONSULTATIONS_TEMPLATE: Consultation[] = [
    { id: 'rec_nephro', department: 'Nephrology', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'rec_cardio', department: 'Cardiology', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'rec_pulmo', department: 'Pulmonology', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'rec_psych', department: 'Psychiatry/Social Worker', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'rec_dental', department: 'Dental', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'rec_ent', department: 'ENT', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'rec_gyno', department: 'Gynecology', ...BASE_CONSULTATIONS, isApplicable: false }, // Conditional
    { id: 'rec_anesth', department: 'Anesthesiology (PAC)', ...BASE_CONSULTATIONS, isApplicable: true },
    { id: 'rec_gi', department: 'Gastroenterology (GI)', ...BASE_CONSULTATIONS, isApplicable: false }, // Optional
];
