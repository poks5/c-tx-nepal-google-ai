import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Patient, EvaluationPhase, MedicalTestItem } from '../../types';
import { PhaseStatus } from '../../types';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { DONOR_TEST_CATEGORIES, INITIAL_DONOR_TESTS } from '../../donor_comprehensive_tests';
import { ChevronDown, AlertCircle, FileUp, BrainCircuit, Check, Ban, RotateCcw } from 'lucide-react';
import { generateEvaluationSummary } from '../../services/geminiService';

interface Phase1DonorProps {
  patient: Patient;
  phase: EvaluationPhase;
  workflow: EvaluationPhase[];
  setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
}

// --- Helper Functions ---
const checkAbnormalValue = (test: MedicalTestItem, value: string): boolean => {
    if (!value) return false;

    if (test.inputType === 'dropdown') {
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'positive' || lowerValue === 'reactive') {
            return true;
        }
    }
    
    if (!test.normalRange) return false;

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return false;
    
    const range = test.normalRange;
    if (range.startsWith('<')) {
        return numericValue >= parseFloat(range.substring(1));
    }
    if (range.startsWith('>')) {
        return numericValue <= parseFloat(range.substring(1));
    }
    const parts = range.split('-').map(part => parseFloat(part.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return numericValue < parts[0] || numericValue > parts[1];
    }
    return false;
};

const shouldShowTest = (test: MedicalTestItem, patient: Patient): boolean => {
    if (!test.conditional) return true;
    const { type, condition, genderCondition } = test.conditional;

    const age = patient.age;

    if (type === 'gender') {
        return patient.gender === condition;
    }
    if (type === 'age' && typeof condition === 'object' && (condition.min || condition.max)) {
        const minOk = condition.min ? age >= condition.min : true;
        const maxOk = condition.max ? age <= condition.max : true;
        return minOk && maxOk;
    }
    if (type === 'both' && typeof condition === 'object' && genderCondition) {
        if (patient.gender !== genderCondition) return false;
        
        const minOk = condition.min ? age >= condition.min : true;
        const maxOk = condition.max ? age <= condition.max : true;
        return minOk && maxOk;
    }
    return true;
};


// --- Sub-components ---

const TestInput: React.FC<{ 
    test: MedicalTestItem;
    onChange: (id: string, field: 'value' | 'conditionalValue', value: string) => void; 
    onExempt: (id: string) => void;
    onRemoveExemption: (id: string) => void;
}> = ({ test, onChange, onExempt, onRemoveExemption }) => {
    // If test is exempt, show a clear, disabled-style view
    if (test.isExempt) {
        return (
            <div className="relative">
                <label className="block text-sm font-medium text-gray-400 truncate">{test.name}</label>
                <div className="mt-1 flex items-center justify-between p-2 bg-slate-100 rounded-md border border-slate-300 text-sm text-slate-600">
                    <span className="italic truncate">Exempt: {test.exemptionReason}</span>
                    <button 
                        onClick={() => onRemoveExemption(test.id)} 
                        className="p-1 text-slate-500 hover:text-primary-600 rounded-full hover:bg-slate-200 transition-colors"
                        aria-label="Remove exemption"
                        title="Remove Exemption"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>
        );
    }

    // Main input view
    const baseInputClasses = "block w-full rounded-md border-gray-300 shadow-sm sm:text-sm transition-colors duration-150";
    const abnormalClasses = "border-red-500 ring-1 ring-red-500 bg-red-50";
    const normalClasses = "focus:border-primary-500 focus:ring-primary-500";
    const inputClassName = `${baseInputClasses} ${test.isAbnormal ? abnormalClasses : normalClasses}`;

    return (
        <div className="relative group">
            <label htmlFor={test.id} className="block text-sm font-medium text-gray-700 truncate">{test.name}</label>
            <div className="relative mt-1">
                 {test.inputType === 'dropdown' ? (
                    <select 
                        id={test.id}
                        value={test.value}
                        onChange={(e) => onChange(test.id, 'value', e.target.value)}
                        className={inputClassName}
                    >
                        <option value="">Select...</option>
                        {test.dropdownOptions?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type={test.inputType || 'text'}
                        id={test.id}
                        value={test.value}
                        onChange={(e) => onChange(test.id, 'value', e.target.value)}
                        placeholder={test.placeholder || test.unit || 'Enter value'}
                        className={inputClassName}
                    />
                )}
                {test.isAbnormal && (
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                    </div>
                )}
            </div>
            {test.normalRange && <p className="text-xs text-gray-500 mt-1">Range: {test.normalRange} {test.unit}</p>}
            
            {test.conditionalInput && test.value === test.conditionalInput.onValue && (
                <div className="mt-2">
                    <input
                        type="text"
                        value={test.conditionalValue || ''}
                        onChange={(e) => onChange(test.id, 'conditionalValue', e.target.value)}
                        placeholder={test.conditionalInput.placeholder}
                        className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                </div>
            )}

            <button 
                onClick={() => onExempt(test.id)} 
                className="absolute -top-1 -right-1 flex items-center p-1.5 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                aria-label={`Exempt ${test.name}`}
                title="Mark as not required"
            >
                <Ban size={16} />
            </button>
        </div>
    );
};


const Phase1DonorComprehensive: React.FC<Phase1DonorProps> = ({ patient, phase, workflow, setWorkflowData }) => {
    const [tests, setTests] = useState<Record<string, MedicalTestItem>>({});
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({ [DONOR_TEST_CATEGORIES[0]]: true });
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [summary, setSummary] = useState('');
    
    // --- Data Persistence ---
    useEffect(() => {
        const storageKey = `phase1_donor_tests_${patient.id}`;
        const savedTests = localStorage.getItem(storageKey);
        const initialTests = INITIAL_DONOR_TESTS.reduce((acc, test) => {
            acc[test.id] = { ...test, value: test.value || '' };
            return acc;
        }, {} as Record<string, MedicalTestItem>);
        
        if (savedTests) {
            const parsedTests = JSON.parse(savedTests);
            Object.keys(initialTests).forEach(key => {
                if (parsedTests[key]) {
                    initialTests[key] = { ...initialTests[key], ...parsedTests[key] };
                }
            });
            setTests(initialTests);
        } else {
            setTests(initialTests);
        }
    }, [patient.id]);

    useEffect(() => {
        if (Object.keys(tests).length > 0) {
            const timer = setTimeout(() => {
                const storageKey = `phase1_donor_tests_${patient.id}`;
                localStorage.setItem(storageKey, JSON.stringify(tests));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [tests, patient.id]);

    // --- Progress Calculation ---
    const { overallProgress, testsByCategory, categoryProgress, categoryAbnormalCounts, categoryExemptedCounts } = useMemo(() => {
        // FIX: Cast Object.values to MedicalTestItem[] to resolve type inference issue.
        const applicableTests = (Object.values(tests) as MedicalTestItem[]).filter(t => shouldShowTest(t, patient));
        if (applicableTests.length === 0) {
            return { overallProgress: 0, testsByCategory: {}, categoryProgress: {}, categoryAbnormalCounts: {}, categoryExemptedCounts: {} };
        }
        
        const completedCount = applicableTests.filter(t => t.isCompleted || t.isExempt).length;
        const overallProgress = Math.round((completedCount / applicableTests.length) * 100);

        const testsByCategory = DONOR_TEST_CATEGORIES.reduce((acc, cat) => {
            acc[cat] = applicableTests.filter(t => t.category === cat);
            return acc;
        }, {} as Record<string, MedicalTestItem[]>);

        const categoryProgress = DONOR_TEST_CATEGORIES.reduce((acc, cat) => {
            const catTests = testsByCategory[cat];
            if (!catTests || catTests.length === 0) {
                acc[cat] = 100;
                return acc;
            }
            const completed = catTests.filter(t => t.isCompleted || t.isExempt).length;
            acc[cat] = Math.round((completed / catTests.length) * 100);
            return acc;
        }, {} as Record<string, number>);

        const categoryAbnormalCounts = DONOR_TEST_CATEGORIES.reduce((acc, cat) => {
            const catTests = testsByCategory[cat];
            acc[cat] = catTests ? catTests.filter(t => t.isAbnormal).length : 0;
            return acc;
        }, {} as Record<string, number>);
        
        const categoryExemptedCounts = DONOR_TEST_CATEGORIES.reduce((acc, cat) => {
            const catTests = testsByCategory[cat];
            acc[cat] = catTests ? catTests.filter(t => t.isExempt).length : 0;
            return acc;
        }, {} as Record<string, number>);

        return { overallProgress, testsByCategory, categoryProgress, categoryAbnormalCounts, categoryExemptedCounts };
    }, [tests, patient]);

    // --- Update main workflow state ---
    useEffect(() => {
        const handler = setTimeout(() => {
            let newStatus = PhaseStatus.Available;
            if (overallProgress === 100) newStatus = PhaseStatus.Completed;
            else if (overallProgress > 0) newStatus = PhaseStatus.InProgress;

            // Prevent update if nothing changed
            if (phase.progress === overallProgress && phase.status === newStatus) {
                return;
            }

            setWorkflowData(prev => prev.map(p => p.id === phase.id ? { ...p, progress: overallProgress, status: newStatus } : p));
        }, 500); // Debounce updates to parent to prevent focus loss

        return () => clearTimeout(handler);
    }, [overallProgress, phase.id, phase.progress, phase.status, setWorkflowData]);

    const handleTestChange = (id: string, field: 'value' | 'conditionalValue', value: string) => {
        const test = tests[id];
        if (!test) return;

        if (field === 'value') {
            const isAbnormal = checkAbnormalValue(test, value);
            setTests(prev => ({
                ...prev,
                [id]: { ...test, value, isAbnormal, isCompleted: value.trim() !== '' }
            }));
        } else { // conditionalValue
            setTests(prev => ({
                ...prev,
                [id]: { ...test, conditionalValue: value }
            }));
        }
    };

    const handleExemptTest = useCallback((id: string) => {
        const reason = prompt("Please provide a reason for exempting this test:", "Not clinically indicated");
        if (reason && reason.trim() !== '') {
            const now = new Date().toISOString().split('T')[0];
            setTests(prev => ({
                ...prev,
                [id]: { ...prev[id], isExempt: true, isCompleted: false, value: '', isAbnormal: false, exemptionReason: reason, exemptionDate: now, exemptedBy: "System User" }
            }));
        }
    }, []);

    const handleRemoveExemption = useCallback((id: string) => {
        setTests(prev => ({
            ...prev,
            [id]: { ...prev[id], isExempt: false, exemptionReason: undefined, exemptionDate: undefined, exemptedBy: undefined }
        }));
    }, []);

    const toggleSection = (category: string) => {
        setOpenSections(prev => ({ ...prev, [category]: !prev[category] }));
    };
    
    const handleCompletePhase = useCallback(() => {
        setWorkflowData(prevWorkflow => {
            const newWorkflow = prevWorkflow.map(p => 
                p.id === phase.id ? { ...p, status: PhaseStatus.Completed, progress: 100 } : p
            );
            const nextPhaseIndex = newWorkflow.findIndex(p => p.id === phase.id + 1);
            if (nextPhaseIndex !== -1 && newWorkflow[nextPhaseIndex].status === PhaseStatus.Locked) {
                newWorkflow[nextPhaseIndex].status = PhaseStatus.Available;
            }
            return newWorkflow;
        });
    }, [phase.id, setWorkflowData]);

    const handleGenerateSummary = async () => {
        setIsLoadingSummary(true);
        setSummary('');
        // FIX: Cast Object.values to MedicalTestItem[] to provide the correct type to the service function.
        const medicalTests = Object.values(tests) as MedicalTestItem[];
        const result = await generateEvaluationSummary(patient, workflow, medicalTests);
        setSummary(result);
        setIsLoadingSummary(false);
    };


    return (
        <div className="p-4 md:p-6 bg-white rounded-b-lg border border-t-0 border-gray-200 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Phase 1 Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold text-primary-600">{overallProgress}%</div>
                        <div className="w-full">
                             <p className="text-sm text-gray-600 mb-1">Overall Completion</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {DONOR_TEST_CATEGORIES.map(category => {
                    const categoryTests = testsByCategory[category] || [];
                    if (categoryTests.length === 0) return null;

                    const isOpen = openSections[category];
                    const progress = categoryProgress[category] || 0;
                    const abnormalCount = categoryAbnormalCounts[category] || 0;
                    const exemptedCount = categoryExemptedCounts[category] || 0;

                    return (
                        <Card key={category}>
                            <button onClick={() => toggleSection(category)} className="w-full text-left">
                                <CardHeader className="flex justify-between items-center cursor-pointer hover:bg-gray-50">
                                    <CardTitle className="text-base">{category}</CardTitle>
                                    <div className="flex items-center space-x-2 md:space-x-4">
                                        {abnormalCount > 0 && <Badge color="red">{abnormalCount} Abnormal</Badge>}
                                        {exemptedCount > 0 && <Badge color="gray">{exemptedCount} Exempt</Badge>}
                                        <Badge color={progress === 100 ? 'green' : 'blue'}>{progress}%</Badge>
                                        <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </CardHeader>
                            </button>
                            {isOpen && (
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 pt-6">
                                    {categoryTests.map(test => (
                                        <TestInput 
                                            key={test.id} 
                                            test={test} 
                                            onChange={handleTestChange}
                                            onExempt={handleExemptTest}
                                            onRemoveExemption={handleRemoveExemption}
                                        />
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
                 <Button variant="secondary" leftIcon={<FileUp size={16}/>}>Upload Reports</Button>
                 <Button variant="secondary" leftIcon={<BrainCircuit size={16}/>} onClick={handleGenerateSummary} disabled={isLoadingSummary}>
                    {isLoadingSummary ? 'Generating...' : 'Generate Summary'}
                 </Button>
                 <Button onClick={handleCompletePhase} disabled={overallProgress !== 100} leftIcon={<Check size={16}/>}>Complete Phase 1</Button>
            </div>
            {isLoadingSummary && (
                <div className="space-y-2 mt-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
            )}
            {summary && !isLoadingSummary && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>AI Generated Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Phase1DonorComprehensive;
