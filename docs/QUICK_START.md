# Quick Start Guide - Backend Integration

## ✅ What's Been Done

Your React frontend is now **fully integrated** with the backend WebSocket API. The integration follows the exact same pattern as your `test_bench2.html` test page.

## 🚀 How It Works

### 1. User Flow
```
1. User clicks on a patient card
2. User selects consultation type:
   - "New Patient" (30 minutes)
   - "Follow Up" (15 minutes)
3. WebSocket connection starts automatically
4. Backend performs initial analysis
5. Simulation starts streaming audio
6. Real-time data updates all tabs:
   - Chat: Live conversation transcript
   - Questions: Clinical questions pool
   - Diagnostic: Differential diagnoses
   - Patient Education: Education items to deliver
   - Checklist: Safety/compliance checks
   - Analytics: Performance metrics
   - Report: Final consultation report
```

### 2. Technical Flow
```
ConsultationPage
    ↓
ChatInterface (user selects consultation type)
    ↓
ClinicalSession.start()
    ↓
WebSocket connects to:
wss://clinic-hepa-v2-481780815788.europe-west1.run.app/ws/transcriber
    ↓
Sends: { type: "start", patient_id: "P-2024-001", gender: "Male" }
    ↓
Receives: chat, diagnosis, questions, education, analytics, checklist, report
    ↓
React components update in real-time
```

## 📁 Key Files

### Modified Files
1. **`services/websocket.ts`** - Complete WebSocket service (matches test_bench2.html)
2. **`components/ConsultationPage.tsx`** - Main orchestrator, manages session
3. **`components/ChatInterface.tsx`** - Real-time chat display
4. **`components/QuestionsInterface.tsx`** - Accepts backend questions
5. **`components/DiagnosticInterface.tsx`** - Accepts backend diagnoses
6. **`components/PatientEducationInterface.tsx`** - Accepts backend education items
7. **`components/AnalyticsInterface.tsx`** - Accepts backend analytics
8. **`components/ChecklistInterface.tsx`** - Accepts backend checklist

### New Files
1. **`WEBSOCKET_INTEGRATION.md`** - Detailed technical documentation
2. **`QUICK_START.md`** - This file

## 🧪 Testing

### 1. Start the Application
```bash
npm run dev
```

### 2. Test the Integration
1. Open the app in your browser
2. Click on a patient card (e.g., Marcus J. Thorne)
3. Click the microphone button in the Chat tab
4. Select "New Patient" or "Follow Up"
5. Watch the console for connection logs:
   ```
   [success] Transcriber connected - Initial Analysis Phase
   [info] Received 5 chat messages
   [info] Received 3 diagnoses
   [success] Initial analysis complete, starting simulation
   [success] Simulation connected - Streaming voice
   ```

### 3. Verify Data Flow
- **Chat Tab**: Messages appear in real-time
- **Questions Tab**: Questions populate from backend
- **Diagnostic Tab**: Diagnoses appear with confidence scores
- **Patient Education Tab**: Education items show up
- **Analytics Tab**: Performance metrics display
- **Top Bar**: Shows live progress (questions answered, education delivered)

## 🔍 Debugging

### Browser Console
Open DevTools Console to see:
- Connection status
- Data received
- Byte counter for audio relay
- Any errors

### What to Look For
✅ "Transcriber connected"
✅ "Simulation connected"
✅ "Received X chat messages"
✅ "Received X diagnoses"
✅ "Relayed X bytes total"

### Common Issues

**No connection:**
- Check network connectivity
- Verify WebSocket URL is accessible
- Check browser console for errors

**No audio:**
- Ensure you clicked something first (AudioContext requires user interaction)
- Check browser audio permissions

**No data updates:**
- Check if backend is sending data
- Verify message format matches expected types
- Check React DevTools for state updates

## 📊 Data Structure

### Backend Sends
```typescript
// Chat messages
{ type: 'chat', data: ChatMessage[], source: string }

// Diagnoses
{ type: 'diagnosis', diagnosis: Diagnosis[], source: string }

// Questions
{ type: 'questions', questions: Question[], source: string }

// Education
{ type: 'education', data: EducationItem[], source: string }

// Analytics
{ type: 'analytics', data: AnalyticsData, source: string }

// Checklist
{ type: 'checklist', data: ChecklistItem[], source: string }

// Audio (from simulation)
{ type: 'audio', data: string } // base64 encoded
```

### Frontend Receives
All data is automatically routed to the correct component via props.

## 🎯 Key Features

### 1. Staggered Handshake
- First connection: Transcriber (receives all data)
- Waits for `source: "initial_analysis"`
- Second connection: Simulation (streams audio)

### 2. Audio Synchronization
- Base64 audio decoded
- Played locally with timing sync
- Relayed to transcriber for processing

### 3. Real-time Updates
- All tabs update automatically
- No manual refresh needed
- State managed by React

### 4. Fallback Data
- Components work with mock data if no backend
- Seamless development experience

## 🔧 Configuration

### WebSocket URL
Located in `services/websocket.ts`:
```typescript
const WS_BASE_URL = 'wss://clinic-hepa-v2-481780815788.europe-west1.run.app';
```

### Patient Data
Located in `components/ConsultationPage.tsx`:
```typescript
const MOCK_PATIENT: Patient = {
  id: 'P-2024-001',
  firstName: 'Marcus',
  gender: 'Male',
  // ...
};
```

## 📝 Next Steps

### Recommended Enhancements
1. **Add reconnection logic** - Auto-reconnect on disconnect
2. **Add session controls** - Pause/resume/stop buttons
3. **Add visual indicators** - Connection status in UI
4. **Add error boundaries** - Graceful error handling
5. **Add data persistence** - Save session to localStorage
6. **Add export functionality** - Export consultation data

### Optional Features
- Recording indicator
- Byte counter display in UI
- Session timer
- Manual question marking
- Education item delivery tracking

## 🎉 Success Criteria

Your integration is working if:
- ✅ WebSocket connects after consultation type selection
- ✅ Console shows "Transcriber connected"
- ✅ Console shows "Simulation connected"
- ✅ Chat messages appear in real-time
- ✅ Questions populate in Questions tab
- ✅ Diagnoses appear in Diagnostic tab
- ✅ Audio plays (if backend sends it)
- ✅ Top bar shows live progress

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify WebSocket URL is correct
3. Test with `test_bench2.html` to confirm backend is working
4. Check network tab for WebSocket messages
5. Review `WEBSOCKET_INTEGRATION.md` for detailed technical info

---

**Status**: ✅ **READY FOR TESTING**

The frontend is fully integrated and ready to connect to your backend. Just start the app and select a consultation type to begin!
