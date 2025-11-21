
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { EvaluationPhase, SurgicalPlan } from '../../types';
import { PhaseStatus } from '../../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import { AlertTriangle, DraftingCompass, Activity, ShieldCheck, Check, CheckCircle, X } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface Phase2DonorProps {
  phase: EvaluationPhase;
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
  isLocked: boolean;
}

// --- Helper Input Components ---
const InputField = ({ label, name, value, onChange, disabled, type = "text", unit, ...props }: any) => (
    <div>
        <label htmlFor={name} className={`block text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</label>
        <div className="relative mt-1">
            <input type={type} name={name} id={name} value={value} onChange={onChange} disabled={disabled} className="block w-full rounded-md border-gray-300 shadow-sm disabled:bg-slate-100 disabled:text-slate-500 sm:text-sm" {...props} />
             {unit && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-500 sm:text-sm">{unit}</span></div>}
        </div>
    </div>
);

const SelectField = ({ label, name, value, onChange, disabled, children }: any) => (
    <div>
        <label htmlFor={name} className={`block text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</label>
        <select name={name} id={name} value={value} onChange={onChange} disabled={disabled} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-slate-100 disabled:text-slate-500 sm:text-sm">
            {children}
        </select>
    </div>
);

const TextAreaField = ({ label, name, value, onChange, disabled, rows = 3, span = 'md:col-span-2' }: any) => (
    <div className={span}>
        <label htmlFor={name} className={`block text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</label>
        <textarea name={name} id={name} value={value} onChange={onChange} disabled={disabled} rows={rows} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-slate-100 disabled:text-slate-500 sm:text-sm"></textarea>
    </div>
);

const CheckboxField = ({ label, name, checked, onChange, disabled }: any) => (
    <div className="flex items-center">
        <input type="checkbox" name={name} id={name} checked={checked} onChange={onChange} disabled={disabled} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:bg-slate-100 disabled:text-slate-400"/>
        <label htmlFor={name} className={`ml-3 block text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</label>
    </div>
);

// --- Dynamic Report Upload Component ---
const ReportUploadSection = ({
  sectionKey,
  sectionLabel,
  reportFileName,
  notes,
  handleFileChange,
  handleFileRemove,
  handleInputChange,
  isLocked,
}: {
  sectionKey: 'ctAngiogram' | 'dtpaRenogram';
  sectionLabel: string;
  reportFileName?: string;
  notes?: string;
  handleFileChange: (sectionKey: 'ctAngiogram' | 'dtpaRenogram', e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileRemove: (sectionKey: 'ctAngiogram' | 'dtpaRenogram') => void;
  handleInputChange: (section: 'ctAngiogram' | 'dtpaRenogram', field: string, value: any) => void;
  isLocked: boolean;
}) => {
    const hasFile = reportFileName && reportFileName.length > 0;

    return (
        <div className="pt-6 border-t">
            <CardTitle className="text-base mb-4">{sectionLabel} Report</CardTitle>
            <div className={`p-4 border-2 rounded-lg transition-colors ${!hasFile ? 'border-dashed border-gray-300' : 'border-solid border-green-500 bg-green-50'}`}>
            {!hasFile ? (
                <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Upload complete {sectionLabel} report.</p>
                <div className="flex items-center justify-center space-x-2">
                    <input type="file" id={`${sectionKey}-file`} className="sr-only" disabled={isLocked} onChange={(e) => handleFileChange(sectionKey, e)} />
                    <label htmlFor={`${sectionKey}-file`} className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                    Choose File
                    </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">No file chosen</p>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{reportFileName}</p>
                    <p className="text-xs text-gray-500">File selected successfully</p>
                    </div>
                </div>
                <button onClick={() => handleFileRemove(sectionKey)} disabled={isLocked} aria-label="Remove file" className="p-1 text-gray-400 hover:text-red-600 rounded-full transition-colors">
                    <X className="h-5 w-5" />
                </button>
                </div>
            )}
            </div>
            {notes !== undefined && ( // Only show notes for DTPA
                <div className="mt-4">
                    <TextAreaField 
                        label="Notes on Report (Optional)" 
                        name={`${sectionKey}_notes`} 
                        value={notes} 
                        onChange={(e: any) => handleInputChange(sectionKey, 'notes', e.target.value)} 
                        disabled={isLocked} 
                        span="" 
                    />
                </div>
            )}
            <p className="flex items-center mt-2 text-sm text-red-600">
            <AlertTriangle size={14} className="mr-1" /> This document is required to proceed to the next phase.
            </p>
        </div>
    );
};


const Phase2DonorEvaluation: React.FC<Phase2DonorProps> = ({ phase, setWorkflowData, isLocked }) => {
  const [activeTab, setActiveTab] = useState<'ct' | 'dtpa' | 'plan'>('ct');
  const [localPhase, setLocalPhase] = useState(phase);

  useEffect(() => {
    setLocalPhase(phase);
  }, [phase]);
  
  // Auto-calculate Total GFR
  useEffect(() => {
    const left = parseFloat(localPhase.dtpaRenogram?.leftKidneyGfr || '0');
    const right = parseFloat(localPhase.dtpaRenogram?.rightKidneyGfr || '0');
    if (!isNaN(left) && !isNaN(right) && localPhase.dtpaRenogram) {
      const total = (left + right).toFixed(2);
      if (total !== localPhase.dtpaRenogram.totalGfr) {
        handleInputChange('dtpaRenogram', 'totalGfr', total);
      }
    }
  }, [localPhase.dtpaRenogram?.leftKidneyGfr, localPhase.dtpaRenogram?.rightKidneyGfr]);

  // Auto-calculate Donor Risk
  useEffect(() => {
    const plan = localPhase.surgicalPlan;
    if (!plan) return;

    const { donorBmi, donorAgeCategory, smokingHistory, hypertensionHistory, diabetesHistory } = plan;

    if (!donorBmi || !donorAgeCategory || !smokingHistory || !hypertensionHistory || !diabetesHistory) {
      if (plan.calculatedRisk !== 'Not Calculated') {
        handleInputChange('surgicalPlan', 'calculatedRisk', 'Not Calculated');
      }
      return;
    }
    
    let score = 0;
    const bmi = parseFloat(donorBmi);
    if (!isNaN(bmi)) {
        if (bmi > 35) score += 2;
        else if (bmi > 30) score += 1;
    }

    if (donorAgeCategory === 'Elderly (60+)') score += 2;
    else if (donorAgeCategory === 'Middle-aged (40-59)') score += 1;

    if (smokingHistory === 'Yes') score += 2;
    if (hypertensionHistory === 'Yes') score += 1;
    if (diabetesHistory === 'Yes') score += 2;

    let risk: SurgicalPlan['calculatedRisk'] = 'Low';
    if (score >= 5) {
        risk = 'High';
    } else if (score >= 2) {
        risk = 'Medium';
    }

    if (risk !== plan.calculatedRisk) {
      handleInputChange('surgicalPlan', 'calculatedRisk', risk);
    }
  }, [
    localPhase.surgicalPlan?.donorBmi, 
    localPhase.surgicalPlan?.donorAgeCategory, 
    localPhase.surgicalPlan?.smokingHistory, 
    localPhase.surgicalPlan?.hypertensionHistory, 
    localPhase.surgicalPlan?.diabetesHistory
  ]);

  const recalculateProgressAndStatus = useCallback((data: EvaluationPhase) => {
    const { ctAngiogram, dtpaRenogram, surgicalPlan } = data;

    let ctProgress = 0;
    if (ctAngiogram) {
      if (ctAngiogram.isCompleted) {
        ctProgress = 100;
      } else {
        const ctFields = [
          ctAngiogram.datePerformed, ctAngiogram.leftKidneyLength, ctAngiogram.leftKidneyWidth,
          ctAngiogram.leftKidneyVolume, ctAngiogram.leftMainArteryDiameter, ctAngiogram.rightKidneyLength,
          ctAngiogram.rightKidneyWidth, ctAngiogram.rightKidneyVolume, ctAngiogram.rightMainArteryDiameter,
          ctAngiogram.leftRenalArteries, ctAngiogram.leftRenalVeins, ctAngiogram.rightRenalArteries,
          ctAngiogram.rightRenalVeins, ctAngiogram.accessoryVessels, ctAngiogram.corticalThickness,
          ctAngiogram.parenchymalQuality, ctAngiogram.calcificationAtherosclerosis, ctAngiogram.anatomicalVariations,
          ctAngiogram.clinicalInterpretation, ctAngiogram.recommendedKidney, ctAngiogram.recommendedApproach,
          ctAngiogram.reportFileName
        ];
        const filledCtFields = ctFields.filter(field => field !== null && field !== undefined && String(field).trim() !== '').length;
        ctProgress = ctFields.length > 0 ? (filledCtFields / ctFields.length) * 100 : 0;
      }
    }

    let dtpaProgress = 0;
    if (dtpaRenogram) {
      if (dtpaRenogram.isCompleted) {
        dtpaProgress = 100;
      } else {
        const dtpaFields = [
          dtpaRenogram.datePerformed, dtpaRenogram.leftKidneyGfr, dtpaRenogram.rightKidneyGfr,
          dtpaRenogram.leftT12, dtpaRenogram.rightT12, dtpaRenogram.reportFileName
        ];
        const filledDtpaFields = dtpaFields.filter(field => field !== null && field !== undefined && String(field).trim() !== '').length;
        dtpaProgress = dtpaFields.length > 0 ? (filledDtpaFields / dtpaFields.length) * 100 : 0;
      }
    }

    let planProgress = 0;
    if (surgicalPlan) {
      if (surgicalPlan.isCompleted) {
        planProgress = 100;
      } else {
        const planFields = [
          surgicalPlan.finalKidneySelection, surgicalPlan.finalSurgicalApproach,
          surgicalPlan.vascularComplexity, surgicalPlan.anesthesiaRisk,
          surgicalPlan.estimatedTimeMinutes, surgicalPlan.anticipatedDifficulties,
          surgicalPlan.postOpConsiderations, surgicalPlan.teamAssignment,
          surgicalPlan.generalNotes,
          // Risk Stratification Fields
          surgicalPlan.donorBmi, surgicalPlan.donorAgeCategory, surgicalPlan.smokingHistory,
          surgicalPlan.hypertensionHistory, surgicalPlan.diabetesHistory
        ];
        const filledPlanFields = planFields.filter(field => field !== null && field !== undefined && String(field).trim() !== '').length;
        planProgress = planFields.length > 0 ? (filledPlanFields / planFields.length) * 100 : 0;
      }
    }

    let overallProgress = Math.round((ctProgress + dtpaProgress + planProgress) / 3);

    let newStatus = data.status;
    if (!isLocked) {
        if (overallProgress >= 100) {
            newStatus = PhaseStatus.Completed;
            overallProgress = 100;
        } else if (overallProgress > 0) {
            newStatus = PhaseStatus.InProgress;
        } else {
            newStatus = PhaseStatus.Available;
        }
    }
    
    const allSectionsMarkedComplete = ctAngiogram?.isCompleted && dtpaRenogram?.isCompleted && surgicalPlan?.isCompleted;
    if (allSectionsMarkedComplete) {
        overallProgress = 100;
        newStatus = PhaseStatus.Completed;
    }
    
    let findings = 0;
    if (data.surgicalPlan?.calculatedRisk === 'High' || data.surgicalPlan?.calculatedRisk === 'Medium') findings++;
    if (data.dtpaRenogram?.obstructionPresent) findings++;

    return { ...data, progress: overallProgress, status: newStatus, abnormalFindings: findings };
  }, [isLocked]);


  useEffect(() => {
    const handler = setTimeout(() => {
        if (JSON.stringify(localPhase) !== JSON.stringify(phase)) {
            const updatedPhase = recalculateProgressAndStatus(localPhase);
            setWorkflowData(prev => {
                const newWorkflow = prev.map(p => p.id === phase.id ? updatedPhase : p);
                if (updatedPhase.status === PhaseStatus.Completed) {
                    const nextPhaseIndex = newWorkflow.findIndex(p => p.id === phase.id + 1);
                    if (nextPhaseIndex !== -1 && newWorkflow[nextPhaseIndex].status === PhaseStatus.Locked) {
                        newWorkflow[nextPhaseIndex].status = PhaseStatus.Available;
                    }
                }
                return newWorkflow;
            });
        }
    }, 1000);

    return () => clearTimeout(handler);
  }, [localPhase, phase, setWorkflowData, recalculateProgressAndStatus]);


  const handleInputChange = (section: 'ctAngiogram' | 'dtpaRenogram' | 'surgicalPlan', field: string, value: any) => {
    setLocalPhase(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [field]: value,
        }
    }));
  };

  const handleFileChange = (section: 'ctAngiogram' | 'dtpaRenogram', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setLocalPhase(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                reportFileName: file.name,
                reportUploaded: true,
            }
        }));
    }
  };

  const handleFileRemove = (section: 'ctAngiogram' | 'dtpaRenogram') => {
    setLocalPhase(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            reportFileName: '',
            reportUploaded: false,
        }
    }));
  };

  const handleCheckboxChange = (section: 'dtpaRenogram', field: 'functionalAsymmetry' | 'obstructionPresent', checked: boolean) => {
     setLocalPhase(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [field]: checked,
        }
    }));
  };

  const handleSectionCompletion = (section: 'ct' | 'dtpa' | 'plan') => {
      const sectionMap = { ct: 'ctAngiogram', dtpa: 'dtpaRenogram', plan: 'surgicalPlan' };
      const key = sectionMap[section] as 'ctAngiogram' | 'dtpaRenogram' | 'surgicalPlan';
      
      setLocalPhase(prev => ({
          ...prev,
          [key]: {
              ...prev[key],
              isCompleted: !prev[key]?.isCompleted,
          }
      }));
  };


  const TabButton = ({ tab, label, icon }: {tab: 'ct' | 'dtpa' | 'plan', label: string, icon: React.ReactNode}) => {
      const isActive = activeTab === tab;
      return (
          <button
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center p-3 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
              aria-current={isActive ? 'page' : undefined}
          >
              {icon} <span className="ml-2 hidden sm:inline">{label}</span>
          </button>
      )
  };

  const ct = localPhase.ctAngiogram;
  const dtpa = localPhase.dtpaRenogram;
  const plan = localPhase.surgicalPlan;

  const RiskBadge: React.FC<{ risk?: 'Low' | 'Medium' | 'High' | 'Not Calculated'}> = ({ risk }) => {
    if (!risk || risk === 'Not Calculated') {
        return <Badge color="gray">Not Calculated</Badge>;
    }
    const colorMap = {
        'Low': 'green' as const,
        'Medium': 'yellow' as const,
        'High': 'red' as const,
    };
    return <Badge color={colorMap[risk]}>{risk} Risk</Badge>;
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-b-lg border border-t-0 border-gray-200 space-y-6">
       {isLocked && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-md" role="alert">
                <p className="font-bold">Phase Locked</p>
                <p>This phase will become available for data entry once Phase 1 is completed.</p>
            </div>
        )}
      
      <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
              <TabButton tab="ct" label="CT Angiogram" icon={<Activity size={18} />} />
              <TabButton tab="dtpa" label="DTPA Renogram" icon={<ShieldCheck size={18} />} />
              <TabButton tab="plan" label="Surgical Plan" icon={<DraftingCompass size={18} />} />
          </nav>
      </div>

      <div>
        {activeTab === 'ct' && ct && (
             <Card>
                <CardHeader><CardTitle>CT Angiogram Assessment</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <InputField label="Date Performed" name="datePerformed" type="date" value={ct.datePerformed} onChange={e => handleInputChange('ctAngiogram', 'datePerformed', e.target.value)} disabled={isLocked}/>
                    
                    <div className="pt-6 border-t"><CardTitle className="text-base mb-4">Kidney Measurements</CardTitle>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <h3 className="font-medium text-gray-800">Left Kidney</h3><h3 className="font-medium text-gray-800">Right Kidney</h3>
                            <InputField label="Length (cm)" name="lk_len" value={ct.leftKidneyLength} onChange={e => handleInputChange('ctAngiogram', 'leftKidneyLength', e.target.value)} disabled={isLocked} type="number"/>
                            <InputField label="Length (cm)" name="rk_len" value={ct.rightKidneyLength} onChange={e => handleInputChange('ctAngiogram', 'rightKidneyLength', e.target.value)} disabled={isLocked} type="number"/>
                            <InputField label="Width (cm)" name="lk_width" value={ct.leftKidneyWidth} onChange={e => handleInputChange('ctAngiogram', 'leftKidneyWidth', e.target.value)} disabled={isLocked} type="number"/>
                            <InputField label="Width (cm)" name="rk_width" value={ct.rightKidneyWidth} onChange={e => handleInputChange('ctAngiogram', 'rightKidneyWidth', e.target.value)} disabled={isLocked} type="number"/>
                            <InputField label="Volume (cm³)" name="lk_vol" value={ct.leftKidneyVolume} onChange={e => handleInputChange('ctAngiogram', 'leftKidneyVolume', e.target.value)} disabled={isLocked} type="number"/>
                            <InputField label="Volume (cm³)" name="rk_vol" value={ct.rightKidneyVolume} onChange={e => handleInputChange('ctAngiogram', 'rightKidneyVolume', e.target.value)} disabled={isLocked} type="number"/>
                            <InputField label="Main Artery Diameter (mm)" name="lk_mad" value={ct.leftMainArteryDiameter} onChange={e => handleInputChange('ctAngiogram', 'leftMainArteryDiameter', e.target.value)} disabled={isLocked} type="number"/>
                            <InputField label="Main Artery Diameter (mm)" name="rk_mad" value={ct.rightMainArteryDiameter} onChange={e => handleInputChange('ctAngiogram', 'rightMainArteryDiameter', e.target.value)} disabled={isLocked} type="number"/>
                        </div>
                    </div>
                     <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6"><CardTitle className="text-base md:col-span-2">Vessel Assessment</CardTitle>
                        <InputField label="Left Renal Arteries" name="lk_ra" value={ct.leftRenalArteries} onChange={e => handleInputChange('ctAngiogram', 'leftRenalArteries', e.target.value)} disabled={isLocked} type="number"/>
                        <InputField label="Right Renal Arteries" name="rk_ra" value={ct.rightRenalArteries} onChange={e => handleInputChange('ctAngiogram', 'rightRenalArteries', e.target.value)} disabled={isLocked} type="number"/>
                        <InputField label="Left Renal Veins" name="lk_rv" value={ct.leftRenalVeins} onChange={e => handleInputChange('ctAngiogram', 'leftRenalVeins', e.target.value)} disabled={isLocked} type="number"/>
                        <InputField label="Right Renal Veins" name="rk_rv" value={ct.rightRenalVeins} onChange={e => handleInputChange('ctAngiogram', 'rightRenalVeins', e.target.value)} disabled={isLocked} type="number"/>
                        <TextAreaField label="Presence of Accessory Vessels" name="accessory_vessels" value={ct.accessoryVessels} onChange={e => handleInputChange('ctAngiogram', 'accessoryVessels', e.target.value)} disabled={isLocked} rows={2}/>
                    </div>
                     <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6"><CardTitle className="text-base md:col-span-2">Parenchymal & Anatomical Assessment</CardTitle>
                        <InputField label="Cortical Thickness" name="cortical_thickness" value={ct.corticalThickness} onChange={e => handleInputChange('ctAngiogram', 'corticalThickness', e.target.value)} disabled={isLocked} unit="mm"/>
                        <TextAreaField label="Parenchymal Quality" name="parenchymal_quality" value={ct.parenchymalQuality} onChange={e => handleInputChange('ctAngiogram', 'parenchymalQuality', e.target.value)} disabled={isLocked} rows={2} span="col-span-1 md:col-span-2"/>
                        <TextAreaField label="Any Calcification / Atherosclerosis" name="calc_ath" value={ct.calcificationAtherosclerosis} onChange={e => handleInputChange('ctAngiogram', 'calcificationAtherosclerosis', e.target.value)} disabled={isLocked} rows={2}/>
                        <TextAreaField label="Anatomical Variations (if any)" name="anat_var" value={ct.anatomicalVariations} onChange={e => handleInputChange('ctAngiogram', 'anatomicalVariations', e.target.value)} disabled={isLocked} rows={2}/>
                    </div>
                     <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6"><CardTitle className="text-base md:col-span-2">Clinical Interpretation & Recommendations</CardTitle>
                        <TextAreaField label="Clinical Interpretation of CT Findings" name="ct_interp" value={ct.clinicalInterpretation} onChange={e => handleInputChange('ctAngiogram', 'clinicalInterpretation', e.target.value)} disabled={isLocked} rows={4}/>
                        <div className="space-y-4">
                            <SelectField label="Recommended Kidney for Donation" name="rec_kidney" value={ct.recommendedKidney} onChange={e => handleInputChange('ctAngiogram', 'recommendedKidney', e.target.value)} disabled={isLocked}>
                                <option value="">Select...</option><option>Left</option><option>Right</option><option>Either</option>
                            </SelectField>
                            <SelectField label="Recommended Surgical Approach" name="rec_approach" value={ct.recommendedApproach} onChange={e => handleInputChange('ctAngiogram', 'recommendedApproach', e.target.value)} disabled={isLocked}>
                                <option value="">Select...</option><option>Open</option><option>Laparoscopic</option><option>Robotic</option>
                            </SelectField>
                        </div>
                    </div>
                    <ReportUploadSection 
                        sectionKey="ctAngiogram"
                        sectionLabel="CT Angiogram"
                        reportFileName={ct.reportFileName}
                        handleFileChange={handleFileChange}
                        handleFileRemove={handleFileRemove}
                        handleInputChange={handleInputChange}
                        isLocked={isLocked}
                    />
                    <div className="pt-6 border-t text-right">
                        <Button onClick={() => handleSectionCompletion('ct')} variant={ct.isCompleted ? 'secondary' : 'primary'} leftIcon={<Check size={16}/>} disabled={isLocked}>
                             {ct.isCompleted ? 'Mark as Incomplete' : 'Complete CT Assessment'}
                        </Button>
                    </div>
                </CardContent>
             </Card>
        )}
        {activeTab === 'dtpa' && dtpa && (
            <Card>
                <CardHeader><CardTitle>DTPA Renogram Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                     <InputField label="Date Performed" name="datePerformed" type="date" value={dtpa.datePerformed} onChange={e => handleInputChange('dtpaRenogram', 'datePerformed', e.target.value)} disabled={isLocked}/>
                     <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6"><CardTitle className="text-base md:col-span-2">Split Renal Function</CardTitle>
                         <InputField label="Left GFR (ml/min)" name="dtpa_l_gfr" value={dtpa.leftKidneyGfr} onChange={e => handleInputChange('dtpaRenogram', 'leftKidneyGfr', e.target.value)} disabled={isLocked} type="number" />
                         <InputField label="Right GFR (ml/min)" name="dtpa_r_gfr" value={dtpa.rightKidneyGfr} onChange={e => handleInputChange('dtpaRenogram', 'rightKidneyGfr', e.target.value)} disabled={isLocked} type="number"/>
                         <InputField label="Total GFR (ml/min)" name="total_gfr" value={dtpa.totalGfr} disabled={true} />
                         <CheckboxField label="Functional Asymmetry" name="func_asym" checked={dtpa.functionalAsymmetry} onChange={(e: any) => handleCheckboxChange('dtpaRenogram', 'functionalAsymmetry', e.target.checked)} disabled={isLocked} />
                     </div>
                     <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6"><CardTitle className="text-base md:col-span-2">Drainage Assessment</CardTitle>
                         <InputField label="Left T1/2 (minutes)" name="left_t12" value={dtpa.leftT12} onChange={e => handleInputChange('dtpaRenogram', 'leftT12', e.target.value)} disabled={isLocked} type="number" />
                         <InputField label="Right T1/2 (minutes)" name="right_t12" value={dtpa.rightT12} onChange={e => handleInputChange('dtpaRenogram', 'rightT12', e.target.value)} disabled={isLocked} type="number" />
                         <div className="md:col-span-2">
                             <CheckboxField label="Obstruction Present" name="obstruct" checked={dtpa.obstructionPresent} onChange={(e: any) => handleCheckboxChange('dtpaRenogram', 'obstructionPresent', e.target.checked)} disabled={isLocked} />
                         </div>
                     </div>
                     <ReportUploadSection 
                        sectionKey="dtpaRenogram"
                        sectionLabel="DTPA Renogram"
                        reportFileName={dtpa.reportFileName}
                        notes={dtpa.notes}
                        handleFileChange={handleFileChange}
                        handleFileRemove={handleFileRemove}
                        handleInputChange={handleInputChange}
                        isLocked={isLocked}
                     />
                     <div className="pt-6 border-t text-right">
                        <Button onClick={() => handleSectionCompletion('dtpa')} variant={dtpa.isCompleted ? 'secondary' : 'primary'} leftIcon={<Check size={16}/>} disabled={isLocked}>
                            {dtpa.isCompleted ? 'Mark as Incomplete' : 'Complete DTPA Assessment'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}
        {activeTab === 'plan' && plan && (
            <Card>
                <CardHeader><CardTitle>Surgical Planning & Team Assignment</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><CardTitle className="text-base md:col-span-2">Surgical Decisions</CardTitle>
                        <SelectField label="Final Kidney Selection" name="plan_kidney" value={plan.finalKidneySelection} onChange={e => handleInputChange('surgicalPlan', 'finalKidneySelection', e.target.value)} disabled={isLocked}>
                            <option value="">Select Kidney...</option><option>Left</option><option>Right</option><option>Undecided</option>
                        </SelectField>
                        <SelectField label="Surgical Approach" name="plan_approach" value={plan.finalSurgicalApproach} onChange={e => handleInputChange('surgicalPlan', 'finalSurgicalApproach', e.target.value)} disabled={isLocked}>
                            <option value="">Select Approach...</option><option>Open</option><option>Laparoscopic</option><option>Robotic</option>
                        </SelectField>
                    </div>
                    <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-6"><CardTitle className="text-base md:col-span-3">Risk Assessment</CardTitle>
                        <SelectField label="Vascular Complexity" name="plan_vascular" value={plan.vascularComplexity} onChange={e => handleInputChange('surgicalPlan', 'vascularComplexity', e.target.value)} disabled={isLocked}>
                            <option value="">Select...</option><option>Simple</option><option>Moderate</option><option>Complex</option>
                        </SelectField>
                         <SelectField label="Anesthesia Risk" name="anesthesia_risk" value={plan.anesthesiaRisk} onChange={e => handleInputChange('surgicalPlan', 'anesthesiaRisk', e.target.value)} disabled={isLocked}>
                            <option value="">Select...</option><option>Low Risk</option><option>Moderate Risk</option><option>High Risk</option>
                        </SelectField>
                        <InputField label="Estimated Time (minutes)" name="est_time" value={plan.estimatedTimeMinutes} onChange={e => handleInputChange('surgicalPlan', 'estimatedTimeMinutes', e.target.value)} disabled={isLocked} type="number"/>
                    </div>
                    <div className="pt-6 border-t space-y-4"><CardTitle className="text-base">Donor Risk Stratification</CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <InputField label="Donor BMI" name="donor_bmi" value={plan.donorBmi} onChange={e => handleInputChange('surgicalPlan', 'donorBmi', e.target.value)} disabled={isLocked} type="number" step="0.1"/>
                             <SelectField label="Donor Age Category" name="donor_age_cat" value={plan.donorAgeCategory} onChange={e => handleInputChange('surgicalPlan', 'donorAgeCategory', e.target.value)} disabled={isLocked}>
                                <option value="">Select...</option><option>Young (18-39)</option><option>Middle-aged (40-59)</option><option>Elderly (60+)</option>
                            </SelectField>
                             <div className="flex items-end pb-1">
                                <RiskBadge risk={plan.calculatedRisk} />
                             </div>
                             <SelectField label="Smoking History" name="smoking_history" value={plan.smokingHistory} onChange={e => handleInputChange('surgicalPlan', 'smokingHistory', e.target.value)} disabled={isLocked}>
                                <option value="">Select...</option><option>Yes</option><option>No</option>
                            </SelectField>
                             <SelectField label="Hypertension History" name="htn_history" value={plan.hypertensionHistory} onChange={e => handleInputChange('surgicalPlan', 'hypertensionHistory', e.target.value)} disabled={isLocked}>
                                <option value="">Select...</option><option>Yes</option><option>No</option>
                            </SelectField>
                             <SelectField label="Diabetes History" name="dm_history" value={plan.diabetesHistory} onChange={e => handleInputChange('surgicalPlan', 'diabetesHistory', e.target.value)} disabled={isLocked}>
                                <option value="">Select...</option><option>Yes</option><option>No</option>
                            </SelectField>
                        </div>
                    </div>
                    <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6"><CardTitle className="text-base md:col-span-2">Considerations & Team</CardTitle>
                        <TextAreaField label="Anticipated Surgical Difficulties" name="plan_difficulties" value={plan.anticipatedDifficulties} onChange={e => handleInputChange('surgicalPlan', 'anticipatedDifficulties', e.target.value)} disabled={isLocked} span="col-span-1"/>
                        <TextAreaField label="Post-operative Considerations" name="post_op" value={plan.postOpConsiderations} onChange={e => handleInputChange('surgicalPlan', 'postOpConsiderations', e.target.value)} disabled={isLocked} span="col-span-1"/>
                        <TextAreaField label="Surgical Team Assignment" name="team" value={plan.teamAssignment} onChange={e => handleInputChange('surgicalPlan', 'teamAssignment', e.target.value)} disabled={isLocked} />
                        <TextAreaField label="General Notes" name="general_notes" value={plan.generalNotes} onChange={e => handleInputChange('surgicalPlan', 'generalNotes', e.target.value)} disabled={isLocked} />
                    </div>
                     <div className="pt-6 border-t text-right">
                        <Button onClick={() => handleSectionCompletion('plan')} variant={plan.isCompleted ? 'secondary' : 'primary'} leftIcon={<Check size={16}/>} disabled={isLocked}>
                            {plan.isCompleted ? 'Mark as Incomplete' : 'Complete Surgical Planning'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>

       <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-1">Overall Phase Progress: {localPhase.progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${localPhase.progress}%` }}></div>
          </div>
      </div>
    </div>
  );
};

export default Phase2DonorEvaluation;
