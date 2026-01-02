import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  HelpCircle, 
  BookOpen, 
  Stethoscope, 
  User, 
  CheckSquare, 
  FileText,
  MoveLeftIcon,
  BarChart3
} from 'lucide-react';
import { PatientInfo } from './PatientInfo';
import { ChatInterface } from './ChatInterface';
import { QuestionsInterface } from './QuestionsInterface';
import { PatientEducationInterface } from './PatientEducationInterface';
import { DiagnosticInterface } from './DiagnosticInterface';
import { ChecklistInterface } from './ChecklistInterface';
import { ReportInterface } from './ReportInterface';
import { AnalyticsInterface } from './AnalyticsInterface';
import { Patient, PatientStatus, ChatMessage, Diagnosis, Question, EducationItem, AnalyticsData, ChecklistItem, ReportData } from '../types';
import { ClinicalSession } from '../services/websocket';

type SectionId = 'patient' | 'chat' | 'questions' | 'education' | 'diagnostic' | 'checklist' | 'analytics' | 'report';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'patient', label: 'Patient Info', icon: <User size={16} /> },
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={16} /> },
  { id: 'questions', label: 'Questions', icon: <HelpCircle size={16} /> },
  { id: 'education', label: 'Patient Education', icon: <BookOpen size={16} /> },
  { id: 'diagnostic', label: 'Diagnostic', icon: <Stethoscope size={16} /> },
  { id: 'checklist', label: 'Checklist', icon: <CheckSquare size={16} /> },
  { id: 'analytics', label: 'Consult Analytics', icon: <BarChart3 size={16} /> },
  { id: 'report', label: 'Report Gen', icon: <FileText size={16} /> },
];

// Donut/Ring Chart Component
interface DonutChartProps {
  percentage: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  percentage, 
  label, 
  size = 80, 
  strokeWidth = 8,
  filled = false 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={filled ? "#475569" : "#64748b"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        {/* Center fill for 100% */}
        {filled && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ 
              margin: strokeWidth,
              borderRadius: '50%',
              backgroundColor: '#475569'
            }}
          >
            <span className="text-white font-semibold text-sm">{percentage}%</span>
          </div>
        )}
        {/* Percentage text for non-filled */}
        {!filled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-neutral-600 font-semibold text-sm">{percentage}%</span>
          </div>
        )}
      </div>
      <span className="text-xs text-neutral-500 mt-2 text-center leading-tight">{label}</span>
    </div>
  );
};

// Small circular indicator for analytics bar
interface SmallDonutProps {
  percentage: number;
  label: string;
  count?: string;
}

const SmallDonut: React.FC<SmallDonutProps> = ({ percentage, label, count }) => {
  const size = 24;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Color based on completion percentage
  const getStrokeColor = () => {
    if (percentage === 100) return '#0891b2'; // cyan-600
    if (percentage >= 60) return '#06b6d4'; // cyan-500
    return '#22d3ee'; // cyan-400
  };
  
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#cffafe"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        {/* Count inside the ring */}
        {count && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[7px] text-cyan-700 font-bold tabular-nums">{count}</span>
          </div>
        )}
      </div>
      <span className="text-[10px] text-slate-600 uppercase tracking-wide leading-tight font-semibold">{label}</span>
    </div>
  );
};

export const ConsultationPage: React.FC<{ patient: Patient; onBack: () => void }> = ({ patient, onBack }) => {
  const [activeSection, setActiveSection] = useState<SectionId>('patient');
  const [consultationDuration, setConsultationDuration] = useState<number>(30); // Default 30 minutes
  const sessionRef = useRef<ClinicalSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in seconds

  // Backend data states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Chat UI states - lifted from ChatInterface to preserve across tab switches
  const [hasStarted, setHasStarted] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  // Calculate dynamic counts from backend data
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => q.status === "asked").length;
  const questionsPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const totalEducation = educationItems.length;
  const deliveredEducation = educationItems.filter(e => e.status === "asked").length;
  const educationPercentage = totalEducation > 0 ? Math.round((deliveredEducation / totalEducation) * 100) : 0;

  // Calculate timer progress
  const elapsedMinutes = Math.floor(elapsedTime / 60);
  const elapsedSeconds = elapsedTime % 60;
  const timerProgressPercentage = Math.round((elapsedTime / (consultationDuration * 60)) * 100);

  // Get top diagnosis
  const topDiagnosis = diagnoses.length > 0 ? diagnoses[0] : null;

  // Timer effect - updates every second when session is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - sessionStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, sessionStartTime]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.stop();
      }
    };
  }, []);

  // Handle consultation type selection and start WebSocket session
  const handleConsultationTypeSelected = (type: 'new' | 'followup') => {
    if (type === 'new') {
      setConsultationDuration(30);
    } else {
      setConsultationDuration(15);
    }

    // Start timer
    setSessionStartTime(Date.now());
    setElapsedTime(0);

    // Mark as started and hide modal
    setHasStarted(true);
    setShowConsultationModal(false);

    // Start WebSocket session
    startClinicalSession(patient.id, patient.gender);
  };

  // Handle microphone click - show modal if not started
  const handleMicClick = () => {
    if (!hasStarted) {
      setShowConsultationModal(true);
    }
  };

  const startClinicalSession = (patientId: string, gender: string) => {
    if (sessionRef.current) {
      console.log('Session already active');
      return;
    }

    console.log('Starting clinical session for patient:', patientId);
    
    const session = new ClinicalSession(patientId, gender, {
      onChat: (messages) => {
        console.log('Received chat messages:', messages.length);
        setChatMessages(messages);
      },
      onDiagnoses: (newDiagnoses) => {
        console.log('Received diagnoses:', newDiagnoses.length);
        setDiagnoses(newDiagnoses);
      },
      onQuestions: (newQuestions) => {
        console.log('Received questions:', newQuestions.length);
        setQuestions(newQuestions);
      },
      onEducation: (items) => {
        console.log('Received education items:', items.length);
        setEducationItems(items);
      },
      onAnalytics: (analyticsData) => {
        console.log('Received analytics data');
        setAnalytics(analyticsData);
      },
      onChecklist: (items) => {
        console.log('Received checklist items:', items.length);
        setChecklistItems(items);
      },
      onReport: (report) => {
        console.log('Received report data');
        setReportData(report);
      },
      onStatusChange: (status) => {
        console.log('Session status:', status);
        setIsSessionActive(status === 'connected');
      },
      onLog: (message, type) => {
        console.log(`[${type}] ${message}`);
      },
    });

    sessionRef.current = session;
    session.start().catch((error) => {
      console.error('Failed to start session:', error);
      sessionRef.current = null;
    });
  };

  // Format duration for display
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:00`;
    }
    return `${mins}:00`;
  };

  return (
    <div className="h-screen bg-neutral-100 flex flex-col overflow-hidden font-sans text-neutral-800">
      {/* Combined Nav + Analytics Bar */}
      <div className="h-12 bg-white border-b border-gray-200 shrink-0 px-4 flex items-center shadow-sm">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-600 transition-colors mr-3"
        >
          <MoveLeftIcon size={18} />
        </button>
        
        {/* Vertical Separator */}
        <div className="h-6 w-px bg-cyan-200 mr-4"></div>

        {/* Voice Consultation Status - Always visible when active */}
        {hasStarted && (
          <>
            <div className="flex items-center gap-2 mr-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isSessionActive ? 'bg-[#0EA5E9] animate-pulse' : 'bg-neutral-300'
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-700">
                  {isSessionActive ? 'Listening' : 'Connecting...'}
                </span>
                <span className="text-[8px] text-slate-500">Voice Active</span>
              </div>
              {/* Stop Button */}
              <button
                onClick={() => {
                  if (sessionRef.current) {
                    sessionRef.current.stop();
                    sessionRef.current = null;
                  }
                  setIsSessionActive(false);
                }}
                className="ml-1 w-6 h-6 rounded flex items-center justify-center bg-cyan-500/50 hover:bg-cyan-600 transition-colors"
                title="Stop consultation"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              </button>
            </div>
            <div className="h-6 w-px bg-cyan-200 mr-4"></div>
          </>
        )}

        {/* Analytics Section */}
        <div className="flex-1 flex items-center gap-5">
          {/* Consultation Duration with Timer */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 uppercase tracking-wide font-semibold">Duration</span>
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1.5 bg-cyan-100 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, timerProgressPercentage)}%` }}></div>
              </div>
              <span className="text-[10px] text-slate-700 font-bold whitespace-nowrap tabular-nums">
                {String(elapsedMinutes).padStart(2, '0')}:{String(elapsedSeconds).padStart(2, '0')}/{formatDuration(consultationDuration)}
              </span>
            </div>
          </div>

          {/* Small Donut Indicators with counts */}
          <div className="flex items-center gap-4">
            <SmallDonut 
              percentage={questionsPercentage} 
              label="Questions" 
              count={`${answeredQuestions}/${totalQuestions}`} 
            />
            <SmallDonut 
              percentage={educationPercentage} 
              label="Education" 
              count={`${deliveredEducation}/${totalEducation}`} 
            />
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-cyan-200"></div>

          {/* Top Diagnosis */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 uppercase tracking-wide font-semibold">Diagnosis</span>
            {topDiagnosis ? (
              <>
                <span className="px-2 py-0.5 bg-cyan-600 text-white text-[10px] font-bold rounded shadow-sm">
                  {topDiagnosis.headline || 'DILI'}
                </span>
                <div className="w-16 h-1.5 bg-cyan-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(90, topDiagnosis.rank ? (100 - topDiagnosis.rank * 10) : 85)}%` }}></div>
                </div>
              </>
            ) : (
              <span className="text-[10px] text-slate-400">Analyzing...</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <div className="w-16 bg-white border-r border-neutral-200 flex flex-col py-2 shrink-0">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 mx-1.5 rounded-lg transition-all ${
                activeSection === item.id
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
              }`}
            >
              {item.icon}
              <span className="text-[9px] mt-1 font-medium text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-3 overflow-hidden">
          {activeSection === 'patient' ? (
            <div className="h-full overflow-y-auto">
              <PatientInfo patient={patient} />
            </div>
          ) : activeSection === 'chat' ? (
            <ChatInterface 
              onConsultationTypeSelected={handleConsultationTypeSelected}
              chatMessages={chatMessages}
              isSessionActive={isSessionActive}
              hasStarted={hasStarted}
              showModal={showConsultationModal}
              onMicClick={handleMicClick}
              onModalClose={() => setShowConsultationModal(false)}
            />
          ) : !hasStarted ? (
            // Show "Please Start Consultation" for all tabs except Patient and Chat
            <div className="h-full flex items-center justify-center">
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Start Consultation</h3>
                <p className="text-sm text-neutral-500">
                  Please start the consultation from the Chat tab to view {activeSection} data
                </p>
              </div>
            </div>
          ) : activeSection === 'questions' ? (
            questions.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-md">
                  <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">Analyzing Consultation</h3>
                  <p className="text-sm text-neutral-500">
                    Waiting for consultation data to present questions
                  </p>
                </div>
              </div>
            ) : (
              <QuestionsInterface questions={questions} />
            )
          ) : activeSection === 'education' ? (
            educationItems.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-md">
                  <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">Analyzing Consultation</h3>
                  <p className="text-sm text-neutral-500">
                    Waiting for consultation data to present patient education
                  </p>
                </div>
              </div>
            ) : (
              <PatientEducationInterface educationItems={educationItems} />
            )
          ) : activeSection === 'diagnostic' ? (
            diagnoses.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-md">
                  <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">Analyzing Consultation</h3>
                  <p className="text-sm text-neutral-500">
                    Waiting for consultation data to present diagnostic information
                  </p>
                </div>
              </div>
            ) : (
              <DiagnosticInterface diagnoses={diagnoses} />
            )
          ) : activeSection === 'checklist' ? (
            checklistItems.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-md">
                  <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">Analyzing Consultation</h3>
                  <p className="text-sm text-neutral-500">
                    Waiting for consultation data to present checklist
                  </p>
                </div>
              </div>
            ) : (
              <ChecklistInterface checklistItems={checklistItems} />
            )
          ) : activeSection === 'analytics' ? (
            !analytics || !analytics.metrics ? (
              <div className="h-full flex items-center justify-center">
                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-md">
                  <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">Analyzing Consultation</h3>
                  <p className="text-sm text-neutral-500">
                    Waiting for consultation data to present analytics
                  </p>
                </div>
              </div>
            ) : (
              <AnalyticsInterface analyticsData={analytics} />
            )
          ) : activeSection === 'report' ? (
            !reportData ? (
              <div className="h-full flex items-center justify-center">
                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-md">
                  <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">Analyzing Consultation</h3>
                  <p className="text-sm text-neutral-500">
                    Waiting for consultation data to generate report
                  </p>
                </div>
              </div>
            ) : (
              <ReportInterface reportData={reportData} />
            )
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="bg-white rounded-xl border border-neutral-200 p-8">
                <h2 className="text-lg font-semibold text-neutral-700 mb-8 capitalize">{activeSection}</h2>
                
                {/* Donut Charts Display */}
                <div className="flex items-center justify-center gap-16">
                  <DonutChart percentage={60} label="Key Symptoms" size={100} strokeWidth={10} />
                  <DonutChart percentage={80} label="Patient Education" size={100} strokeWidth={10} />
                  <DonutChart percentage={100} label="Safety Check" size={100} strokeWidth={10} filled />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
