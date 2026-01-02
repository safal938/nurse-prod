import React from 'react';
import { Diagnosis } from '../../types';

interface DiagnosisCardProps {
  diagnosis: Diagnosis;
  isPrimary: boolean;
  onClick: () => void;
}

// Helper to generate short names from diagnosis
const getShortName = (diagnosis: string): string => {
  if (diagnosis.includes('Cholestatic Hepatitis')) return 'DILI (Drug-Induced)';
  if (diagnosis.includes('Unknown Etiology')) return 'Cholestasis';
  if (diagnosis.includes('Dental Abscess')) return 'Dental Abscess';
  if (diagnosis.includes('Acetaminophen')) return 'Acetaminophen Overuse';
  // Default: take first 2-3 words
  return diagnosis.split(' ').slice(0, 2).join(' ');
};

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ diagnosis, isPrimary, onClick }) => {
  const confidenceLevel = isPrimary ? 'High' : 'Moderate';
  const confidenceWidth = { 'High': 90, 'Moderate': 65, 'Low': 40, 'Very Low': 20 }[confidenceLevel] || 50;
  const shortName = getShortName(diagnosis.diagnosis);
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 group-hover:text-primary transition-colors">
            {isPrimary ? 'Primary' : 'Secondary'}
          </span>
          <span className="text-[10px] text-neutral-300 mx-2">•</span>
          <span className="text-[10px] text-neutral-400">{diagnosis.indicators_point.length} findings</span>
        </div>
      </div>
      <h4 className="font-semibold text-neutral-400 group-hover:text-neutral-900 text-base mb-1 leading-tight transition-colors">{shortName}</h4>
      <p className="text-xs text-neutral-400 group-hover:text-neutral-600 leading-relaxed line-clamp-2 mb-3 transition-colors">{diagnosis.diagnosis}</p>
      <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-2 overflow-hidden">
        <div className="bg-neutral-300 group-hover:bg-primary h-full rounded-full transition-all" style={{ width: `${confidenceWidth}%` }}></div>
      </div>
      <div className="flex justify-between text-[10px] font-medium">
        <span className="text-neutral-400 group-hover:text-primary font-sm uppercase tracking-wide transition-colors">{confidenceLevel}</span>
        <span className="text-neutral-400">confidence</span>
      </div>
    </div>
  );
};
