# WebSocket Connection Update

## Overview
Updated the React frontend to use the new simplified WebSocket connection method that matches `simulation_test.html`. The backend has been optimized for better performance ("more snappy").

## Changes Made

### 1. Single WebSocket Connection
**Before:** Dual WebSocket approach
- `/ws/transcriber` - Initial analysis + transcription relay
- `/ws/simulation` - Voice audio streaming

**After:** Single WebSocket approach
- `/ws/simulation/audio` - All data and audio in one connection

### 2. Audio Processing Method
**Before:** Web Audio API with real-time PCM streaming
- Converted Int16 PCM → Float32
- Scheduled playback with AudioContext
- Relayed audio back to transcriber
- 50ms buffer for low latency

**After:** Blob-based audio playback (matching simulation_test.html)
- Accumulates base64 audio chunks
- Waits for `isFinal` flag
- Creates MP3 Blob URLs
- Queue-based sequential playback
- Simpler and more reliable

### 3. Message Handling
**Before:** Two-phase approach with source checking
- Initial analysis phase (transcriber only)
- Simulation phase (both connections)
- Checked `data.source === 'initial_analysis'` to trigger phase transition

**After:** Direct message handling
- All messages come through single connection
- No phase management needed
- Simpler switch statement for message types

### 4. Connection URL
```typescript
// Updated endpoint
const SIMULATION_URL = `${WS_BASE_URL}/ws/simulation/audio`;
```

## Benefits

1. **Simpler Architecture**: One connection instead of two
2. **Better Performance**: Backend optimized for this approach
3. **More Reliable**: Fewer connection points = fewer failure modes
4. **Easier Debugging**: Single message stream to monitor
5. **Consistent with Test Tool**: Matches `simulation_test.html` exactly

## Code Changes

### services/websocket.ts
- Removed `transcriberSocket` and `simulationSocket`
- Added single `socket` property
- Removed `startSimulation()` method
- Removed `handleTranscriberMessage()` and `handleSimulationMessage()`
- Added unified `handleMessage()` method
- Updated audio handling to use Blob-based approach
- Removed Web Audio API complexity
- Added `audioQueue` and `currentAudioChunks` for audio buffering

### components/ConsultationPage.tsx
- Updated status text from "Listening" to "Connected"
- Updated label from "Voice Active" to "Voice Simulation"

## Testing

To test the new connection:
1. Start the backend server
2. Navigate to a patient consultation page
3. Click the microphone to start consultation
4. Select consultation type (new/followup)
5. Verify audio playback works
6. Check debug console for message flow

## Backward Compatibility

This is a **breaking change** - the old dual-WebSocket approach will not work with the updated backend. Ensure your backend is running the latest version that supports `/ws/simulation/audio`.

## Related Files
- `services/websocket.ts` - Main WebSocket service
- `components/ConsultationPage.tsx` - UI updates
- `simulation_test.html` - Reference implementation
