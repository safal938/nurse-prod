import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, AlertCircle, Clock, HelpCircle } from 'lucide-react';

export interface QuestionCardData {
  id: string;
  status: 'answered' | 'pending' | 'urgent';
  question: string;
  answer?: string;
  rank: number;
}

interface QuestionCardProps {
  data: QuestionCardData;
  isHighlighted?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ data, isHighlighted = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAnswered = data.status === 'answered';
  const isUrgent = data.status === 'urgent';

  const containerClasses = isUrgent
    ? "bg-red-50 border-red-200 shadow-[0_0_0_1px_rgba(254,202,202,0.4)]"
    : "bg-neutral-50 border-neutral-200 hover:border-neutral-300";

  const innerCardClasses = isUrgent ? "border-red-100 shadow-sm" : "border-neutral-100 shadow-sm";

  return (
    <motion.div 
      layout
      layoutId={`question-${data.id}`}
      animate={{ 
        opacity: 1, 
        scale: isHighlighted ? 1.02 : 1, 
        y: 0,
        boxShadow: isHighlighted ? '0 0 0 2px rgba(14, 165, 233, 0.5)' : 'none'
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      onClick={() => setIsOpen(!isOpen)}
      className={`rounded-xl p-2 border cursor-pointer group select-none relative overflow-hidden ${containerClasses}`}
    >
       <div className={`bg-white rounded-lg p-3 border relative z-10 flex justify-between items-start gap-3 transition-colors ${innerCardClasses}`}>
          <h3 className={`text-sm font-medium leading-snug transition-colors ${isUrgent ? 'text-red-900 font-semibold' : 'text-neutral-900'}`}>
            {data.question}
          </h3>
          <div className="flex flex-col items-center shrink-0 min-h-[1.5rem]">
            {isAnswered && (
              <>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'h-0 opacity-0 mb-0' : 'h-4 opacity-100 mb-1'}`}>
                  <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check size={10} className="text-emerald-600" strokeWidth={3} />
                  </div>
                </div>
                <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </>
            )}
            {isUrgent && <div className="animate-pulse"><AlertCircle size={18} className="text-red-500 fill-red-50" /></div>}
            {!isAnswered && !isUrgent && <HelpCircle size={16} className="text-neutral-300" />}
          </div>
       </div>
       {isAnswered ? (
         <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
           <div className="overflow-hidden">
             <div className="px-3 pt-3 pb-1 flex items-start gap-2">
               <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5 border border-emerald-200">
                 <Check size={12} strokeWidth={3} />
               </div>
               <p className="text-xs text-neutral-600 leading-relaxed py-1">{data.answer}</p>
             </div>
           </div>
         </div>
       ) : (
         <div className="px-3 pt-3 pb-1 flex items-center gap-2 text-xs">
           {isUrgent ? (
             <>
               <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 animate-pulse">
                 <AlertCircle size={12} className="text-red-600" />
               </div>
               <span className="font-bold text-red-700 tracking-wide uppercase text-[10px]">Critical Assessment</span>
             </>
           ) : (
             <>
               <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                 <Clock size={12} className="text-neutral-500" />
               </div>
               <span className="text-neutral-400 italic">Awaiting Response...</span>
             </>
           )}
         </div>
       )}
    </motion.div>
  );
};
