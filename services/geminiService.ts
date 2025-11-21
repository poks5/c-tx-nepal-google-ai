import { GoogleGenAI, Type } from "@google/genai";
import type { Patient, EvaluationPhase, MedicalTestItem, Consultation, Phase5Data } from '../types';

// IMPORTANT: This assumes process.env.API_KEY is set in the environment.
// Do not add UI for key management.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

// FIX: Initialize GoogleGenAI with a named apiKey parameter.
const ai = new GoogleGenAI({ apiKey: API_KEY! });

const formatPatientDataForPrompt = (patient: Patient, workflow: EvaluationPhase[], medicalTests?: MedicalTestItem[]): string => {
  const completedPhases = workflow.filter(p => p.status === 'completed').map(p => p.name).join(', ') || 'None';
  const inProgressPhase = workflow.find(p => p.status === 'in_progress');

  let promptData = `
    - Patient Name: ${patient.name}
    - Age: ${patient.age}
    - Gender: ${patient.gender}
    - Blood Type: ${patient.bloodType}
    - Role: ${patient.type}
    - Medical History: ${patient.medicalHistory.join(', ')}
    - Current Medications: ${patient.medications.join(', ')}
    - Allergies: ${patient.allergies.join(', ')}
    - Evaluation Progress:
      - Completed Phases: ${completedPhases}
      - Current Phase: ${inProgressPhase ? `${inProgressPhase.name} (${inProgressPhase.progress}% complete)` : 'Not started'}
  `;

  if (medicalTests) {
    const abnormalTests = medicalTests.filter(t => t.isAbnormal && t.isCompleted);
    const exemptedTests = medicalTests.filter(t => t.isExempt);

    if (abnormalTests.length > 0) {
      promptData += '\n\n    - Key Findings (Abnormal Lab Results):\n';
      abnormalTests.forEach(t => {
        let resultDisplay = t.value;
        if (t.conditionalInput && t.value === t.conditionalInput.onValue && t.conditionalValue) {
            resultDisplay += `: ${t.conditionalValue}`;
        } else if (t.unit) {
            resultDisplay += ` ${t.unit}`;
        }
        promptData += `      - ${t.name}: ${resultDisplay} (Normal Range: ${t.normalRange || 'N/A'})\n`;
      });
    }

    if (exemptedTests.length > 0) {
      promptData += '\n    - Exempted Tests (Not Required):\n';
      exemptedTests.forEach(t => {
        promptData += `      - ${t.name}: Reason - ${t.exemptionReason}\n`;
      });
    }
  }

  return promptData;
};

export const generateEvaluationSummary = async (patient: Patient, workflow: EvaluationPhase[], medicalTests?: MedicalTestItem[]): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured.";
  }
  
  const patientData = formatPatientDataForPrompt(patient, workflow, medicalTests);
  const prompt = `
    Generate a concise, professional medical summary report for a living kidney transplant ${patient.type}.
    The report should be structured for a clinical audience, highlighting key information and evaluation progress.

    CRITICAL: The summary MUST include the following dedicated sections if applicable:
    - **Abnormal Lab Results**: Detail any results flagged as abnormal, including the test name, value, and normal range.
    - **Exempted Tests**: List any tests marked as 'Not Required' and the reason for exemption.

    If there are no abnormal results or no exempted tests, explicitly state "None noted" under the corresponding heading.
    Do not add any greetings or closing remarks, just the report.

    Patient Data:
    ${patientData}
  `;

  try {
    // FIX: Use correct model 'gemini-2.5-flash' and access text property directly.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating evaluation summary:", error);
    return "An error occurred while generating the summary. Please check the console for details.";
  }
};


export const generateRiskAssessment = async (patient: Patient): Promise<string> => {
   if (!API_KEY) {
    return "Error: Gemini API key is not configured.";
  }

  const prompt = `
    Based on the following patient profile, provide a brief, qualitative risk assessment for a living kidney ${patient.type === 'Donor' ? 'donation' : 'transplant'}. 
    Highlight potential areas of concern for clinicians to investigate further.
    Conclude with an overall risk categorization: "Overall Risk: Low", "Overall Risk: Medium", or "Overall Risk: High".
    Do not add any greetings or closing remarks, just the assessment.

    Patient Profile:
    - Age: ${patient.age}
    - Blood Type: ${patient.bloodType}
    - Role: ${patient.type}
    - Key Medical History: ${patient.medicalHistory.join(', ')}
  `;

  try {
    // FIX: Use correct model 'gemini-2.5-flash' and access text property directly.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating risk assessment:", error);
    return "An error occurred while generating the risk assessment. Please check the console for details.";
  }
};

const formatConsultationDataForPrompt = (consultations: Consultation[]): string => {
  const applicableConsults = consultations.filter(c => c.isApplicable);

  const cleared = applicableConsults.filter(c => c.status === 'Cleared').map(c => c.department).join(', ') || 'None';
  const pending = applicableConsults.filter(c => c.status === 'Pending' || c.status === 'In Progress').map(c => c.department).join(', ') || 'None';
  const notRequired = applicableConsults.filter(c => c.status === 'Not Required').map(c => `${c.department} (Justification: ${c.justification || 'N/A'})`).join(', ') || 'None';

  return `
    - Cleared Departments: ${cleared}
    - Pending/In Progress Departments: ${pending}
    - Not Required Departments: ${notRequired}
  `;
};

export const generateClearanceSummary = async (patient: Patient, consultations: Consultation[]): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured.";
  }

  const consultationData = formatConsultationDataForPrompt(consultations);
  const prompt = `
    Generate a concise, professional summary of the departmental clearance status for a living kidney transplant ${patient.type}.
    The summary should be a brief paragraph, highlighting the overall progress.
    Do not use bullet points. Do not add greetings or closing remarks.

    Patient Role: ${patient.type}
    
    Current Clearance Status:
    ${consultationData}
  `;

  try {
// FIX: Use correct model 'gemini-2.5-flash' and access text property directly.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating clearance summary:", error);
    return "An error occurred while generating the summary. Please check the console for details.";
  }
};

export const generatePairSummary = async (
  donor: Patient,
  recipient: Patient,
  donorWorkflow: EvaluationPhase[],
  recipientWorkflow: EvaluationPhase[]
): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured.";
  }

  const donorData = formatPatientDataForPrompt(donor, donorWorkflow);
  const recipientData = formatPatientDataForPrompt(recipient, recipientWorkflow);

  const prompt = `
    As a clinical transplant coordinator, generate a concise, professional summary for the living kidney transplant pair listed below. The summary should be suitable for a team meeting, providing a high-level overview of the combined progress, highlighting key data points, and identifying any potential issues.

    **Structure the summary with the following sections:**
    1.  **Overall Status:** A brief, one-sentence summary of the pair's current stage in the evaluation process.
    2.  **Donor Highlights:** Key positive findings or milestones achieved for the donor. Mention the current in-progress phase.
    3.  **Recipient Highlights:** Key positive findings or milestones achieved for the recipient. Mention the current in-progress phase.
    4.  **Key Concerns & Blockers:** List any abnormal results, incompatible findings, significant delays, or pending critical clearances for either patient that could impact the transplant timeline. If none, state "No significant concerns noted at this time."
    5.  **Synchronization Status:** Briefly comment on whether the donor and recipient evaluations are progressing in parallel or if one is significantly ahead of the other.
    6.  **Next Steps:** State the immediate next steps for the pair to move forward.

    Do not add any greetings or closing remarks, just the report.

    **Donor Data:**
    ${donorData}

    **Recipient Data:**
    ${recipientData}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating pair summary:", error);
    return "An error occurred while generating the summary. Please check the console for details.";
  }
};

// --- New Function for Phase 5 Report Parsing ---

// Define the schema for a single HLA typing result
const hlaTypingSchema = {
    type: Type.OBJECT,
    properties: {
        A: { type: Type.ARRAY, items: { type: Type.STRING } },
        B: { type: Type.ARRAY, items: { type: Type.STRING } },
        C: { type: Type.ARRAY, items: { type: Type.STRING } },
        DR: { type: Type.ARRAY, items: { type: Type.STRING } },
        DQ: { type: Type.ARRAY, items: { type: Type.STRING } },
        DP: { type: Type.ARRAY, items: { type: Type.STRING } },
    }
};

// Define the overall schema for the data to be extracted
const hlaExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        donorHla: hlaTypingSchema,
        recipientHla: hlaTypingSchema,
        crossmatch: {
            type: Type.OBJECT,
            properties: {
                cdc: { type: Type.STRING, enum: ['Pending', 'Negative', 'Positive'] },
                dsa: { type: Type.STRING, enum: ['Pending', 'Absent', 'Present'] },
                dsaInterpretation: { type: Type.STRING, description: 'Any notes or interpretation regarding the DSA findings.' }
            }
        }
    }
};

export type HlaExtractedData = Partial<Pick<Phase5Data, 'donorHla' | 'recipientHla' | 'crossmatch'>>;

export const extractHlaDataFromReports = async (
  reportFiles: { base64: string; mimeType: string }[]
): Promise<HlaExtractedData> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  
  const textPart = {
    text: `
      You are a specialized medical data extraction agent.
      Analyze the provided medical reports, which could include HLA Typing, T/B Cell Crossmatch (CDC), and Donor-Specific Antibodies (DSA) reports.
      Your task is to extract the following information and return it in a structured JSON format.

      **Instructions:**
      1.  **HLA Typing:** Identify the "Patient" or "Recipient" and the "Donor". Extract the two alleles for each HLA locus (A, B, C, DRB1, DQB1, DPB1).
          - Map 'DRB1' from the report to 'DR' in the JSON.
          - Map 'DQB1' from the report to 'DQ' in the JSON.
          - Map 'DPB1' from the report to 'DP' in the JSON.
          - If a report only contains information for one person, fill in their data and leave the other person's HLA fields as empty arrays.
      2.  **CDC Crossmatch:** From the "T AND B CELL CROSS MATCH REPORT", determine the final result. If the T-Cell and B-Cell crossmatches are "Negative" (typically <20% dead cells), the overall CDC result is "Negative". Otherwise, it is "Positive".
      3.  **DSA Result:** From the "DONOR SPECIFIC IgG HLA ANTIBODIES" report, find the final result. A "Negative" result for Class I and Class II IgG DSA means the result is "Absent". A "Positive" result means "Present".
      4.  **DSA Interpretation:** If there are any comments, notes, MFI values, or interpretation text related to the DSA findings (e.g., in the "Comment" or "Interpretation" section), extract that text into the 'dsaInterpretation' field.
      5.  **Incomplete Data:** If any piece of information cannot be found in the reports, use the default/pending values from the schema (e.g., "Pending" for strings, empty arrays for HLA loci).
      6.  **Patient/Recipient:** The terms "Patient" and "Recipient" are used interchangeably in these reports.
    `
  };
  
  const fileParts = reportFiles.map(file => ({
    inlineData: {
      data: file.base64,
      mimeType: file.mimeType,
    },
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, ...fileParts] },
      config: {
        responseMimeType: "application/json",
        responseSchema: hlaExtractionSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error extracting data from reports:", error);
    throw new Error("Failed to parse the medical reports. Please ensure the uploaded files are clear and valid.");
  }
};