# Chat Messages Fix

## Problem
Chat messages were being received from the backend but not displaying in the React app's ChatInterface component or debug console.

## Root Causes

### 1. Backend Field Name - ACTUAL ISSUE!
**The backend sends chat messages in `data.questions` field, not `data.data`!**

Looking at the console logs:
```javascript
[WebSocket] Received message: chat {type: 'chat', questions: Array(4)}
```

The backend is using `questions` as the field name for chat message arrays. This is confusing naming but we need to handle it.

### 2. Role Name Case Sensitivity
The backend sends role names that might be lowercase ('admin', 'patient') but the ChatInterface was doing a direct cast to 'Nurse' | 'Patient' without normalization.

### 3. Bug in simulation_test.html
The reference implementation had a copy-paste bug:
```javascript
case "chat":
    updatePanel("json-chat", "flash-chat", data.questions); // WRONG!
```
Should be:
```javascript
case "chat":
    updatePanel("json-chat", "flash-chat", data.data); // CORRECT
```

## Fixes Applied

### 1. services/websocket.ts
Added flexible field name handling (including the actual field name used by backend):
```typescript
case 'chat':
  // Backend sends chat in data.questions field (confusing naming!)
  const chatMessages = data.data || data.chat || data.messages || data.questions || [];
  this.log(`Received ${chatMessages.length} chat messages`);
  console.log('[WebSocket] Chat messages:', chatMessages);
  this.callbacks.onChat?.(chatMessages);
  break;
```

Also added comprehensive logging to see raw WebSocket messages:
```typescript
console.log('[WebSocket] Received message:', data.type, data);
```

### 2. components/ChatInterface.tsx
Added role normalization and better logging:
```typescript
useEffect(() => {
  console.log('[ChatInterface] External chat messages updated:', externalChatMessages);
  
  if (externalChatMessages.length > 0) {
    const formattedMessages = externalChatMessages.map((msg, idx) => {
      // Normalize role to capitalized format
      let sender: 'Nurse' | 'Patient' = 'Patient';
      if (msg.role === 'Nurse' || msg.role === 'admin') {
        sender = 'Nurse';
      } else if (msg.role === 'Patient' || msg.role === 'patient') {
        sender = 'Patient';
      }
      
      return {
        id: Date.now() + idx,
        text: msg.message || '',
        sender: sender,
        timestamp: new Date(),
        highlights: msg.highlights
      };
    });
    
    console.log('[ChatInterface] Formatted messages:', formattedMessages);
    setMessages(formattedMessages);
  }
}, [externalChatMessages]);
```

### 3. components/ConsultationPage.tsx
Enhanced logging in the callback:
```typescript
onChat: (messages) => {
  console.log('[ConsultationPage] Received chat messages:', messages);
  addDebugLog('chat', { count: messages.length, data: messages });
  setChatMessages(messages);
},
```

### 4. simulation_test.html
Fixed to handle the actual backend field name:
```javascript
case "chat":
    // Backend sends chat in data.questions field
    updatePanel("json-chat", "flash-chat", data.questions || data.data);
```

## Debugging Steps

With the new logging, you can now trace the chat message flow:

1. **WebSocket Level**: Check browser console for:
   ```
   [WebSocket] Received message: chat {...}
   [WebSocket] Chat messages: [...]
   ```

2. **ConsultationPage Level**: Check for:
   ```
   [ConsultationPage] Received chat messages: [...]
   ```

3. **ChatInterface Level**: Check for:
   ```
   [ChatInterface] External chat messages updated: [...]
   [ChatInterface] Formatted messages: [...]
   ```

4. **Debug Console**: Open the debug modal (Bug icon) and check the CHAT panel and EVENT LOG

## Testing

1. Start a consultation
2. Open browser console (F12)
3. Open debug modal in the app
4. Speak or wait for backend messages
5. Check console logs for the message flow
6. Verify messages appear in:
   - Browser console logs
   - Debug modal CHAT panel
   - ChatInterface component

## Expected Backend Message Format

**ACTUAL FORMAT** (discovered from console logs):
```json
{
  "type": "chat",
  "questions": [
    {
      "role": "Nurse" | "Patient" | "admin" | "patient",
      "message": "The message text",
      "highlights": ["keyword1", "keyword2"]
    }
  ]
}
```

Note: The backend uses `questions` as the field name for chat messages (confusing naming, but that's what it sends).

Alternative field names (`data`, `chat`, or `messages`) are also supported for flexibility.

## Role Mapping

| Backend Role | Display As |
|-------------|-----------|
| 'Nurse' | Nurse |
| 'admin' | Nurse |
| 'Patient' | Patient |
| 'patient' | Patient |
