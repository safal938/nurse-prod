import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Maximize2, Minimize2, Check,
  Square, Wifi, WifiOff, Bug
} from 'lucide-react';
import { Patient, Diagnosis, Question } from '../types';
import { ClinicalSession, TranscriptMessage } from '../services/websocket';
import { DiagnosisDetailModal, DiagnosisCard, QuestionCard, QuestionCardData, DebugPanel } from './interaction';

interface InteractionViewExperimentalProps {
  patient: Patient;
  onBack: () => void;
}

interface TranscriptEntry {
  speaker: 'Patient' | 'Nurse';
  text: string;
  highlight: { text: string; type: string }[];
}

const mapQuestionToCardData = (q: Question): QuestionCardData => {
  let status: 'answered' | 'pending' | 'urgent' = 'pending';
  if (q.answer) {
    status = 'answered';
  } else if (q.rank === 1 || q.rank === 2) {
    status = 'urgent';
  }
  return { id: q.qid, status, question: q.content, answer: q.answer || undefined, rank: q.rank };
};

export const InteractionViewExperimental: React.FC<InteractionViewExperimentalProps> = ({ patient, onBack }) => {
  const [isAssessmentExpanded, setIsAssessmentExpanded] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  
  // Diagnosis modal state
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<{ diagnosis: Diagnosis; isPrimary: boolean } | null>(null);
  
  // Debug panel state
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [rawDiagnosesData, setRawDiagnosesData] = useState<Diagnosis[]>([]);
  const [rawQuestionsData, setRawQuestionsData] = useState<Question[]>([]);
  const [debugFilter, setDebugFilter] = useState<'all' | 'diagnoses' | 'questions' | 'logs' | 'transcript'>('all');
  const [selectedDebugItem, setSelectedDebugItem] = useState<{ type: string; data: any; index: number } | null>(null);
  
  // WebSocket session state
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'>('idle');
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const sessionRef = useRef<ClinicalSession | null>(null);
  
  // Real-time data from backend
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [logs, setLogs] = useState<{ message: string; type: string; time: string }[]>([]);

  const addLog = useCallback((message: string, type: string = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ message, type, time }, ...prev].slice(0, 50));
  }, []);

  const handleTranscript = useCallback((msg: TranscriptMessage) => {
    setTranscript(prev => [...prev, { speaker: msg.speaker, text: msg.text, highlight: [] }]);
  }, []);

  const startSession = useCallback(async () => {
    if (sessionRef.current?.running) return;
    
    sessionRef.current = new ClinicalSession(patient.id, {
      onDiagnoses: (data) => {
        setRawDiagnosesData(data);
        setDiagnoses(data);
      },
      onQuestions: (data) => {
        setRawQuestionsData(data);
        setQuestions(data);
      },
      onTranscript: handleTranscript,
      onStatusChange: (status) => setConnectionStatus(status as any),
      onSessionComplete: () => setIsSessionComplete(true),
      onLog: addLog,
    });

    try {
      await sessionRef.current.start();
    } catch (error) {
      addLog(`Failed to start session: ${error}`, 'error');
    }
  }, [patient.id, handleTranscript, addLog]);

  const stopSession = useCallback(() => {
    sessionRef.current?.stop();
    sessionRef.current = null;
  }, []);

  useEffect(() => {
    return () => { sessionRef.current?.stop(); };
  }, []);

  // Transform questions to card data
  const questionCards = questions.map(mapQuestionToCardData);
  const pendingQuestions = questionCards.filter(q => q.status !== 'answered').sort((a, b) => a.rank - b.rank);
  const answeredQuestions = questionCards.filter(q => q.status === 'answered');
  const urgentQuestions = pendingQuestions.filter(q => q.status === 'urgent');
  const regularPendingQuestions = pendingQuestions.filter(q => q.status === 'pending');
  
  // Get top 2 diagnoses sorted by number of findings
  const topDiagnoses = [...diagnoses]
    .sort((a, b) => b.indicators_point.length - a.indicators_point.length)
    .slice(0, 2);
  const activeProblems = topDiagnoses.map(d => d.diagnosis);

  const isConnected = connectionStatus === 'connected';
  const isIdle = connectionStatus === 'idle';

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
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
              isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              connectionStatus === 'connecting' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-neutral-50 text-neutral-500 border border-neutral-200'
            }`}>
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connectionStatus === 'connecting' ? 'Connecting...' : 
               isConnected ? 'Connected' : 
               connectionStatus === 'error' ? 'Error' : 'Offline'}
            </div>

            {/* Start/Stop Button */}
            {isIdle || connectionStatus === 'disconnected' || connectionStatus === 'error' ? (
              <button 
                onClick={startSession}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
              >
                <Play size={14} />
                Start Session
              </button>
            ) : (
              <button 
                onClick={stopSession}
                className="flex items-center gap-2 px-4 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
              >
                <Square size={14} />
                Stop
              </button>
            )}

            {isSessionComplete && (
              <span className="px-3 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                Complete
              </span>
            )}

            <button 
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                showDebugPanel 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Bug size={14} />
              Debug
            </button>

            <span className="px-3 py-1 rounded border border-red-200 bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-wider">
              Critical
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Patient Context */}
        <motion.div 
          layout
          initial={false}
          animate={{ width: isAssessmentExpanded ? '5%' : '20%' }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="bg-white border-r border-neutral-200 flex flex-col overflow-y-auto shrink-0 z-10"
        >
          <div className={`flex flex-col items-center py-6 gap-6 ${isAssessmentExpanded ? 'opacity-100 delay-200' : 'opacity-0 hidden'}`}>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
              {patient.firstName[0]}
            </div>
            <div className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-50"></div>
          </div>

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
                <h3 className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium mb-3">Active Problems ({activeProblems.length})</h3>
                <div className="space-y-2">
                  {activeProblems.length > 0 ? activeProblems.map((problem, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded hover:bg-neutral-50 transition-colors group">
                      <div className="mt-0.5 w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                        <Check size={10} className="text-neutral-300 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-sm text-neutral-600 leading-snug group-hover:text-neutral-900 transition-colors line-clamp-2">{problem}</span>
                    </div>
                  )) : (
                    <p className="text-xs text-neutral-400 italic">Waiting for AI analysis...</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium mb-3">Session Log</h3>
                <div className="bg-slate-900 rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-[10px]">
                  {logs.length > 0 ? logs.map((log, i) => (
                    <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-sky-400'}`}>
                      <span className="text-slate-500">[{log.time}]</span> {log.message}
                    </div>
                  )) : (
                    <div className="text-slate-500">Waiting for session...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CENTER: Chat Interface */}
        <motion.div 
          layout
          initial={false}
          animate={{ width: isAssessmentExpanded ? '20%' : '45%' }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="flex flex-col min-w-0 bg-neutral-50/30 border-r border-neutral-200"
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {transcript.length > 0 ? transcript.map((turn, i) => {
              const isNurse = turn.speaker === 'Nurse';
              return (
                <div key={i} className={`flex gap-3 ${isNurse ? 'justify-end' : 'justify-start'}`}>
                  {!isNurse && (
                    <div className="w-8 h-8 rounded-full bg-white text-neutral-900 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm border border-neutral-200">
                      PT
                    </div>
                  )}
                  <div className={`max-w-[85%] ${isNurse ? 'order-1' : 'order-2'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${isNurse ? 'bg-white border border-neutral-200 text-neutral-800 rounded-tr-sm' : 'bg-blue-50/50 border border-blue-100 text-neutral-800 rounded-tl-sm'}`}>
                      {turn.text}
                    </div>
                  </div>
                  {isNurse && (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm order-2">
                      RN
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center text-neutral-400">
                  <p className="text-sm mb-2">No transcript yet</p>
                  <p className="text-xs">Start a session to begin the clinical interview</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* RIGHT SIDEBAR: Assessment */}
        <motion.div 
          layout
          initial={false}
          animate={{ width: isAssessmentExpanded ? '75%' : '35%' }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className={`bg-white flex flex-col overflow-hidden shrink-0 ${isAssessmentExpanded ? '' : 'border-l border-neutral-200'}`}
        >
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Diagnostics Header Area */}
            <div className="p-6 border-b border-neutral-200 shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Real-Time Diagnostic Assessment</h3>
                <button onClick={() => setIsAssessmentExpanded(!isAssessmentExpanded)} className="text-primary hover:bg-primary/5 p-1.5 rounded transition-colors">
                  {isAssessmentExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>

              {/* Diagnostic Cards */}
              <div className={`grid gap-4 ${isAssessmentExpanded ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {topDiagnoses.length > 0 ? topDiagnoses.map((diagnosis, index) => (
                  <DiagnosisCard
                    key={diagnosis.did}
                    diagnosis={diagnosis}
                    isPrimary={index === 0}
                    onClick={() => setSelectedDiagnosis({ diagnosis, isPrimary: index === 0 })}
                  />
                )) : (
                  <div className="text-center py-8 text-neutral-400 text-sm col-span-full">
                    {isConnected ? 'Analyzing patient data...' : 'Start session to receive diagnoses'}
                  </div>
                )}
              </div>
            </div>

            {/* Questions Area */}
            <div className={`flex-1 p-6 ${isAssessmentExpanded ? 'grid grid-cols-2 gap-8' : ''}`}>
              {isAssessmentExpanded && (
                <div className="border-r border-neutral-100 pr-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">New Inquiries <span className="text-neutral-300 font-normal ml-1">({pendingQuestions.length})</span></h3>
                  </div>
                  
                  {urgentQuestions.length > 0 && (
                    <div className="space-y-4 mb-6">
                      <AnimatePresence>
                        {urgentQuestions.map((q) => (
                          <QuestionCard key={q.id} data={q} isHighlighted={highlightedIds.includes(q.id)} />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {regularPendingQuestions.length > 0 && (
                    <div className="grid gap-4 grid-cols-2">
                      <AnimatePresence>
                        {regularPendingQuestions.map((q) => (
                          <QuestionCard key={q.id} data={q} isHighlighted={highlightedIds.includes(q.id)} />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              <div className={isAssessmentExpanded ? 'pl-2' : ''}>
                {!isAssessmentExpanded && (
                  <>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">New Inquiries <span className="text-neutral-300 font-normal ml-1">({pendingQuestions.length})</span></h3>
                    </div>
                    
                    {urgentQuestions.length > 0 && (
                      <div className="space-y-4 mb-6">
                        <AnimatePresence>
                          {urgentQuestions.map((q) => (
                            <QuestionCard key={q.id} data={q} isHighlighted={highlightedIds.includes(q.id)} />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    {regularPendingQuestions.length > 0 && (
                      <div className="grid gap-4 grid-cols-2 mb-8">
                        <AnimatePresence>
                          {regularPendingQuestions.map((q) => (
                            <QuestionCard key={q.id} data={q} isHighlighted={highlightedIds.includes(q.id)} />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <Check size={14} className="text-emerald-500" /> Answered Questions <span className="text-neutral-300 font-normal ml-1">({answeredQuestions.length})</span>
                  </h3>
                </div>

                <div className={`grid gap-4 ${isAssessmentExpanded ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {answeredQuestions.length > 0 ? answeredQuestions.map((q) => (
                    <QuestionCard key={q.id} data={q} />
                  )) : (
                    <p className="text-xs text-neutral-400 italic col-span-full">No answered questions yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Debug Panel */}
      <AnimatePresence>
        {showDebugPanel && (
          <DebugPanel
            isOpen={showDebugPanel}
            onClose={() => setShowDebugPanel(false)}
            isConnected={isConnected}
            connectionStatus={connectionStatus}
            rawDiagnosesData={rawDiagnosesData}
            rawQuestionsData={rawQuestionsData}
            transcript={transcript}
            logs={logs}
            onClearLogs={() => setLogs([])}
            debugFilter={debugFilter}
            setDebugFilter={setDebugFilter}
            selectedDebugItem={selectedDebugItem}
            setSelectedDebugItem={setSelectedDebugItem}
          />
        )}
      </AnimatePresence>

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
