import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Patient, EvaluationPhase, Consultation } from '../../types';
import { PhaseStatus } from '../../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { Check, CheckCircle, ChevronDown, FileUp, X, AlertTriangle, BrainCircuit } from 'lucide-react';
import { generateClearanceSummary } from '../../services/geminiService';

interface Phase3Props {
  patient: Patient;
  phase: EvaluationPhase;
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
  isLocked: boolean;
}

const getStatusColor = (status: Consultation['status']) => {
  switch (status) {
    case 'Cleared': return 'bg-green-100 text-green-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Not Required': return 'bg-gray-100 text-gray-700';
    case 'Pending':
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

const ConsultationRow: React.FC<{
    consult: Consultation;
    isLocked: boolean;
    onUpdate: (id: string, field: keyof Consultation, value: any) => void;
    onFileChange: (id:string, e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileRemove: (id: string) => void;
}> = ({ consult, isLocked, onUpdate, onFileChange, onFileRemove }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as Consultation['status'];
        if (newStatus === 'Not Required') {
            const justification = prompt("Please provide a justification for marking this as 'Not Required'.");
            if (justification) {
                onUpdate(consult.id, 'justification', justification);
                onUpdate(consult.id, 'status', newStatus);
            }
        } else {
             onUpdate(consult.id, 'status', newStatus);
        }
    }

    if (!consult.isApplicable) return null;

    return (
        <div className="border border-gray-200 rounded-lg">
            <button className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50" onClick={() => setIsOpen(!isOpen)}>
                <div className="font-semibold text-gray-800">{consult.department}</div>
                <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(consult.status)}`}>{consult.status}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                 <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select value={consult.status} onChange={handleStatusChange} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Cleared</option>
                                <option>Not Required</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Clearance Date</label>
                            <input type="date" value={consult.clearanceDate} onChange={e => onUpdate(consult.id, 'clearanceDate', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Doctor's Name</label>
                            <input type="text" value={consult.doctorName} onChange={e => onUpdate(consult.id, 'doctorName', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea rows={3} value={consult.notes} onChange={e => onUpdate(consult.id, 'notes', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Supporting Document</label>
                         {!consult.reportFileName ? (
                            <div className="mt-1">
                                <input type="file" id={`file-${consult.id}`} className="sr-only" disabled={isLocked} onChange={e => onFileChange(consult.id, e)} />
                                <label htmlFor={`file-${consult.id}`} className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                                    <FileUp size={16} className="mr-2"/> Upload File
                                </label>
                            </div>
                         ) : (
                            <div className="mt-1 flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-500"/>
                                    <p className="text-sm font-medium text-gray-800 truncate">{consult.reportFileName}</p>
                                </div>
                                <button onClick={() => onFileRemove(consult.id)} disabled={isLocked} className="p-1 text-gray-500 hover:text-red-600">
                                    <X size={16}/>
                                </button>
                            </div>
                         )}
                     </div>
                 </div>
            )}
        </div>
    );
};

const Phase3Consultations: React.FC<Phase3Props> = ({ patient, phase, setWorkflowData, isLocked }) => {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [summary, setSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    useEffect(() => {
        // Initialize and determine applicability of consultations
        const initialConsults = (phase.consultations || []).map(c => {
            let isApplicable = c.isApplicable;
            if (c.id.includes('gyno') && patient.gender === 'Female') {
                isApplicable = true;
            }
            if (c.id.includes('gi') && patient.type === 'Recipient') { // Example for optional
                // Logic to make GI applicable could be based on patient history in a real app
                // For now, we keep its default applicability unless manually changed
            }
            return { ...c, isApplicable };
        });
        setConsultations(initialConsults);
    }, [phase.consultations, patient.gender, patient.type]);


    const progress = useMemo(() => {
        const applicableConsults = consultations.filter(c => c.isApplicable);
        if (applicableConsults.length === 0) return 100;

        const completedCount = applicableConsults.filter(c => c.status === 'Cleared' || c.status === 'Not Required').length;
        return Math.round((completedCount / applicableConsults.length) * 100);
    }, [consultations]);


    useEffect(() => {
        let newStatus = phase.status;
        if (!isLocked) {
             if (progress === 100) newStatus = PhaseStatus.Completed;
             else if (consultations.some(c => c.status !== 'Pending')) newStatus = PhaseStatus.InProgress;
             else newStatus = PhaseStatus.Available;
        }

        if (progress !== phase.progress || newStatus !== phase.status || JSON.stringify(consultations) !== JSON.stringify(phase.consultations)) {
            const timer = setTimeout(() => {
                 setWorkflowData(prev => {
                    const newWorkflow = prev.map(p => p.id === phase.id ? { ...p, progress, status: newStatus, consultations } : p);
                    if (newStatus === PhaseStatus.Completed) {
                        const nextPhaseIndex = newWorkflow.findIndex(p => p.id === phase.id + 1);
                        if (nextPhaseIndex !== -1 && newWorkflow[nextPhaseIndex].status === PhaseStatus.Locked) {
                            newWorkflow[nextPhaseIndex].status = PhaseStatus.Available;
                        }
                    }
                    return newWorkflow;
                 });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [progress, phase.progress, phase.status, consultations, phase.id, setWorkflowData, isLocked]);


    const handleUpdate = useCallback((id: string, field: keyof Consultation, value: any) => {
        setConsultations(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    }, []);
    
    const handleFileChange = useCallback((id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             handleUpdate(id, 'reportFileName', file.name);
        }
    }, [handleUpdate]);

    const handleFileRemove = useCallback((id: string) => {
        handleUpdate(id, 'reportFileName', '');
    }, [handleUpdate]);

    const handleGenerateSummary = async () => {
        setIsLoadingSummary(true);
        setSummary('');
        const result = await generateClearanceSummary(patient, consultations);
        setSummary(result);
        setIsLoadingSummary(false);
    };
    
    const handleCompletePhase = () => {
         setWorkflowData(prev => prev.map(p => p.id === phase.id ? { ...p, progress: 100, status: PhaseStatus.Completed, consultations } : p));
    }


    return (
        <div className="p-4 md:p-6 bg-white rounded-b-lg border border-t-0 border-gray-200 space-y-6">
            {isLocked && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-md" role="alert">
                    <p className="font-bold">Phase Locked</p>
                    <p>This phase is not yet active. Complete prior phases to unlock.</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Phase 3 Progress: Departmental Clearances</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold text-primary-600">{progress}%</div>
                        <div className="w-full">
                            <p className="text-sm text-gray-600 mb-1">Overall Completion</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {consultations.map(consult => (
                    <ConsultationRow 
                        key={consult.id}
                        consult={consult}
                        isLocked={isLocked}
                        onUpdate={handleUpdate}
                        onFileChange={handleFileChange}
                        onFileRemove={handleFileRemove}
                    />
                ))}
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Summary</CardTitle>
                    <CardDescription>Generate a quick overview of the current clearance status.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingSummary ? (
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {summary || 'Click the button below to generate a summary.'}
                        </p>
                    )}
                </CardContent>
            </Card>

            <div className="pt-4 border-t flex flex-col sm:flex-row justify-end items-center space-y-2 sm:space-y-0 sm:space-x-4">
                 <Button variant="secondary" leftIcon={<BrainCircuit size={16}/>} onClick={handleGenerateSummary} disabled={isLocked || isLoadingSummary}>
                    {isLoadingSummary ? 'Generating...' : 'Generate Summary'}
                 </Button>
                <Button onClick={handleCompletePhase} disabled={isLocked || progress < 100} leftIcon={<Check size={16}/>}>
                    Complete Phase 3
                </Button>
            </div>
        </div>
    );
};

export default Phase3Consultations;