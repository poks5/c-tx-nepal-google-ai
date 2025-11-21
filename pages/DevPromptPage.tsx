
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FileCode, Clipboard, Check, RefreshCw } from 'lucide-react';

const getAppGenerationPrompt = () => {
  return `
# Prompt to Generate the TransplantFlow Application

## 1. High-Level Goal

Create a comprehensive web application named "TransplantFlow" for healthcare professionals to manage the entire workflow for living kidney transplant evaluations. The system should track both donors and recipients, pair them, and guide them through a multi-phase evaluation process. It must feature a clean, professional UI and leverage the Google Gemini API for summaries and data extraction.

## 2. Technology Stack & Setup

- **Frontend Framework:** React with TypeScript.
- **Routing:** React Router (\`react-router-dom\`).
- **Styling:** TailwindCSS. Use the provided CDN link and theme configuration.
- **Icons:** \`lucide-react\`.
- **AI Integration:** Google Gemini API (\`@google/genai\`).
- **Data Persistence:** Use browser \`localStorage\` to simulate a backend. All data operations (get, set, update) should be encapsulated in a \`services/backendService.ts\` file.
- **Structure:** Use an \`index.html\` that imports a single compiled \`index.tsx\` module.

## 3. Core App Structure (\`App.tsx\`)

- A main layout with a persistent sidebar on larger screens (\`lg:ml-64\`) and a toggleable sidebar on smaller screens.
- A header that is only visible on mobile screens (\`lg:hidden\`) containing a menu button to toggle the sidebar.
- Use \`react-router-dom\` with \`HashRouter\` to manage all application routes.
- The sidebar should contain links to: Dashboard, Patients, Pairs, Register Patient, User Manual, and a developer-focused "Dev Prompt" page.

## 4. Data Models (\`types.ts\`)

Define a comprehensive set of TypeScript types and enums to model the entire domain. This should include, but not be limited to:
- **Enums:** \`PatientType\` (Donor, Recipient), \`PhaseStatus\` (Completed, InProgress, etc.).
- **Core Interfaces:** \`Patient\`, \`Donor\`, \`Recipient\`, \`DonorRecipientPair\`.
- **Workflow Models:** \`EvaluationPhase\` as a central interface containing data for all 8 phases. Create specific interfaces for each phase's data, such as \`CTAngiogram\`, \`DTPARenogram\`, \`Consultation\`, \`Phase5Data\` (for HLA), \`Phase8Data\`, etc.
- **Medical Tests:** \`MedicalTestItem\` to represent a single test in the comprehensive Phase 1 checklist.

## 5. Mock Backend Service (\`services/backendService.ts\`)

- Create a service that uses \`localStorage\` for all data storage.
- Implement functions to manage patients and pairs: \`getPatients\`, \`getPatientById\`, \`getPairs\`, \`getPairById\`, \`registerNewPatient\`, \`createPair\`.
- Implement functions for managing workflows: \`getWorkflowForPatient\` and \`updateWorkflowForPatient\`.
- **\`getWorkflowForPatient\` should be intelligent:** if a workflow doesn't exist for a patient, it should create one from a predefined template where all phases are set to \`Available\` status by default. It must also retroactively update any existing workflows loaded from storage to change any \`Locked\` phases to \`Available\`, ensuring a non-linear data entry model.
- This service should handle data synchronization for pair-based phases (4-8).

## 6. Gemini API Service (\`services/geminiService.ts\`)

- Initialize the Gemini API client using \`new GoogleGenAI({ apiKey: process.env.API_KEY })\`.
- Implement the following asynchronous functions, ensuring they use the \`gemini-2.5-flash\` model for text generation:
  - \`generateEvaluationSummary(patient, workflow, medicalTests)\`: Generates a professional summary of a single patient's progress, highlighting abnormal and exempted test results.
  - \`generateRiskAssessment(patient)\`: Provides a brief, qualitative risk assessment based on key patient profile data.
  - \`generateClearanceSummary(patient, consultations)\`: Summarizes the status of multi-disciplinary consultations.
  - \`generatePairSummary(donor, recipient, donorWorkflow, recipientWorkflow)\`: Creates a detailed, structured summary for a donor-recipient pair, suitable for clinical meetings.
  - \`extractHlaDataFromReports(reportFiles)\`: A sophisticated function that takes uploaded report files (images/PDFs), converts them to base64, and sends them to the Gemini model with a detailed prompt and a strict JSON schema (\`responseSchema\`) to parse HLA typing and crossmatch results.

## 7. Pages and Components

### Shared UI Components
- **Card (\`components/ui/Card.tsx\`):** A flexible card component with sub-components like \`CardHeader\`, \`CardContent\`, \`CardTitle\`, \`CardDescription\`.
- **Button (\`components/ui/Button.tsx\`):** A customizable button with variants (primary, secondary) and support for a left icon.
- **Badge (\`components/ui/Badge.tsx\`):** A component for displaying status tags with different colors.

### Core Pages
- **DashboardPage:** Display stat cards and charts for an at-a-glance overview.
- **PatientsListPage:** A table view of all registered patients. Rows should be clickable to navigate to the detail page. Include a "Register New Patient" button.
- **PatientDetailPage:**
    - Display patient demographics in a top card.
    - Implement a two-column layout.
    - **Left Column:** A \`PhaseTracker\` component that lists all evaluation phases. Each phase is a collapsible accordion.
    - **Right Column:** "AI Assistants" section with buttons to trigger \`generateEvaluationSummary\` and \`generateRiskAssessment\`. Display the results in dedicated cards with loading states.
- **PairsListPage:** A table of all donor-recipient pairs. Include a button to open a "Create Pair" modal.
- **PairDetailPage:**
    - Display an overview card for the pair.
    - Include an "AI-Powered Pair Summary" card with a button to trigger \`generatePairSummary\`. The summary should be well-formatted.
    - Implement a view switcher for "Columns" and "Timeline" views.
    - **Columns View:** Show the full \`PhaseTracker\` for both donor and recipient side-by-side.
    - **Timeline View:** Show a condensed, synchronized timeline comparing the progress of both patients for each phase.
- **RegisterPatientPage:** A form that dynamically changes based on a "Donor"/"Recipient" toggle.
- **UserManualPage & DevPromptPage:** Static content pages accessible from the sidebar.

### Workflow Components
- **PhaseTracker:** Manages the accordion-style display of evaluation phases. It should dynamically render the correct detail component for each phase based on its ID and the patient type.
- **Phase-Specific Components (e.g., \`Phase1ComprehensiveView\`, \`Phase2DonorEvaluation\`, \`Phase5HLA\`):**
    - These are the most complex components. They contain the forms for all data entry.
    - Implement robust state management, often using \`useState\` and \`useEffect\` to persist data to \`localStorage\` via the backend service.
    - **Crucially for pair-based phases (4-8):** When data is changed for one patient in a pair, it must be automatically synchronized to the other patient's workflow data in \`localStorage\`.
    - **Phase 1:** A detailed checklist view. It must dynamically show/hide tests based on patient demographics (age/gender) and auto-flag abnormal results. When progress reaches 100%, the "Complete Phase 1" button becomes active. Note: All phases are available from the start; completing a phase simply updates its status and does not unlock subsequent phases.
    - **Phase 5:** An advanced form for HLA data with an AI "Autofill from Reports" feature that uses the \`extractHlaDataFromReports\` service. It must also feature a real-time compatibility analysis card that calculates and displays mismatch results and risk level as the user types.

This prompt provides a comprehensive blueprint. Follow it to build the TransplantFlow application with all its specified features and logic.
`;
};


const DevPromptPage: React.FC = () => {
    const [isCopied, setIsCopied] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const promptTextRef = useRef<HTMLTextAreaElement>(null);
    const promptContent = getAppGenerationPrompt();

    const handleCopy = useCallback(() => {
        if (promptTextRef.current) {
            promptTextRef.current.select();
            document.execCommand('copy');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, []);
    
    const handleUpdate = () => {
        setIsUpdating(true);
        // This is a simulation. In a real scenario, this might trigger a backend call.
        // Here, we just re-render with the same hardcoded prompt, giving the user feedback.
        setTimeout(() => {
            setIsUpdating(false);
        }, 750);
    };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-3">
          <FileCode className="w-8 h-8 text-primary-600"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Application Generation Prompt</h1>
            <p className="text-gray-500 mt-1">Use this prompt with a capable AI model to generate or update the application.</p>
          </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>Application Blueprint</CardTitle>
                <CardDescription>This prompt describes the current architecture, components, and logic of the app.</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="secondary" onClick={handleUpdate} leftIcon={
                    <RefreshCw size={16} className={isUpdating ? 'animate-spin' : ''} />
                }>
                    {isUpdating ? 'Updating...' : 'Update Prompt'}
                </Button>
                <Button onClick={handleCopy} leftIcon={isCopied ? <Check size={16} /> : <Clipboard size={16}/>}>
                    {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <textarea
                ref={promptTextRef}
                readOnly
                className="w-full h-[60vh] p-4 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm text-slate-800 resize-none focus:ring-2 focus:ring-primary-500"
                value={promptContent}
            />
        </CardContent>
      </Card>
    </div>
  );
};

export default DevPromptPage;
