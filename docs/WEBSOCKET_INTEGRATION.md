# WebSocket Backend Integration Guide

## Overview

The frontend is now fully integrated with the backend WebSocket API. The integration follows the same pattern as the `test_bench2.html` test page provided by your backend developer.

## Architecture

### WebSocket Connection Flow

```
User selects consultation type (New/Follow-up)
    ↓
ConsultationPage starts ClinicalSession
    ↓
ClinicalSession connects to wss://clinic-hepa-v2-481780815788.europe-west1.run.app/ws/transcriber
    ↓
Sends: { type: "start", patient_id: "P-2024-001", gender: "Male" }
    ↓
Backend performs initial analysis
    ↓
When source === "initial_analysis", starts simulation connection
    ↓
Simulation streams audio data (base64 encoded)
    ↓
Audio is played locally AND relayed to transcriber
    ↓
Backend sends real-time updates: chat, diagnosis, questions, education, analytics, checklist, report
    ↓
React components update in real-time
```

## Key Files Modified

### 1. `services/websocket.ts`
**Complete WebSocket service matching test_bench2.html behavior:**

- **ClinicalSession class**: Manages WebSocket connections
- **Dual connection pattern**: 
  - First connection: Transcriber (receives all data updates)
  - Second connection: Simulation (streams audio after initial analysis)
- **Audio handling**: Base64 decode → Play locally → Relay to transcriber with timing sync
- **Message routing**: Routes all backend message types to appropriate callbacks

**Key Features:**
- Staggered handshake (waits for `source: "initial_analysis"` before starting simulation)
- Audio synchronization with `nextStartTime` scheduling
- Byte counter for relay monitoring
- Proper cleanup on session end

### 2. `components/ConsultationPage.tsx`
**Main orchestrator component:**

- Creates `ClinicalSession` instance when consultation type is selected
- Manages all backend data states:
  - `chatMessages`: Real-time conversation
  - `diagnoses`: Differential diagnosis list
  - `questions`: Clinical questions pool
  - `educationItems`: Patient education content
  - `analytics`: Consultation performance metrics
  - `checklistItems`: Safety/compliance checklist
- Passes data down to child components as props
- Calculates dynamic analytics for top bar (questions answered, education delivered, etc.)

### 3. `components/ChatInterface.tsx`
**Real-time chat display:**

- Receives `chatMessages` prop from parent
- Displays Nurse messages (right, blue) and Patient messages (left, white)
- Highlights key medical terms from backend
- Shows listening indicator when session is active
- Triggers WebSocket connection via `onConsultationTypeSelected` callback

### 4. Other Interface Components
All updated to accept backend data as props with fallback to mock data:

- `QuestionsInterface`: `questions` prop
- `DiagnosticInterface`: `diagnoses` prop
- `PatientEducationInterface`: `educationItems` prop
- `AnalyticsInterface`: `analyticsData` prop
- `ChecklistInterface`: `checklistItems` prop

## Backend Message Types

The WebSocket receives these message types from the backend:

```typescript
// Chat messages
{
  type: 'chat',
  data: ChatMessage[],
  source: string
}

// Diagnosis updates
{
  type: 'diagnosis',
  diagnosis: Diagnosis[],
  source: string
}

// Question pool updates
{
  type: 'questions',
  questions: Question[],
  source: string
}

// Patient education items
{
  type: 'education',
  data: EducationItem[],
  source: string
}

// Consultation analytics
{
  type: 'analytics',
  data: AnalyticsData,
  source: string
}

// Safety checklist
{
  type: 'checklist',
  data: ChecklistItem[],
  source: string
}

// Status updates
{
  type: 'status',
  data: any,
  source: string
}

// Final report
{
  type: 'report',
  data: any,
  source: string
}

// Audio stream (from simulation)
{
  type: 'audio',
  data: string // base64 encoded PCM audio
}
```

## Usage Example

```typescript
// In ConsultationPage.tsx
const startClinicalSession = (patientId: string, gender: string) => {
  const session = new ClinicalSession(patientId, gender, {
    onChat: (messages) => setChatMessages(messages),
    onDiagnoses: (diagnoses) => setDiagnoses(diagnoses),
    onQuestions: (questions) => setQuestions(questions),
    onEducation: (items) => setEducationItems(items),
    onAnalytics: (data) => setAnalytics(data),
    onChecklist: (items) => setChecklistItems(items),
    onStatusChange: (status) => setIsSessionActive(status === 'connected'),
    onLog: (message, type) => console.log(`[${type}] ${message}`),
  });

  session.start();
};
```

## Testing

1. **Start the consultation:**
   - Click on a patient card
   - Select consultation type (New Patient or Follow-up)
   - WebSocket connection starts automatically

2. **Monitor the connection:**
   - Open browser console to see connection logs
   - Check for "Transcriber connected" and "Simulation connected" messages
   - Watch for incoming data updates

3. **Verify data flow:**
   - Chat messages appear in real-time
   - Questions populate in Questions tab
   - Diagnoses appear in Diagnostic tab
   - Education items show in Patient Education tab
   - Analytics update in Analytics tab

## Debugging

### Console Logs
The session logs all important events:
```
[success] Transcriber connected - Initial Analysis Phase
[info] Received 5 chat messages
[info] Received 3 diagnoses
[success] Initial analysis complete, starting simulation
[success] Simulation connected - Streaming voice
[info] Relayed 24,576 bytes total
```

### Common Issues

**1. WebSocket connection fails:**
- Check network connectivity
- Verify WebSocket URL is correct
- Check browser console for CORS errors

**2. No audio playback:**
- Ensure user has interacted with page (required for AudioContext)
- Check browser audio permissions
- Verify audio data is being received

**3. Data not updating:**
- Check if callbacks are properly set
- Verify message type matches expected format
- Check React state updates in DevTools

## Differences from test_bench2.html

The React implementation maintains the same core logic but with improvements:

1. **State Management**: Uses React hooks instead of DOM manipulation
2. **Component Architecture**: Data flows through props to child components
3. **Type Safety**: Full TypeScript typing for all messages and data structures
4. **Error Handling**: Proper error boundaries and fallback states
5. **Cleanup**: Automatic session cleanup on component unmount

## Next Steps

1. **Add error recovery**: Implement automatic reconnection on disconnect
2. **Add session persistence**: Save session state to localStorage
3. **Add manual controls**: Pause/resume/stop buttons for the session
4. **Add visual indicators**: Show connection status in UI
5. **Add data export**: Export consultation data to JSON/PDF

## Environment Variables

No environment variables needed - WebSocket URL is hardcoded to match test_bench2.html:
```
wss://clinic-hepa-v2-481780815788.europe-west1.run.app/ws/transcriber
```

If you need to change this, update `WS_BASE_URL` in `services/websocket.ts`.
