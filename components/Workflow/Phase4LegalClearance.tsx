import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Patient, EvaluationPhase, LegalClearance } from '../../types';
import { PhaseStatus, PatientType } from '../../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { getPairs, getWorkflowForPatient, updateWorkflowForPatient } from '../../services/backendService';
import { Check, CheckCircle, FileUp, X, Gavel } from 'lucide-react';

interface Phase4Props {
  phase: EvaluationPhase;
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
  isLocked: boolean;
  patient: Patient; // Add patient prop to find the pair
}

const Phase4LegalClearance: React.FC<Phase4Props> = ({ phase, setWorkflowData, isLocked, patient }) => {
    const [clearance, setClearance] = useState<LegalClearance>(phase.legalClearance!);
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


    useEffect(() => {
        setClearance(phase.legalClearance!);
    }, [phase.legalClearance]);
    
    const progress = useMemo(() => {
        if (!clearance) return 0;
        const { status, fileName } = clearance;
        if (status === 'Cleared' && fileName) {
            return 100;
        }
        if (status === 'In Progress' || fileName) {
            return 50;
        }
        return 0;
    }, [clearance]);

    // This effect updates the current patient's workflow state
    useEffect(() => {
        const handler = setTimeout(() => {
            let newStatus = phase.status;
            if (!isLocked) {
                 if (progress === 100) newStatus = PhaseStatus.Completed;
                 else if (progress > 0) newStatus = PhaseStatus.InProgress;
                 else newStatus = PhaseStatus.Available;
            }
            if (progress !== phase.progress || newStatus !== phase.status || JSON.stringify(clearance) !== JSON.stringify(phase.legalClearance)) {
                setWorkflowData(prev => {
                    const newWorkflow = prev.map(p => p.id === phase.id ? { ...p, progress, status: newStatus, legalClearance: clearance } : p);
                    if (newStatus === PhaseStatus.Completed) {
                        const nextPhaseIndex = newWorkflow.findIndex(p => p.id === phase.id + 1);
                        if (nextPhaseIndex !== -1 && newWorkflow[nextPhaseIndex].status === PhaseStatus.Locked) {
                            newWorkflow[nextPhaseIndex].status = PhaseStatus.Available;
                        }
                    }
                    return newWorkflow;
                });
            }
        }, 500); // Debounce to prevent focus loss
        return () => clearTimeout(handler);
    }, [progress, phase.progress, phase.status, clearance, phase.id, setWorkflowData, isLocked, phase.legalClearance]);
    
    // This effect synchronizes data to the paired patient
    useEffect(() => {
        if (!otherPatientId || JSON.stringify(clearance) === JSON.stringify(phase.legalClearance)) {
            return; // No pair or no change, do nothing
        }
        
        const syncData = async () => {
            if (!otherPatientId) return;
            const otherWorkflow = await getWorkflowForPatient(otherPatientId);
            const otherPhase4 = otherWorkflow.find(p => p.id === 4);

            if (otherPhase4 && JSON.stringify(otherPhase4.legalClearance) !== JSON.stringify(clearance)) {
                 const updatedOtherWorkflow = otherWorkflow.map(p => 
                    p.id === 4 ? { ...p, legalClearance: clearance, progress, status: p.status === PhaseStatus.Locked ? p.status : (progress === 100 ? PhaseStatus.Completed : PhaseStatus.InProgress) } : p
                );
                await updateWorkflowForPatient(otherPatientId, updatedOtherWorkflow);
            }
        };

        const syncTimer = setTimeout(() => {
            syncData().catch(console.error);
        }, 1500); // Debounce
        
        return () => clearTimeout(syncTimer);
    }, [clearance, otherPatientId, progress, phase.legalClearance]);


    const handleChange = (field: keyof LegalClearance, value: string) => {
        setClearance(prev => ({...prev, [field]: value}));
    };

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file){
            handleChange('fileName', file.name);
        }
    }, []);
    
    const handleFileRemove = useCallback(() => {
        handleChange('fileName', '');
    }, []);
    
    if(!clearance) {
        return <div className="p-4">Loading...</div>
    }

    return (
         <div className="p-4 md:p-6 bg-white rounded-b-lg border border-t-0 border-gray-200 space-y-8">
            {isLocked && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-md" role="alert">
                    <p className="font-bold">Phase Locked</p>
                    <p>This phase is not yet active. Complete prior phases to unlock.</p>
                </div>
            )}
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Gavel size={20} className="mr-2"/> Legal Clearance</CardTitle>
                    <CardDescription>Record and upload the final legal clearance for the donor-recipient pair.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Clearance Status</label>
                            <select value={clearance.status} onChange={e => handleChange('status', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Cleared</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Clearance Date</label>
                            <input type="date" value={clearance.clearanceDate} onChange={e => handleChange('clearanceDate', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Issuing Authority/Officer</label>
                            <input type="text" value={clearance.officerName} onChange={e => handleChange('officerName', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Document Upload</label>
                        {!clearance.fileName ? (
                             <div className="mt-1">
                                <input type="file" id={`file-legal`} className="sr-only" disabled={isLocked} onChange={handleFileChange} />
                                <label htmlFor={`file-legal`} className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                                    <FileUp size={16} className="mr-2"/> Upload Clearance Document
                                </label>
                            </div>
                        ) : (
                             <div className="mt-1 flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-green-500"/>
                                    <p className="text-sm font-medium text-gray-800 truncate">{clearance.fileName}</p>
                                </div>
                                <button onClick={handleFileRemove} disabled={isLocked} className="p-1 text-gray-500 hover:text-red-600">
                                    <X size={16}/>
                                </button>
                            </div>
                        )}
                    </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700">Notes / Remarks</label>
                         <textarea rows={4} value={clearance.notes} onChange={e => handleChange('notes', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                     </div>
                </CardContent>
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

export default Phase4LegalClearance;