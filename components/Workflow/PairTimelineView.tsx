
import React from 'react';
import type { EvaluationPhase } from '../../types';
import { PhaseStatus } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { CheckCircle, Clock, Lock, AlertTriangle, CircleDot } from 'lucide-react';

// Helper to get styling based on status
const getStatusStyles = (status: PhaseStatus) => {
    switch (status) {
        case PhaseStatus.Completed:
            return { icon: <CheckCircle className="w-5 h-5 text-green-500" />, bgColor: 'bg-green-500', label: 'Completed' };
        case PhaseStatus.InProgress:
            return { icon: <Clock className="w-5 h-5 text-blue-500" />, bgColor: 'bg-blue-500', label: 'In Progress' };
        case PhaseStatus.Available:
            return { icon: <CircleDot className="w-5 h-5 text-yellow-500" />, bgColor: 'bg-yellow-500', label: 'Available' };
        case PhaseStatus.ReviewNeeded:
            return { icon: <AlertTriangle className="w-5 h-5 text-red-500" />, bgColor: 'bg-red-500', label: 'Review Needed' };
        case PhaseStatus.Locked:
        default:
            return { icon: <Lock className="w-5 h-5 text-gray-400" />, bgColor: 'bg-gray-300', label: 'Locked' };
    }
};

interface ProgressBarProps {
    phase: EvaluationPhase;
    label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ phase, label }) => {
    const { bgColor, label: statusLabel } = getStatusStyles(phase.status);
    const progress = phase.progress;

    const renderBarContent = () => {
        switch (phase.status) {
            case PhaseStatus.InProgress:
            case PhaseStatus.ReviewNeeded:
                return (
                    <div
                        className={`${bgColor} h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                    >
                        {progress > 15 && `${progress}%`}
                    </div>
                );
            case PhaseStatus.Completed:
                 return (
                    <div className={`${bgColor} h-6 rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                        {statusLabel}
                    </div>
                );
            case PhaseStatus.Available:
            case PhaseStatus.Locked:
            default:
                return (
                    <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-medium text-gray-600">{statusLabel}</span>
                    </div>
                );
        }
    };

    return (
        <div className="flex items-center space-x-4">
            <span className="w-20 text-sm font-medium text-gray-600 flex-shrink-0">{label}</span>
            <div
                className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden"
                role="progressbar"
                aria-valuenow={phase.status === PhaseStatus.Completed ? 100 : progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label} progress for ${phase.name}: ${statusLabel}${phase.status === PhaseStatus.InProgress || phase.status === PhaseStatus.ReviewNeeded ? ` ${progress}%` : ''}`}
            >
               {renderBarContent()}
            </div>
        </div>
    );
};


interface PairTimelineViewProps {
  donorWorkflow: EvaluationPhase[];
  recipientWorkflow: EvaluationPhase[];
}

const getCombinedStatus = (donorStatus: PhaseStatus, recipientStatus: PhaseStatus): PhaseStatus => {
    // Priority order: The most actionable or critical status is shown for the phase.
    const priority: Record<PhaseStatus, number> = {
        [PhaseStatus.ReviewNeeded]: 5,
        [PhaseStatus.InProgress]: 4,
        [PhaseStatus.Available]: 3,
        [PhaseStatus.Completed]: 2,
        [PhaseStatus.Locked]: 1,
    };

    return priority[donorStatus] > priority[recipientStatus] ? donorStatus : recipientStatus;
};

const PairTimelineView: React.FC<PairTimelineViewProps> = ({ donorWorkflow, recipientWorkflow }) => {
    // Assuming both workflows have the same phases, use one as the template.
    const phasesTemplate = donorWorkflow.length > 0 ? donorWorkflow : recipientWorkflow;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Synchronized Workflow Timeline</CardTitle>
                <CardDescription>A visual overview of progress for both donor and recipient across all phases.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
                {phasesTemplate.map((phase, index) => {
                    const donorPhase = donorWorkflow[index];
                    const recipientPhase = recipientWorkflow[index];
                    
                    if (!donorPhase || !recipientPhase) return null;

                    const combinedStatus = getCombinedStatus(donorPhase.status, recipientPhase.status);

                    return (
                        <div key={phase.id}>
                            <div className="flex items-start space-x-3 mb-4">
                                <div className="mt-1 flex-shrink-0">{getStatusStyles(combinedStatus).icon}</div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-lg">{phase.name}</h4>
                                    <p className="text-sm text-gray-500">{phase.description}</p>
                                </div>
                            </div>
                            <div className="pl-9 space-y-3">
                                <ProgressBar phase={donorPhase} label="Donor" />
                                <ProgressBar phase={recipientPhase} label="Recipient" />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default PairTimelineView;
