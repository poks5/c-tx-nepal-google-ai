
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { BookOpen, AlertCircle, Ban, Dna, GitCommitHorizontal, LayoutGrid, List, BrainCircuit } from 'lucide-react';

const ManualSection: React.FC<{ title: string; children: React.ReactNode; description?: string }> = ({ title, description, children }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none prose-p:text-gray-600 prose-li:text-gray-600 prose-headings:text-gray-800">
            {children}
        </CardContent>
    </Card>
);

const InlineIcon: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
    <span className="inline-flex items-center not-prose">
        {icon}
        <span className="ml-1 font-semibold">{text}</span>
    </span>
);

const UserManualPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-primary-600"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Manual</h1>
            <p className="text-gray-500 mt-1">A comprehensive guide to the TransplantFlow Evaluation System.</p>
          </div>
      </div>

      <ManualSection title="1. Introduction" description="Welcome to TransplantFlow, a web-based system designed to streamline the evaluation process for living kidney transplantation.">
        <p>This system allows healthcare professionals to:</p>
        <ul>
          <li>Register and manage donor and recipient profiles with role-specific data points.</li>
          <li>Track patients through a detailed, multi-phase evaluation workflow from initial screening to surgery.</li>
          <li>Enter comprehensive medical, lab, imaging, and clearance data in structured forms.</li>
          <li>View and manage synchronized workflows for donor-recipient pairs, ensuring both evaluations progress in tandem.</li>
          <li>Leverage multiple AI assistants to generate clinical summaries, risk assessments, and parse data from uploaded reports.</li>
        </ul>
      </ManualSection>

      <ManualSection title="2. Dashboard" description="The main landing page providing a high-level overview of the system's status.">
          <p>The dashboard contains several key components:</p>
          <ul>
              <li><strong>Statistic Cards:</strong> Quick metrics on Total Patients, Active Pairs, Completed Evaluations, and Average Evaluation Time.</li>
              <li><strong>Evaluation Phase Completion Chart:</strong> A bar chart visualizing the percentage of patients who have completed or are in-progress for each evaluation phase.</li>
              <li><strong>Recent Activity:</strong> A feed of the latest significant events, such as new patient registrations or phase completions.</li>
          </ul>
      </ManualSection>

      <ManualSection title="3. Patient Management" description="All functionalities related to registering and managing patient data.">
        <h4>3.1. Registering a New Patient</h4>
        <ol>
          <li>Navigate to the <strong>Register Patient</strong> page from the sidebar.</li>
          <li>Select whether you are registering a <strong>Recipient</strong> or a <strong>Donor</strong> using the toggle buttons at the top. The form will dynamically adjust.</li>
          <li>Fill in all personal and medical information. Fields like Medical History can accept comma-separated values.</li>
          <li>For both patient types, a BMI is automatically calculated once weight and height are entered.</li>
          <li>Click the <strong>Register Patient</strong> button to save the new patient. You will see a success notification and be redirected to the patient list.</li>
        </ol>

        <h4>3.2. Patient Detail Page</h4>
        <p>This is the central hub for a single patient's evaluation. It is divided into two main columns:</p>
        <ul>
            <li><strong>Evaluation Workflow:</strong> The left column contains the <strong>Phase Tracker</strong>, where all clinical data entry occurs.</li>
            <li><strong>AI Assistants:</strong> The right column provides AI-powered tools. Click <strong>Generate Evaluation Summary</strong> for a report based on entered data, or <strong>Generate Risk Assessment</strong> for a qualitative risk profile based on the patient's core medical history.</li>
        </ul>
      </ManualSection>

      <ManualSection title="4. The Evaluation Workflow" description="How to enter data and progress a patient through the evaluation phases.">
          <h4>4.1. Phase 1: Initial Screening & Comprehensive Lab Work</h4>
          <p>This phase uses a comprehensive checklist of medical tests organized by category (e.g., Blood Tests, Imaging). The system intelligently shows/hides tests based on patient age and gender.</p>
          <ul>
              <li>Click on a category header to expand or collapse its list of tests.</li>
              <li>Enter the result for each test. The system will automatically flag abnormal results with a red border and an <InlineIcon icon={<AlertCircle size={14} className="text-red-500" />} text="Alert Icon" />.</li>
              <li>If a test is not clinically indicated, hover over it and click the <InlineIcon icon={<Ban size={14} className="text-red-500" />} text="Exempt Icon" />. You will be prompted for a reason.</li>
              <li>As you fill in data, the progress for each category and the overall phase will update in real-time.</li>
              <li>Once all tests are completed or exempted (100% progress), click the <strong>Complete Phase 1</strong> button to unlock Phase 2.</li>
          </ul>

          <h4>4.2. Phase 2: Advanced Assessments</h4>
          <p>This phase differs significantly between Donors and Recipients.</p>
          <h5>For Donors:</h5>
          <p>A detailed, tabbed interface for Imaging and Surgical Planning.</p>
          <ol>
              <li><strong>CT Angiogram Tab:</strong> Enter detailed bilateral kidney measurements, vessel assessments, and clinical interpretations.</li>
              <li><strong>DTPA Renogram Tab:</strong> Input GFR and drainage data. The total GFR is calculated automatically.</li>
              <li><strong>Surgical Plan Tab:</strong> Document final surgical decisions and risk assessments. An overall surgical risk is automatically calculated based on factors like BMI, age, and medical history.</li>
              <li>In the CT and DTPA tabs, you must upload the corresponding report file to complete the section.</li>
          </ol>
           <h5>For Recipients:</h5>
          <p>This phase focuses on cardiac and vascular fitness. You can update the status of imaging tests like Echocardiograms and add notes to the surgical plan.</p>
          
          <h4>4.3. Phase 3: Multi-Disciplinary Consultations</h4>
          <p>This phase tracks clearances from various specialists for each patient individually. Data entered in this phase applies only to the specific patient (donor or recipient) and is <strong>not</strong> synchronized with their counterpart in the pair. Each consultation is a collapsible row where you can update status, add notes, and upload supporting documents.</p>
          
          <h4>4.4. Synchronized Pair-Based Phases (Phases 4-8)</h4>
          <p>Phases 4 through 8 are synchronized for donor-recipient pairs. Data entered for one patient in a pair will automatically appear for the other, ensuring consistency. This includes legal clearance, HLA typing, final reviews, and surgery preparation.</p>

          <h5>Phase 5: HLA Typing & Crossmatch <InlineIcon icon={<Dna size={14}/>} text="AI-Powered"/></h5>
          <p>This is a critical, data-intensive phase with powerful AI assistance.</p>
            <ul>
              <li><strong>Autofill from Reports:</strong> Upload HLA, CDC, and DSA reports (images or PDFs). The system's AI will parse the documents and automatically populate the relevant fields for HLA typing and crossmatch results.</li>
              <li><strong>Real-time Compatibility Analysis:</strong> As HLA data is entered (manually or via AI), a dedicated card provides a live analysis, showing the match ratio (e.g., "8/12"), total mismatches, and a calculated compatibility risk level (Identical, Low, Moderate, High).</li>
            </ul>

          <h5>Phase 8: Surgery Preparation & Admission</h5>
          <p>This final phase is a tabbed interface to manage all pre-operative logistics.</p>
            <ul>
                <li><strong>Surgical Coordination:</strong> Set the OR, surgery times, and assign the surgical team.</li>
                <li><strong>Preparation Checklist:</strong> A patient-specific (Donor vs Recipient) list of final prep tasks.</li>
                <li><strong>Pre-Op Assessment:</strong> Enter the patient's final vitals and confirm all medical clearances are in place.</li>
            </ul>
      </ManualSection>

      <ManualSection title="5. Pair Management" description="Viewing and managing donor-recipient pairs.">
           <p>The <strong>Pairs</strong> page lists all created donor-recipient pairs. Clicking "View Workflow" takes you to the Pair Detail Page.</p>
           <h4>5.1. Pair Detail Page</h4>
           <p>This page provides a synchronized view of the evaluation progress for both the donor and the recipient, with powerful tools for oversight.</p>
           <ul>
               <li><InlineIcon icon={<BrainCircuit size={16} />} text="AI-Powered Pair Summary:" /> At the top of the page, click <strong>Generate Pair Summary</strong>. The AI will analyze both patients' entire workflows and generate a structured clinical summary covering overall status, highlights, key concerns, and next steps.</li>
               <li><strong>View Switcher:</strong>
                   <ul>
                       <li><InlineIcon icon={<LayoutGrid size={14} />} text="Columns View (Default):" /> Displays the full, interactive evaluation workflows for the donor and recipient side-by-side. You can enter and edit data for either patient directly from this view.</li>
                       <li><InlineIcon icon={<List size={14} />} text="Timeline View:" /> Provides a condensed, visual timeline of progress. Each phase shows progress bars for both individuals, making it easy to spot discrepancies in their evaluation timelines.</li>
                   </ul>
                </li>
           </ul>
      </ManualSection>
    </div>
  );
};

export default UserManualPage;
