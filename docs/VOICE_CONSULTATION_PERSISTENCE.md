# Voice Consultation Persistence Update

## Problem
- Chat state was lost when switching between tabs (Chat → Questions → Chat)
- Voice consultation (microphone/listening) would stop when navigating away from Chat tab
- Backend WebSocket connection would continue but UI state was reset

## Solution

### 1. Lifted State to Parent Component
Moved chat-related state from `ChatInterface` to `ConsultationPage`:
- `hasStarted` - Tracks if consultation has begun
- `showConsultationModal` - Controls the New/Follow-up modal
- Chat messages are already managed at parent level via WebSocket

### 2. Made ChatInterface a Controlled Component
Updated `ChatInterface` to accept state as props:
- `hasStarted` - Passed from parent
- `showModal` - Passed from parent
- `onMicClick` - Callback to parent
- `onModalClose` - Callback to parent
- `isListening` - Derived from `isSessionActive && hasStarted`

### 3. Global Voice Indicator
Added a persistent microphone indicator in the top analytics bar:
- Shows on ALL tabs when voice consultation is active
- Displays "Listening" with animated pulse when active
- Visible status: "Voice Active" with connection state
- User can see voice is active even when viewing Questions, Education, etc.

## Benefits
✅ Chat history preserved when switching tabs
✅ Voice consultation remains active across all tabs
✅ Backend continues receiving audio regardless of active tab
✅ Clear visual feedback that voice is active system-wide
✅ No interruption to WebSocket connection

## Technical Details

### State Management Flow
```
ConsultationPage (Parent)
├── hasStarted: boolean
├── showConsultationModal: boolean
├── isSessionActive: boolean (from WebSocket)
└── chatMessages: ChatMessage[] (from WebSocket)
    ↓
ChatInterface (Child - Controlled)
├── Receives all state as props
├── Displays UI based on props
└── Calls parent callbacks for actions
```

### Voice Consultation Lifecycle
1. User clicks microphone → `onMicClick()` called
2. Parent shows modal → `showConsultationModal = true`
3. User selects type → `handleConsultationTypeSelected(type)`
4. Parent starts WebSocket → `startClinicalSession()`
5. Parent sets `hasStarted = true`
6. Voice indicator appears in top bar (visible on all tabs)
7. User can switch tabs freely - voice stays active

## Files Modified
- `components/ConsultationPage.tsx` - Added state management and voice indicator
- `components/ChatInterface.tsx` - Converted to controlled component
