import { Diagnosis, Question } from '../types';

// WebSocket endpoints - use wss:// for secure connections
const WS_BASE_URL = 'wss://clinic-hepa-v2-481780815788.europe-west1.run.app';
const TRANSCRIBER_URL = `${WS_BASE_URL}/ws/transcriber`;
const SIMULATION_URL = `${WS_BASE_URL}/ws/simulation`;

// Message types from backend
export interface AIUpdateMessage {
  type: 'ai_update';
  is_finished: boolean;
  [key: string]: unknown;
}

export interface DiagnosisMessage {
  type: 'diagnosis';
  diagnosis: Diagnosis[];
}

export interface QuestionsMessage {
  type: 'questions';
  questions: Question[];
}

export interface TranscriptMessage {
  type: 'transcript';
  speaker: 'Patient' | 'Nurse';
  text: string;
  timestamp?: string;
}

export type WebSocketMessage = AIUpdateMessage | DiagnosisMessage | QuestionsMessage | TranscriptMessage;

export interface SessionCallbacks {
  onDiagnoses?: (diagnoses: Diagnosis[]) => void;
  onQuestions?: (questions: Question[]) => void;
  onAIUpdate?: (update: AIUpdateMessage) => void;
  onTranscript?: (transcript: TranscriptMessage) => void;
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
  private isRunning: boolean = false;

  private static readonly SAMPLE_RATE = 24000;

  constructor(patientId: string, callbacks: SessionCallbacks) {
    this.patientId = patientId;
    this.callbacks = callbacks;
  }

  private log(message: string, type: 'info' | 'error' | 'success' = 'info') {
    this.callbacks.onLog?.(message, type);
    console.log(`[ClinicalSession] ${message}`);
  }

  private initAudio() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
      sampleRate: ClinicalSession.SAMPLE_RATE 
    });
    this.nextStartTime = this.audioContext.currentTime;
  }

  private playInt16Audio(buffer: ArrayBuffer) {
    if (!this.audioContext) return;
    
    const int16 = new Int16Array(buffer);
    const float32 = new Float32Array(int16.length);
    
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }
    
    const audioBuf = this.audioContext.createBuffer(1, float32.length, ClinicalSession.SAMPLE_RATE);
    audioBuf.getChannelData(0).set(float32);
    
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuf;
    source.connect(this.audioContext.destination);
    
    const start = Math.max(this.nextStartTime, this.audioContext.currentTime);
    source.start(start);
    this.nextStartTime = start + audioBuf.duration;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.log('Session already running', 'error');
      return;
    }

    this.isRunning = true;
    this.callbacks.onStatusChange?.('connecting');
    this.initAudio();

    return new Promise((resolve, reject) => {
      // Connect to transcriber WebSocket
      this.transcriberSocket = new WebSocket(TRANSCRIBER_URL);
      this.transcriberSocket.binaryType = 'arraybuffer';

      this.transcriberSocket.onopen = () => {
        this.log('Transcriber connected', 'success');
        this.callbacks.onStatusChange?.('connected');
        
        // Start session
        this.transcriberSocket?.send(JSON.stringify({ 
          type: 'start', 
          patient_id: this.patientId 
        }));
        
        // Start simulation after transcriber is ready
        this.startSimulation();
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
    this.simulationSocket = new WebSocket(SIMULATION_URL);
    this.simulationSocket.binaryType = 'arraybuffer';

    this.simulationSocket.onopen = () => {
      this.log('Simulation connected', 'success');
      this.simulationSocket?.send(JSON.stringify({ 
        type: 'start', 
        patient_id: this.patientId,
        gender: 'Male' // TODO: Get from patient data
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
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'ai_update':
          this.callbacks.onAIUpdate?.(data as AIUpdateMessage);
          if (data.is_finished) {
            this.log('Interview complete', 'success');
            this.callbacks.onSessionComplete?.();
          }
          break;
          
        case 'diagnosis':
          this.log(`Received ${data.diagnosis?.length || 0} diagnoses`);
          this.callbacks.onDiagnoses?.(data.diagnosis || []);
          break;
          
        case 'questions':
          this.log(`Received ${data.questions?.length || 0} questions`);
          this.callbacks.onQuestions?.(data.questions || []);
          break;
          
        case 'transcript':
          this.callbacks.onTranscript?.(data as TranscriptMessage);
          break;
          
        default:
          this.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      this.log(`Failed to parse message: ${error}`, 'error');
    }
  }

  private async handleSimulationMessage(event: MessageEvent) {
    // Handle binary audio data
    if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
      const buffer = event.data instanceof Blob 
        ? await event.data.arrayBuffer() 
        : event.data;
      
      this.playInt16Audio(buffer);
      
      // Forward audio to transcriber
      if (this.transcriberSocket?.readyState === WebSocket.OPEN) {
        this.transcriberSocket.send(buffer);
      }
      return;
    }

    // Handle JSON messages
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'audio' && data.data) {
        // Base64 encoded audio
        const binary = Uint8Array.from(atob(data.data), c => c.charCodeAt(0)).buffer;
        this.playInt16Audio(binary);
        
        if (this.transcriberSocket?.readyState === WebSocket.OPEN) {
          this.transcriberSocket.send(binary);
        }
        return;
      }

      // Log other messages
      this.log(`[Sim] ${data.type}: ${data.message || data.data || ''}`);
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
    this.log('Session stopped');
  }

  get running() {
    return this.isRunning;
  }
}
