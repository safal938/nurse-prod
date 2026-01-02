import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, ChevronDown, Info } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  category: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  status: 'asked' | null;
}

const MOCK_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "1",
    title: "Drug Allergy Verification",
    description: "The nurse recommended over-the-counter medication (Ibuprofen) without first asking the patient if they have any known drug allergies.",
    reasoning: "Verification of allergies prior to suggesting treatment is a fundamental 'Standard of Care.' Failure to do so constitutes clinical negligence under the principle of 'Duty of Care' and exposes the clinic to liability for anaphylactic reactions.",
    category: "Legal/Safety",
    completed: false,
    priority: "high",
    status: "asked"
  },
  {
    id: "2",
    title: "Dehydration Risk Assessment",
    description: "Nurse explicitly asked: 'Have you been able to keep any fluids down in the last 4 hours, and are you urinating normally?'",
    reasoning: "Under Clinical Practice Guidelines (CPG) for Gastroenteritis, assessing hydration status is mandatory. This fulfills the 'Duty of Care' to prevent the life-threatening complication of hypovolemic shock.",
    category: "Diagnostic Accuracy",
    completed: true,
    priority: "high",
    status: "asked"
  },
  {
    id: "3",
    title: "Safety Netting (Red Flags)",
    description: "Nurse provided specific instructions: 'If you see blood in your stool or develop a high fever, you must go to the Emergency Room immediately.'",
    reasoning: "This fulfills the 'Failure to Warn' legal requirement. By documenting specific emergency triggers, the nurse satisfies the 'Informed Consent Doctrine' regarding the risks of home-management.",
    category: "Informed Consent",
    completed: true,
    priority: "high",
    status: "asked"
  },
  {
    id: "4",
    title: "Active Listening & Narrative Flow",
    description: "High interruption count (8) detected in analytics. The nurse repeatedly interrupted the patient while they were describing the onset of their stomach pain.",
    reasoning: "Medical-legal research indicates that frequent interruptions lead to 'Failure to Diagnose' by suppressing vital patient history. This breach of communication standards is a primary driver in 'Negligence' litigation.",
    category: "Communication",
    completed: false,
    priority: "medium",
    status: null
  },
  {
    id: "5",
    title: "Diagnostic Limitation Disclosure",
    description: "Nurse informed the patient: 'Because this is a remote assessment, we cannot perform a physical exam. If pain localizes to the lower right side, you must be seen in person.'",
    reasoning: "This establishes a 'Legal Safeguard' for telehealth. It explicitly states the limitations of the current assessment, protecting the provider against 'Failure to Diagnose' claims related to appendicitis.",
    category: "Legal/Safety",
    completed: true,
    priority: "high",
    status: null
  }
];

const CATEGORY_LABELS = {
  symptoms: 'Symptoms Assessment',
  education: 'Patient Education',
  safety: 'Safety Checks',
  followup: 'Follow-up Care'
};

interface DonutChartProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ completed, total, size = 120, strokeWidth = 10 }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isComplete = completed === total && total > 0;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0EA5E9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      {isComplete && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            margin: strokeWidth,
            borderRadius: '50%',
            backgroundColor: '#0EA5E9'
          }}
        >
          <span className="text-white font-bold text-lg">{completed}/{total}</span>
        </div>
      )}
      {!isComplete && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-neutral-600 font-bold text-lg">{completed}/{total}</span>
        </div>
      )}
    </div>
  );
};

export const ChecklistInterface: React.FC<{ checklistItems?: ChecklistItem[] }> = ({ checklistItems: externalItems = [] }) => {
  // Use mock data immediately, fall back to dummy data if no external data
  const [items, setItems] = useState<ChecklistItem[]>(MOCK_CHECKLIST_ITEMS);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const initialCategory = Array.from(new Set(MOCK_CHECKLIST_ITEMS.map(item => item.category)))[0] || '';
  const [currentCategory, setCurrentCategory] = useState<string>(initialCategory);

  // Update when external items change
  useEffect(() => {
    if (externalItems.length > 0) {
      setItems(externalItems);
      // Set first category
      const newCategories = Array.from(new Set(externalItems.map(item => item.category)));
      if (newCategories.length > 0 && !currentCategory) {
        setCurrentCategory(newCategories[0]);
      }
    }
  }, [externalItems, currentCategory]);

  // Get unique categories from items
  const categories = Array.from(new Set(items.map(item => item.category)));
  const currentCategoryIndex = categories.indexOf(currentCategory);

  const handlePrevCategory = () => {
    const newIndex = currentCategoryIndex === 0 ? categories.length - 1 : currentCategoryIndex - 1;
    setCurrentCategory(categories[newIndex]);
  };

  const handleNextCategory = () => {
    const newIndex = currentCategoryIndex === categories.length - 1 ? 0 : currentCategoryIndex + 1;
    setCurrentCategory(categories[newIndex]);
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const toggleExpanded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const categoryItems = items.filter(item => item.category === currentCategory);
  const completedInCategory = categoryItems.filter(item => item.completed).length;
  const totalInCategory = categoryItems.length;
  const categoryPercentage = totalInCategory > 0 ? Math.round((completedInCategory / totalInCategory) * 100) : 0;

  return (
    <div className="h-full flex items-center justify-center bg-neutral-50 p-8">
      <div className="flex items-center gap-8 w-full max-w-5xl">
        {/* Left Arrow */}
        <button
          onClick={handlePrevCategory}
          className="p-4 rounded-lg transition-colors text-neutral-400 hover:text-neutral-600 hover:bg-white shrink-0"
        >
          <ChevronLeft size={48} strokeWidth={2} />
        </button>

        {/* Main Content Box */}
        <div className="flex-1 bg-white rounded-2xl border border-neutral-200 shadow-lg p-8">
          {/* Header with Donut Chart */}
          <div className="flex items-start gap-6 mb-8">
            <DonutChart completed={completedInCategory} total={totalInCategory} size={100} strokeWidth={10} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-neutral-800 mb-1">
                {currentCategory}
              </h2>
              <p className="text-sm text-neutral-500 mb-3">
                {completedInCategory} of {totalInCategory} items completed
              </p>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${categoryPercentage}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-[#0EA5E9] rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Category Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                onClick={() => setCurrentCategory(cat)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentCategoryIndex
                    ? 'w-8 bg-cyan-500'
                    : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
                }`}
              />
            ))}
          </div>

          {/* Checklist Items */}
          <div className="space-y-3 h-[440px] overflow-y-auto pr-2">
            {categoryItems.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              const hasReasoning = item.status === 'asked';
              
              return (
                <div
                  key={item.id}
                  className={`rounded-lg border transition-all ${
                    item.completed
                      ? 'bg-neutral-50 border-neutral-300'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
                  }`}
                >
                  <div
                    onClick={() => toggleItem(item.id)}
                    className="flex items-start gap-4 p-4 cursor-pointer"
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        item.completed
                          ? 'bg-[#0EA5E9] border-[#0EA5E9]'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {item.completed && <Check size={16} className="text-white" strokeWidth={3} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-neutral-900">
                          {item.title}
                        </h4>
                        {item.priority === 'high' && !item.completed && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-semibold uppercase rounded">
                            Priority
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-neutral-600">
                        {item.description}
                      </p>
                    </div>

                    {/* Chevron for expandable items */}
                    {hasReasoning && (
                      <motion.button
                        onClick={(e) => toggleExpanded(item.id, e)}
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="shrink-0 p-1 hover:bg-neutral-100 rounded"
                      >
                        <ChevronDown size={16} className="text-neutral-400" />
                      </motion.button>
                    )}
                  </div>

                  {/* Reasoning Section */}
                  {hasReasoning && (
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="px-4 pb-4">
                          <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                                <Info size={12} className="text-neutral-500" />
                              </div>
                              <p className="text-[9px] text-neutral-600 leading-relaxed py-0.5">{item.reasoning}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNextCategory}
          className="p-4 rounded-lg transition-colors text-neutral-400 hover:text-neutral-600 hover:bg-white shrink-0"
        >
          <ChevronRight size={48} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
