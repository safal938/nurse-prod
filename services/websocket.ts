import { Diagnosis, Question, ChatMessage, EducationItem, AnalyticsData, ChecklistItem } from '../types';

// WebSocket endpoints - use wss:// for secure connections
const WS_BASE_URL = 'wss://clinic-hepa-v2-481780815788.europe-west1.run.app';
const TRANSCRIBER_URL = `${WS_BASE_URL}/ws/transcriber`;
const SIMULATION_URL = `${WS_BASE_URL}/ws/simulation`;

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
  private simulationSocket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private nextStartTime: number = 0;
  private callbacks: SessionCallbacks;
  private patientId: string;
  private gender: string;
  private isRunning: boolean = false;
  private bytesTotal: number = 0;

  private static readonly SAMPLE_RATE = 24000;

  constructor(patientId: string, gender: string, callbacks: SessionCallbacks) {
    this.patientId = patientId;
    this.gender = gender;
    this.callbacks = callbacks;
  }

  private log(message: string, type: 'info' | 'error' | 'success' = 'info') {
    this.callbacks.onLog?.(message, type);
    console.log(`[ClinicalSession] ${message}`);
  }

  private async initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: ClinicalSession.SAMPLE_RATE 
      });
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.nextStartTime = this.audioContext.currentTime;
  }

  private base64ToBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private playAndRelayAudio(buffer: ArrayBuffer) {
    if (!this.audioContext) return;
    
    const int16 = new Int16Array(buffer);
    const float32 = new Float32Array(int16.length);
    
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    
    const audioBuf = this.audioContext.createBuffer(1, float32.length, ClinicalSession.SAMPLE_RATE);
    audioBuf.getChannelData(0).set(float32);
    
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuf;
    source.connect(this.audioContext.destination);
    
    const now = this.audioContext.currentTime;
    if (this.nextStartTime < now) this.nextStartTime = now + 0.1;
    const scheduledPlayTime = this.nextStartTime;
    source.start(scheduledPlayTime);
    this.nextStartTime += audioBuf.duration;

    // Delayed relay to transcriber
    const delayMs = (scheduledPlayTime - now) * 1000;
    setTimeout(() => {
      if (this.transcriberSocket && this.transcriberSocket.readyState === WebSocket.OPEN) {
        this.transcriberSocket.send(buffer);
        this.bytesTotal += buffer.byteLength;
        this.log(`Relayed ${this.bytesTotal.toLocaleString()} bytes total`);
      }
    }, delayMs);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.log('Session already running', 'error');
      return;
    }

    this.isRunning = true;
    this.callbacks.onStatusChange?.('connecting');
    await this.initAudio();

    return new Promise((resolve, reject) => {
      // Connect to transcriber WebSocket (handles both transcription and simulation)
      this.transcriberSocket = new WebSocket(TRANSCRIBER_URL);
      this.transcriberSocket.binaryType = 'arraybuffer';

      this.transcriberSocket.onopen = () => {
        this.log('Transcriber connected - Initial Analysis Phase', 'success');
        this.callbacks.onStatusChange?.('connected');
        
        // Start session with patient data
        this.transcriberSocket?.send(JSON.stringify({ 
          type: 'start', 
          patient_id: this.patientId,
          gender: this.gender
        }));
        
        resolve();
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
    });
  }

  private startSimulation() {
    // Start simulation connection after initial analysis
    this.simulationSocket = new WebSocket(SIMULATION_URL);
    this.simulationSocket.binaryType = 'arraybuffer';

    this.simulationSocket.onopen = () => {
      this.log('Simulation connected - Streaming voice', 'success');
      this.simulationSocket?.send(JSON.stringify({ 
        type: 'start', 
        patient_id: this.patientId,
        gender: this.gender
      }));
    };

    this.simulationSocket.onmessage = async (event) => {
      await this.handleSimulationMessage(event);
    };

    this.simulationSocket.onerror = () => {
      this.log('Simulation error', 'error');
    };

    this.simulationSocket.onclose = () => {
      this.log('Simulation disconnected');
    };
  }

  private handleTranscriberMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;
      
      switch (data.type) {
        case 'chat':
          this.log(`Received ${data.data?.length || 0} chat messages`);
          this.callbacks.onChat?.(data.data || []);
          // Check if initial analysis is complete
          if (data.source === 'initial_analysis' && !this.simulationSocket) {
            this.log('Initial analysis complete, starting simulation');
            this.startSimulation();
          }
          break;
          
        case 'diagnosis':
          this.log(`Received ${data.diagnosis?.length || 0} diagnoses`);
          this.callbacks.onDiagnoses?.(data.diagnosis || []);
          if (data.source === 'initial_analysis' && !this.simulationSocket) {
            this.log('Initial analysis complete, starting simulation');
            this.startSimulation();
          }
          break;
          
        case 'questions':
          this.log(`Received ${data.questions?.length || 0} questions`);
          this.callbacks.onQuestions?.(data.questions || []);
          if (data.source === 'initial_analysis' && !this.simulationSocket) {
            this.log('Initial analysis complete, starting simulation');
            this.startSimulation();
          }
          break;

        case 'education':
          this.log(`Received ${data.data?.length || 0} education items`);
          this.callbacks.onEducation?.(data.data || []);
          if (data.source === 'initial_analysis' && !this.simulationSocket) {
            this.log('Initial analysis complete, starting simulation');
            this.startSimulation();
          }
          break;

        case 'analytics':
          this.log('Received analytics data');
          this.callbacks.onAnalytics?.(data.data);
          if (data.source === 'initial_analysis' && !this.simulationSocket) {
            this.log('Initial analysis complete, starting simulation');
            this.startSimulation();
          }
          break;

        case 'checklist':
          this.log(`Received ${data.data?.length || 0} checklist items`);
          this.callbacks.onChecklist?.(data.data || []);
          if (data.source === 'initial_analysis' && !this.simulationSocket) {
            this.log('Initial analysis complete, starting simulation');
            this.startSimulation();
          }
          break;

        case 'status':
          this.callbacks.onStatus?.(data.data);
          if (data.source === 'initial_analysis' && !this.simulationSocket) {
            this.log('Initial analysis complete, starting simulation');
            this.startSimulation();
          }
          break;

        case 'report':
          this.log('Received report data');
          this.callbacks.onReport?.(data.data);
          if (data.source === 'initial_analysis' && !this.simulationSocket) {
            this.log('Initial analysis complete, starting simulation');
            this.startSimulation();
          }
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

  private async handleSimulationMessage(event: MessageEvent) {
    // Handle JSON messages
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'audio' && data.data) {
        // Base64 encoded audio
        const buffer = this.base64ToBuffer(data.data);
        this.playAndRelayAudio(buffer);
        this.callbacks.onAudio?.(data.data);
        return;
      }

      // Log other messages
      this.log(`[Sim] ${data.type}`);
    } catch (error) {
      // Non-JSON message, ignore
    }
  }

  stop() {
    this.isRunning = false;
    
    if (this.transcriberSocket) {
      this.transcriberSocket.close();
      this.transcriberSocket = null;
    }
    
    if (this.simulationSocket) {
      this.simulationSocket.close();
      this.simulationSocket = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.callbacks.onStatusChange?.('disconnected');
    this.log('Session stopped', 'success');
  }

  get running() {
    return this.isRunning;
  }

  get totalBytesTransferred() {
    return this.bytesTotal;
  }
}
