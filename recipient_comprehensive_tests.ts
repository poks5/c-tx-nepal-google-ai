import type { MedicalTestItem } from './types';
import { BLOOD_TYPES } from './constants';

export const RECIPIENT_TEST_CATEGORIES = [
    'Blood Tests & Laboratory Studies',
    'Urine & Other Tests',
    'Imaging & Specialized Tests',
];

export const INITIAL_RECIPIENT_TESTS: MedicalTestItem[] = [
    // --- Blood Tests & Laboratory Studies ---
    { id: 'blood_group', name: 'Blood Grouping', value: '', normalRange: 'A/B/AB/O [+/-]', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'dropdown', dropdownOptions: BLOOD_TYPES },

    // CBC
    { id: 'hemoglobin', name: 'Hemoglobin (Hb)', value: '', unit: 'g/dL', normalRange: '13.5-17.5', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'total_count', name: 'Total Count (TC)', value: '', unit: 'cells/mcL', normalRange: '4500-11000', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'neutrophils', name: 'Neutrophils', value: '', unit: '%', normalRange: '40-60', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'lymphocytes', name: 'Lymphocytes', value: '', unit: '%', normalRange: '20-40', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'platelets', name: 'Platelets', value: '', unit: 'x10^3/uL', normalRange: '150-450', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },

    // RFT
    { id: 'urea', name: 'Urea', value: '', unit: 'mg/dL', normalRange: '7-20', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'creatinine', name: 'Creatinine', value: '', unit: 'mg/dL', normalRange: '0.6-1.3', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'sodium', name: 'Sodium (Na)', value: '', unit: 'mEq/L', normalRange: '135-145', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'potassium', name: 'Potassium (K)', value: '', unit: 'mEq/L', normalRange: '3.5-5.1', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'uric_acid_rft', name: 'Uric Acid', value: '', unit: 'mg/dL', normalRange: '3.5-7.2', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },

    // Coagulation
    { id: 'bt', name: 'Bleeding Time (BT)', value: '', unit: 'mins', normalRange: '2-7', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'ct', name: 'Clotting Time (CT)', value: '', unit: 'mins', normalRange: '8-15', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'pt', name: 'Prothrombin Time (PT)', value: '', unit: 'seconds', normalRange: '11-13.5', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'inr', name: 'INR', value: '', unit: '', normalRange: '0.8-1.1', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'aptt', name: 'APTT', value: '', unit: 'seconds', normalRange: '25-35', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },

    // Diabetic
    { id: 'fbs', name: 'FBS', value: '', unit: 'mg/dL', normalRange: '70-100', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'ppbs', name: 'PP', value: '', unit: 'mg/dL', normalRange: '70-140', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'hba1c', name: 'HbA1C', value: '', unit: '%', normalRange: '<5.7', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },

    // Serology
    { id: 'hbsag', name: 'HBsAg', value: '', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'dropdown', dropdownOptions: ['Non-Reactive', 'Reactive'] },
    { id: 'anti_hcv', name: 'Anti-HCV', value: '', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'dropdown', dropdownOptions: ['Non-Reactive', 'Reactive'] },
    { id: 'hiv', name: 'HIV 1 & 2', value: '', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'dropdown', dropdownOptions: ['Non-Reactive', 'Reactive'] },

    // LFT
    { id: 'total_bilirubin', name: 'Bilirubin (Total)', value: '', unit: 'mg/dL', normalRange: '0.1-1.2', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'cong_bilirubin', name: 'Bilirubin (Congugated)', value: '', unit: 'mg/dL', normalRange: '0.0-0.3', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'sgpt', name: 'SGPT (ALT)', value: '', unit: 'U/L', normalRange: '7-56', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'sgot', name: 'SGOT (AST)', value: '', unit: 'U/L', normalRange: '10-40', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'alp', name: 'Alkaline Phosphatase (ALP)', value: '', unit: 'U/L', normalRange: '44-147', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    
    // TFT
    { id: 'ft3', name: 'Free T3', value: '', unit: 'pg/mL', normalRange: '2.0-4.4', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'ft4', name: 'Free T4', value: '', unit: 'ng/dL', normalRange: '0.8-1.8', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'tsh', name: 'TSH', value: '', unit: 'mIU/L', normalRange: '0.4-4.0', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    
    // Lipid Profile
    { id: 'total_cholesterol', name: 'Total Cholesterol', value: '', unit: 'mg/dL', normalRange: '<200', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'triglycerides', name: 'Triglycerides (TG)', value: '', unit: 'mg/dL', normalRange: '<150', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'hdl', name: 'HDL Cholesterol', value: '', unit: 'mg/dL', normalRange: '>40', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'ldl', name: 'LDL Cholesterol', value: '', unit: 'mg/dL', normalRange: '<100', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    
    // Bone Profile
    { id: 'calcium', name: 'Calcium', value: '', unit: 'mg/dL', normalRange: '8.6-10.3', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'phosphorus', name: 'Phosphorus', value: '', unit: 'mg/dL', normalRange: '2.5-4.5', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'ipth', name: 'iPTH', value: '', unit: 'pg/mL', normalRange: '10-65', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'vitd', name: 'Vitamin D', value: '', unit: 'ng/mL', normalRange: '30-100', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },

    // Protein
    { id: 'total_protein', name: 'Total Protein', value: '', unit: 'g/dL', normalRange: '6.0-8.3', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'albumin', name: 'Albumin', value: '', unit: 'g/dL', normalRange: '3.4-5.4', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },

    // Iron Profile
    { id: 'serum_iron', name: 'Serum Iron', value: '', unit: 'mcg/dL', normalRange: '60-170', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'ferritin', name: 'Ferritin', value: '', unit: 'ng/mL', normalRange: '30-400', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'tibc', name: 'TIBC', value: '', unit: 'mcg/dL', normalRange: '240-450', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'tsat', name: 'TSAT', value: '', unit: '%', normalRange: '20-50', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    
    // Other Blood Tests
    { id: 'blood_cs', name: 'Blood C/S', value: '', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'dropdown', dropdownOptions: ['No Growth', 'Positive'], conditionalInput: { onValue: 'Positive', placeholder: 'Specify organism' } },
    { id: 'ana_screening', name: 'ANA-Screening', value: '', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'dropdown', dropdownOptions: ['Negative', 'Positive'] },
    { id: 'cmv_igg', name: 'Cytomegalovirus (CMV) - IgG', value: '', unit: 'AU/mL', normalRange: '<0.6', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'cmv_igm', name: 'Cytomegalovirus (CMV) - IgM', value: '', unit: 'Index', normalRange: '<0.85', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', inputType: 'number' },
    { id: 'psa', name: 'PSA', value: '', unit: 'ng/mL', normalRange: '<4.0', isAbnormal: false, isCompleted: false, category: 'Blood Tests & Laboratory Studies', conditional: { type: 'both', genderCondition: 'Male', condition: { min: 50 } }, inputType: 'number' },

    // --- Urine & Other Tests ---
    { id: 'urine_re', name: 'Urine R/E', value: '', isAbnormal: false, isCompleted: false, category: 'Urine & Other Tests', inputType: 'text', normalRange: 'Clear, pH 5-8' },
    { id: 'pregnancy_test', name: 'Urine Pregnancy Test', value: '', isAbnormal: false, isCompleted: false, category: 'Urine & Other Tests', conditional: { type: 'gender', condition: 'Female' }, inputType: 'dropdown', dropdownOptions: ['Negative', 'Positive'] },
    { id: 'stool_re', name: 'Stool R/E', value: '', isAbnormal: false, isCompleted: false, category: 'Urine & Other Tests', inputType: 'text', normalRange: 'No parasites/ova' },
    { id: 'stool_occult', name: 'Stool Occult Blood', value: '', isAbnormal: false, isCompleted: false, category: 'Urine & Other Tests', inputType: 'dropdown', dropdownOptions: ['Negative', 'Positive'] },

    // --- Imaging & Specialized Tests ---
    { id: 'chest_xray', name: 'Chest X-ray P/A view', value: '', isAbnormal: false, isCompleted: false, category: 'Imaging & Specialized Tests', inputType: 'text', normalRange: 'Clear lung fields' },
    { id: 'kub_xray', name: 'X-ray KUB', value: '', isAbnormal: false, isCompleted: false, category: 'Imaging & Specialized Tests', inputType: 'text', normalRange: 'No calcification' },
    { id: 'ecg', name: 'ECG', value: '', isAbnormal: false, isCompleted: false, category: 'Imaging & Specialized Tests', inputType: 'text', normalRange: 'Normal sinus rhythm' },
    { id: 'echo', name: 'ECHO', value: '', isAbnormal: false, isCompleted: false, category: 'Imaging & Specialized Tests', inputType: 'text', placeholder: 'RWMA, LVEF-%, other abnormality' },
    { id: 'usg_abdomen', name: 'USG Abdomen & Pelvis', value: '', isAbnormal: false, isCompleted: false, category: 'Imaging & Specialized Tests', inputType: 'text', normalRange: 'Normal organ size' },
    { id: 'usg_doppler', name: 'USG Doppler of bilateral iliac vessels', value: '', isAbnormal: false, isCompleted: false, category: 'Imaging & Specialized Tests', inputType: 'text', normalRange: 'Patent vessels' },
    { id: 'sputum_afb', name: 'Sputum AFB: I & II', value: '', isAbnormal: false, isCompleted: false, category: 'Imaging & Specialized Tests', inputType: 'dropdown', dropdownOptions: ['Negative', 'Positive'] },
    { id: 'sputum_cs', name: 'Sputum C/S', value: '', isAbnormal: false, isCompleted: false, category: 'Imaging & Specialized Tests', inputType: 'dropdown', dropdownOptions: ['No Growth', 'Positive'], conditionalInput: { onValue: 'Positive', placeholder: 'Specify organism' } },
    { id: 'colonoscopy', name: 'Colonoscopy', value: '', isAbnormal: false, isCompleted: false, category: 'Imaging & Specialized Tests', conditional: { type: 'age', condition: { min: 60 } }, inputType: 'text', normalRange: 'Normal findings' },
];
