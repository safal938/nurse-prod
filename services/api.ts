import { Diagnosis, Question } from '../types';

// Sample data - replace with actual API calls when backend is ready
const SAMPLE_DIAGNOSES: Diagnosis[] = [
  {
    did: "A1B2C",
    diagnosis: "Drug-Induced Liver Injury secondary to Amoxicillin-Clavulanate and Acetaminophen (Acute)",
    indicators_point: [
      "Patient reports yellow eyes (jaundice).",
      "Patient reports itching (pruritus).",
      "Elevated AST (450 U/L), ALT (620 U/L), and Total Bilirubin (5.2 mg/dL).",
      "Elevated Alk Phos (180 U/L)",
      "Recent prescription of Amoxicillin-Clavulanate (Augmentin) 3 weeks ago.",
      "Frequent use of Tylenol (Acetaminophen) for pain management.",
      "Patient reports taking 'Tylenol PM' and 'Extra Strength Tylenol' frequently for lingering jaw pain."
    ],
    reasoning: "The patient presents with overt jaundice, pruritus, and significantly elevated liver enzymes (AST, ALT, Alk Phos, Bilirubin), consistent with acute liver injury. The timing of the elevated LFTs and jaundice, occurring shortly after a course of Amoxicillin-Clavulanate and with frequent acetaminophen intake, strongly suggests a drug-induced liver injury. The itching is a common symptom associated with cholestasis. Chronic overuse of acetaminophen is also noted as a potential contributing factor.",
    followup_question: "When did the yellowing of your eyes and the itching start in relation to when you finished taking the Augmentin and Tylenol?",
    rank: 1,
    severity: "Moderate"
  },
  {
    did: "D3E4F",
    diagnosis: "Cholestasis secondary to Hepatotoxicity (Acute)",
    indicators_point: [
      "Patient reports yellow eyes (jaundice).",
      "Patient reports itching (pruritus).",
      "Elevated Alk Phos (180 U/L) and Total Bilirubin (5.2 mg/dL).",
      "INR is borderline (1.2).",
      "Elevated AST (450 U/L)",
      "Elevated ALT (620 U/L)"
    ],
    reasoning: "The presence of jaundice, significant itching, and elevated alkaline phosphatase, along with elevated transaminases, indicates a cholestatic pattern of liver injury. This suggests impaired bile flow, which is often a component of drug-induced liver injury. While DILI is a strong possibility, other causes of cholestasis, such as biliary obstruction, should be considered.",
    followup_question: "Have you experienced any pain in your upper right abdomen, especially after eating fatty foods, or have you noticed any changes in the color of your stool or urine?",
    rank: 2,
    severity: "Moderate"
  }
];

const SAMPLE_QUESTIONS: Question[] = [
  {
    content: "What brings you in today?",
    qid: "00001",
    rank: 8,
    status: null,
    answer: null
  },
  {
    content: "What are all the medications you are currently taking, including over-the-counter drugs and supplements?",
    qid: "00004",
    rank: 5,
    status: null,
    answer: null
  },
  {
    content: "Do you have any known drug allergies?",
    qid: "00005",
    rank: 6,
    status: null,
    answer: null
  },
  {
    content: "Have you had any surgeries in the past?",
    qid: "00006",
    rank: 7,
    status: null,
    answer: null
  },
  {
    qid: "A1B2C",
    content: "Can you estimate how many Extra Strength Tylenol pills (325mg each) or Tylenol PM pills (500mg acetaminophen) you were taking per day during that period?",
    status: "asked",
    answer: null,
    rank: 1
  },
  {
    qid: "D3E4F",
    content: "Have you experienced any abdominal pain, particularly in your upper right side, or have you noticed any changes in the color of your urine or stools?",
    status: null,
    answer: null,
    rank: 2
  },
  {
    qid: "G5H6I",
    content: "Does the itching get worse at any particular time of day or night, or after eating certain foods?",
    status: "asked",
    answer: null,
    rank: 3
  },
  {
    qid: "XYZ78",
    content: "Is the jaw pain still present, or has it completely resolved since you stopped taking the Tylenol?",
    status: null,
    answer: null,
    rank: 4
  }
];

// API Service - swap these implementations when backend is ready
export const api = {
  // Fetch diagnoses for a patient
  async getDiagnoses(patientId: string): Promise<Diagnosis[]> {
    // TODO: Replace with actual API call
    // return fetch(`/api/patients/${patientId}/diagnoses`).then(r => r.json());
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return SAMPLE_DIAGNOSES;
  },

  // Fetch questions for a patient
  async getQuestions(patientId: string): Promise<Question[]> {
    // TODO: Replace with actual API call
    // return fetch(`/api/patients/${patientId}/questions`).then(r => r.json());
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return SAMPLE_QUESTIONS;
  },

  // Update question status/answer
  async updateQuestion(qid: string, data: Partial<Question>): Promise<Question> {
    // TODO: Replace with actual API call
    // return fetch(`/api/questions/${qid}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json());
    await new Promise(resolve => setTimeout(resolve, 200));
    const question = SAMPLE_QUESTIONS.find(q => q.qid === qid);
    if (!question) throw new Error('Question not found');
    return { ...question, ...data };
  }
};
