
import React, { useState, useEffect, useRef } from 'react';
// FIX: Change import style for react-router-dom to work around potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeft, Stethoscope, FileText } from 'lucide-react';

import type { Patient, EvaluationPhase, MedicalTestItem } from '../types';
import { getPatientById, getWorkflowForPatient, updateWorkflowForPatient } from '../services/backendService';
import { generateEvaluationSummary, generateRiskAssessment } from '../services/geminiService';

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { PatientType } from '../types';
import PhaseTracker from '../components/Workflow/PhaseTracker';
import AutosaveIndicator, { type SaveStatus } from '../components/ui/AutosaveIndicator';


const AISummaryCard: React.FC<{ title: string; description: string; content: string; isLoading: boolean }> = ({ title, description, content, isLoading }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
            ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
            )}
        </CardContent>
    </Card>
);


const PatientDetailPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();

    const [patient, setPatient] = useState<Patient | null>(null);
    const [workflowData, setWorkflowData] = useState<EvaluationPhase[]>([]);
    const [summary, setSummary] = useState('');
    const [risk, setRisk] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [isLoadingRisk, setIsLoadingRisk] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const workflowDataRef = useRef<string>();
    const saveTimeoutRef = useRef<number | null>(null);


    useEffect(() => {
        if (!id) return;
        
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const foundPatient = await getPatientById(id);
                if (foundPatient) {
                    setPatient(foundPatient);
                    const workflow = await getWorkflowForPatient(foundPatient.id);
                    setWorkflowData(workflow);
                    workflowDataRef.current = JSON.stringify(workflow);
                } else {
                    // Handle patient not found
                    navigate('/patients');
                }
            } catch (error) {
                console.error("Failed to fetch patient data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Persist workflow changes to localStorage whenever they occur
    useEffect(() => {
        const stringifiedWorkflow = JSON.stringify(workflowData);
        if (patient && workflowData.length > 0 && workflowDataRef.current && stringifiedWorkflow !== workflowDataRef.current) {
            
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            setSaveStatus('saving');
    
            updateWorkflowForPatient(patient.id, workflowData).then(() => {
                workflowDataRef.current = stringifiedWorkflow;
                setSaveStatus('saved');
                saveTimeoutRef.current = window.setTimeout(() => {
                    setSaveStatus('idle');
                }, 2000);
            });
        }
    }, [workflowData, patient]);

    const handleGenerateSummary = async () => {
        if (!patient) return;
        setIsLoadingSummary(true);

        let medicalTests: MedicalTestItem[] | undefined;
        
        const storageKey = patient.type === PatientType.Donor 
            ? `phase1_donor_tests_${patient.id}`
            : `phase1_recipient_tests_${patient.id}`;
            
        const storedTestData = localStorage.getItem(storageKey);
        
        if (storedTestData) {
            try {
                const testMap: Record<string, MedicalTestItem> = JSON.parse(storedTestData);
                medicalTests = Object.values(testMap);
            } catch (e) {
                console.error("Failed to parse test data from localStorage", e);
            }
        }

        const result = await generateEvaluationSummary(patient, workflowData, medicalTests);
        setSummary(result);
        setIsLoadingSummary(false);
    };

    const handleGenerateRisk = async () => {
        if (!patient) return;
        setIsLoadingRisk(true);
        const result = await generateRiskAssessment(patient);
        setRisk(result);
        setIsLoadingRisk(false);
    };

    if (isLoading) {
        return <div>Loading patient data...</div>;
    }

    if (!patient) {
        return <div>Patient not found.</div>;
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-3xl font-bold text-gray-800">{patient.name}</h1>
                                <Badge color={patient.type === PatientType.Donor ? 'blue' : 'green'}>{patient.type}</Badge>
                            </div>
                            <p className="text-gray-500 mt-1">ID: {patient.id} &bull; Registered: {patient.registrationDate}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><span className="font-semibold">Age:</span> {patient.age}</div>
                    <div><span className="font-semibold">Gender:</span> {patient.gender}</div>
                    <div><span className="font-semibold">Blood Type:</span> {patient.bloodType}</div>
                    <div><span className="font-semibold">Email:</span> {patient.email}</div>
                    <div className="md:col-span-2"><span className="font-semibold">Address:</span> {patient.address}</div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">Evaluation Workflow</h2>
                        <AutosaveIndicator status={saveStatus} />
                    </div>
                    <PhaseTracker workflowData={workflowData} setWorkflowData={setWorkflowData} patient={patient} />
                </div>
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">AI Assistants</h2>
                    <div>
                        <Button onClick={handleGenerateSummary} disabled={isLoadingSummary} leftIcon={<FileText size={16} />} className="w-full">
                           {isLoadingSummary ? 'Generating...' : 'Generate Evaluation Summary'}
                        </Button>
                        <AISummaryCard 
                            title="Evaluation Summary" 
                            description="AI-generated summary of the patient's evaluation status."
                            content={summary || 'Click the button to generate a summary.'}
                            isLoading={isLoadingSummary}
                        />
                    </div>
                    <div>
                        <Button onClick={handleGenerateRisk} disabled={isLoadingRisk} leftIcon={<Stethoscope size={16} />} className="w-full">
                           {isLoadingRisk ? 'Generating...' : 'Generate Risk Assessment'}
                        </Button>
                        <AISummaryCard 
                            title="Clinical Risk Assessment"
                            description="AI-generated qualitative risk assessment based on key profile data."
                            content={risk || 'Click the button to generate a risk assessment.'}
                            isLoading={isLoadingRisk}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailPage;
