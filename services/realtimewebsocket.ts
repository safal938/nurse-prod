import { Diagnosis, Question, ChatMessage, EducationItem, AnalyticsData, ChecklistItem } from '../types';

// WebSocket endpoints - use wss:// for secure connections
const WS_BASE_URL = import.meta.env.VITE_WS_REALTIME_BASE_URL || 'https://clinic-hepa-v2-stable-481780815788.europe-west1.run.app';
const TRANSCRIBER_URL = `${WS_BASE_URL}/ws/transcriber`;

// Message types from backend
export interface ChatMessageData {
  type: 'chat';
  data: ChatMessage[];
  source: string;
}

export interface DiagnosisMessage {
  type: 'diagnosis';
  diagnosis: Diagnosis[];
  source: string;
}

export interface QuestionsMessage {
  type: 'questions';
  questions: Question[];
  source: string;
}

export interface EducationMessage {
  type: 'education';
  data: EducationItem[];
  source: string;
}

export interface AnalyticsMessage {
  type: 'analytics';
  data: AnalyticsData;
  source: string;
}

export interface ChecklistMessage {
  type: 'checklist';
  data: ChecklistItem[];
  source: string;
}

export interface StatusMessage {
  type: 'status';
  data: any;
  source: string;
}

export interface ReportMessage {
  type: 'report';
  data: any;
  source: string;
}

export interface AudioMessage {
  type: 'audio';
  data: string; // base64 encoded audio
}

export type WebSocketMessage = 
  | ChatMessageData 
  | DiagnosisMessage 
  | QuestionsMessage 
  | EducationMessage
  | AnalyticsMessage
  | ChecklistMessage
  | StatusMessage
  | ReportMessage
  | AudioMessage;

export interface SessionCallbacks {
  onChat?: (messages: ChatMessage[]) => void;
  onDiagnoses?: (diagnoses: Diagnosis[]) => void;
  onQuestions?: (questions: Question[]) => void;
  onEducation?: (items: EducationItem[]) => void;
  onAnalytics?: (analytics: AnalyticsData) => void;
  onChecklist?: (items: ChecklistItem[]) => void;
  onStatus?: (status: any) => void;
  onReport?: (report: any) => void;
  onAudio?: (audioData: string) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  onSessionComplete?: () => void;
  onLog?: (message: string, type?: 'info' | 'error' | 'success') => void;
}

export class ClinicalSession {
  private transcriberSocket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private callbacks: SessionCallbacks;
  private patientId: string;
  private gender: string;
  private isRunning: boolean = false;
  private bytesTotal: number = 0;
  
  // Microphone capture properties
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private microphoneSource: MediaStreamAudioSourceNode | null = null;

  private static readonly TARGET_SAMPLE_RATE = 24000;

  constructor(patientId: string, gender: string, callbacks: SessionCallbacks) {
    this.patientId = patientId;
    this.gender = gender;
    this.callbacks = callbacks;
  }

  private log(message: string, type: 'info' | 'error' | 'success' = 'info') {
    this.callbacks.onLog?.(message, type);
    console.log(`[ClinicalSession] ${message}`);
  }

  // Microphone audio processing methods
  private downsampleAndConvert(buffer: Float32Array, inputRate: number, outputRate: number): ArrayBuffer {
    if (outputRate === inputRate) {
      return this.convertFloatToInt16(buffer);
    }

    const sampleRateRatio = inputRate / outputRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }

      let resultSample = count > 0 ? accum / count : 0;
      resultSample = Math.max(-1, Math.min(1, resultSample));
      
      // Convert to Int16
      result[offsetResult] = resultSample < 0 ? resultSample * 0x8000 : resultSample * 0x7FFF;
      
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result.buffer;
  }

  private convertFloatToInt16(buffer: Float32Array): ArrayBuffer {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      let s = Math.max(-1, Math.min(1, buffer[i]));
      buf[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buf.buffer;
  }

  private async startMicrophoneCapture() {
    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser API not supported. Are you using HTTPS or Localhost?");
      }

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        } 
      });

      // Create audio context if not exists
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Fix for suspended audio contexts (common in Chrome)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create audio source from microphone
      this.microphoneSource = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Use ScriptProcessor to access raw PCM data
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.microphoneSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      // Process audio in real-time
      this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        if (!this.transcriberSocket || this.transcriberSocket.readyState !== WebSocket.OPEN) return;

        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0); // Float32 Array
        const currentRate = inputBuffer.sampleRate; // e.g., 48000

        // Convert Float32@48k -> Int16@24k
        const resampledInt16 = this.downsampleAndConvert(inputData, currentRate, ClinicalSession.TARGET_SAMPLE_RATE);
        
        // Send to transcriber
        this.transcriberSocket.send(resampledInt16);
        this.bytesTotal += resampledInt16.byteLength;
      };

      this.log('Microphone capture started', 'success');
    } catch (error: any) {
      let msg = error.message || error.name || "Unknown Error";
      
      if (error.name === 'NotAllowedError') msg = "Microphone Permission Denied.";
      if (error.name === 'NotFoundError') msg = "No Microphone Found.";

      this.log(`Microphone error: ${msg}`, 'error');
      throw new Error(msg);
    }
  }

  private stopMicrophoneCapture() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    
    if (this.microphoneSource) {
      this.microphoneSource.disconnect();
      this.microphoneSource = null;
    }
    
    this.log('Microphone capture stopped');
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.log('Session already running', 'error');
      return;
    }

    this.isRunning = true;
    this.callbacks.onStatusChange?.('connecting');

    return new Promise(async (resolve, reject) => {
      try {
        // Connect to transcriber WebSocket first
        this.transcriberSocket = new WebSocket(TRANSCRIBER_URL);
        this.transcriberSocket.binaryType = 'arraybuffer';

        this.transcriberSocket.onopen = async () => {
          this.log('Transcriber connected - Starting microphone', 'success');
          
          // Start session with patient data
          this.transcriberSocket?.send(JSON.stringify({ 
            type: 'start', 
            patient_id: this.patientId,
            gender: this.gender
          }));
          
          // Start microphone capture
          try {
            await this.startMicrophoneCapture();
            this.callbacks.onStatusChange?.('connected');
            resolve();
          } catch (micError) {
            this.log('Failed to start microphone', 'error');
            this.callbacks.onStatusChange?.('error');
            reject(micError);
          }
        };

        this.transcriberSocket.onmessage = (event) => {
          this.handleTranscriberMessage(event);
        };

        this.transcriberSocket.onerror = (error) => {
          this.log('Transcriber error', 'error');
          this.callbacks.onStatusChange?.('error');
          reject(error);
        };

        this.transcriberSocket.onclose = () => {
          this.log('Transcriber disconnected');
          if (this.isRunning) {
            this.callbacks.onStatusChange?.('disconnected');
          }
        };
      } catch (error) {
        this.log('Failed to start session', 'error');
        this.callbacks.onStatusChange?.('error');
        reject(error);
      }
    });
  }

  private handleTranscriberMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;
      
      switch (data.type) {
        case 'chat':
          this.log(`Received ${data.data?.length || 0} chat messages`);
          this.callbacks.onChat?.(data.data || []);
          break;
          
        case 'diagnosis':
          this.log(`Received ${data.diagnosis?.length || 0} diagnoses`);
          this.callbacks.onDiagnoses?.(data.diagnosis || []);
          break;
          
        case 'questions':
          this.log(`Received ${data.questions?.length || 0} questions`);
          this.callbacks.onQuestions?.(data.questions || []);
          break;

        case 'education':
          this.log(`Received ${data.data?.length || 0} education items`);
          this.callbacks.onEducation?.(data.data || []);
          break;

        case 'analytics':
          this.log('Received analytics data');
          this.callbacks.onAnalytics?.(data.data);
          break;

        case 'checklist':
          this.log(`Received ${data.data?.length || 0} checklist items`);
          this.callbacks.onChecklist?.(data.data || []);
          break;

        case 'status':
          this.callbacks.onStatus?.(data.data);
          break;

        case 'report':
          this.log('Received report data');
          this.callbacks.onReport?.(data.data);
          break;

        case 'audio':
          // Audio messages don't have source field, ignore
          break;
          
        default:
          this.log(`Unknown message type: ${(data as any).type}`);
      }
    } catch (error) {
      // Not JSON, might be audio data - ignore
    }
  }

  stop() {
    this.isRunning = false;
    
    // Stop microphone capture
    this.stopMicrophoneCapture();
    
    if (this.transcriberSocket) {
      this.transcriberSocket.close();
      this.transcriberSocket = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.callbacks.onStatusChange?.('disconnected');
    this.log('Session stopped', 'success');
  }

  finishConsultation() {
    if (this.transcriberSocket && this.transcriberSocket.readyState === WebSocket.OPEN) {
      this.transcriberSocket.send(JSON.stringify({ status: true }));
      this.log('Sent end session signal', 'success');
    }
    
    // Stop microphone but keep socket open for reports
    this.stopMicrophoneCapture();
    this.log('Consultation finished, waiting for report...');
  }

  get running() {
    return this.isRunning;
  }

  get totalBytesTransferred() {
    return this.bytesTotal;
  }
}
