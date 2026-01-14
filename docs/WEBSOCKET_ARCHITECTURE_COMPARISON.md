# WebSocket Architecture Comparison

## Old Architecture (Dual Connection)

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         ClinicalSession Class                         │  │
│  │                                                        │  │
│  │  ┌──────────────────┐    ┌──────────────────┐       │  │
│  │  │ transcriberSocket│    │ simulationSocket │       │  │
│  │  └────────┬─────────┘    └────────┬─────────┘       │  │
│  │           │                       │                  │  │
│  │           │ Phase 1               │ Phase 2          │  │
│  │           │ (Initial Analysis)    │ (Voice Stream)   │  │
│  └───────────┼───────────────────────┼──────────────────┘  │
└─────────────┼───────────────────────┼─────────────────────┘
              │                       │
              │ wss://...             │ wss://...
              │ /ws/transcriber       │ /ws/simulation
              │                       │
┌─────────────┼───────────────────────┼─────────────────────┐
│             ▼                       ▼                      │
│  ┌──────────────────┐    ┌──────────────────┐            │
│  │   Transcriber    │    │   Simulation     │            │
│  │   Endpoint       │    │   Endpoint       │            │
│  │                  │    │                  │            │
│  │ • Chat           │    │ • Audio (PCM)    │            │
│  │ • Diagnosis      │    │                  │            │
│  │ • Questions      │    │                  │            │
│  │ • Education      │    │                  │            │
│  │ • Analytics      │    │                  │            │
│  │ • Checklist      │    │                  │            │
│  │ • Report         │    │                  │            │
│  │                  │    │                  │            │
│  │ Receives audio   │◄───┤ Sends audio      │            │
│  │ for transcription│    │                  │            │
│  └──────────────────┘    └──────────────────┘            │
│                                                           │
│                    Backend Server                         │
└───────────────────────────────────────────────────────────┘

Flow:
1. Connect to transcriber
2. Send patient data
3. Receive initial analysis (chat, diagnosis, questions, etc.)
4. When source='initial_analysis', trigger Phase 2
5. Connect to simulation
6. Receive audio chunks (Int16 PCM)
7. Play audio with Web Audio API
8. Relay audio back to transcriber for speech-to-text
```

## New Architecture (Single Connection)

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         ClinicalSession Class                         │  │
│  │                                                        │  │
│  │  ┌──────────────────┐                                │  │
│  │  │     socket       │                                │  │
│  │  └────────┬─────────┘                                │  │
│  │           │                                           │  │
│  │           │ Single Connection                        │  │
│  │           │ (All Data + Audio)                       │  │
│  └───────────┼──────────────────────────────────────────┘  │
└─────────────┼─────────────────────────────────────────────┘
              │
              │ wss://...
              │ /ws/simulation/audio
              │
┌─────────────┼─────────────────────────────────────────────┐
│             ▼                                              │
│  ┌──────────────────────────────────────────┐             │
│  │      Unified Simulation Endpoint         │             │
│  │                                           │             │
│  │ • Chat                                    │             │
│  │ • Diagnosis                               │             │
│  │ • Questions                               │             │
│  │ • Education                               │             │
│  │ • Analytics                               │             │
│  │ • Checklist                               │             │
│  │ • Report                                  │             │
│  │ • Audio (base64 MP3 with isFinal flag)   │             │
│  │                                           │             │
│  │ All processing happens server-side        │             │
│  │ No audio relay needed                     │             │
│  └──────────────────────────────────────────┘             │
│                                                           │
│                    Backend Server                         │
└───────────────────────────────────────────────────────────┘

Flow:
1. Connect to simulation/audio
2. Send patient data
3. Receive all data types through single connection
4. Accumulate audio chunks until isFinal=true
5. Create MP3 Blob and play with Audio element
6. Simple queue-based playback
```

## Comparison Table

| Aspect | Old (Dual) | New (Single) |
|--------|-----------|--------------|
| **Connections** | 2 WebSockets | 1 WebSocket |
| **Endpoints** | `/ws/transcriber` + `/ws/simulation` | `/ws/simulation/audio` |
| **Audio Format** | Int16 PCM (raw) | Base64 MP3 (compressed) |
| **Audio Playback** | Web Audio API (complex) | Audio element (simple) |
| **Audio Relay** | Yes (to transcriber) | No (server-side) |
| **Latency** | Lower (~50ms buffer) | Slightly higher (waits for isFinal) |
| **Complexity** | High | Low |
| **Phase Management** | Yes (2 phases) | No (single phase) |
| **Code Lines** | ~250 lines | ~180 lines |
| **Debugging** | Complex (2 streams) | Simple (1 stream) |
| **Reliability** | More failure points | Fewer failure points |
| **Backend Load** | Distributed | Centralized |

## Audio Processing Comparison

### Old Method (Web Audio API)
```typescript
// Convert Int16 PCM to Float32
const int16 = new Int16Array(buffer);
const float32 = new Float32Array(int16.length);
for (let i = 0; i < int16.length; i++) {
  float32[i] = int16[i] / 32768.0;
}

// Create audio buffer
const audioBuf = audioContext.createBuffer(1, float32.length, 24000);
audioBuf.getChannelData(0).set(float32);

// Schedule playback
const source = audioContext.createBufferSource();
source.buffer = audioBuf;
source.connect(audioContext.destination);
source.start(scheduledPlayTime);

// Relay to transcriber
transcriberSocket.send(buffer);
```

### New Method (Blob-based)
```typescript
// Accumulate chunks
if (data.data) {
  const bytes = base64ToBuffer(data.data);
  currentAudioChunks.push(bytes);
}

// When complete, create blob and play
if (data.isFinal) {
  const blob = new Blob(currentAudioChunks, { type: 'audio/mp3' });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
}
```

## Migration Benefits

1. **Simplicity**: 70 fewer lines of code, easier to maintain
2. **Performance**: Backend optimized for single connection
3. **Reliability**: One connection = one failure point
4. **Debugging**: Single message stream in debug console
5. **Consistency**: Matches reference implementation exactly
6. **Server-side Processing**: Audio transcription handled by backend

## Trade-offs

- **Latency**: Slightly higher due to waiting for complete audio segments
- **Audio Quality**: MP3 compression vs raw PCM (negligible for voice)
- **Real-time Feel**: Less immediate but more stable

The trade-offs are minimal and worth it for the significant gains in simplicity and reliability.
