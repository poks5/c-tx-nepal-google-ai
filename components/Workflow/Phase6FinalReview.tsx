
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Patient, EvaluationPhase, FinalReviewData, ClearanceItem } from '../../types';
import { PhaseStatus, PatientType } from '../../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { getPairs, getWorkflowForPatient, updateWorkflowForPatient } from '../../services/backendService';
import { ClipboardCheck, Stethoscope, Gavel, ShieldCheck, HeartHandshake, ChevronDown } from 'lucide-react';
import { produce } from 'immer';

interface Phase6Props {
  patient: Patient;
  phase: EvaluationPhase;
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
  isLocked: boolean;
}

const getStatusColor = (status: ClearanceItem['status']) => {
  switch (status) {
    case 'Cleared': return 'bg-green-100 text-green-800';
    case 'Not Required': return 'bg-gray-100 text-gray-700';
    case 'Pending':
    default: return 'bg-yellow-100 text-yellow-800';
  }
};


const ClearanceItemRow: React.FC<{
    item: ClearanceItem,
    isLocked: boolean,
    onUpdate: (id: string, field: keyof ClearanceItem, value: string) => void;
}> = ({ item, isLocked, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const iconMap: { [key: string]: React.ReactNode } = {
        med_review: <Stethoscope size={20} className="text-blue-500" />,
        surg_clear: <ShieldCheck size={20} className="text-green-500" />,
        anesth_clear: <ShieldCheck size={20} className="text-teal-500" />,
        consent: <Gavel size={20} className="text-amber-600" />,
        advocate: <HeartHandshake size={20} className="text-purple-500" />,
    };

    const iconKey = Object.keys(iconMap).find(key => item.id.includes(key)) || 'med_review';

    return (
        <div className="border border-gray-200 rounded-lg">
            <button className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center space-x-3">
                    {iconMap[iconKey]}
                    <span className="font-semibold text-gray-800">{item.title}</span>
                </div>
                <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                     <p className="text-sm text-gray-500">{item.description}</p>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select value={item.status} onChange={e => onUpdate(item.id, 'status', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option>Pending</option>
                                <option>Cleared</option>
                                <option>Not Required</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Clearance Date</label>
                            <input type="date" value={item.clearanceDate} onChange={e => onUpdate(item.id, 'clearanceDate', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cleared By</label>
                            <input type="text" value={item.clearedBy} onChange={e => onUpdate(item.id, 'clearedBy', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea rows={2} value={item.notes} onChange={e => onUpdate(item.id, 'notes', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                     </div>
                 </div>
            )}
        </div>
    )
}

const Phase6FinalReview: React.FC<Phase6Props> = ({ patient, phase, setWorkflowData, isLocked }) => {
    const [reviewData, setReviewData] = useState<FinalReviewData>(phase.finalReviewData!);
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
        setReviewData(phase.finalReviewData!);
    }, [phase.finalReviewData]);

    const progress = useMemo(() => {
        if (!reviewData) return 0;
        const { clearanceItems } = reviewData;
        const totalItems = clearanceItems.length;
        if (totalItems === 0) return 100;
        const completedClearance = clearanceItems.filter(item => item.status === 'Cleared' || item.status === 'Not Required').length;
        return Math.round((completedClearance / totalItems) * 100);
    }, [reviewData]);

    // Update current patient's workflow
    useEffect(() => {
        const handler = setTimeout(() => {
            let newStatus = phase.status;
            if (!isLocked) {
                 if (progress === 100) newStatus = PhaseStatus.Completed;
                 else if (progress > 0) newStatus = PhaseStatus.InProgress;
                 else newStatus = PhaseStatus.Available;
            }
            if (progress !== phase.progress || newStatus !== phase.status || JSON.stringify(reviewData) !== JSON.stringify(phase.finalReviewData)) {
                setWorkflowData(prev => {
                    const newWorkflow = prev.map(p => p.id === phase.id ? { ...p, progress, status: newStatus, finalReviewData: reviewData } : p);
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
    }, [progress, phase, reviewData, setWorkflowData, isLocked]);

    // Synchronize to paired patient
    useEffect(() => {
        if (!otherPatientId || JSON.stringify(reviewData) === JSON.stringify(phase.finalReviewData)) {
            return;
        }

        const syncData = async () => {
            if (!otherPatientId) return;
            const otherWorkflow = await getWorkflowForPatient(otherPatientId);
            const otherPhase = otherWorkflow.find(p => p.id === phase.id);
            if (otherPhase && JSON.stringify(otherPhase.finalReviewData) !== JSON.stringify(reviewData)) {
                 const updatedOtherWorkflow = otherWorkflow.map(p => {
                    if (p.id === phase.id) {
                        const newStatus = p.status === PhaseStatus.Locked ? p.status : (progress === 100 ? PhaseStatus.Completed : PhaseStatus.InProgress);
                        return { ...p, finalReviewData: reviewData, progress, status: newStatus };
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
    }, [reviewData, otherPatientId, progress, phase]);

    const handleClearanceUpdate = useCallback((id: string, field: keyof ClearanceItem, value: string) => {
        setReviewData(produce(draft => {
            const item = draft.clearanceItems.find(i => i.id === id);
            if (item) {
                (item[field] as any) = value;
            }
        }));
    }, []);
    
    if(!reviewData) return <div className="p-4">Loading...</div>;

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
                    <CardTitle className="flex items-center"><ClipboardCheck size={20} className="mr-2"/>Final Readiness Clearances</CardTitle>
                    <CardDescription>Complete the final checklist of clearances required before proceeding to the team review phase.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {reviewData.clearanceItems.map(item => (
                        <ClearanceItemRow key={item.id} item={item} isLocked={isLocked} onUpdate={handleClearanceUpdate} />
                    ))}
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

export default Phase6FinalReview;