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
