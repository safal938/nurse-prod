import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, CheckCircle2, Brain } from 'lucide-react';
import { Diagnosis } from '../../types';

interface DiagnosisDetailModalProps {
  diagnosis: Diagnosis;
  isPrimary: boolean;
  onClose: () => void;
}

export const DiagnosisDetailModal: React.FC<DiagnosisDetailModalProps> = ({ diagnosis, isPrimary, onClose }) => {
  const confidenceLevel = isPrimary ? 'High' : 'Moderate';
  const confidenceWidth = { 'High': 90, 'Moderate': 65, 'Low': 40, 'Very Low': 20 }[confidenceLevel] || 50;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col m-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide ${
                  isPrimary ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {isPrimary ? 'Primary' : 'Secondary'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  diagnosis.severity === 'Severe' ? 'bg-red-100 text-red-700' :
                  diagnosis.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {diagnosis.severity}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-semibold text-neutral-900 leading-tight">
                {diagnosis.diagnosis}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Confidence Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-neutral-500">Confidence Level</span>
              <span className="font-bold text-primary uppercase tracking-wide">{confidenceLevel}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${confidenceWidth}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-primary to-sky-400 h-full rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Clinical Indicators */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Clinical Indicators</h3>
                <p className="text-xs text-neutral-500">{diagnosis.indicators_point.length} supporting findings identified</p>
              </div>
            </div>
            <div className="space-y-2 pl-2">
              {diagnosis.indicators_point.map((indicator, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-200 transition-colors">
                    <Check size={12} className="text-emerald-600" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-neutral-700 leading-relaxed">{indicator}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Clinical Reasoning */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Brain size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Clinical Reasoning</h3>
                <p className="text-xs text-neutral-500">AI-generated diagnostic rationale</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-5 border border-blue-100">
              <p className="text-sm text-neutral-700 leading-relaxed">{diagnosis.reasoning}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Diagnosis ID: {diagnosis.did} • Rank #{diagnosis.rank}
          </span>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
