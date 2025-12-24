import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, X, Activity, FileText } from 'lucide-react';
import { Diagnosis } from '../types';

interface DesignShowcaseProps {
  onBack: () => void;
}

// Sample diagnosis data for showcase
const SAMPLE_DIAGNOSIS: Diagnosis = {
  did: "A1B2C",
  diagnosis: "Drug-Induced Liver Injury secondary to Amoxicillin-Clavulanate",
  indicators_point: [
    "Patient reports yellow eyes (jaundice)",
    "Patient reports itching (pruritus)",
    "Elevated AST (450 U/L), ALT (620 U/L)",
    "Elevated Alk Phos (180 U/L)",
    "Recent Amoxicillin-Clavulanate prescription",
    "Frequent Tylenol use",
    "Lingering jaw pain history"
  ],
  reasoning: "The patient presents with overt jaundice and elevated liver enzymes consistent with acute liver injury.",
  followup_question: "When did the yellowing start?",
  rank: 1,
  severity: "Moderate"
};

// Design 1: Current Production (Clean Minimal with Progress Bar)
const DiagnosisCardV1: React.FC<{ diagnosis: Diagnosis; isPrimary: boolean; onClick: () => void }> = ({ diagnosis, isPrimary, onClick }) => {
  const confidencePercent = isPrimary ? 92 : 65;
  const confidenceLabel = confidencePercent >= 80 ? 'High' : 'Moderate';
  
  return (
    <div onClick={onClick} className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide transition-colors ${
          isPrimary ? 'bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-neutral-50 text-neutral-500'
        }`}>
          {isPrimary ? 'Primary' : 'Secondary'}
        </span>
        <span className="text-[10px] text-neutral-400 font-medium">{diagnosis.indicators_point.length} findings</span>
      </div>
      <h4 className="font-semibold text-neutral-900 text-lg mb-4 line-clamp-2">{diagnosis.diagnosis}</h4>
      <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-2 overflow-hidden">
        <div className="bg-primary h-full rounded-full" style={{ width: `${confidencePercent}%` }}></div>
      </div>
      <div className="flex justify-between text-[10px] font-medium">
        <span className="text-primary font-bold uppercase tracking-wide">{confidenceLabel}</span>
        <span className="text-neutral-400">confidence level</span>
      </div>
    </div>
  );
};

// Design 2: Compact with Left Accent
const DiagnosisCardV2: React.FC<{ diagnosis: Diagnosis; isPrimary: boolean; onClick: () => void }> = ({ diagnosis, isPrimary, onClick }) => {
  const findingsCount = diagnosis.indicators_point.length;
  
  return (
    <div onClick={onClick} className={`bg-white rounded-lg overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-all cursor-pointer flex ${isPrimary ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-neutral-300'}`}>
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isPrimary ? 'text-primary' : 'text-neutral-400'}`}>
            #{isPrimary ? '1' : '2'} Diagnosis
          </span>
          <span className="text-neutral-300">•</span>
          <span className="text-[10px] text-neutral-400">{diagnosis.severity}</span>
        </div>
        <h4 className="font-medium text-neutral-900 text-sm mb-3 line-clamp-2">{diagnosis.diagnosis}</h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
            <Check className="w-3 h-3 text-green-500" />
            <span>{findingsCount} indicators</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300 ml-auto" />
        </div>
      </div>
    </div>
  );
};


// Design 3: Card with Indicator Pills
const DiagnosisCardV3: React.FC<{ diagnosis: Diagnosis; isPrimary: boolean; onClick: () => void }> = ({ diagnosis, isPrimary, onClick }) => {
  const topIndicators = diagnosis.indicators_point.slice(0, 3);
  const remaining = diagnosis.indicators_point.length - 3;
  
  return (
    <div onClick={onClick} className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
          isPrimary ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'
        }`}>
          {isPrimary ? '1' : '2'}
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
          diagnosis.severity === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
        }`}>
          {diagnosis.severity}
        </span>
      </div>
      <h4 className="font-semibold text-neutral-900 text-base mb-4 line-clamp-2">{diagnosis.diagnosis}</h4>
      <div className="flex flex-wrap gap-1.5">
        {topIndicators.map((indicator, i) => (
          <span key={i} className="px-2 py-1 bg-neutral-50 text-neutral-600 text-[10px] rounded-full truncate max-w-[140px]">
            {indicator.split(' ').slice(0, 3).join(' ')}...
          </span>
        ))}
        {remaining > 0 && (
          <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-full font-medium">
            +{remaining} more
          </span>
        )}
      </div>
    </div>
  );
};

// Design 4: Compact with Progress Bar (Text Labels)
const DiagnosisCardV4: React.FC<{ diagnosis: Diagnosis; isPrimary: boolean; onClick: () => void }> = ({ diagnosis, isPrimary, onClick }) => {
  // Map confidence levels to progress bar widths
  const confidenceLevel = isPrimary ? 'High' : 'Moderate';
  const confidenceWidth = { 'High': 90, 'Moderate': 65, 'Low': 40, 'Very Low': 20 }[confidenceLevel] || 50;
  
  return (
    <div onClick={onClick} className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          isPrimary ? 'bg-primary/10' : 'bg-neutral-100'
        }`}>
          <Activity className={`w-5 h-5 ${isPrimary ? 'text-primary' : 'text-neutral-400'}`} />
        </div>
        <div className="flex-1">
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${isPrimary ? 'text-primary' : 'text-neutral-400'}`}>
            {isPrimary ? 'Primary' : 'Secondary'}
          </span>
          <span className="text-[10px] text-neutral-300 mx-2">•</span>
          <span className="text-[10px] text-neutral-400">{diagnosis.indicators_point.length} findings</span>
        </div>
      </div>
      <h4 className="font-medium text-neutral-900 text-sm mb-3">{diagnosis.diagnosis}</h4>
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

// Design 5: Split Card with Findings Preview
const DiagnosisCardV5: React.FC<{ diagnosis: Diagnosis; isPrimary: boolean; onClick: () => void }> = ({ diagnosis, isPrimary, onClick }) => {
  const topFindings = diagnosis.indicators_point.slice(0, 2);
  
  return (
    <div onClick={onClick} className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
            isPrimary ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
          }`}>
            Rank #{isPrimary ? '1' : '2'}
          </span>
          <span className={`text-[10px] font-medium ${
            diagnosis.severity === 'Moderate' ? 'text-amber-500' : 'text-red-500'
          }`}>
            {diagnosis.severity}
          </span>
        </div>
        <h4 className="font-semibold text-neutral-900 text-sm line-clamp-2">{diagnosis.diagnosis}</h4>
      </div>
      <div className="p-3 bg-neutral-50">
        <div className="text-[10px] text-neutral-400 uppercase tracking-wide mb-2">Key Findings</div>
        <div className="space-y-1.5">
          {topFindings.map((finding, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
              <span className="text-[11px] text-neutral-600 line-clamp-1">{finding}</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-primary font-medium mt-2">
          View all {diagnosis.indicators_point.length} findings →
        </div>
      </div>
    </div>
  );
};


// Design 6: Minimal List Style
const DiagnosisCardV6: React.FC<{ diagnosis: Diagnosis; isPrimary: boolean; onClick: () => void }> = ({ diagnosis, isPrimary, onClick }) => {
  const confidencePercent = isPrimary ? 92 : 65;
  
  return (
    <div onClick={onClick} className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-all cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
          isPrimary ? 'border-primary text-primary' : 'border-neutral-300 text-neutral-400'
        }`}>
          {isPrimary ? '1' : '2'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-neutral-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {diagnosis.diagnosis}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-neutral-400">
              {diagnosis.indicators_point.length} findings
            </span>
            <span className="text-neutral-300">•</span>
            <span className={`text-[10px] ${
              diagnosis.severity === 'Moderate' ? 'text-amber-500' : 'text-red-500'
            }`}>
              {diagnosis.severity}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-[10px] text-primary font-medium">{confidencePercent}%</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
};

// Detail Modal Component
const DiagnosisDetailModal: React.FC<{ 
  diagnosis: Diagnosis | null; 
  onClose: () => void;
}> = ({ diagnosis, onClose }) => {
  if (!diagnosis) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b border-neutral-100 flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-primary text-white">
                Rank #{diagnosis.rank}
              </span>
              <h3 className="font-semibold text-neutral-900 text-lg mt-2">{diagnosis.diagnosis}</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto max-h-[60vh]">
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Clinical Indicators ({diagnosis.indicators_point.length})
              </h4>
              <div className="space-y-2">
                {diagnosis.indicators_point.map((indicator, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-neutral-50 rounded-lg">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-neutral-700">{indicator}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Clinical Reasoning
              </h4>
              <p className="text-sm text-neutral-700 leading-relaxed">{diagnosis.reasoning}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


// Main Showcase Component
const DesignShowcase: React.FC<DesignShowcaseProps> = ({ onBack }) => {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  
  const secondaryDiagnosis: Diagnosis = {
    ...SAMPLE_DIAGNOSIS,
    did: "D3E4F",
    diagnosis: "Cholestasis secondary to Hepatotoxicity (Acute)",
    rank: 2,
    indicators_point: SAMPLE_DIAGNOSIS.indicators_point.slice(0, 5)
  };

  const designs = [
    { name: "V1: Current Production", description: "Clean minimal with progress bar", Component: DiagnosisCardV1 },
    { name: "V2: Left Accent", description: "Compact with colored left border", Component: DiagnosisCardV2 },
    { name: "V3: Indicator Pills", description: "Shows top findings as pills", Component: DiagnosisCardV3 },
    { name: "V4: Compact Progress", description: "Full text with progress bar & text labels", Component: DiagnosisCardV4 },
    { name: "V5: Split Card", description: "Two sections with findings preview", Component: DiagnosisCardV5 },
    { name: "V6: Minimal List", description: "Compact list-style layout", Component: DiagnosisCardV6 },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Diagnosis Card Designs</h1>
            <p className="text-sm text-neutral-500">6 clean minimal variations • Click any card to see detail modal</p>
          </div>
        </div>
      </div>

      {/* Design Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {designs.map(({ name, description, Component }, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900">{name}</h3>
                  <p className="text-xs text-neutral-500">{description}</p>
                </div>
                <span className="px-2 py-1 bg-neutral-100 text-neutral-500 text-[10px] rounded font-medium">
                  Design {index + 1}
                </span>
              </div>
              <div className="space-y-3">
                <Component 
                  diagnosis={SAMPLE_DIAGNOSIS} 
                  isPrimary={true} 
                  onClick={() => setSelectedDiagnosis(SAMPLE_DIAGNOSIS)}
                />
                <Component 
                  diagnosis={secondaryDiagnosis} 
                  isPrimary={false} 
                  onClick={() => setSelectedDiagnosis(secondaryDiagnosis)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDiagnosis && (
        <DiagnosisDetailModal 
          diagnosis={selectedDiagnosis} 
          onClose={() => setSelectedDiagnosis(null)} 
        />
      )}
    </div>
  );
};

export { DesignShowcase };
