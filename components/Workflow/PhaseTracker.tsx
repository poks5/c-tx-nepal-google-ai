
import React, { useState } from 'react';
import type { Patient, EvaluationPhase } from '../../types';
import { PatientType, PhaseStatus } from '../../types';
import { PhaseStatusBadge } from '../ui/Badge';
import { ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';

// Import detail view components for each phase
import Phase1ComprehensiveView from './Phase1ComprehensiveView';
import { DONOR_TEST_CATEGORIES, INITIAL_DONOR_TESTS } from '../../donor_comprehensive_tests';
import { RECIPIENT_TEST_CATEGORIES, INITIAL_RECIPIENT_TESTS } from '../../recipient_comprehensive_tests';
import Phase2DonorEvaluation from './Phase2DonorEvaluation';
import Phase2ImagingSurgicalPlanning from './Phase2ImagingSurgicalPlanning';
import Phase3Consultations from './Phase3Consultations';
import Phase4LegalClearance from './Phase4LegalClearance';
import Phase5HLA from './Phase5HLA';
import Phase6FinalReview from './Phase6FinalReview';
import Phase7TransplantReview from './Phase7TransplantReview';
import Phase8SurgeryPrep from './Phase8SurgeryPrep';


interface PhaseTrackerProps {
  workflowData: EvaluationPhase[];
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
  patient: Patient;
}

const PhaseBar: React.FC<{
  phase: EvaluationPhase;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ phase, isOpen, onToggle }) => {
  const isLocked = phase.status === PhaseStatus.Locked;
  const isCompleted = phase.status === PhaseStatus.Completed;

  return (
    <button
      onClick={onToggle}
      disabled={false} // Allow toggling locked phases
      className={`w-full flex items-center justify-between p-4 rounded-lg text-left transition-all duration-200 ${
        isLocked
          ? 'bg-gray-100 text-gray-400'
          : 'bg-white hover:bg-primary-50 border border-gray-200 shadow-sm'
      } ${isOpen && !isLocked ? 'rounded-b-none' : ''}`}
    >
      <div className="flex items-center flex-1 min-w-0 mr-4">
        {isCompleted ? (
           <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
        ) : (
           <div className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-sm font-bold mr-4 flex-shrink-0 ${isLocked ? 'bg-gray-300' : 'bg-primary-500'}`}>
            {phase.id}
          </div>
        )}
        <div className="min-w-0">
          <h4 className={`font-semibold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>{phase.name}</h4>
          <p className="text-sm text-gray-500 truncate">{phase.description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 flex-shrink-0">
        {phase.abnormalFindings && phase.abnormalFindings > 0 && (
            <div className="flex items-center px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full" title={`${phase.abnormalFindings} items require attention`}>
                <AlertCircle className="w-3 h-3 mr-1" />
                {phase.abnormalFindings} Issue{phase.abnormalFindings !== 1 ? 's' : ''}
            </div>
        )}
        <div className="hidden sm:block">
            <PhaseStatusBadge status={phase.status} />
        </div>
        {!isLocked && (
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">{phase.progress}%</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
        )}
      </div>
    </button>
  );
};

const PhaseTracker: React.FC<PhaseTrackerProps> = ({ workflowData, setWorkflowData, patient }) => {
  const [openPhaseId, setOpenPhaseId] = useState<number | null>(1);

  const togglePhase = (id: number) => {
    setOpenPhaseId(openPhaseId === id ? null : id);
  };

  const renderPhaseContent = (phase: EvaluationPhase) => {
    const isLocked = phase.status === PhaseStatus.Locked;
    switch (phase.id) {
      case 1:
        return patient.type === PatientType.Donor ? (
            <Phase1ComprehensiveView
                patient={patient}
                phase={phase}
                workflow={workflowData}
                setWorkflowData={setWorkflowData}
                storageKey={`phase1_donor_tests_${patient.id}`}
                testCategories={DONOR_TEST_CATEGORIES}
                initialTests={INITIAL_DONOR_TESTS}
            />
        ) : (
             <Phase1ComprehensiveView
                patient={patient}
                phase={phase}
                workflow={workflowData}
                setWorkflowData={setWorkflowData}
                storageKey={`phase1_recipient_tests_${patient.id}`}
                testCategories={RECIPIENT_TEST_CATEGORIES}
                initialTests={INITIAL_RECIPIENT_TESTS}
            />
        );
      case 2:
        return patient.type === PatientType.Donor ? (
          <Phase2DonorEvaluation phase={phase} setWorkflowData={setWorkflowData} isLocked={isLocked} />
        ) : (
          <Phase2ImagingSurgicalPlanning phase={phase} setWorkflowData={setWorkflowData} patientType={patient.type} isLocked={isLocked}/>
        );
      case 3:
        return <Phase3Consultations patient={patient} phase={phase} setWorkflowData={setWorkflowData} isLocked={isLocked} />;
      case 4:
        return <Phase4LegalClearance patient={patient} phase={phase} setWorkflowData={setWorkflowData} isLocked={isLocked} />;
      case 5:
        return <Phase5HLA patient={patient} phase={phase} setWorkflowData={setWorkflowData} isLocked={isLocked} />;
      case 6:
          return <Phase6FinalReview patient={patient} phase={phase} setWorkflowData={setWorkflowData} isLocked={isLocked} />;
      case 7:
          return <Phase7TransplantReview patient={patient} phase={phase} setWorkflowData={setWorkflowData} isLocked={isLocked} />;
      case 8:
          return <Phase8SurgeryPrep patient={patient} phase={phase} setWorkflowData={setWorkflowData} isLocked={isLocked} />;
      default:
        return <div className="p-4 bg-white rounded-b-lg border border-t-0"><p>No detail view available for this phase.</p></div>;
    }
  };

  return (
    <div className="space-y-3">
      {workflowData.map(phase => (
        <div key={phase.id}>
          <PhaseBar phase={phase} isOpen={openPhaseId === phase.id} onToggle={() => togglePhase(phase.id)} />
          {openPhaseId === phase.id && (
            renderPhaseContent(phase)
          )}
        </div>
      ))}
    </div>
  );
};

export default PhaseTracker;
