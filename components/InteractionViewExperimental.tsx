import React, { useState } from 'react';
import { 
  ArrowLeft, RefreshCw, Play, Maximize2, Minimize2, Check, ChevronDown, 
  ChevronRight, MoreHorizontal, Activity, AlertCircle, Clock, Pause,
  User, HelpCircle
} from 'lucide-react';
import { Patient, PatientStatus } from '../types';

interface InteractionViewExperimentalProps {
  patient: Patient;
  onBack: () => void;
}

type CardStatus = 'answered' | 'pending' | 'urgent';

interface QuestionData {
  id: number;
  status: CardStatus;
  question: string;
  answer?: string;
}

const QuestionCard: React.FC<{ data: QuestionData; isNew?: boolean }> = ({ data, isNew = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAnswered = data.status === 'answered';
  const isUrgent = data.status === 'urgent';

  const containerClasses = isUrgent
    ? "bg-red-50 border-red-200 shadow-[0_0_0_1px_rgba(254,202,202,0.4)]"
    : "bg-neutral-50 border-neutral-200 hover:border-neutral-300";

  const innerCardClasses = isUrgent
    ? "border-red-100 shadow-sm"
    : "border-neutral-100 shadow-sm";

  return (
    <div 
      onClick={() => setIsOpen(!isOpen)}
      className={`rounded-xl p-2 border transition-all duration-200 cursor-pointer group select-none relative overflow-hidden ${containerClasses} ${isNew ? 'animate-in slide-in-from-top-4 fade-in duration-500' : ''}`}
    >
       {/* Inner White Card */}
       <div className={`bg-white rounded-lg p-3 border relative z-10 flex justify-between items-start gap-3 transition-colors ${innerCardClasses}`}>
          <h3 className={`text-sm font-medium leading-snug transition-colors ${isUrgent ? 'text-red-900 font-semibold' : 'text-neutral-900'}`}>
            {data.question}
          </h3>
          
          {/* Status Indicators (Top Right) */}
          <div className="flex flex-col items-center shrink-0 min-h-[1.5rem]">
            {isAnswered && (
              <>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'h-0 opacity-0 mb-0' : 'h-4 opacity-100 mb-1'}`}>
                  <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check size={10} className="text-emerald-600" strokeWidth={3} />
                  </div>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </>
            )}
            
            {isUrgent && (
              <div className="animate-pulse">
                <AlertCircle size={18} className="text-red-500 fill-red-50" />
              </div>
            )}
            
            {!isAnswered && !isUrgent && (
              <HelpCircle size={16} className="text-neutral-300" />
            )}
          </div>
       </div>
       
       {/* Footer Content (Answer or Status) */}
       {isAnswered ? (
         <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
           <div className="overflow-hidden">
             <div className="px-3 pt-3 pb-1 flex items-start gap-2">
               <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5 border border-emerald-200">
                 <Check size={12} strokeWidth={3} />
               </div>
               <p className="text-xs text-neutral-600 leading-relaxed py-1">
                 {data.answer}
               </p>
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
               <span className="font-bold text-red-700 tracking-wide uppercase text-[10px]">Response Required</span>
             </>
           ) : (
             <>
               <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                 <Clock size={12} className="text-neutral-500" />
               </div>
               <span className="text-neutral-400 italic">Pending input...</span>
             </>
           )}
         </div>
       )}
    </div>
  );
};

export const InteractionViewExperimental: React.FC<InteractionViewExperimentalProps> = ({ patient, onBack }) => {
  // Layout State
  const [isAssessmentExpanded, setIsAssessmentExpanded] = useState(false);
  
  // Mock Playback State
  const [isPlaying, setIsPlaying] = useState(false);

  // Animation demo state
  const [pendingQuestions, setPendingQuestions] = useState<QuestionData[]>([
    {
      id: 8,
      status: 'urgent',
      question: "Are you currently taking any blood thinning medications?",
    },
    {
      id: 9,
      status: 'urgent',
      question: "Have you had any recent surgeries or hospitalizations?",
    },
    {
      id: 10,
      status: 'pending',
      question: "Is there a family history of liver disease or gallbladder problems?",
    },
    {
      id: 11,
      status: 'pending',
      question: "Have you experienced any dizziness or lightheadedness?",
    }
  ]);

  // Demo: Add new question every 5 seconds
  React.useEffect(() => {
    const newQuestions: QuestionData[] = [
      { id: 12, status: 'urgent', question: "Do you have any history of bleeding disorders?" },
      { id: 13, status: 'pending', question: "Have you noticed any changes in your urine color?" },
      { id: 14, status: 'urgent', question: "Are you currently experiencing any chest pain?" },
      { id: 15, status: 'pending', question: "Do you smoke or use tobacco products?" },
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < newQuestions.length) {
        setPendingQuestions(prev => [newQuestions[index], ...prev]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Separate urgent and regular pending questions
  const urgentQuestions = pendingQuestions.filter(q => q.status === 'urgent');
  const regularPendingQuestions = pendingQuestions.filter(q => q.status === 'pending');
  
  const activeProblems = [
    "Mechanical Biliary Obstruction",
    "Acute Ascending Cholangitis",
    "Obstructive Choledocholithiasis"
  ];

  const questions: QuestionData[] = [
    {
      id: 1,
      status: 'answered',
      question: "Have you consumed alcohol recently, and if so, how much?",
      answer: "I have a few beers with the guys, nothin' crazy.",
    },
    {
      id: 2,
      status: 'answered',
      question: "Have you noticed any changes in your bowel habits besides the color, such as diarrhea or constipation?",
      answer: "Nah, just the color of the stool. No real diarrhea or gettin' stopped up.",
    },
    {
      id: 3,
      status: 'answered',
      question: "Have you had any fevers or chills, especially with the itching or abdominal discomfort?",
      answer: "Nah, don't think so. Haven't felt feverish or had any chills. Just this itch and the yellow.",
    },
    {
      id: 4,
      status: 'answered',
      question: "Have you had any recent travel or exposure to anyone with similar symptoms?",
      answer: "Nope, haven't traveled, and no one else seems to be havin' these problems.",
    },
    {
      id: 5,
      status: 'answered',
      question: "Have you experienced any unintentional weight loss recently?",
      answer: "Nah, haven't really weighed myself, but my clothes feel a little loose. Must be from not eatin' as much with the nausea.",
    },
    {
      id: 6,
      status: 'answered',
      question: "Can you describe the pain in your right side more? Is it constant or does it come and go?",
      answer: "Well, my tooth was really killin' me. I was takin' like, six to eight pills a day, for about the last three weeks. Just tryin' to deal with the pain.",
    },
    {
      id: 7,
      status: 'answered',
      question: "Have you experienced any nausea, vomiting, or loss of appetite?",
      answer: "Yeah, I haven't been feelin' real hungry lately. Had a little nausea now and then, but haven't thrown up.",
    }
  ];

  const transcript = [
    {
      speaker: 'Patient',
      text: "Well, my tooth was really killin' me. I was takin' like, six to eight pills a day, for about the last three weeks. Just tryin' to deal with the pain.",
      highlight: [
        { text: "my tooth was really killin' me", type: "symptom" },
        { text: "six to eight pills a day", type: "medication" },
        { text: "about the last three weeks", type: "duration" }
      ]
    },
    {
      speaker: 'Nurse',
      text: "I understand the pain must have been really bad. Have you experienced any unintentional weight loss recently?",
      highlight: []
    },
    {
      speaker: 'Patient',
      text: "Nah, haven't really weighed myself, but my clothes feel a little loose. Must be from not eatin' as much with the nausea.",
      highlight: [
        { text: "clothes feel a little loose", type: "symptom" },
        { text: "nausea", type: "symptom" }
      ]
    },
    {
      speaker: 'Nurse',
      text: "Okay. Have you traveled recently or been exposed to anyone with similar symptoms?",
      highlight: []
    },
    {
      speaker: 'Patient',
      text: "Nah, been stayin' close to home. And nope, no one else is sick around me. Just me.",
      highlight: []
    },
    {
      speaker: 'Nurse',
      text: "Okay. Have you noticed any changes in your bowel habits besides the color, such as diarrhea or constipation?",
      highlight: []
    },
    {
      speaker: 'Patient',
      text: "Nah, just the color of the stool. No real diarrhea or gettin' stopped up.",
      highlight: [{ text: "just the color of the stool", type: "symptom" }]
    },
    {
      speaker: 'Nurse',
      text: "Understood. Can you describe the intensity of the itching on a scale of 1 to 10?",
      highlight: []
    },
    {
      speaker: 'Patient',
      text: "It's bad. Like, a good eight or nine most of the time. Sometimes worse if I think about it. Makes it hard to focus or even sleep.",
      highlight: [{ text: "a good eight or nine", type: "severity" }, { text: "Sometimes worse", type: "severity" }]
    },
    {
        speaker: 'Nurse',
        text: "That does sound very intense. Do you have any drug allergies?",
        highlight: []
    },
    {
        speaker: 'Patient',
        text: "Nah, no allergies to meds that I know of.",
        highlight: []
    }
  ];

  return (
    <div className="h-screen bg-neutral-50 flex flex-col overflow-hidden font-sans text-neutral-800">
      
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-neutral-200 shrink-0 z-20">
        <div className="w-[90%] max-w-[1920px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
              <button 
                onClick={onBack}
                className="flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-900 leading-tight">
                  {patient.lastName}, {patient.firstName}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                  <span className="font-mono">P{patient.id}</span>
                  <span>·</span>
                  <span className="uppercase tracking-wider font-medium text-primary">Live Interaction</span>
                </div>
              </div>
          </div>

          <div className="flex items-center gap-3">
               <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2 px-4 py-1.5 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700"
               >
                   <Play size={14} className="text-neutral-500" />
                   Resume
               </button>
               <button className="text-neutral-400 hover:text-neutral-900 transition-colors p-2">
                  <RefreshCw size={16} />
               </button>
               <span className="px-3 py-1 rounded border border-red-200 bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-wider">
                 Critical
               </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR: Patient Context */}
        <div 
            className={`
                bg-white border-r border-neutral-200 flex flex-col overflow-y-auto shrink-0 z-10 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                ${isAssessmentExpanded ? 'w-[5%]' : 'w-[20%]'}
            `}
        >
           {/* Collapsed Content */}
           <div className={`flex flex-col items-center py-6 gap-6 ${isAssessmentExpanded ? 'opacity-100 delay-200' : 'opacity-0 hidden'}`}>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                 {patient.firstName[0]}
              </div>
              <div className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-50"></div>
              <button className="p-2 text-neutral-400 hover:text-neutral-600">
                  <Activity size={20} />
              </button>
           </div>

           {/* Full Content */}
           <div className={`${isAssessmentExpanded ? 'opacity-0 hidden' : 'opacity-100'} transition-opacity duration-200`}>
                <div className="p-6 border-b border-neutral-100">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-lg mb-4">
                        {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-900 leading-tight mb-1">
                        {patient.firstName} '{patient.middleName?.split(' ')[0]}' {patient.lastName}
                    </h2>
                    <p className="text-xs text-neutral-500 font-mono mb-4">MRN: {patient.id}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                        <div>
                            <span className="block text-neutral-400 uppercase tracking-wider font-medium text-[11px]">DOB</span>
                            <span className="font-medium text-neutral-700">1978-08-14</span>
                        </div>
                        <div>
                            <span className="block text-neutral-400 uppercase tracking-wider font-medium text-[11px]">Age/Sex</span>
                            <span className="font-medium text-neutral-700">{patient.age} / {patient.gender}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium block mb-2">Risk Status</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            HIGH RISK
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    <div>
                        <h3 className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium mb-3">Presenting Diagnosis</h3>
                        <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 text-sm font-medium text-neutral-800">
                            {patient.diagnosis}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium mb-3">Active Problems</h3>
                        <div className="space-y-2">
                            {activeProblems.map((problem, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-2 rounded hover:bg-neutral-50 transition-colors group">
                                <div className="mt-0.5 w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                                    <Check size={10} className="text-neutral-300 group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-sm text-neutral-600 leading-snug group-hover:text-neutral-900 transition-colors">{problem}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
           </div>
        </div>

        {/* CENTER: Chat Interface */}
        <div 
            className={`
                flex flex-col min-w-0 bg-neutral-50/30 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] border-r border-neutral-200
                ${isAssessmentExpanded ? 'w-[20%]' : 'w-[45%]'}
            `}
        >
           {/* Chat Stream */}
           <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {transcript.map((turn, i) => {
                 const isNurse = turn.speaker === 'Nurse';
                 
                 return (
                    <div key={i} className={`flex gap-3 ${isNurse ? 'justify-end' : 'justify-start'}`}>
                       {!isNurse && (
                          <div className="w-8 h-8 rounded-full bg-white text-neutral-900 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm border border-neutral-200">
                             PT
                          </div>
                       )}
                       
                       <div className={`max-w-[85%] ${isNurse ? 'order-1' : 'order-2'}`}>
                          <div className={`
                             px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                             ${isNurse 
                                ? 'bg-white border border-neutral-200 text-neutral-800 rounded-tr-sm' 
                                : 'bg-blue-50/50 border border-blue-100 text-neutral-800 rounded-tl-sm'}
                          `}>
                             {turn.highlight.length > 0 ? (
                                <span>
                                   {turn.text.split(new RegExp(`(${turn.highlight.map(h => h.text).join('|')})`, 'g')).map((part, idx) => {
                                      const highlightMatch = turn.highlight.find(h => h.text === part);
                                      if (highlightMatch) {
                                         return (
                                            <mark key={idx} className="bg-orange-200/70 text-inherit rounded-sm px-0.5 -mx-0.5">
                                               {part}
                                            </mark>
                                         );
                                      }
                                      return part;
                                   })}
                                </span>
                             ) : (
                                turn.text
                             )}
                          </div>
                       </div>

                       {isNurse && (
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm order-2">
                             RN
                          </div>
                       )}
                    </div>
                 );
              })}
           </div>
        </div>

        {/* RIGHT SIDEBAR: Assessment */}
        <div 
            className={`
                bg-white flex flex-col overflow-hidden shrink-0 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
                ${isAssessmentExpanded ? 'w-[75%]' : 'w-[35%] border-l border-neutral-200'}
            `}
        >
           <div className="h-full flex flex-col overflow-y-auto">
                {/* Diagnostics Header Area */}
                <div className="p-6 border-b border-neutral-200 shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Real-Time Diagnostic Assessment</h3>
                        <button 
                            onClick={() => setIsAssessmentExpanded(!isAssessmentExpanded)}
                            className="text-primary hover:bg-primary/5 p-1.5 rounded transition-colors"
                        >
                            {isAssessmentExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>

                    {/* Diagnostic Cards - Responsive Grid */}
                    <div className={`grid gap-4 ${isAssessmentExpanded ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {/* Card 1 */}
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 hover:border-primary/30 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-primary text-[10px] font-semibold uppercase tracking-wide group-hover:bg-primary group-hover:text-white transition-colors">Primary</span>
                                <span className="text-[10px] text-neutral-400 font-medium">11 findings</span>
                            </div>
                            <h4 className="font-semibold text-neutral-900 text-lg mb-4">Mechanical Biliary Obstruction</h4>
                            <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-2 overflow-hidden">
                                <div className="bg-primary w-[92%] h-full rounded-full opacity-90"></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-medium">
                                <span className="text-primary font-bold uppercase tracking-wide">High</span>
                                <span className="text-neutral-400">confidence level</span>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 hover:border-primary/30 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-2 py-0.5 rounded bg-neutral-50 text-neutral-500 text-[10px] font-semibold uppercase tracking-wide group-hover:bg-neutral-600 group-hover:text-white transition-colors">Secondary</span>
                                <span className="text-[10px] text-neutral-400 font-medium">11 findings</span>
                            </div>
                            <h4 className="font-semibold text-neutral-900 text-lg mb-4">Acute Ascending Cholangitis</h4>
                            <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-2 overflow-hidden">
                                <div className="bg-primary w-[65%] h-full rounded-full opacity-90"></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-medium">
                                <span className="text-primary font-bold uppercase tracking-wide">Moderate</span>
                                <span className="text-neutral-400">confidence level</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Area */}
                <div className={`flex-1 p-6 ${isAssessmentExpanded ? 'grid grid-cols-2 gap-8' : ''}`}>
                    
                    {/* LEFT COL: New Inquiries */}
                    {isAssessmentExpanded && (
                        <div className="border-r border-neutral-100 pr-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">New Inquiries <span className="text-neutral-300 font-normal ml-1">({pendingQuestions.length})</span></h3>
                            </div>
                            
                            {/* Urgent Questions - Full Width */}
                            {urgentQuestions.length > 0 && (
                              <div className="space-y-4 mb-6">
                                {urgentQuestions.map((q) => (
                                  <QuestionCard key={q.id} data={q} isNew={q.id > 11} />
                                ))}
                              </div>
                            )}

                            {/* Regular Pending Questions - 2 Column Grid */}
                            {regularPendingQuestions.length > 0 && (
                              <div className="grid gap-4 grid-cols-2">
                                {regularPendingQuestions.map((q) => (
                                  <QuestionCard key={q.id} data={q} isNew={q.id > 11} />
                                ))}
                              </div>
                            )}
                        </div>
                    )}

                    {/* RIGHT COL: Answered Questions */}
                    <div className={isAssessmentExpanded ? 'pl-2' : ''}>
                        {/* Show pending questions when not expanded */}
                        {!isAssessmentExpanded && (
                          <>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">New Inquiries <span className="text-neutral-300 font-normal ml-1">({pendingQuestions.length})</span></h3>
                            </div>
                            
                            {/* Urgent Questions - Full Width */}
                            {urgentQuestions.length > 0 && (
                              <div className="space-y-4 mb-6">
                                {urgentQuestions.map((q) => (
                                  <QuestionCard key={q.id} data={q} isNew={q.id > 11} />
                                ))}
                              </div>
                            )}

                            {/* Regular Pending Questions - 2 Column Grid */}
                            {regularPendingQuestions.length > 0 && (
                              <div className="grid gap-4 grid-cols-2 mb-8">
                                {regularPendingQuestions.map((q) => (
                                  <QuestionCard key={q.id} data={q} isNew={q.id > 11} />
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                <Check size={14} className="text-emerald-500" /> Answered Questions <span className="text-neutral-300 font-normal ml-1">({questions.length})</span>
                            </h3>
                        </div>

                        <div className={`grid gap-4 ${isAssessmentExpanded ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {questions.map((q) => (
                                <QuestionCard key={q.id} data={q} />
                            ))}
                        </div>
                    </div>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
};
