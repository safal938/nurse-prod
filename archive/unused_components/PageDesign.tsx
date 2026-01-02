import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Maximize2, Minimize2, Check, Square, Bug, ChevronDown, MessageCircle, AlertTriangle, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Diagnosis, Question } from '../types';
import { DiagnosisDetailModal, DiagnosisCard, QuestionCard, QuestionCardData } from './interaction';

// Static mock data - using backend structure
const MOCK_DIAGNOSES: Diagnosis[] = [
  {
    did: "A1B2C",
    diagnosis: "Acute Cholestatic Hepatitis secondary to Amoxicillin-Clavulanate",
    indicators_point: [
      "Patient reports yellowing of the eyes (jaundice).",
      "Patient reports generalized itching (pruritus).",
      "Patient reports a dull ache under the ribs (RUQ pain).",
      "Patient reports significant fatigue.",
      "Elevated AST (450 U/L), ALT (620 U/L), and Alk Phos (180 U/L).",
      "Elevated Total Bilirubin (5.2 mg/dL).",
      "Recent prescription of Amoxicillin-Clavulanate 3 weeks ago.",
      "Patient reports taking 'Tylenol PM' and 'Extra Strength Tylenol' frequently for lingering jaw pain."
    ],
    reasoning: "The patient presents with overt jaundice, pruritus, RUQ discomfort, and fatigue, along with significantly elevated LFTs including a cholestatic pattern (elevated Alk Phos relative to transaminases). The recent use of Amoxicillin-Clavulanate (a known cause of drug-induced liver injury, particularly cholestatic patterns) 3 weeks prior to symptom onset strongly suggests a drug-induced hepatitis. The frequent use of acetaminophen for pain is also noted and could contribute to liver burden.",
    followup_question: "Have you noticed any changes in the color of your urine (darker) or stool (lighter) recently?",
    rank: 1,
    severity: "Moderate"
  },
  {
    did: "D3E4F",
    diagnosis: "Acute Jaundice of Unknown Etiology",
    indicators_point: [
      "Patient reports yellowing of the eyes (jaundice).",
      "Patient reports generalized itching (pruritus).",
      "Patient reports a dull ache under the ribs (RUQ pain).",
      "Patient reports significant fatigue.",
      "Elevated AST (450 U/L), ALT (620 U/L), Alk Phos (180 U/L), and Total Bilirubin (5.2 mg/dL).",
      "INR is borderline (1.2)."
    ],
    reasoning: "The patient exhibits signs and symptoms of jaundice and elevated liver enzymes, with a cholestatic pattern. While drug-induced liver injury is a strong possibility, this diagnosis acknowledges the need to rule out other causes of biliary obstruction or dysfunction, especially given the relatively preserved INR. The new indicators reinforce the cholestatic presentation and add fatigue and RUQ pain.",
    followup_question: "Have you had any recent travel, exposure to new people, or engaged in any activities that might put you at risk for viral hepatitis?",
    rank: 2,
    severity: "Moderate"
  }
];

const MOCK_QUESTIONS: Question[] = [
  {
    qid: "A1B2C",
    content: "Can you estimate how many Extra Strength Tylenol pills you take in a typical day, and how often you take Tylenol PM?",
    status: "asked",
    answer: null,
    rank: 1,
    headline: "Tylenol Usage",
    domain: "Medication Review",
    system_affected: "General",
    clinical_intent: "To quantify the daily intake of Extra Strength Tylenol and the frequency of Tylenol PM use for medication adherence and safety assessment.",
    tags: ["acetaminophen", "over-the-counter", "medication use", "pain relief"]
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
    answer: "The itching is worse at night, especially after dinner. It keeps me awake sometimes.",
    rank: 3,
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
    rank: 4,
    headline: "Hepatitis Exposure Risk",
    domain: "Symptom Triage",
    system_affected: "Gastrointestinal",
    clinical_intent: "To identify potential risk factors for hepatitis infection, such as travel, dietary exposure, or contact with infected individuals.",
    tags: ["hepatitis", "risk factors", "travel", "foodborne illness"]
  },
  {
    qid: "00001",
    content: "What brings you in today?",
    status: "asked",
    answer: "I noticed my eyes turning yellow about a week ago, and I've been itching all over my body.",
    rank: 8,
    headline: "Chief Complaint",
    domain: "Symptom Triage",
    system_affected: "General",
    clinical_intent: "To understand the primary reason for the patient's visit and gather initial information about their presenting problem.",
    tags: ["reason for visit", "chief complaint", "presenting problem"]
  },
  {
    qid: "00004",
    content: "What are all the medications you are currently taking, including over-the-counter drugs and supplements?",
    status: "asked",
    answer: "I take Lisinopril for blood pressure, and I've been taking a lot of Tylenol for jaw pain after my dental work.",
    rank: 5,
    headline: "Current Medications",
    domain: "Medication Review",
    system_affected: "General",
    clinical_intent: "To obtain an accurate and up-to-date list of all prescribed and over-the-counter medications the patient is currently taking.",
    tags: ["medication", "current", "list"]
  }
];

const MOCK_TRANSCRIPT = [
  { speaker: 'Nurse' as const, text: "Good morning! I'm your nurse today. What brings you in?" },
  { speaker: 'Patient' as const, text: "Hi. I noticed my eyes have been turning yellow over the past week, and I've had this terrible itching all over my body." },
  { speaker: 'Nurse' as const, text: "I see. When did you first notice the yellowing of your eyes?" },
  { speaker: 'Patient' as const, text: "About a week ago. My wife pointed it out first. The itching started around the same time." },
  { speaker: 'Nurse' as const, text: "Have you been taking any new medications recently?" },
  { speaker: 'Patient' as const, text: "I finished a course of antibiotics about 3 weeks ago for a tooth infection. And I've been taking a lot of Tylenol for the jaw pain." },
  { speaker: 'Nurse' as const, text: "Have you been taking any new medications recently?" },
  { speaker: 'Patient' as const, text: "I finished a course of antibiotics about 3 weeks ago for a tooth infection. And I've been taking a lot of Tylenol for the jaw pain." },
  { speaker: 'Nurse' as const, text: "Have you been taking any new medications recently?" },
  { speaker: 'Patient' as const, text: "I finished a course of antibiotics about 3 weeks ago for a tooth infection. And I've been taking a lot of Tylenol for the jaw pain." },
  { speaker: 'Nurse' as const, text: "Have you been taking any new medications recently?" },
  { speaker: 'Patient' as const, text: "I finished a course of antibiotics about 3 weeks ago for a tooth infection. And I've been taking a lot of Tylenol for the jaw pain." },
];

const MOCK_PATIENT = {
  id: "P0001",
  firstName: "Marcus",
  middleName: "James",
  lastName: "Thorne",
  age: 46,
  gender: "Male",
  diagnosis: "Acute Liver Injury - Suspected Drug-Induced"
};

const MOCK_PATIENT_EDUCATION = [
  {
    id: "edu1",
    priority: "high",
    title: "Stop Tylenol Immediately",
    content: "Please stop taking all acetaminophen products (Tylenol, Tylenol PM, Extra Strength Tylenol) until further notice."
  },
  {
    id: "edu2",
    priority: "high",
    title: "Avoid Alcohol",
    content: "Do not consume any alcohol as it can worsen liver damage."
  },
  {
    id: "edu3",
    priority: "medium",
    title: "Watch for Warning Signs",
    content: "Seek immediate care if you experience severe abdominal pain, vomiting, confusion, or worsening jaundice."
  },
  {
    id: "edu4",
    priority: "medium",
    title: "Follow-up Labs Required",
    content: "You will need repeat liver function tests in 48-72 hours to monitor your condition."
  },
  {
    id: "edu5",
    priority: "low",
    title: "Medication Review",
    content: "Bring all your medications to your next appointment for a comprehensive review."
  }
];

const mapQuestionToCardData = (q: Question): QuestionCardData => {
  let status: 'answered' | 'pending' | 'urgent' = 'pending';
  if (q.status === 'asked' && q.answer) {
    status = 'answered';
  } else if (q.rank <= 2 && q.rank !== 999) {
    status = 'urgent';
  }
  return { id: q.qid, status, headline: q.headline, question: q.content, answer: q.answer || undefined, rank: q.rank };
};

export const PageDesign: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAssessmentExpanded, setIsAssessmentExpanded] = useState(true);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<{ diagnosis: Diagnosis; isPrimary: boolean } | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Cell collapse states
  const [cellCollapsed, setCellCollapsed] = useState({
    newInquiries: false,
    diagnostics: false,
    answered: false,
    cell4: false
  });

  const toggleCell = (cell: keyof typeof cellCollapsed) => {
    setCellCollapsed(prev => ({ ...prev, [cell]: !prev[cell] }));
  };

  // Process questions
  const questionCards = MOCK_QUESTIONS.map(mapQuestionToCardData);
  const pendingQuestions = questionCards.filter(q => q.status !== 'answered').sort((a, b) => a.rank - b.rank);
  const answeredQuestions = questionCards.filter(q => q.status === 'answered');
  const urgentQuestions = pendingQuestions.filter(q => q.status === 'urgent');
  const regularPendingQuestions = pendingQuestions.filter(q => q.status === 'pending');

  const topDiagnoses = MOCK_DIAGNOSES.slice(0, 2);
  const activeProblems = topDiagnoses.map(d => d.diagnosis);

  return (
    <div className="h-screen bg-neutral-50 flex flex-col overflow-hidden font-sans text-neutral-800">
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-neutral-200 shrink-0 z-20">
        <div className="w-[90%] max-w-[1920px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-900 leading-tight">
                {MOCK_PATIENT.lastName}, {MOCK_PATIENT.firstName}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="font-mono">{MOCK_PATIENT.id}</span>
                <span>·</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-1.5 bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-md hover:bg-neutral-200 transition-colors text-xs font-medium">
              <Play size={14} />
              Start Session
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-md hover:bg-neutral-200 transition-colors text-xs font-medium">
              <Square size={14} />
              Stop
            </button>
            
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100 transition-colors">
              <Bug size={14} />
              Debug
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Patient Info + Chat (collapsible sidebar) */}
        <div className={`flex flex-col bg-white border-r border-neutral-200 shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-12' : 'w-[20%]'}`}>
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-5 h-10 bg-white border border-neutral-200 border-l-0 rounded-r-md flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm"
            style={{ marginLeft: isSidebarCollapsed ? '48px' : '20%' }}
          >
            {isSidebarCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          </button>

          {isSidebarCollapsed ? (
            /* Collapsed State - Just avatar and minimal info */
            <div className="flex flex-col items-center py-4 gap-4">
              <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 font-semibold text-xs">
                {MOCK_PATIENT.firstName[0]}{MOCK_PATIENT.lastName[0]}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-300"></div>
            </div>
          ) : (
            /* Expanded State */
            <>
              {/* Patient Info Row */}
              <div className="p-4 border-b border-neutral-200 shrink-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {MOCK_PATIENT.firstName[0]}{MOCK_PATIENT.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-neutral-900 leading-tight truncate">
                      {MOCK_PATIENT.firstName} {MOCK_PATIENT.lastName}
                    </h2>
                    <p className="text-[10px] text-neutral-500 font-mono">MRN: {MOCK_PATIENT.id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-[10px] mb-3">
                  <div>
                    <span className="block text-neutral-400 uppercase tracking-wider font-medium">DOB</span>
                    <span className="font-medium text-neutral-700">1978-08-14</span>
                  </div>
                  <div>
                    <span className="block text-neutral-400 uppercase tracking-wider font-medium">Age</span>
                    <span className="font-medium text-neutral-700">{MOCK_PATIENT.age}</span>
                  </div>
                  <div>
                    <span className="block text-neutral-400 uppercase tracking-wider font-medium">Sex</span>
                    <span className="font-medium text-neutral-700">{MOCK_PATIENT.gender}</span>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-2 text-xs text-neutral-700">
                  <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-medium block mb-1">Presenting Diagnosis</span>
                  {MOCK_PATIENT.diagnosis}
                </div>
              </div>

              {/* Chat Row */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-neutral-50/30 scrollbar-hover">
                {MOCK_TRANSCRIPT.map((turn, i) => {
                  const isNurse = turn.speaker === 'Nurse';
                  return (
                    <div key={i} className={`flex gap-2 ${isNurse ? 'justify-end' : 'justify-start'}`}>
                      {!isNurse && (
                        <div className="w-6 h-6 rounded-full bg-white text-neutral-900 flex items-center justify-center font-bold text-[8px] shrink-0 shadow-sm border border-neutral-200">
                          PT
                        </div>
                      )}
                      <div className={`max-w-[85%] ${isNurse ? 'order-1' : 'order-2'}`}>
                        <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${isNurse ? 'bg-white border border-neutral-200 text-neutral-800 rounded-tr-sm' : 'bg-blue-50/50 border border-blue-100 text-neutral-800 rounded-tl-sm'}`}>
                          {turn.text}
                        </div>
                      </div>
                      {isNurse && (
                        <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center font-bold text-[8px] shrink-0 border border-neutral-300 order-2">
                          RN
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Assessment (4 cells) */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          <div className="h-full flex gap-4 p-4 overflow-hidden">
            {/* Left Column: New Inquiries + Answered */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
              {/* Cell 1: New Inquiries - PRIMARY FOCUS */}
              <div className={`rounded-xl border-2 border-red-200 bg-red-50/30 flex flex-col overflow-hidden transition-all duration-300 shadow-sm ${cellCollapsed.newInquiries ? 'shrink-0' : 'flex-1 min-h-0'}`}>
                <button 
                  onClick={() => toggleCell('newInquiries')}
                  className="flex items-center justify-between p-3 bg-red-50 border-b border-red-200 shrink-0 hover:bg-red-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                    <h3 className="text-[11px] font-bold text-red-700 uppercase tracking-widest">New Inquiries <span className="text-red-500 font-semibold ml-1">({pendingQuestions.length})</span></h3>
                  </div>
                  <ChevronDown size={14} className={`text-red-400 transition-transform duration-300 ${cellCollapsed.newInquiries ? '' : 'rotate-180'}`} />
                </button>
                
                {!cellCollapsed.newInquiries && (
                  <div className="p-3 overflow-y-auto flex-1 scrollbar-hover">
                    {urgentQuestions.length > 0 && (
                      <div className="space-y-3 mb-3">
                        <AnimatePresence>
                          {urgentQuestions.map((q) => (
                            <QuestionCard key={q.id} data={q} />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    {regularPendingQuestions.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        <AnimatePresence>
                          {regularPendingQuestions.map((q) => (
                            <QuestionCard key={q.id} data={q} />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cell 3: Answered Questions */}
              <div className={`rounded-lg border border-neutral-200 flex flex-col overflow-hidden transition-all duration-300 ${cellCollapsed.answered ? 'shrink-0' : 'flex-1 min-h-0'}`}>
                <button 
                  onClick={() => toggleCell('answered')}
                  className="flex items-center justify-between p-3 bg-neutral-50 border-b border-neutral-200 shrink-0 hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-500" />
                    <h3 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Answered <span className="text-neutral-300 font-normal ml-1">({answeredQuestions.length})</span></h3>
                  </div>
                  <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${cellCollapsed.answered ? '' : 'rotate-180'}`} />
                </button>
                
                {!cellCollapsed.answered && (
                  <div className="p-3 overflow-y-auto flex-1 scrollbar-hover">
                    <div className="grid grid-cols-2 gap-3">
                      {answeredQuestions.map((q) => (
                        <QuestionCard key={q.id} data={q} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Diagnostics + New Section */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
              {/* Cell 2: Diagnosis Cards */}
              <div className={`rounded-lg border border-neutral-200 flex flex-col overflow-hidden transition-all duration-300 ${cellCollapsed.diagnostics ? 'shrink-0' : 'flex-1 min-h-0'}`}>
                <div className="flex items-center justify-between p-3 bg-neutral-50 border-b border-neutral-200 shrink-0">
                  <button 
                    onClick={() => toggleCell('diagnostics')}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    <h3 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Real-Time Diagnostic Assessment</h3>
                    <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${cellCollapsed.diagnostics ? '' : 'rotate-180'}`} />
                  </button>
                  <button onClick={() => setIsAssessmentExpanded(!isAssessmentExpanded)} className="text-neutral-400 hover:text-primary hover:bg-primary/5 p-1 rounded transition-colors">
                    {isAssessmentExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
                
                {!cellCollapsed.diagnostics && (
                  <div className="p-3 overflow-y-auto flex-1 space-y-3 scrollbar-hover">
                    {topDiagnoses.map((diagnosis, index) => (
                      <DiagnosisCard
                        key={diagnosis.did}
                        diagnosis={diagnosis}
                        isPrimary={index === 0}
                        onClick={() => setSelectedDiagnosis({ diagnosis, isPrimary: index === 0 })}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Cell 4: Patient Education */}
              <div className={`rounded-lg border border-neutral-200 flex flex-col overflow-hidden transition-all duration-300 ${cellCollapsed.cell4 ? 'shrink-0' : 'flex-1 min-h-0'}`}>
                <button 
                  onClick={() => toggleCell('cell4')}
                  className="flex items-center justify-between p-3 bg-neutral-50 border-b border-neutral-200 shrink-0 hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle size={12} className="text-neutral-400" />
                    <h3 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Patient Education <span className="text-neutral-300 font-normal ml-1">({MOCK_PATIENT_EDUCATION.length})</span></h3>
                  </div>
                  <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${cellCollapsed.cell4 ? '' : 'rotate-180'}`} />
                </button>
                
                {!cellCollapsed.cell4 && (
                  <div className="p-3 overflow-y-auto flex-1 scrollbar-hover space-y-2">
                    {MOCK_PATIENT_EDUCATION.map((item) => (
                      <div 
                        key={item.id} 
                        className="rounded-lg p-3 border bg-neutral-50 border-neutral-200 hover:border-neutral-300 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                        
                          <div className="min-w-0">
                            <h4 className="text-xs font-medium text-neutral-800 mb-1">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis Detail Modal */}
      <AnimatePresence>
        {selectedDiagnosis && (
          <DiagnosisDetailModal
            key={selectedDiagnosis.diagnosis.did}
            diagnosis={selectedDiagnosis.diagnosis}
            isPrimary={selectedDiagnosis.isPrimary}
            onClose={() => setSelectedDiagnosis(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
