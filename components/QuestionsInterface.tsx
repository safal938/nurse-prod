import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle } from 'lucide-react';
import { QuestionCard, QuestionCardData } from './interaction/QuestionCard';
import { Question } from '../types';

// Data from backend: dataobjects/questions_logic_check_20251230_140640.json
const BACKEND_QUESTIONS: Question[] = [
  {
    content: "What brings you in today?",
    qid: "00001",
    rank: 999,
    status: "asked",
    answer: "What can I help you with today?",
    headline: "Chief Complaint",
    domain: "Symptom Triage",
    system_affected: "General",
    clinical_intent: "To understand the primary reason for the patient's visit and gather initial information about their presenting problem.",
    tags: ["reason for visit", "chief complaint", "presenting problem"]
  },
  {
    content: "Current Medications",
    qid: "00004",
    rank: 999,
    status: "asked",
    answer: "I'm yellow. And this itching is driving. Me nuts. Feels like there are ants under my skin. What's going on? Am I dying?",
    headline: "Current Medications",
    domain: "Medication Review",
    system_affected: "General",
    clinical_intent: "To obtain an accurate and up-to-date list of all prescribed and over-the-counter medications the patient is currently taking.",
    tags: ["medication", "current", "list"]
  },
  {
    content: "Do you have any known drug allergies?",
    qid: "00005",
    rank: 999,
    status: "asked",
    answer: "I'm yellow. And this itching is driving. Me nuts. Feels like there are ants under my skin.",
    headline: "Drug Allergies",
    domain: "Medical History",
    system_affected: "General",
    clinical_intent: "To identify potential adverse reactions to medications and ensure patient safety.",
    tags: ["allergy", "drug", "medication", "adverse reaction"]
  },
  {
    content: "Have you had any surgeries in the past?",
    qid: "00006",
    rank: 6,
    status: null,
    answer: null,
    headline: "Past Surgical History",
    domain: "Surgical History",
    system_affected: "General",
    clinical_intent: "To gather information on previous surgical interventions which may impact current health status or future treatment.",
    tags: ["surgery", "past procedures", "medical history"]
  },
  {
    qid: "A1B2C",
    content: "Have you noticed any changes in the color of your urine (darker) or stool (lighter) recently?",
    status: "asked",
    answer: "Yeah, I got this dull ache under my ribs. Not sharp just heavy. And I'm really tired how to leave work early yesterday.",
    rank: 1,
    headline: "Gastrointestinal Symptom Assessment",
    domain: "Symptom Triage",
    system_affected: "Gastrointestinal",
    clinical_intent: "To assess for common gastrointestinal symptoms that may indicate an underlying condition, particularly related to the hepatobiliary system.",
    tags: ["nausea", "vomiting", "abdominal pain", "GI symptoms"]
  },
  {
    qid: "D3E4F",
    content: "Have you had any recent travel, exposure to new people, or engaged in any activities that might put you at risk for viral hepatitis?",
    status: null,
    answer: null,
    rank: 2,
    headline: "Hepatitis Exposure Risk",
    domain: "Symptom Triage",
    system_affected: "Gastrointestinal",
    clinical_intent: "To assess potential exposure risks for viral hepatitis, including travel and social contacts.",
    tags: ["hepatitis", "exposure", "travel", "viral illness"]
  },
  {
    qid: "G5H6I",
    content: "On a scale of 0 to 10, how severe is your jaw pain currently, and does it radiate anywhere else in your face or head?",
    status: "asked",
    answer: "Yeah, I got this dull ache under my ribs. Not sharp just heavy. And I'm really tired how to leave work early yesterday.",
    rank: 999,
    headline: "Jaw Pain Assessment",
    domain: "Symptom Triage",
    system_affected: "Neurological",
    clinical_intent: "To quantify the severity of jaw pain and identify any associated radiating pain patterns.",
    tags: ["pain", "jaw pain", "neuropathic pain", "headache"]
  },
  {
    qid: "XYZ78",
    content: "Have you had any recent travel, consumed raw seafood, or had any close contact with someone who has had similar symptoms?",
    status: null,
    answer: null,
    rank: 5,
    headline: "Hepatitis Exposure Risk",
    domain: "Symptom Triage",
    system_affected: "Gastrointestinal",
    clinical_intent: "To identify potential risk factors for hepatitis infection, such as travel, dietary exposure, or contact with infected individuals.",
    tags: ["hepatitis", "risk factors", "travel", "foodborne illness"]
  },
  {
    qid: "J7K8L",
    content: "Can you estimate how many Extra Strength Tylenol pills you take in a typical day, and how often you take Tylenol PM?",
    status: null,
    answer: null,
    rank: 3,
    headline: "Tylenol Usage",
    domain: "Medication Review",
    system_affected: "General",
    clinical_intent: "To quantify the daily intake of Extra Strength Tylenol and the frequency of Tylenol PM use for medication adherence and safety assessment.",
    tags: ["acetaminophen", "over-the-counter", "medication use", "pain relief"]
  }
];

const mapQuestionToCardData = (q: Question): QuestionCardData => {
  let status: 'answered' | 'pending' | 'urgent' = 'pending';
  if (q.status === 'asked' && q.answer) {
    status = 'answered';
  } else if (q.rank <= 2 && q.rank !== 999) {
    status = 'urgent';
  }
  return { 
    id: q.qid, 
    status, 
    headline: q.headline, 
    question: q.content, 
    answer: q.answer || undefined, 
    rank: q.rank 
  };
};

export const QuestionsInterface: React.FC<{ questions?: Question[] }> = ({ questions: externalQuestions = [] }) => {
  const [questions, setQuestions] = useState<Question[]>([]);

  // Update when external questions change
  useEffect(() => {
    if (externalQuestions.length > 0) {
      setQuestions(externalQuestions);
    }
  }, [externalQuestions]);

  const handleMarkAsAnswered = (questionId: string) => {
    // This would be handled by backend updates
    console.log('Mark as answered:', questionId);
  };

  // Show loading state if no questions yet
  if (questions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="text-center max-w-md px-8">
          <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Circle size={40} className="text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">
            Analyzing Patient Information
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            AI is processing the consultation data to generate relevant clinical questions...
          </p>
        </div>
      </div>
    );
  }

  const questionCards = questions.map(mapQuestionToCardData);
  const unansweredQuestions = questionCards.filter(q => q.status !== 'answered').sort((a, b) => a.rank - b.rank);
  const answeredQuestions = questionCards.filter(q => q.status === 'answered');
  const urgentQuestions = unansweredQuestions.filter(q => q.status === 'urgent');
  const regularPendingQuestions = unansweredQuestions.filter(q => q.status === 'pending');

  return (
    <div className="h-full flex gap-4">
      {/* Left Column - Questions to Ask (66%) */}
      <div className="flex-[2] flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50 shrink-0">
          <h2 className="text-[10px] font-semibold text-neutral-800">Questions to ask</h2>
          <p className="text-[10px] text-neutral-500 mt-1">
            {unansweredQuestions.length} remaining
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Urgent Questions - Full Width */}
          {urgentQuestions.length > 0 && (
            <div className="space-y-3 mb-4">
              <AnimatePresence mode="popLayout">
                {urgentQuestions.map((q) => (
                  <QuestionCard key={q.id} data={q} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Regular Pending Questions - 2 Column Grid */}
          {regularPendingQuestions.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {regularPendingQuestions.map((q) => (
                  <QuestionCard key={q.id} data={q} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {unansweredQuestions.length === 0 && (
            <div className="flex items-center justify-center h-full text-center py-12">
              <div>
                <Circle size={48} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">All questions answered</p>
                <p className="text-xs text-neutral-400 mt-1">Great job!</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-neutral-200 bg-neutral-50 shrink-0">
          <div className="text-center">
           
          </div>
        </div>
      </div>

      {/* Right Column - Questions Answered (33%) */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50 shrink-0">
          <h2 className="text-[10px] font-semibold text-neutral-800">Questions answered</h2>
          <p className="text-[10px] text-neutral-500 mt-1">
            {answeredQuestions.length} completed
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {answeredQuestions.map((q) => (
              <QuestionCard key={q.id} data={q} />
            ))}
          </AnimatePresence>

          {answeredQuestions.length === 0 && (
            <div className="flex items-center justify-center h-full text-center py-12">
              <div>
                <Circle size={48} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">No questions answered yet</p>
                <p className="text-xs text-neutral-400 mt-1">Start asking questions from the left</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-neutral-200 bg-neutral-50 shrink-0">
          <div className="text-center">
           
          </div>
        </div>
      </div>
    </div>
  );
};
