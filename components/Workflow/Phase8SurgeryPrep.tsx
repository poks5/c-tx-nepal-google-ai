
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Patient, EvaluationPhase, Phase8Data, SurgeryPreparationItem, PreoperativeAssessment, OperativeSchedule } from '../../types';
import { PhaseStatus, PatientType } from '../../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { getPairs, getWorkflowForPatient, updateWorkflowForPatient } from '../../services/backendService';
import { ClipboardList, Stethoscope, CalendarCheck, CheckCircle, Clock } from 'lucide-react';
import { produce } from 'immer';

// --- Prop Types ---
interface Phase8Props {
  patient: Patient;
  phase: EvaluationPhase;
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
  isLocked: boolean;
}

// --- Helper Input Components ---
const InputField = ({ label, name, value, onChange, disabled, type = "text" }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} name={name} id={name} value={value || ''} onChange={onChange} disabled={disabled} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
    </div>
);

const CheckboxField = ({ label, name, checked, onChange, disabled }: any) => (
    <div className="flex items-center">
        <input type="checkbox" name={name} id={name} checked={checked} onChange={onChange} disabled={disabled} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
        <label htmlFor={name} className="ml-3 block text-sm font-medium text-gray-700">{label}</label>
    </div>
);


// --- Sub-components for each tab ---
const ScheduleView: React.FC<{ data: OperativeSchedule, onUpdate: (field: keyof OperativeSchedule | string, value: any) => void, isLocked: boolean }> = ({ data, onUpdate, isLocked }) => {
    return (
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="OR Room" name="orRoom" value={data.orRoom} onChange={(e: any) => onUpdate('orRoom', e.target.value)} disabled={isLocked} />
                <InputField label="Donor Surgery Time" name="donorTime" type="datetime-local" value={data.donorSurgeryTime} onChange={(e: any) => onUpdate('donorSurgeryTime', e.target.value)} disabled={isLocked} />
                <InputField label="Recipient Surgery Time" name="recTime" type="datetime-local" value={data.recipientSurgeryTime} onChange={(e: any) => onUpdate('recipientSurgeryTime', e.target.value)} disabled={isLocked} />
            </div>
            <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-800 mb-2">Surgical Team</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Primary Surgeon" name="primarySurgeon" value={data.surgicalTeam.primarySurgeon} onChange={(e: any) => onUpdate('surgicalTeam.primarySurgeon', e.target.value)} disabled={isLocked} />
                    <InputField label="Assisting Surgeon" name="assistingSurgeon" value={data.surgicalTeam.assistingSurgeon} onChange={(e: any) => onUpdate('surgicalTeam.assistingSurgeon', e.target.value)} disabled={isLocked} />
                    <InputField label="Anesthesiologist" name="anesthesiologist" value={data.surgicalTeam.anesthesiologist} onChange={(e: any) => onUpdate('surgicalTeam.anesthesiologist', e.target.value)} disabled={isLocked} />
                </div>
            </div>
        </CardContent>
    )
};

const ChecklistView: React.FC<{ items: SurgeryPreparationItem[], onUpdate: (id: string, newStatus: SurgeryPreparationItem['status']) => void, isLocked: boolean }> = ({ items, onUpdate, isLocked }) => {
    const getStatusColor = (status: SurgeryPreparationItem['status']) => {
        if (status === 'completed') return 'green';
        if (status === 'in_progress') return 'blue';
        if (status === 'delayed') return 'red';
        return 'yellow';
    };
    return (
        <CardContent className="space-y-3">
            {items.map(item => (
                <div key={item.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge color={getStatusColor(item.status)}>{item.status.replace('_', ' ')}</Badge>
                        {item.status !== 'completed' && <Button size="sm" variant="secondary" onClick={() => onUpdate(item.id, 'completed')} disabled={isLocked}>Complete</Button>}
                    </div>
                </div>
            ))}
        </CardContent>
    )
};

const AssessmentView: React.FC<{ data: PreoperativeAssessment, onUpdate: (field: string, value: any) => void, isLocked: boolean }> = ({ data, onUpdate, isLocked }) => {
    return (
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Assessment Date" name="assessmentDate" type="date" value={data.assessmentDate} onChange={(e: any) => onUpdate('assessmentDate', e.target.value)} disabled={isLocked} />
            </div>
            <div className="pt-4 border-t">
                 <h4 className="font-medium text-gray-800 mb-2">Vital Signs</h4>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <InputField label="BP (mmHg)" name="bp" value={data.vitalSigns.bloodPressure} onChange={(e: any) => onUpdate('vitalSigns.bloodPressure', e.target.value)} disabled={isLocked} />
                    <InputField label="HR (bpm)" name="hr" value={data.vitalSigns.heartRate} onChange={(e: any) => onUpdate('vitalSigns.heartRate', e.target.value)} disabled={isLocked} />
                    <InputField label="Temp (°C)" name="temp" value={data.vitalSigns.temperature} onChange={(e: any) => onUpdate('vitalSigns.temperature', e.target.value)} disabled={isLocked} />
                    <InputField label="SpO2 (%)" name="spo2" value={data.vitalSigns.oxygenSaturation} onChange={(e: any) => onUpdate('vitalSigns.oxygenSaturation', e.target.value)} disabled={isLocked} />
                    <InputField label="Weight (kg)" name="weight" value={data.vitalSigns.weight} onChange={(e: any) => onUpdate('vitalSigns.weight', e.target.value)} disabled={isLocked} />
                 </div>
            </div>
            <div className="pt-4 border-t">
                 <h4 className="font-medium text-gray-800 mb-2">Final Clearances</h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <CheckboxField label="Cardiology" name="cardioClear" checked={data.clearances.cardiology} onChange={(e: any) => onUpdate('clearances.cardiology', e.target.checked)} disabled={isLocked} />
                    <CheckboxField label="Pulmonology" name="pulmoClear" checked={data.clearances.pulmonology} onChange={(e: any) => onUpdate('clearances.pulmonology', e.target.checked)} disabled={isLocked} />
                    <CheckboxField label="Anesthesia" name="anesthClear" checked={data.clearances.anesthesia} onChange={(e: any) => onUpdate('clearances.anesthesia', e.target.checked)} disabled={isLocked} />
                    <CheckboxField label="Surgery" name="surgClear" checked={data.clearances.surgery} onChange={(e: any) => onUpdate('clearances.surgery', e.target.checked)} disabled={isLocked} />
                 </div>
            </div>
        </CardContent>
    )
};


// --- Main Component ---
const Phase8SurgeryPrep: React.FC<Phase8Props> = ({ patient, phase, setWorkflowData, isLocked }) => {
    const [phaseData, setPhaseData] = useState<Phase8Data>(phase.phase8Data!);
    const [activeTab, setActiveTab] = useState<'schedule' | 'checklist' | 'assessment'>('schedule');
    const [otherPatientId, setOtherPatientId] = useState<string | null>(null);

    useEffect(() => {
        const findPair = async () => {
            const allPairs = await getPairs();
            const pair = allPairs.find(p => p.donorId === patient.id || p.recipientId === patient.id);
            if (pair) {
                const otherId = patient.type === PatientType.Donor ? pair.recipientId : pair.donorId;
                setOtherPatientId(otherId);
            }
        };
        findPair();
    }, [patient.id, patient.type]);

    useEffect(() => setPhaseData(phase.phase8Data!), [phase.phase8Data]);

    const progress = useMemo(() => {
        if (!phaseData) return 0;
        const prep = patient.type === PatientType.Donor ? phaseData.donorPreparation : phaseData.recipientPreparation;
        const totalItems = prep.items.length;
        const completedItems = prep.items.filter(i => i.status === 'completed').length;
        const checklistProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 100;

        const { assessment } = prep;
        const assessFields = [assessment.assessmentDate, ...Object.values(assessment.vitalSigns)].filter(Boolean);
        const totalAssessFields = 6;
        const assessmentProgress = (assessFields.length / totalAssessFields) * 100;
        
        // Weight checklist 70%, assessment 30%
        return Math.round(checklistProgress * 0.7 + assessmentProgress * 0.3);
    }, [phaseData, patient.type]);
    
    // Update current patient's workflow
    useEffect(() => {
        const handler = setTimeout(() => {
            let newStatus = phase.status;
            if (!isLocked) {
                 if (progress === 100) newStatus = PhaseStatus.Completed;
                 else if (progress > 0) newStatus = PhaseStatus.InProgress;
                 else newStatus = PhaseStatus.Available;
            }
            if (progress !== phase.progress || newStatus !== phase.status || JSON.stringify(phaseData) !== JSON.stringify(phase.phase8Data)) {
                setWorkflowData(prev => prev.map(p => p.id === phase.id ? { ...p, progress, status: newStatus, phase8Data: phaseData } : p));
            }
        }, 500); // Debounce to prevent focus loss
        return () => clearTimeout(handler);
    }, [progress, phase, phaseData, setWorkflowData, isLocked]);

    // Synchronize to paired patient
    useEffect(() => {
        if (!otherPatientId || JSON.stringify(phaseData) === JSON.stringify(phase.phase8Data)) return;
        
        const syncData = async () => {
            if (!otherPatientId) return;
            const otherWorkflow = await getWorkflowForPatient(otherPatientId);
            const otherPhase = otherWorkflow.find(p => p.id === phase.id);
            if (otherPhase && JSON.stringify(otherPhase.phase8Data) !== JSON.stringify(phaseData)) {
                 const updatedOtherWorkflow = otherWorkflow.map(p => {
                    if (p.id === phase.id) {
                        return { ...p, phase8Data: phaseData }; // Sync the whole data object
                    }
                    return p;
                });
                await updateWorkflowForPatient(otherPatientId, updatedOtherWorkflow);
            }
        };

        const syncTimer = setTimeout(() => {
            syncData().catch(console.error);
        }, 1500);
        return () => clearTimeout(syncTimer);
    }, [phaseData, otherPatientId, phase]);


    const handleDataUpdate = useCallback((path: string, value: any) => {
        setPhaseData(produce(draft => {
            const keys = path.split('.');
            let current = draft as any;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
        }));
    }, []);

    const handleChecklistUpdate = useCallback((id: string, newStatus: SurgeryPreparationItem['status']) => {
        const prepPath = patient.type === PatientType.Donor ? 'donorPreparation' : 'recipientPreparation';
        setPhaseData(produce(draft => {
            const prep = (draft as any)[prepPath];
            const item = prep.items.find((i: SurgeryPreparationItem) => i.id === id);
            if (item) {
                item.status = newStatus;
                item.completedAt = new Date().toISOString();
                item.completedBy = "System User";
            }
        }));
    }, [patient.type]);

    const TabButton = ({ tab, label, icon }: {tab: any, label: string, icon: React.ReactNode}) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center p-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
        >
            {icon} <span className="ml-2 hidden sm:inline">{label}</span>
        </button>
    );

    if (!phaseData) return <div className="p-4">Loading...</div>;

    const patientPrep = patient.type === PatientType.Donor ? phaseData.donorPreparation : phaseData.recipientPreparation;

    return (
        <div className="p-4 md:p-6 bg-white rounded-b-lg border border-t-0 border-gray-200 space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex" aria-label="Tabs">
                    <TabButton tab="schedule" label="Surgical Coordination" icon={<CalendarCheck size={18} />} />
                    <TabButton tab="checklist" label="Preparation Checklist" icon={<ClipboardList size={18} />} />
                    <TabButton tab="assessment" label="Pre-Op Assessment" icon={<Stethoscope size={18} />} />
                </nav>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{
                        { schedule: 'Surgical Coordination', checklist: `${patient.type} Preparation Checklist`, assessment: `${patient.type} Pre-Operative Assessment` }[activeTab]
                    }</CardTitle>
                </CardHeader>
                {activeTab === 'schedule' && <ScheduleView data={phaseData.operativeSchedule} onUpdate={handleDataUpdate} isLocked={isLocked} />}
                {activeTab === 'checklist' && <ChecklistView items={patientPrep.items} onUpdate={handleChecklistUpdate} isLocked={isLocked} />}
                {activeTab === 'assessment' && <AssessmentView data={patientPrep.assessment} onUpdate={(field, value) => handleDataUpdate(`${patient.type === PatientType.Donor ? 'donorPreparation' : 'recipientPreparation'}.assessment.${field}`, value)} isLocked={isLocked} />}
            </Card>

            <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Overall Phase Progress: {progress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default Phase8SurgeryPrep;