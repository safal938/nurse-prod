import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Diagnosis } from '../../types';

interface DiagnosisCardProps {
  diagnosis: Diagnosis;
  isPrimary: boolean;
  onClick: () => void;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ diagnosis, isPrimary, onClick }) => {
  const confidenceLevel = isPrimary ? 'High' : 'Moderate';
  const confidenceWidth = { 'High': 90, 'Moderate': 65, 'Low': 40, 'Very Low': 20 }[confidenceLevel] || 50;
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          isPrimary ? 'bg-primary/10' : 'bg-neutral-100'
        }`}>
          <AlertCircle className={`w-5 h-5 ${isPrimary ? 'text-primary' : 'text-neutral-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${isPrimary ? 'text-primary' : 'text-neutral-400'}`}>
            {isPrimary ? 'Primary' : 'Secondary'}
          </span>
          <span className="text-[10px] text-neutral-300 mx-2">•</span>
          <span className="text-[10px] text-neutral-400">{diagnosis.indicators_point.length} findings</span>
        </div>
      </div>
      <h4 className="font-medium text-neutral-900 text-sm mb-3 leading-snug">{diagnosis.diagnosis}</h4>
      <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-2 overflow-hidden">
        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${confidenceWidth}%` }}></div>
      </div>
      <div className="flex justify-between text-[10px] font-medium">
        <span className="text-primary font-bold uppercase tracking-wide">{confidenceLevel}</span>
        <span className="text-neutral-400">confidence</span>
      </div>
    </div>
  );
};
