import type { ClearanceItem } from './types';

const BASE_CLEARANCE_ITEM: Omit<ClearanceItem, 'id' | 'title' | 'description'> = {
    status: 'Pending',
    notes: '',
    clearedBy: '',
    clearanceDate: '',
};

export const DONOR_CLEARANCE_TEMPLATE: ClearanceItem[] = [
    { id: 'donor_med_review', title: 'Final Medical Review', description: 'Comprehensive assessment of all evaluation data.', ...BASE_CLEARANCE_ITEM },
    { id: 'donor_surg_clear', title: 'Surgical Clearance', description: 'Final sign-off on operative fitness for donation.', ...BASE_CLEARANCE_ITEM },
    { id: 'donor_anesth_clear', title: 'Anesthesia Clearance', description: 'Final assessment of perioperative risk.', ...BASE_CLEARANCE_ITEM },
    { id: 'donor_consent', title: 'Final Donation Consent', description: 'Verification of informed consent for donation.', ...BASE_CLEARANCE_ITEM },
    { id: 'donor_advocate', title: 'Independent Advocate Clearance', description: 'Confirmation of ethical oversight and donor well-being.', ...BASE_CLEARANCE_ITEM },
];

export const RECIPIENT_CLEARANCE_TEMPLATE: ClearanceItem[] = [
    { id: 'rec_med_review', title: 'Comprehensive Medical Review', description: 'Final assessment of readiness for transplant.', ...BASE_CLEARANCE_ITEM },
    { id: 'rec_surg_clear', title: 'Surgical Clearance', description: 'Final sign-off on operative candidacy.', ...BASE_CLEARANCE_ITEM },
    { id: 'rec_anesth_clear', title: 'Anesthesia Clearance', description: 'Final assessment of perioperative optimization.', ...BASE_CLEARANCE_ITEM },
    { id: 'rec_consent', title: 'Final Informed Consent', description: 'Verification of informed consent for transplant procedure.', ...BASE_CLEARANCE_ITEM },
];
