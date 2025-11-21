
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Patient, EvaluationPhase, TransplantTeamReviewData, ReviewItem } from '../../types';
import { PhaseStatus, PatientType } from '../../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { getPairs, getWorkflowForPatient, updateWorkflowForPatient } from '../../services/backendService';
import { CheckCircle, Clock, Users, Calendar, Mic } from 'lucide-react';
import { produce } from 'immer';

// Props
interface Phase7Props {
  patient: Patient;
  phase: EvaluationPhase;
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
  isLocked: boolean;
}

// Sub-component for each review item
const ReviewItemRow: React.FC<{
    item: ReviewItem;
    isLocked: boolean;
    onToggleStatus: (id: string) => void;
}> = ({ item, isLocked, onToggleStatus }) => {
    const isCompleted = item.status === 'Completed';
    return (
        <div className={`p-4 border rounded-lg flex items-center justify-between ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
            <div className="flex items-center space-x-4">
                {isCompleted ? <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" /> : <Clock className="w-6 h-6 text-yellow-500 flex-shrink-0" />}
                <div>
                    <h4 className={`font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    {isCompleted && <p className="text-xs text-gray-400 mt-1">Completed by {item.completedBy} on {item.completionDate}</p>}
                </div>
            </div>
            {!isCompleted && (
                 <Button variant="secondary" size="sm" onClick={() => onToggleStatus(item.id)} disabled={isLocked}>
                    Mark Complete
                 </Button>
            )}
        </div>
    );
};

// Main component
const Phase7TransplantReview: React.FC<Phase7Props> = ({ patient, phase, setWorkflowData, isLocked }) => {
    const [reviewData, setReviewData] = useState<TransplantTeamReviewData>(phase.transplantTeamReviewData!);
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
        setReviewData(phase.transplantTeamReviewData!);
    }, [phase.transplantTeamReviewData]);

    const progress = useMemo(() => {
        if (!reviewData) return 0;
        const total = reviewData.reviewItems.length;
        if (total === 0) return 100;
        const completed = reviewData.reviewItems.filter(i => i.status === 'Completed').length;
        return Math.round((completed / total) * 100);
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
            if (progress !== phase.progress || newStatus !== phase.status || JSON.stringify(reviewData) !== JSON.stringify(phase.transplantTeamReviewData)) {
                setWorkflowData(prev => {
                    const newWorkflow = prev.map(p => p.id === phase.id ? { ...p, progress, status: newStatus, transplantTeamReviewData: reviewData } : p);
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
        if (!otherPatientId || JSON.stringify(reviewData) === JSON.stringify(phase.transplantTeamReviewData)) {
            return;
        }
        const syncData = async () => {
            if (!otherPatientId) return;
            const otherWorkflow = await getWorkflowForPatient(otherPatientId);
            const otherPhase = otherWorkflow.find(p => p.id === phase.id);
            if (otherPhase && JSON.stringify(otherPhase.transplantTeamReviewData) !== JSON.stringify(reviewData)) {
                 const updatedOtherWorkflow = otherWorkflow.map(p => {
                    if (p.id === phase.id) {
                        const newStatus = p.status === PhaseStatus.Locked ? p.status : (progress === 100 ? PhaseStatus.Completed : PhaseStatus.InProgress);
                        return { ...p, transplantTeamReviewData: reviewData, progress, status: newStatus };
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
    
    const handleToggleStatus = useCallback((id: string) => {
        setReviewData(produce(draft => {
            const item = draft.reviewItems.find(i => i.id === id);
            if (item && item.status === 'Pending') {
                item.status = 'Completed';
                item.completedBy = "System User"; // Placeholder
                item.completionDate = new Date().toISOString().split('T')[0];

                if (id === 'surgery_date' && !draft.surgeryDate) {
                    const date = prompt("Please enter the tentative surgery date (YYYY-MM-DD):");
                    if (date) {
                        draft.surgeryDate = date;
                    }
                }
            }
        }));
    }, []);

    const handleNotesChange = (notes: string) => {
        setReviewData(produce(draft => {
            draft.finalNotes = notes;
        }));
    };

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
                    <CardTitle className="flex items-center"><Users size={20} className="mr-2"/> Team Review Progress</CardTitle>
                    <CardDescription>Track the completion of key milestones in the final transplant team review meeting.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold text-primary-600">{progress}%</div>
                        <div className="w-full">
                            <p className="text-sm text-gray-600 mb-1">Overall Completion</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {reviewData.reviewItems.map(item => (
                    <ReviewItemRow key={item.id} item={item} isLocked={isLocked} onToggleStatus={handleToggleStatus} />
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Mic size={20} className="mr-2"/> Meeting Summary & Final Notes</CardTitle>
                </CardHeader>
                <CardContent>
                     <textarea 
                        rows={5} 
                        value={reviewData.finalNotes} 
                        onChange={e => handleNotesChange(e.target.value)} 
                        disabled={isLocked}
                        placeholder="Document the key discussion points, decisions, and any outstanding concerns from the meeting..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                     />
                     {reviewData.surgeryDate && (
                         <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3">
                            <Calendar size={20} className="text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-800">Tentative Surgery Date Assigned</p>
                                <p className="font-semibold text-blue-900">{reviewData.surgeryDate}</p>
                            </div>
                         </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Phase7TransplantReview;