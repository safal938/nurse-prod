# Audio-Transcript Synchronization

## Problem

When audio segments are long, the transcript text was appearing before the audio finished playing. For example:

**Audio playing:** "I appreciate you letting me know about those symptoms..."
**Transcript shows:** "I appreciate you letting me know about those symptoms. The yellowing of your eyes and skin, called jaundice, and the severe itching, can sometimes be signs of liver issues. Can you tell me when you first started noticing the yellowing and itching after you finished the Augmentin?"

This breaks the illusion of real-time transcription because users see text that hasn't been spoken yet.

## Solution

Implemented a queuing system that delays displaying chat messages until their corresponding audio segment finishes playing.

### How It Works

1. **Audio Playback Tracking**: Track when audio is currently playing with `isPlayingAudio` flag
2. **Message Queuing**: When chat messages arrive while audio is playing, store them in `pendingChatMessages`
3. **Delayed Display**: When audio finishes (`audio.onended`), display the queued messages
4. **Immediate Display**: If no audio is playing, display messages immediately

### Implementation Details

```typescript
// Track audio playback state
private isPlayingAudio: boolean = false;
private currentAudioElement: HTMLAudioElement | null = null;
private pendingChatMessages: ChatMessage[] = [];

// When chat messages arrive
case 'chat':
  const chatMessages = data.data || data.chat || data.messages || data.questions || [];
  
  if (this.isPlayingAudio) {
    // Queue messages to display after audio finishes
    this.pendingChatMessages = chatMessages;
  } else {
    // Display immediately if no audio playing
    this.callbacks.onChat?.(chatMessages);
  }
  break;

// When audio finishes playing
audio.onended = () => {
  // Display pending chat messages
  if (this.pendingChatMessages.length > 0) {
    this.callbacks.onChat?.(this.pendingChatMessages);
    this.pendingChatMessages = [];
  }
  
  this.playNextAudio(); // Continue with next audio segment
};
```

## User Experience

### Before Fix
```
[Audio starts playing]
[Transcript appears immediately with full text]
[Audio continues playing the rest]
❌ User sees text before hearing it
```

### After Fix
```
[Audio starts playing]
[User listens to audio]
[Audio finishes]
[Transcript appears with full text]
✅ User sees text after hearing it
```

## Edge Cases Handled

1. **No Audio Playing**: Messages display immediately (no delay)
2. **Multiple Messages**: Only the latest message batch is queued (replaces previous pending)
3. **Session Stop**: Pending messages are cleared when session stops
4. **Audio Error**: If audio fails to play, messages still display (error handler triggers next audio)

## Benefits

1. **Natural Feel**: Transcript appears synchronized with audio completion
2. **Real-time Illusion**: Maintains the feeling of live transcription
3. **Better UX**: Users don't see "future" text before hearing it
4. **Smooth Flow**: Audio and text feel connected and synchronized

## Technical Notes

- Uses `HTMLAudioElement.onended` event for precise timing
- Stores reference to current audio element for cleanup
- Clears pending messages on session stop to prevent stale data
- Logs queue operations for debugging

## Testing

To test the synchronization:
1. Start a consultation
2. Observe that chat messages appear after audio segments finish
3. Check console logs for "queuing chat messages" and "displaying pending chat messages"
4. Verify no text appears before its audio completes

## Future Enhancements

Potential improvements:
- Word-by-word synchronization using audio timestamps
- Progressive text reveal as audio plays
- Visual indicator showing audio is playing before transcript appears
