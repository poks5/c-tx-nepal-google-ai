

import React, { useState, useEffect, useRef } from 'react';
// FIX: Change import style for react-router-dom to work around potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeft, Users, GitCommitHorizontal, HeartPulse, LayoutGrid, List, BrainCircuit } from 'lucide-react';

import type { Patient, DonorRecipientPair, EvaluationPhase } from '../types';
import { getPairById, getPatientById, getWorkflowForPatient, updateWorkflowForPatient } from '../../services/backendService';
import { generatePairSummary } from '../../services/geminiService';

import Button from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { PatientType } from '../types';
import PhaseTracker from '../components/Workflow/PhaseTracker';
import PairTimelineView from '../components/Workflow/PairTimelineView';
import AutosaveIndicator, { type SaveStatus } from '../components/ui/AutosaveIndicator';

const PatientWorkflowColumn: React.FC<{
    patient: Patient;
    workflowData: EvaluationPhase[];
    setWorkflowData: React.Dispatch<React.SetStateAction<EvaluationPhase[]>>;
}> = ({ patient, workflowData, setWorkflowData }) => {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-3">
                         <h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2>
                         <Badge color={patient.type === PatientType.Donor ? 'blue' : 'green'}>{patient.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{patient.age} years old, Blood Type {patient.bloodType}</p>
                </CardHeader>
            </Card>
            <PhaseTracker workflowData={workflowData} setWorkflowData={setWorkflowData} patient={patient} />
        </div>
    );
};


const PairDetailPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();

    const [pair, setPair] = useState<DonorRecipientPair | null>(null);
    const [donor, setDonor] = useState<Patient | null>(null);
    const [recipient, setRecipient] = useState<Patient | null>(null);
    const [donorWorkflow, setDonorWorkflow] = useState<EvaluationPhase[]>([]);
    const [recipientWorkflow, setRecipientWorkflow] = useState<EvaluationPhase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'columns' | 'timeline'>('columns');
    const [summary, setSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const donorWorkflowRef = useRef<string>();
    const recipientWorkflowRef = useRef<string>();
    const saveTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const foundPair = await getPairById(id);
                if (!foundPair) {
                    navigate('/pairs');
                    return;
                }
                setPair(foundPair);
                
                const [foundDonor, foundRecipient] = await Promise.all([
                    getPatientById(foundPair.donorId),
                    getPatientById(foundPair.recipientId),
                ]);

                if (!foundDonor || !foundRecipient) {
                     navigate('/pairs');
                     return;
                }
                setDonor(foundDonor);
                setRecipient(foundRecipient);

                const [donorWorkflowData, recipientWorkflowData] = await Promise.all([
                    getWorkflowForPatient(foundDonor.id),
                    getWorkflowForPatient(foundRecipient.id)
                ]);
                setDonorWorkflow(donorWorkflowData);
                setRecipientWorkflow(recipientWorkflowData);
                donorWorkflowRef.current = JSON.stringify(donorWorkflowData);
                recipientWorkflowRef.current = JSON.stringify(recipientWorkflowData);

            } catch (error) {
                console.error("Failed to fetch pair data", error);
                navigate('/pairs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    // Persist workflow changes
    useEffect(() => {
        const stringifiedDonorWf = JSON.stringify(donorWorkflow);
        const stringifiedRecipientWf = JSON.stringify(recipientWorkflow);
        const donorChanged = donor && donorWorkflow.length > 0 && donorWorkflowRef.current && stringifiedDonorWf !== donorWorkflowRef.current;
        const recipientChanged = recipient && recipientWorkflow.length > 0 && recipientWorkflowRef.current && stringifiedRecipientWf !== recipientWorkflowRef.current;
    
        if (donorChanged || recipientChanged) {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            setSaveStatus('saving');
    
            const promises = [];
            if (donorChanged) {
                promises.push(updateWorkflowForPatient(donor!.id, donorWorkflow));
            }
            if (recipientChanged) {
                promises.push(updateWorkflowForPatient(recipient!.id, recipientWorkflow));
            }
    
            Promise.all(promises).then(() => {
                if (donorChanged) donorWorkflowRef.current = stringifiedDonorWf;
                if (recipientChanged) recipientWorkflowRef.current = stringifiedRecipientWf;
                setSaveStatus('saved');
                saveTimeoutRef.current = window.setTimeout(() => setSaveStatus('idle'), 2000);
            });
        }
    }, [donor, donorWorkflow, recipient, recipientWorkflow]);


    if (isLoading) {
        return <div>Loading pair data...</div>;
    }

    if (!pair || !donor || !recipient) {
        return <div>Pair data could not be loaded.</div>;
    }

    const handleGenerateSummary = async () => {
        if (!donor || !recipient) return;
        setIsLoadingSummary(true);
        setSummary('');
        const result = await generatePairSummary(donor, recipient, donorWorkflow, recipientWorkflow);
        setSummary(result);
        setIsLoadingSummary(false);
    };

    const getCompatibilityColor = (status: string) => {
        if (status === 'Compatible') return 'green' as const;
        if (status === 'Incompatible') return 'red' as const;
        return 'yellow' as const;
    };

    const ViewSwitcher = () => (
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
                onClick={() => setViewMode('columns')}
                aria-pressed={viewMode === 'columns'}
                className={`flex items-center justify-center w-1/2 p-2 rounded-md font-semibold text-center transition-colors ${viewMode === 'columns' ? 'bg-white text-primary-700 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                aria-label="Column View"
            >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Columns
            </button>
            <button
                onClick={() => setViewMode('timeline')}
                aria-pressed={viewMode === 'timeline'}
                className={`flex items-center justify-center w-1/2 p-2 rounded-md font-semibold text-center transition-colors ${viewMode === 'timeline' ? 'bg-white text-primary-700 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                aria-label="Timeline View"
            >
                <List className="w-4 h-4 mr-2" />
                Timeline
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pairs List
            </Button>

            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <GitCommitHorizontal className="w-8 h-8 text-primary-600" />
                        <h1 className="text-3xl font-bold text-gray-800">Pair Workflow</h1>
                    </div>
                    <AutosaveIndicator status={saveStatus} />
                </div>
                <p className="text-gray-500 mt-1">Synchronized evaluation view for Donor and Recipient.</p>
            </div>
            
             <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>Pair Overview</CardTitle>
                        <CardDescription>Key details about the donor-recipient pair.</CardDescription>
                    </div>
                     <div className="w-full md:w-auto md:max-w-xs">
                        <ViewSwitcher />
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <Users className="w-8 h-8 mx-auto text-blue-500" />
                            <p className="font-semibold">{donor.name}</p>
                            <p className="text-sm text-gray-500">Donor</p>
                        </div>
                        <HeartPulse className="w-6 h-6 text-gray-400" />
                         <div className="text-center">
                            <Users className="w-8 h-8 mx-auto text-green-500" />
                            <p className="font-semibold">{recipient.name}</p>
                            <p className="text-sm text-gray-500">Recipient</p>
                        </div>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-sm text-gray-500 mb-1">Compatibility Status</p>
                        <Badge color={getCompatibilityColor(pair.compatibilityStatus)}>{pair.compatibilityStatus}</Badge>
                    </div>
                </CardContent>
             </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><BrainCircuit size={20} className="mr-2 text-primary-600"/>AI-Powered Pair Summary</CardTitle>
                    <CardDescription>A high-level overview of the combined progress and key highlights.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoadingSummary ? (
                        <div className="space-y-2 p-4 bg-slate-50 rounded-lg border">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        </div>
                    ) : summary ? (
                        <div className="text-sm text-gray-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border space-y-2">
                            {summary.split('\n').filter(line => line.trim() !== '').map((line, index) => {
                                const boldMatch = line.match(/^\s*\*\*(.*?)\*\*/);
                                if (boldMatch) {
                                    const title = boldMatch[1];
                                    const restOfLine = line.substring(boldMatch[0].length);
                                    return (
                                        <div key={index}>
                                            <strong className="font-semibold text-gray-900">{title}</strong>
                                            <span className="text-gray-700">{restOfLine}</span>
                                        </div>
                                    );
                                }
                                return <p key={index} className="pl-2">{line}</p>;
                            })}
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-slate-50 rounded-lg border">
                             <p className="text-sm text-gray-500 italic">Click the button to generate an AI summary for this pair.</p>
                        </div>
                    )}
                </CardContent>
                 <div className="p-4 border-t bg-slate-50 text-center rounded-b-xl">
                    <Button onClick={handleGenerateSummary} disabled={isLoadingSummary} leftIcon={<BrainCircuit size={16} />}>
                        {isLoadingSummary ? 'Generating...' : summary ? 'Re-generate Summary' : 'Generate Pair Summary'}
                    </Button>
                </div>
            </Card>

            {viewMode === 'columns' ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PatientWorkflowColumn
                        patient={donor}
                        workflowData={donorWorkflow}
                        setWorkflowData={setDonorWorkflow}
                    />
                    <PatientWorkflowColumn
                        patient={recipient}
                        workflowData={recipientWorkflow}
                        setWorkflowData={setRecipientWorkflow}
                    />
                </div>
            ) : (
                <PairTimelineView 
                    donorWorkflow={donorWorkflow}
                    recipientWorkflow={recipientWorkflow}
                />
            )}
        </div>
    );
};

export default PairDetailPage;
