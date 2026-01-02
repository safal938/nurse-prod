import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, AlertCircle, Clock, HelpCircle } from 'lucide-react';

export interface QuestionCardData {
  id: string;
  status: 'answered' | 'pending' | 'urgent';
  headline: string;
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
       <div className={`bg-white rounded-lg p-3 border relative z-10 transition-colors ${innerCardClasses}`}>
          <div className="flex justify-between items-start gap-3">
            <h2 className={`leading-tight mb-1 ${
              isUrgent ? 'text-black' : 'text-neutral-900'
            } ${
              isAnswered ? 'text-[10px]' : 'text-[15px] font-semibold '
            }`}>
              {data.headline}
            </h2>
            <div className="flex flex-col items-center shrink-0 min-h-[1.5rem]">
              {isAnswered && (
                <>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'h-0 opacity-0 mb-0' : 'h-4 opacity-100 mb-1'}`}>
                    <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-gray-600" strokeWidth={3} />
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </>
              )}
              {!isAnswered && !isUrgent && <HelpCircle size={16} className="text-neutral-300" />}
            </div>
          </div>
          <p className={`leading-snug ${isUrgent ? 'text-red-800' : 'text-neutral-600'} ${
              isAnswered ? 'text-[9px]' : 'text-xs'}`}>
            {data.question}
          </p>
       </div>
       {isUrgent && !isAnswered && (
         <div className="px-3 py-0.5">
           <span className="text-[7px] text-red-400 font-semibold uppercase tracking-wide">
             Critical Question
           </span>
         </div>
       )}
       {isAnswered ? (
         <div className={`grid pt-3 transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
           <div className="overflow-hidden">
             <div className="flex items-start gap-2">
               <div className="w-6 h-6 rounded-full bg-grey-100 flex items-center justify-center shrink-0 text-gray-600 mt-0.5 border ">
                 <Check size={12} strokeWidth={3} />
               </div>
               <p className="text-[9px] text-neutral-600 leading-relaxed py-1">{data.answer}</p>
             </div>
           </div>
         </div>
       ) : (
         
         
             <>
              
             </>
           
      
       )}
    </motion.div>
  );
};
