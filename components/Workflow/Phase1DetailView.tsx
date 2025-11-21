import React from 'react';
import type { EvaluationPhase, LabTestGroup, OtherTestResult } from '../../types';
import { PhaseStatus } from '../../types';

interface Phase1DetailViewProps {
  phase: EvaluationPhase;
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
}

const checkAbnormal = (value: string, range: string): 'Normal' | 'Abnormal' | null => {
    if (!value || !range || range.toLowerCase().includes('report') || range === '') return null;

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
        // Handle non-numeric results like 'Negative', 'Non-reactive'
        const normalizedRange = range.toLowerCase().trim();
        const normalizedValue = value.toLowerCase().trim();
        if (normalizedRange === normalizedValue) {
            return 'Normal';
        }
        // Specific case for blood type
        if (normalizedRange === 'a/b/ab/o [+/-]') {
             if (['a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'o+', 'o-'].includes(normalizedValue)) {
                 return 'Normal';
             }
        }
        return 'Abnormal';
    }

    if (range.startsWith('<')) {
        const limit = parseFloat(range.substring(1));
        return numericValue < limit ? 'Normal' : 'Abnormal';
    }
    
    if (range.startsWith('>')) {
        const limit = parseFloat(range.substring(1));
        return numericValue > limit ? 'Normal' : 'Abnormal';
    }

    const parts = range.split('-').map(part => parseFloat(part.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return numericValue >= parts[0] && numericValue <= parts[1] ? 'Normal' : 'Abnormal';
    }

    return null;
}

const Phase1DetailView: React.FC<Phase1DetailViewProps> = ({ phase, setWorkflowData }) => {
  
  const updateWorkflow = (updatedPhase: EvaluationPhase) => {
    setWorkflowData(prevWorkflow => {
      const newWorkflow = prevWorkflow.map(p => p.id === updatedPhase.id ? updatedPhase : p);
      
      const currentPhaseIndex = newWorkflow.findIndex(p => p.id === updatedPhase.id);
      if (currentPhaseIndex !== -1 && newWorkflow[currentPhaseIndex].status === PhaseStatus.Completed) {
        if (currentPhaseIndex + 1 < newWorkflow.length && newWorkflow[currentPhaseIndex + 1].status === PhaseStatus.Locked) {
          newWorkflow[currentPhaseIndex + 1].status = PhaseStatus.Available;
        }
      }
      return newWorkflow;
    });
  }

  const handleLabTestChange = (groupName: string, testName: string, newValue: string) => {
    const labTestGroups = phase.labTestGroups || [];
    const updatedLabTestGroups = labTestGroups.map(group => {
      if (group.groupName === groupName) {
        const updatedTests = group.tests.map(test => {
          if (test.name === testName) {
            const flag = checkAbnormal(newValue, test.normalRange);
            return { ...test, value: newValue, flag, isCompleted: newValue.trim() !== '' };
          }
          return test;
        });
        return { ...group, tests: updatedTests };
      }
      return group;
    });
    
    recalculateProgress(updatedLabTestGroups, phase.otherTests || []);
  };
  
  const handleOtherTestChange = (testName: string, newResult: string) => {
    const otherTests = phase.otherTests || [];
    const updatedOtherTests = otherTests.map(test => 
      test.name === testName ? { ...test, result: newResult, isCompleted: newResult.trim() !== '' } : test
    );

    recalculateProgress(phase.labTestGroups || [], updatedOtherTests);
  };

  const recalculateProgress = (labGroups: LabTestGroup[], otherTests: OtherTestResult[]) => {
      const allLabTests = labGroups.flatMap(g => g.tests);
      const completedLabTests = allLabTests.filter(t => t.isCompleted).length;
      const completedOtherTests = otherTests.filter(t => t.isCompleted).length;
      const totalTests = allLabTests.length + otherTests.length;

      const newProgress = totalTests > 0 ? Math.round(((completedLabTests + completedOtherTests) / totalTests) * 100) : 0;

      let newStatus = phase.status;
      if (newProgress === 100) {
        newStatus = PhaseStatus.Completed;
      } else if (newProgress > 0) {
        newStatus = PhaseStatus.InProgress;
      } else {
        newStatus = PhaseStatus.Available;
      }

      updateWorkflow({ ...phase, labTestGroups: labGroups, otherTests, progress: newProgress, status: newStatus });
  }

  const getFlagColor = (flag: 'Normal' | 'Abnormal' | null) => {
      if(flag === 'Abnormal') return 'text-red-600 font-bold';
      if(flag === 'Normal') return 'text-green-600';
      return 'text-gray-500';
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-b-lg border border-t-0 border-gray-200 space-y-8">
      
      {(phase.labTestGroups || []).map(group => (
        <div key={group.groupName}>
          <h5 className="font-semibold text-gray-700 mb-4">{group.groupName}</h5>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/3">Test Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Normal Range</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Flag</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {group.tests.map((test) => (
                  <tr key={test.name}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{test.name}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={test.value}
                        onChange={(e) => handleLabTestChange(group.groupName, test.name, e.target.value)}
                        placeholder="Enter value"
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{test.unit}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{test.normalRange}</td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm ${getFlagColor(test.flag)}`}>{test.flag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Other Tests Section */}
       <div>
            <h5 className="font-semibold text-gray-700 mb-4">Urine and Other Tests</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(phase.otherTests || []).map((test) => (
                    <div key={test.name}>
                        <label className="block text-sm font-medium text-gray-700">{test.name}</label>
                        <input
                            type="text"
                            value={test.result}
                            onChange={(e) => handleOtherTestChange(test.name, e.target.value)}
                            placeholder="Enter result..."
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>
                ))}
            </div>
       </div>

      <div className="mt-6">
          <p className="text-sm text-gray-600 mb-1">Overall Phase Progress: {phase.progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${phase.progress}%` }}></div>
          </div>
      </div>
    </div>
  );
};

export default Phase1DetailView;