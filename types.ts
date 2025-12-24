export enum PatientStatus {
  Critical = 'Critical',
  Recovering = 'Recovering',
  Stable = 'Stable',
  Discharged = 'Discharged'
}

export interface Patient {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  status: PatientStatus;
  lastUpdate: string; // ISO Date string YYYY-MM-DD
}

// Backend response types
export interface Diagnosis {
  did: string;
  diagnosis: string;
  indicators_point: string[];
  reasoning: string;
  followup_question: string;
  rank: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | string;
}

export interface Question {
  qid: string;
  content: string;
  rank: number;
  status: 'asked' | null;
  answer: string | null;
}
