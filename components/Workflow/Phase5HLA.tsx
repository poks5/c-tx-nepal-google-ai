
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Patient, EvaluationPhase, Phase5Data, HLATyping, FinalAssessment, HLACompatibility } from '../../types';
import { PhaseStatus, PatientType } from '../../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { getPairs, getWorkflowForPatient, updateWorkflowForPatient } from '../../services/backendService';
import { Dna, GitCommitHorizontal, TestTube, Check, FileUp, CheckCircle, X, FileSearch, AlertCircle, TrendingUp, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { extractHlaDataFromReports, HlaExtractedData } from '../../services/geminiService';
import { calculateHlaCompatibility } from '../../services/hlaService';
import { produce } from 'immer';

interface Phase5Props {
  patient: Patient;
  phase: EvaluationPhase;
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
  isLocked: boolean;
}

const HLAInputTable: React.FC<{
  title: string;
  hlaData: HLATyping;
  isLocked: boolean;
  onChange: (locus: keyof HLATyping, index: 0 | 1, value: string) => void;
}> = ({ title, hlaData, isLocked, onChange }) => {
  const loci: (keyof HLATyping)[] = ['A', 'B', 'C', 'DR', 'DQ', 'DP'];
  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
      <div className="space-y-3">
        {loci.map(locus => (
          <div key={locus} className="grid grid-cols-3 items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{`HLA-${locus}`}</label>
            <input
              type="text"
              placeholder="Allele 1"
              value={hlaData[locus]?.[0] || ''}
              onChange={e => onChange(locus, 0, e.target.value)}
              disabled={isLocked}
              className="col-span-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
            />
            <input
              type="text"
              placeholder="Allele 2"
              value={hlaData[locus]?.[1] || ''}
              onChange={e => onChange(locus, 1, e.target.value)}
              disabled={isLocked}
              className="col-span-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const CompatibilityAnalysisCard: React.FC<{ result: HLACompatibility }> = ({ result }) => {
    const riskConfig = {
        Identical: { icon: <ShieldCheck className="w-6 h-6 text-green-500" />, color: 'green' as const, textClass: 'text-green-600' },
        Low: { icon: <Shield className="w-6 h-6 text-blue-500" />, color: 'blue' as const, textClass: 'text-blue-600' },
        Moderate: { icon: <ShieldAlert className="w-6 h-6 text-yellow-500" />, color: 'yellow' as const, textClass: 'text-yellow-600' },
        High: { icon: <ShieldAlert className="w-6 h-6 text-red-500" />, color: 'red' as const, textClass: 'text-red-600' },
        Pending: { icon: <Dna className="w-6 h-6 text-gray-400" />, color: 'gray' as const, textClass: 'text-gray-500' },
    };
    const { icon, color, textClass } = riskConfig[result.riskLevel];
    const { mismatchResult } = result;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><TrendingUp size={20} className="mr-2"/> HLA Compatibility Analysis</CardTitle>
                <CardDescription>Real-time analysis based on the entered HLA typing data.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg text-center h-full">
                    {icon}
                    <p className={`text-2xl font-bold mt-2 ${textClass}`}>{result.matchRatio} Match</p>
                    <Badge color={color} className="mt-2">{result.riskLevel} Risk</Badge>
                </div>
                <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-800 mb-3">Mismatch Details</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                            <span className="font-bold text-lg text-gray-700">Total Mismatches</span>
                            <span className="font-bold text-lg text-primary-700">{mismatchResult.total}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                           <div className="p-2 border rounded">
                             <p className="font-medium text-gray-600">Class I (A, B, C)</p>
                             <p className="font-semibold text-lg">{mismatchResult.class1}</p>
                           </div>
                            <div className="p-2 border rounded">
                             <p className="font-medium text-gray-600">Class II (DR, DQ, DP)</p>
                             <p className="font-semibold text-lg">{mismatchResult.class2}</p>
                           </div>
                        </div>
                        <details className="text-sm">
                            <summary className="cursor-pointer font-medium text-gray-600 hover:text-primary-600">Per-Locus Breakdown</summary>
                            <ul className="mt-2 space-y-1 pl-2">
                                {/* FIX: Explicitly cast `count` to a number to fix type error where it's inferred as `unknown`. */}
                                {Object.entries(mismatchResult.details).map(([locus, countValue]) => {
                                    const count = countValue as number;
                                    return (
                                        <li key={locus} className="flex justify-between">
                                            <span>{locus}:</span>
                                            <span className={`font-semibold ${count > 0 ? 'text-red-600' : 'text-green-600'}`}>{count} mismatch{count !== 1 ? 'es' : ''}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </details>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


const Phase5HLA: React.FC<Phase5Props> = ({ patient, phase, setWorkflowData, isLocked }) => {
    const [phaseData, setPhaseData] = useState<Phase5Data>(phase.phase5Data!);
    const [isProcessingReport, setIsProcessingReport] = useState(false);
    const [processingError, setProcessingError] = useState('');
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

    const hlaCompatibilityResult = useMemo(() => {
        if (phaseData.donorHla && phaseData.recipientHla) {
            return calculateHlaCompatibility(phaseData.donorHla, phaseData.recipientHla);
        }
        return phase.phase5Data!.hlaCompatibility; // Return default/initial
    }, [phaseData.donorHla, phaseData.recipientHla, phase.phase5Data]);

    useEffect(() => {
        setPhaseData(phase.phase5Data!);
    }, [phase.phase5Data]);

    const progress = useMemo(() => {
        if (!phaseData) return 0;
        const { donorHla, recipientHla, crossmatch, finalAssessment } = phaseData;

        // FIX: Cast the result of Object.values to resolve type inference issues and fix type error for 'total'.
        const hlaFields = [
            ...Object.values(donorHla).flat(),
            ...Object.values(recipientHla).flat()
        ] as string[];
        
        const otherFields = [
            { value: crossmatch.cdc, isPending: crossmatch.cdc === 'Pending' },
            { value: crossmatch.flow, isPending: crossmatch.flow === 'Pending' },
            { value: crossmatch.dsa, isPending: crossmatch.dsa === 'Pending' },
            { value: crossmatch.dsaInterpretation, isPending: !crossmatch.dsaInterpretation },
            { value: finalAssessment.finalResult, isPending: finalAssessment.finalResult === 'Pending' },
        ];
        
        const total = hlaFields.length + otherFields.length;
        // FIX: Corrected progress calculation logic. It should return 100 if there are no items to complete.
        if (total === 0) return 100;
        
        const completedHla = hlaFields.filter(Boolean).length;
        const completedOthers = otherFields.filter(f => !f.isPending).length;
        
        const completed = completedHla + completedOthers;
        
        return Math.min(100, Math.round((completed / total) * 100));
    }, [phaseData]);

    // This effect updates the current patient's workflow state
    useEffect(() => {
        const handler = setTimeout(() => {
            const updatedPhaseData = { ...phaseData, hlaCompatibility: hlaCompatibilityResult };

            let newStatus = phase.status;
            if (!isLocked) {
                 if (progress === 100) newStatus = PhaseStatus.Completed;
                 else if (progress > 0) newStatus = PhaseStatus.InProgress;
                 else newStatus = PhaseStatus.Available;
            }
            
            let findings = 0;
            if (updatedPhaseData.crossmatch.cdc === 'Positive') findings++;
            if (updatedPhaseData.crossmatch.flow === 'Positive') findings++;
            if (updatedPhaseData.crossmatch.dsa === 'Present') findings++;
            if (hlaCompatibilityResult.riskLevel === 'High' || hlaCompatibilityResult.riskLevel === 'Moderate') findings++;
    
            if (progress !== phase.progress || newStatus !== phase.status || JSON.stringify(updatedPhaseData) !== JSON.stringify(phase.phase5Data)) {
                setWorkflowData(prev => {
                    const newWorkflow = prev.map(p => p.id === phase.id ? { ...p, progress, status: newStatus, phase5Data: updatedPhaseData, abnormalFindings: findings } : p);
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
    }, [progress, phase, phaseData, setWorkflowData, isLocked, hlaCompatibilityResult]);

    // This effect synchronizes data to the paired patient
    useEffect(() => {
        const updatedPhaseData = { ...phaseData, hlaCompatibility: hlaCompatibilityResult };
        if (!otherPatientId || JSON.stringify(updatedPhaseData) === JSON.stringify(phase.phase5Data)) {
            return; // No pair or no change, do nothing
        }
        
        const syncData = async () => {
            if (!otherPatientId) return;
            const otherWorkflow = await getWorkflowForPatient(otherPatientId);
            const otherPhase5 = otherWorkflow.find(p => p.id === 5);
            
            let findings = 0;
            if (updatedPhaseData.crossmatch.cdc === 'Positive') findings++;
            if (updatedPhaseData.crossmatch.flow === 'Positive') findings++;
            if (updatedPhaseData.crossmatch.dsa === 'Present') findings++;
            if (hlaCompatibilityResult.riskLevel === 'High' || hlaCompatibilityResult.riskLevel === 'Moderate') findings++;

            if (otherPhase5 && JSON.stringify(otherPhase5.phase5Data) !== JSON.stringify(updatedPhaseData)) {
                const updatedOtherWorkflow = otherWorkflow.map(p => {
                    if (p.id === 5) {
                        const newStatus = p.status === PhaseStatus.Locked 
                            ? p.status 
                            : (progress === 100 ? PhaseStatus.Completed : PhaseStatus.InProgress);
                        return { ...p, phase5Data: updatedPhaseData, progress, status: newStatus, abnormalFindings: findings };
                    }
                    return p;
                });
                await updateWorkflowForPatient(otherPatientId, updatedOtherWorkflow);
            }
        };

        const syncTimer = setTimeout(() => {
            syncData().catch(console.error);
        }, 1500); // Debounce to prevent rapid updates

        return () => clearTimeout(syncTimer);
    }, [phaseData, otherPatientId, progress, phase.phase5Data, hlaCompatibilityResult]);


    const handleHlaChange = useCallback((
        type: 'donorHla' | 'recipientHla',
        locus: keyof HLATyping,
        index: 0 | 1,
        value: string
    ) => {
        setPhaseData(produce(draft => {
            draft[type][locus][index] = value;
        }));
    }, []);

    const handleCrossmatchChange = useCallback((
        field: keyof Phase5Data['crossmatch'],
        value: string
    ) => {
        setPhaseData(produce(draft => {
            draft.crossmatch[field] = value as any; // Cast to any to handle different value types
        }));
    }, []);

    const handleFinalAssessmentChange = useCallback((
        field: keyof FinalAssessment,
        value: string
    ) => {
        setPhaseData(produce(draft => {
            draft.finalAssessment[field] = value as any;
        }));
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsProcessingReport(true);
        setProcessingError('');

        try {
            // FIX: Explicitly type `file` as `File` to resolve type errors on `file.type` and `reader.readAsDataURL`.
            const filePromises = Array.from(files).map((file: File) => {
                return new Promise<{ base64: string; mimeType: string }>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64String = (reader.result as string).split(',')[1];
                        resolve({ base64: base64String, mimeType: file.type });
                    };
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file);
                });
            });

            const reportFiles = await Promise.all(filePromises);
            const extractedData = await extractHlaDataFromReports(reportFiles);

            // Merge extracted data carefully
            setPhaseData(produce(draft => {
                if (extractedData.donorHla) {
                    Object.keys(draft.donorHla).forEach(locus => {
                        const key = locus as keyof HLATyping;
                        if(extractedData.donorHla?.[key]?.[0]) draft.donorHla[key][0] = extractedData.donorHla[key][0];
                        if(extractedData.donorHla?.[key]?.[1]) draft.donorHla[key][1] = extractedData.donorHla[key][1];
                    });
                }
                 if (extractedData.recipientHla) {
                    Object.keys(draft.recipientHla).forEach(locus => {
                        const key = locus as keyof HLATyping;
                        if(extractedData.recipientHla?.[key]?.[0]) draft.recipientHla[key][0] = extractedData.recipientHla[key][0];
                        if(extractedData.recipientHla?.[key]?.[1]) draft.recipientHla[key][1] = extractedData.recipientHla[key][1];
                    });
                }
                if (extractedData.crossmatch) {
                    if (extractedData.crossmatch.cdc && extractedData.crossmatch.cdc !== 'Pending') draft.crossmatch.cdc = extractedData.crossmatch.cdc;
                    if (extractedData.crossmatch.dsa && extractedData.crossmatch.dsa !== 'Pending') draft.crossmatch.dsa = extractedData.crossmatch.dsa;
                    if (extractedData.crossmatch.dsaInterpretation) draft.crossmatch.dsaInterpretation = extractedData.crossmatch.dsaInterpretation;
                }
            }));

        } catch (error: any) {
            console.error("Error processing report:", error);
            setProcessingError(error.message || 'An unknown error occurred during processing.');
        } finally {
            setIsProcessingReport(false);
            // Reset file input value to allow re-uploading the same file
            event.target.value = '';
        }
    };
    
    if (!phaseData) {
        return <div className="p-4">Loading phase data...</div>;
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
                    <CardTitle className="flex items-center"><FileSearch size={20} className="mr-2"/> Autofill from Reports</CardTitle>
                    <CardDescription>Upload HLA, CDC, and DSA reports to automatically populate the fields below using AI.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <input
                            type="file"
                            id="report-upload"
                            multiple
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            disabled={isLocked || isProcessingReport}
                            className="hidden"
                        />
                        <Button
                            onClick={() => document.getElementById('report-upload')?.click()}
                            disabled={isLocked || isProcessingReport}
                            leftIcon={isProcessingReport ? null : <FileUp size={16} />}
                        >
                            {isProcessingReport ? 'Processing...' : 'Upload Report(s)'}
                        </Button>
                        {isProcessingReport && (
                            <div className="flex items-center text-sm text-primary-600">
                                <Dna size={16} className="animate-spin mr-2" />
                                <p>Analyzing documents, please wait...</p>
                            </div>
                        )}
                        {processingError && (
                            <div className="flex items-center text-sm text-red-600 p-2 bg-red-50 rounded-md">
                                <AlertCircle size={16} className="mr-2" />
                                <p>{processingError}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Dna size={20} className="mr-2"/> HLA Typing</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <HLAInputTable
                        title="Donor HLA"
                        hlaData={phaseData.donorHla}
                        isLocked={isLocked}
                        onChange={(locus, index, value) => handleHlaChange('donorHla', locus, index, value)}
                    />
                    <HLAInputTable
                        title="Recipient HLA"
                        hlaData={phaseData.recipientHla}
                        isLocked={isLocked}
                        onChange={(locus, index, value) => handleHlaChange('recipientHla', locus, index, value)}
                    />
                </CardContent>
            </Card>

            <CompatibilityAnalysisCard result={hlaCompatibilityResult} />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><TestTube size={20} className="mr-2"/> Crossmatch & DSA Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">CDC Crossmatch</label>
                            <select value={phaseData.crossmatch.cdc} onChange={e => handleCrossmatchChange('cdc', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option>Pending</option><option>Negative</option><option>Positive</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Flow Cytometry Crossmatch</label>
                            <select value={phaseData.crossmatch.flow} onChange={e => handleCrossmatchChange('flow', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option>Pending</option><option>Negative</option><option>Positive</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Donor Specific Antibodies (DSA)</label>
                            <select value={phaseData.crossmatch.dsa} onChange={e => handleCrossmatchChange('dsa', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option>Pending</option><option>Absent</option><option>Present</option>
                            </select>
                        </div>
                    </div>
                    {(phaseData.crossmatch.dsa === 'Absent' || phaseData.crossmatch.dsa === 'Present') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">DSA Interpretation (MFI, etc.)</label>
                            <textarea
                                value={phaseData.crossmatch.dsaInterpretation || ''}
                                onChange={e => handleCrossmatchChange('dsaInterpretation', e.target.value)}
                                disabled={isLocked}
                                rows={3}
                                placeholder="Enter any notes, MFI values, or specific antibody details..."
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><GitCommitHorizontal size={20} className="mr-2"/> Final Assessment & Sign-off</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Final Compatibility Result</label>
                            <select value={phaseData.finalAssessment.finalResult} onChange={e => handleFinalAssessmentChange('finalResult', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option>Pending</option>
                                <option>Compatible</option>
                                <option>Incompatible</option>
                                <option>Requires further testing</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Assessment Date</label>
                            <input type="date" value={phaseData.finalAssessment.date} onChange={e => handleFinalAssessmentChange('date', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Performing Lab</label>
                            <input type="text" value={phaseData.finalAssessment.lab} onChange={e => handleFinalAssessmentChange('lab', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Final Notes / Summary</label>
                        <textarea rows={4} value={phaseData.finalAssessment.notes} onChange={e => handleFinalAssessmentChange('notes', e.target.value)} disabled={isLocked} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
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

export default Phase5HLA;
