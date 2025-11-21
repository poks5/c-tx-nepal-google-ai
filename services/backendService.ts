import { Patient, DonorRecipientPair, EvaluationPhase, PatientType, PhaseStatus } from '../types';
import { DONOR_WORKFLOW_TEMPLATE } from '../donor_constants';
import { RECIPIENT_WORKFLOW_TEMPLATE } from '../recipient_constants';

// --- Constants for localStorage keys ---
const PATIENTS_KEY = 'transplantflow_patients';
const PAIRS_KEY = 'transplantflow_pairs';
const WORKFLOWS_KEY = 'transplantflow_workflows';

// --- Type-safe helpers for localStorage ---
const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },
};

// --- Initial Mock Data (used only if localStorage is empty) ---
const initialPatients: Patient[] = [
  {
    id: 'p001',
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    bloodType: 'A+',
    type: PatientType.Donor,
    registrationDate: '2024-01-15',
    phone: '555-123-4567',
    email: 'john.s@example.com',
    address: '123 Maple St, Springfield',
    medicalHistory: ['Hypertension (controlled)', 'History of kidney stones'],
    medications: ['Lisinopril'],
    allergies: ['Penicillin'],
    relationshipToRecipient: 'Spouse',
    motivationForDonation: 'Wishes to help his wife lead a normal life.',
  },
  {
    id: 'p002',
    name: 'Jane Smith',
    age: 42,
    gender: 'Female',
    bloodType: 'A+',
    type: PatientType.Recipient,
    registrationDate: '2024-01-15',
    phone: '555-123-4568',
    email: 'jane.s@example.com',
    address: '123 Maple St, Springfield',
    medicalHistory: ['End-Stage Renal Disease (ESRD) due to Polycystic Kidney Disease (PKD)'],
    medications: ['Sevelamer', 'Erythropoietin'],
    allergies: ['None'],
    weightKg: 68,
    heightCm: 165,
    bmi: 24.9,
    primaryKidneyDisease: 'Polycystic Kidney Disease (PKD)',
    dialysisMode: 'HD',
  },
  {
    id: 'p003',
    name: 'Robert Johnson',
    age: 58,
    gender: 'Male',
    bloodType: 'O-',
    type: PatientType.Recipient,
    registrationDate: '2024-02-20',
    phone: '555-987-6543',
    email: 'rob.j@example.com',
    address: '456 Oak Ave, Metropolis',
    medicalHistory: ['Diabetic Nephropathy', 'Coronary Artery Disease'],
    medications: ['Insulin', 'Metoprolol', 'Aspirin'],
    allergies: ['Sulfa drugs'],
    weightKg: 95,
    heightCm: 180,
    bmi: 29.3,
    primaryKidneyDisease: 'Diabetic Nephropathy',
    dialysisMode: 'PD',
  }
];

const initialPairs: DonorRecipientPair[] = [
    {
        id: 'pair001',
        donorId: 'p001',
        recipientId: 'p002',
        compatibilityStatus: 'Compatible',
        creationDate: '2024-01-20',
    }
];

// --- Centralized Database Manager ---
class Database {
  public patients: Patient[];
  public pairs: DonorRecipientPair[];
  public workflows: Record<string, EvaluationPhase[]>;

  constructor() {
    this.patients = storage.get<Patient[]>(PATIENTS_KEY) ?? this.seedPatients();
    this.pairs = storage.get<DonorRecipientPair[]>(PAIRS_KEY) ?? this.seedPairs();
    this.workflows = storage.get<Record<string, EvaluationPhase[]>>(WORKFLOWS_KEY) ?? this.seedWorkflows();
  }
  
  private seedPatients(): Patient[] {
    storage.set(PATIENTS_KEY, initialPatients);
    return initialPatients;
  }

  private seedPairs(): DonorRecipientPair[] {
    storage.set(PAIRS_KEY, initialPairs);
    return initialPairs;
  }

  private seedWorkflows(): Record<string, EvaluationPhase[]> {
      const emptyWorkflows = {};
      storage.set(WORKFLOWS_KEY, emptyWorkflows);
      return emptyWorkflows;
  }
  
  // --- Data Mutation Methods ---
  
  savePatients() {
    storage.set(PATIENTS_KEY, this.patients);
  }
  
  savePairs() {
    storage.set(PAIRS_KEY, this.pairs);
  }
  
  saveWorkflows() {
    storage.set(WORKFLOWS_KEY, this.workflows);
  }
}

// --- Singleton instance of our database, initialized once ---
const DB = new Database();

// --- Helper to merge latest template changes into loaded workflow data ---
const hydrateObject = (target: any, template: any): any => {
    if (typeof template !== 'object' || template === null || Array.isArray(template)) {
        return target;
    }
    const hydrated = { ...target };
    for (const key in template) {
        if (Object.prototype.hasOwnProperty.call(template, key)) {
            const templateValue = template[key];
            const targetValue = target[key];
            if (typeof targetValue === 'undefined') {
                hydrated[key] = templateValue;
            } else if (typeof templateValue === 'object' && templateValue !== null && !Array.isArray(templateValue) && typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue)) {
                hydrated[key] = hydrateObject(targetValue, templateValue);
            }
        }
    }
    return hydrated;
};

// --- API-like functions ---
// Operations are effectively synchronous and resolve immediately
export const getPatients = (): Promise<Patient[]> => Promise.resolve(DB.patients);

export const getPatientById = (id: string): Promise<Patient | undefined> => Promise.resolve(DB.patients.find(p => p.id === id));

export const getPairs = (): Promise<DonorRecipientPair[]> => Promise.resolve(DB.pairs);

export const getPairById = (id: string): Promise<DonorRecipientPair | undefined> => Promise.resolve(DB.pairs.find(p => p.id === id));

export const registerNewPatient = (patientData: Omit<Patient, 'id' | 'registrationDate'>): Promise<Patient> => {
    const newPatient: Patient = {
        ...patientData,
        id: `p${(DB.patients.length + 1).toString().padStart(3, '0')}`,
        registrationDate: new Date().toISOString().split('T')[0],
    };
    DB.patients.push(newPatient);
    DB.savePatients();
    return Promise.resolve(newPatient);
};

export const getWorkflowForPatient = (patientId: string): Promise<EvaluationPhase[]> => {
    const patient = DB.patients.find(p => p.id === patientId);
    if (!patient) return Promise.resolve([]);
    
    const template = patient.type === PatientType.Donor ? DONOR_WORKFLOW_TEMPLATE : RECIPIENT_WORKFLOW_TEMPLATE;

    if (DB.workflows[patientId]) {
        // Hydrate existing workflow data with the latest template
        const loadedWorkflow = DB.workflows[patientId];
        const hydratedWorkflow = template.map(templatePhase => {
            const loadedPhase = loadedWorkflow.find(p => p.id === templatePhase.id) || templatePhase;
            return hydrateObject(loadedPhase, templatePhase);
        });
        DB.workflows[patientId] = hydratedWorkflow;
    } else {
        // Create new workflow from template if none exists
        DB.workflows[patientId] = JSON.parse(JSON.stringify(template));
    }

    // --- UNLOCKING LOGIC ---
    // Ensure all phases are unlocked for immediate data entry,
    // applying the change retroactively to any stored workflows.
    const unlockedWorkflow = DB.workflows[patientId].map(phase => {
        if (phase.status === PhaseStatus.Locked) {
            return { ...phase, status: PhaseStatus.Available };
        }
        return phase;
    });

    DB.workflows[patientId] = unlockedWorkflow;
    
    DB.saveWorkflows(); // Save any changes from creation or hydration
    return Promise.resolve(DB.workflows[patientId]);
};

export const updateWorkflowForPatient = (patientId: string, workflow: EvaluationPhase[]): Promise<void> => {
    DB.workflows[patientId] = workflow;
    DB.saveWorkflows();
    return Promise.resolve();
};

export const createPair = (donorId: string, recipientId: string): Promise<DonorRecipientPair> => {
    const newPair: DonorRecipientPair = {
        id: `pair${(DB.pairs.length + 1).toString().padStart(3, '0')}`,
        donorId,
        recipientId,
        compatibilityStatus: 'Pending',
        creationDate: new Date().toISOString().split('T')[0],
    };
    DB.pairs.push(newPair);
    DB.savePairs();
    return Promise.resolve(newPair);
};
