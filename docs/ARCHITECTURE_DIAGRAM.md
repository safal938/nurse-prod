# Architecture Diagram - Backend Integration

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    ConsultationPage                           │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Top Analytics Bar                                      │  │  │
│  │  │  • Duration Timer  • Questions Progress                 │  │  │
│  │  │  • Education Progress  • Top Diagnosis                  │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────┬─────────────────────────────────────────────┐  │  │
│  │  │  Nav    │  Content Area (Active Tab)                  │  │  │
│  │  │  Tabs   │                                              │  │  │
│  │  │         │  • Patient Info                              │  │  │
│  │  │  [👤]   │  • Chat Interface ← WebSocket starts here   │  │  │
│  │  │  [💬]   │  • Questions Interface                       │  │  │
│  │  │  [❓]   │  • Patient Education                         │  │  │
│  │  │  [📚]   │  • Diagnostic Interface                      │  │  │
│  │  │  [🩺]   │  • Checklist Interface                       │  │  │
│  │  │  [✅]   │  • Analytics Interface                       │  │  │
│  │  │  [📊]   │  • Report Interface                          │  │  │
│  │  │  [📄]   │                                              │  │  │
│  │  └─────────┴─────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
                    React State Management
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      WEBSOCKET SERVICE                               │
│                   (services/websocket.ts)                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              ClinicalSession Class                            │  │
│  │                                                               │  │
│  │  State:                                                       │  │
│  │  • transcriberSocket: WebSocket                              │  │
│  │  • simulationSocket: WebSocket                               │  │
│  │  • audioContext: AudioContext                                │  │
│  │  • bytesTotal: number                                        │  │
│  │                                                               │  │
│  │  Methods:                                                     │  │
│  │  • start() - Initialize connections                          │  │
│  │  • stop() - Cleanup connections                              │  │
│  │  • handleTranscriberMessage() - Route data                   │  │
│  │  • handleSimulationMessage() - Process audio                 │  │
│  │  • playAndRelayAudio() - Play + relay audio                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
                    WebSocket Connections
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND API                                  │
│     wss://clinic-hepa-v2-481780815788.europe-west1.run.app          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /ws/transcriber (Connection 1)                              │  │
│  │  ────────────────────────────────────────────────────────    │  │
│  │  Receives:                                                    │  │
│  │  • Start command: { type: "start", patient_id, gender }      │  │
│  │  • Audio data (relayed from simulation)                      │  │
│  │                                                               │  │
│  │  Sends:                                                       │  │
│  │  • chat: ChatMessage[]                                       │  │
│  │  • diagnosis: Diagnosis[]                                    │  │
│  │  • questions: Question[]                                     │  │
│  │  • education: EducationItem[]                                │  │
│  │  • analytics: AnalyticsData                                  │  │
│  │  • checklist: ChecklistItem[]                                │  │
│  │  • status: any                                               │  │
│  │  • report: any                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /ws/transcriber (Connection 2 - Simulation)                 │  │
│  │  ────────────────────────────────────────────────────────────│  │
│  │  Receives:                                                    │  │
│  │  • Start command: { type: "start", patient_id, gender }      │  │
│  │                                                               │  │
│  │  Sends:                                                       │  │
│  │  • audio: { type: "audio", data: base64_string }            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Connection Sequence

```
┌──────────┐
│  User    │
│  Action  │
└────┬─────┘
     │
     │ 1. Clicks patient card
     │ 2. Selects consultation type
     │
     ▼
┌─────────────────────────────┐
│  ConsultationPage           │
│  handleConsultationType()   │
└────┬────────────────────────┘
     │
     │ 3. Creates ClinicalSession
     │
     ▼
┌─────────────────────────────┐
│  ClinicalSession            │
│  start()                    │
└────┬────────────────────────┘
     │
     │ 4. Connect to transcriber
     │
     ▼
┌─────────────────────────────┐
│  WebSocket 1                │
│  /ws/transcriber            │
└────┬────────────────────────┘
     │
     │ 5. Send start command
     │    { type: "start", patient_id, gender }
     │
     ▼
┌─────────────────────────────┐
│  Backend                    │
│  Initial Analysis           │
└────┬────────────────────────┘
     │
     │ 6. Send initial data
     │    { type: "chat", source: "initial_analysis", ... }
     │
     ▼
┌─────────────────────────────┐
│  ClinicalSession            │
│  handleTranscriberMessage() │
└────┬────────────────────────┘
     │
     │ 7. Detect initial_analysis complete
     │    Start simulation connection
     │
     ▼
┌─────────────────────────────┐
│  WebSocket 2                │
│  /ws/transcriber (sim)      │
└────┬────────────────────────┘
     │
     │ 8. Send start command
     │
     ▼
┌─────────────────────────────┐
│  Backend                    │
│  Simulation Stream          │
└────┬────────────────────────┘
     │
     │ 9. Stream audio data
     │    { type: "audio", data: base64 }
     │
     ▼
┌─────────────────────────────┐
│  ClinicalSession            │
│  handleSimulationMessage()  │
└────┬────────────────────────┘
     │
     │ 10. Decode base64 audio
     │
     ▼
┌─────────────────────────────┐
│  playAndRelayAudio()        │
│  • Play locally             │
│  • Relay to transcriber     │
└────┬────────────────────────┘
     │
     │ 11. Audio → AudioContext (play)
     │     Audio → WebSocket 1 (relay)
     │
     ▼
┌─────────────────────────────┐
│  Backend                    │
│  Process Audio              │
└────┬────────────────────────┘
     │
     │ 12. Send real-time updates
     │     • chat messages
     │     • diagnoses
     │     • questions
     │     • education
     │     • analytics
     │
     ▼
┌─────────────────────────────┐
│  React Components           │
│  Update UI                  │
└─────────────────────────────┘
```

## Data Flow

```
Backend Message → ClinicalSession → Callback → ConsultationPage State → Component Props → UI Update

Example: Chat Message Flow
──────────────────────────────

Backend:
{ type: "chat", data: [{ role: "Nurse", message: "Hello" }], source: "..." }
    ↓
ClinicalSession.handleTranscriberMessage()
    ↓
callbacks.onChat([{ role: "Nurse", message: "Hello" }])
    ↓
ConsultationPage.setChatMessages([...])
    ↓
<ChatInterface chatMessages={chatMessages} />
    ↓
UI displays: "Nurse: Hello"
```

## Audio Flow

```
Backend Simulation → Base64 Audio → Decode → Play + Relay → Backend Transcriber

Detailed:
────────

1. Backend sends:
   { type: "audio", data: "SGVsbG8gV29ybGQ=" }

2. ClinicalSession.handleSimulationMessage()
   • Detects audio message
   • Calls playAndRelayAudio()

3. playAndRelayAudio(buffer)
   • Decode base64 → ArrayBuffer
   • Convert Int16 → Float32
   • Create AudioBuffer
   • Schedule playback with timing sync
   • Relay to transcriber after delay

4. Audio plays through speakers
   AND
   Audio sent to transcriber for processing

5. Backend transcriber processes audio
   • Generates chat messages
   • Updates diagnoses
   • Updates questions
   • etc.
```

## Component Hierarchy

```
App
└── ConsultationPage
    ├── Header (Back button)
    ├── Analytics Bar
    │   ├── Duration Timer
    │   ├── Questions Progress
    │   ├── Education Progress
    │   └── Top Diagnosis
    ├── Navigation Sidebar
    └── Content Area
        ├── PatientInfo
        ├── ChatInterface ← WebSocket trigger
        │   ├── Consultation Type Modal
        │   ├── Microphone Button
        │   └── Message List
        ├── QuestionsInterface
        │   ├── Questions to Ask (66%)
        │   └── Questions Answered (33%)
        ├── PatientEducationInterface
        │   ├── Remaining Education (66%)
        │   └── Educated Content (33%)
        ├── DiagnosticInterface
        │   ├── Diagnosis List (40%)
        │   └── Detail View (60%)
        ├── ChecklistInterface
        │   └── Category Carousel
        ├── AnalyticsInterface
        │   ├── Overall Score
        │   ├── Metric Cards
        │   └── Key Insights
        └── ReportInterface
            └── Rich Text Editor
```

## State Management

```
ConsultationPage (Parent State)
├── chatMessages: ChatMessage[]
├── diagnoses: Diagnosis[]
├── questions: Question[]
├── educationItems: EducationItem[]
├── analytics: AnalyticsData | null
├── checklistItems: ChecklistItem[]
├── isSessionActive: boolean
└── sessionRef: ClinicalSession | null

Props Flow:
───────────
ConsultationPage
    ↓ chatMessages, isSessionActive
ChatInterface

ConsultationPage
    ↓ questions
QuestionsInterface

ConsultationPage
    ↓ diagnoses
DiagnosticInterface

ConsultationPage
    ↓ educationItems
PatientEducationInterface

ConsultationPage
    ↓ analyticsData
AnalyticsInterface

ConsultationPage
    ↓ checklistItems
ChecklistInterface
```

## Callback Flow

```
ClinicalSession Callbacks
─────────────────────────

onChat: (messages) => setChatMessages(messages)
onDiagnoses: (diagnoses) => setDiagnoses(diagnoses)
onQuestions: (questions) => setQuestions(questions)
onEducation: (items) => setEducationItems(items)
onAnalytics: (data) => setAnalytics(data)
onChecklist: (items) => setChecklistItems(items)
onStatusChange: (status) => setIsSessionActive(status === 'connected')
onLog: (message, type) => console.log(`[${type}] ${message}`)
```

## Error Handling

```
┌─────────────────────────────┐
│  WebSocket Error            │
└────┬────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│  ClinicalSession            │
│  • Log error                │
│  • Call onStatusChange      │
│  • Reject promise           │
└────┬────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│  ConsultationPage           │
│  • Update UI state          │
│  • Show error message       │
│  • Cleanup session          │
└─────────────────────────────┘
```

## Cleanup Flow

```
Component Unmount / Session Stop
    ↓
ConsultationPage.useEffect cleanup
    ↓
sessionRef.current.stop()
    ↓
ClinicalSession.stop()
    ↓
• Close transcriberSocket
• Close simulationSocket
• Close audioContext
• Set isRunning = false
• Call onStatusChange('disconnected')
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Unidirectional data flow
- ✅ Proper resource cleanup
- ✅ Type safety throughout
- ✅ Real-time updates
- ✅ Scalable component structure
