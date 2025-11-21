
import React, { useState, useEffect } from 'react';
import type { EvaluationPhase, ImagingTestResult, SurgicalPlan } from '../../types';
import { PatientType, PhaseStatus } from '../../types';

interface Phase2Props {
  phase: EvaluationPhase;
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
  patientType: PatientType;
  isLocked: boolean;
}

const Phase2ImagingSurgicalPlanning: React.FC<Phase2Props> = ({ phase, setWorkflowData, patientType, isLocked }) => {
    const [localPhase, setLocalPhase] = useState(phase);

    useEffect(() => {
        setLocalPhase(phase);
    }, [phase]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (JSON.stringify(localPhase) !== JSON.stringify(phase)) {
                setWorkflowData(prev => {
                    const newWorkflow = prev.map(p => p.id === phase.id ? localPhase : p);
                    if (localPhase.status === PhaseStatus.Completed) {
                        const nextPhaseIndex = newWorkflow.findIndex(p => p.id === phase.id + 1);
                        if (nextPhaseIndex !== -1 && newWorkflow[nextPhaseIndex].status === PhaseStatus.Locked) {
                            newWorkflow[nextPhaseIndex].status = PhaseStatus.Available;
                        }
                    }
                    return newWorkflow;
                });
            }
        }, 500); // Debounce parent update
        return () => clearTimeout(handler);
    }, [localPhase, phase, setWorkflowData]);

    const recalculateProgress = (updatedPhase: EvaluationPhase) => {
        const imagingTests = updatedPhase.imagingTests || [];
        const surgicalPlan = updatedPhase.surgicalPlan;
        
        const completedImaging = imagingTests.filter(t => t.isCompleted).length;
        const totalImaging = imagingTests.length;
        
        const isPlanComplete = surgicalPlan?.isCompleted ? 1 : 0;
        const totalTasks = totalImaging + 1; // +1 for surgical plan

        const newProgress = totalTasks > 0 ? Math.round(((completedImaging + isPlanComplete) / totalTasks) * 100) : 0;

        let newStatus = updatedPhase.status;
        if (!isLocked) {
            if (newProgress === 100) {
                newStatus = PhaseStatus.Completed;
            } else if (newProgress > 0) {
                newStatus = PhaseStatus.InProgress;
            } else {
                newStatus = PhaseStatus.Available;
            }
        }
        
        const reviewsNeeded = imagingTests.filter(t => t.status === 'Requires Review').length;
        
        setLocalPhase({ ...updatedPhase, progress: newProgress, status: newStatus, abnormalFindings: reviewsNeeded });
    };

    const handleImagingTestChange = (testName: string, field: keyof ImagingTestResult, value: string) => {
        const imagingTests = localPhase.imagingTests || [];
        const updatedImagingTests = imagingTests.map(test => {
            if (test.name === testName) {
                const updatedTest = { ...test, [field]: value };
                if (field === 'status' && value === 'Completed') {
                    updatedTest.isCompleted = true;
                } else if (field === 'status' && value !== 'Completed') {
                     updatedTest.isCompleted = false;
                }
                return updatedTest;
            }
            return test;
        });
        recalculateProgress({ ...localPhase, imagingTests: updatedImagingTests });
    };

    const handleSurgicalPlanChange = (notes: string) => {
        const updatedSurgicalPlan = { ...(localPhase.surgicalPlan || { notes: '', isCompleted: false }), notes };
        recalculateProgress({ ...localPhase, surgicalPlan: updatedSurgicalPlan });
    }
    
    const handleSurgicalPlanCompletion = (isCompleted: boolean) => {
        const updatedSurgicalPlan = { ...(localPhase.surgicalPlan || { notes: '', isCompleted: false }), isCompleted };
        recalculateProgress({ ...localPhase, surgicalPlan: updatedSurgicalPlan });
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Requires Review': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    const disabledClasses = "disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";

    return (
        <div className="p-4 md:p-6 bg-white rounded-b-lg border border-t-0 border-gray-200 space-y-8">
            {isLocked && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-md" role="alert">
                    <p className="font-bold">Phase Locked</p>
                    <p>This phase will become available for data entry once Phase 1 is completed.</p>
                </div>
            )}
            <div>
                <h5 className="font-semibold text-gray-700 mb-4">Imaging Reports</h5>
                <div className="space-y-6">
                    {(localPhase.imagingTests || []).map(test => (
                        <div key={test.name} className={`p-4 border rounded-lg ${isLocked ? 'bg-slate-50' : ''}`}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium ${isLocked ? 'text-gray-400' : 'text-gray-700'}`}>{test.name}</label>
                                    <p className="text-xs text-gray-500">Update the status and summary.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex items-center space-x-4">
                                        <span className={`font-medium text-sm ${isLocked ? 'text-gray-400' : ''}`}>Status:</span>
                                        <select
                                            value={test.status}
                                            onChange={(e) => handleImagingTestChange(test.name, 'status', e.target.value)}
                                            className={`rounded-md border-gray-300 shadow-sm text-sm ${getStatusColor(test.status)} ${disabledClasses}`}
                                            disabled={isLocked}
                                        >
                                            <option>Pending</option>
                                            <option>Completed</option>
                                            <option>Requires Review</option>
                                        </select>
                                    </div>
                                    <div className="mt-4">
                                        <label className={`block text-sm font-medium ${isLocked ? 'text-gray-400' : 'text-gray-700'}`}>Report Summary</label>
                                        <textarea
                                            rows={3}
                                            value={test.reportSummary}
                                            onChange={(e) => handleImagingTestChange(test.name, 'reportSummary', e.target.value)}
                                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${disabledClasses}`}
                                            placeholder={isLocked ? "Phase is locked" : "Enter key findings from the imaging report..."}
                                            disabled={isLocked}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h5 className="font-semibold text-gray-700 mb-2">Surgical Planning</h5>
                <p className="text-sm text-gray-500 mb-4">
                    {patientType === PatientType.Donor
                        ? "Notes on kidney selection, vascular anatomy, and surgical approach for donation."
                        : "Notes on vessel quality, potential transplant site, and considerations for anastomosis."}
                </p>
                <textarea
                    rows={5}
                    value={localPhase.surgicalPlan?.notes || ''}
                    onChange={(e) => handleSurgicalPlanChange(e.target.value)}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${disabledClasses}`}
                    placeholder={isLocked ? "Phase is locked" : "Enter surgical planning notes here..."}
                    disabled={isLocked}
                />
                <div className="mt-4 flex items-center">
                    <input
                        type="checkbox"
                        id={`surgicalPlanCompleted-${phase.id}`}
                        checked={localPhase.surgicalPlan?.isCompleted || false}
                        onChange={(e) => handleSurgicalPlanCompletion(e.target.checked)}
                        className={`h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${disabledClasses}`}
                        disabled={isLocked}
                    />
                    <label htmlFor={`surgicalPlanCompleted-${phase.id}`} className={`ml-2 block text-sm ${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900'}`}>
                        Mark surgical plan as complete
                    </label>
                </div>
            </div>
            
            <div className="mt-6">
                <p className="text-sm text-gray-600 mb-1">Overall Phase Progress: {localPhase.progress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${localPhase.progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default Phase2ImagingSurgicalPlanning;
