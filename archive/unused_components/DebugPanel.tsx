import React from 'react';
import { motion } from 'framer-motion';
import { Bug } from 'lucide-react';
import { Diagnosis, Question } from '../../types';

interface TranscriptEntry {
  speaker: 'Patient' | 'Nurse';
  text: string;
  highlight: { text: string; type: string }[];
}

interface LogEntry {
  message: string;
  type: string;
  time: string;
}

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  connectionStatus: string;
  rawDiagnosesData: Diagnosis[];
  rawQuestionsData: Question[];
  transcript: TranscriptEntry[];
  logs: LogEntry[];
  onClearLogs: () => void;
  debugFilter: 'all' | 'diagnoses' | 'questions' | 'logs' | 'transcript';
  setDebugFilter: (filter: 'all' | 'diagnoses' | 'questions' | 'logs' | 'transcript') => void;
  selectedDebugItem: { type: string; data: any; index: number } | null;
  setSelectedDebugItem: (item: { type: string; data: any; index: number } | null) => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  isOpen,
  onClose,
  isConnected,
  connectionStatus,
  rawDiagnosesData,
  rawQuestionsData,
  transcript,
  logs,
  onClearLogs,
  debugFilter,
  setDebugFilter,
  selectedDebugItem,
  setSelectedDebugItem,
}) => {
  if (!isOpen) return null;

  const handleCopyAll = () => {
    const data = { diagnoses: rawDiagnosesData, questions: rawQuestionsData, logs, transcript };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bug size={20} className="text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Debug Panel</h2>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopyAll} className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
              Copy All
            </button>
            <button onClick={onClearLogs} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
              Clear Logs
            </button>
            <button onClick={onClose} className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
              Close
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Log List */}
          <div className="w-72 border-r bg-gray-50 flex flex-col">
            <div className="p-2 border-b bg-white">
              <select
                value={debugFilter}
                onChange={(e) => setDebugFilter(e.target.value as typeof debugFilter)}
                className="w-full text-xs p-2 border rounded bg-white"
              >
                <option value="all">All Data</option>
                <option value="diagnoses">Diagnoses Only</option>
                <option value="questions">Questions Only</option>
                <option value="logs">Session Logs</option>
                <option value="transcript">Transcript</option>
              </select>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Diagnoses */}
              {(debugFilter === 'all' || debugFilter === 'diagnoses') && rawDiagnosesData.map((d, i) => (
                <div
                  key={`diag-${d.did}`}
                  onClick={() => setSelectedDebugItem({ type: 'diagnosis', data: d, index: i })}
                  className={`p-3 border-b cursor-pointer hover:bg-emerald-50 ${
                    selectedDebugItem?.type === 'diagnosis' && selectedDebugItem?.data?.did === d.did ? 'bg-emerald-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">DIAG</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Rank {d.rank}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">{d.diagnosis}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{d.indicators_point.length} indicators</div>
                </div>
              ))}
              
              {/* Questions */}
              {(debugFilter === 'all' || debugFilter === 'questions') && rawQuestionsData.map((q, i) => (
                <div
                  key={`q-${q.qid}`}
                  onClick={() => setSelectedDebugItem({ type: 'question', data: q, index: i })}
                  className={`p-3 border-b cursor-pointer hover:bg-purple-50 ${
                    selectedDebugItem?.type === 'question' && selectedDebugItem?.data?.qid === q.qid ? 'bg-purple-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">QUES</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Rank {q.rank}</span>
                    {q.status === 'asked' && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Asked</span>}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">{q.content}</div>
                </div>
              ))}
              
              {/* Logs */}
              {(debugFilter === 'all' || debugFilter === 'logs') && logs.map((log, i) => (
                <div
                  key={`log-${i}`}
                  onClick={() => setSelectedDebugItem({ type: 'log', data: log, index: i })}
                  className={`p-3 border-b cursor-pointer hover:bg-amber-50 ${
                    selectedDebugItem?.type === 'log' && selectedDebugItem?.index === i ? 'bg-amber-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      log.type === 'error' ? 'bg-red-100 text-red-700' :
                      log.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-sky-100 text-sky-700'
                    }`}>
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-400">{log.time}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 truncate">{log.message}</div>
                </div>
              ))}
              
              {/* Transcript */}
              {(debugFilter === 'all' || debugFilter === 'transcript') && transcript.map((t, i) => (
                <div
                  key={`trans-${i}`}
                  onClick={() => setSelectedDebugItem({ type: 'transcript', data: t, index: i })}
                  className={`p-3 border-b cursor-pointer hover:bg-blue-50 ${
                    selectedDebugItem?.type === 'transcript' && selectedDebugItem?.index === i ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      t.speaker === 'Nurse' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {t.speaker === 'Nurse' ? '↑ RN' : '↓ PT'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 truncate">{t.text}</div>
                </div>
              ))}
              
              {rawDiagnosesData.length === 0 && rawQuestionsData.length === 0 && logs.length === 0 && transcript.length === 0 && (
                <p className="p-4 text-gray-500 text-sm">No data yet. Start a session to see debug info.</p>
              )}
            </div>
          </div>

          {/* Right Panel - Detail View */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedDebugItem ? (
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-sm px-2 py-1 rounded font-medium ${
                      selectedDebugItem.type === 'diagnosis' ? 'bg-emerald-100 text-emerald-700' :
                      selectedDebugItem.type === 'question' ? 'bg-purple-100 text-purple-700' :
                      selectedDebugItem.type === 'log' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedDebugItem.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">Index: {selectedDebugItem.index}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Raw Data</h3>
                    <pre className="bg-gray-900 text-cyan-400 p-4 rounded text-xs overflow-auto max-h-[60vh] whitespace-pre-wrap font-mono">
                      {JSON.stringify(selectedDebugItem.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">Session Summary</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-emerald-600">{rawDiagnosesData.length}</div>
                      <div className="text-xs text-gray-500">Diagnoses</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">{rawQuestionsData.length}</div>
                      <div className="text-xs text-gray-500">Questions</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{transcript.length}</div>
                      <div className="text-xs text-gray-500">Transcript</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-amber-600">{logs.length}</div>
                      <div className="text-xs text-gray-500">Logs</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto p-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">All Data (JSON)</h3>
                  <pre className="bg-gray-900 text-purple-400 p-4 rounded text-xs overflow-auto whitespace-pre-wrap font-mono">
                    {JSON.stringify({ 
                      diagnoses: rawDiagnosesData, 
                      questions: rawQuestionsData,
                      transcript,
                      logs,
                      status: connectionStatus
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
