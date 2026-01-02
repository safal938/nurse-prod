# Backend Integration Guide

This document describes how the frontend components now accept data from the backend JSON objects.

## Updated Components

All components have been updated to use the backend data structure:

1. **ChatInterface.tsx** - Uses backend chat messages
2. **DiagnosticInterface.tsx** - Uses backend diagnosis structure
3. **QuestionsInterface.tsx** - Uses backend question structure
4. **PatientEducationInterface.tsx** - Uses backend education structure
5. **EducationCardDesigns.tsx** - Updated all 10 design variants
6. **DiagnosisCard.tsx** - Updated to generate shortName from diagnosis text
7. **PageDesign.tsx** - Updated mock data to match backend structure
8. **InteractionViewExperimental.tsx** - Updated question mapping logic
9. **AnalyticsInterface.tsx** - NEW: Real-time consultation analytics dashboard

**Type Definitions:**
- Updated `types.ts` with all backend response types including Analytics data
- Added proper TypeScript interfaces matching your JSON structures

**Key Changes:**
- Removed fields not in backend (like `shortName` on Diagnosis, `id` on EducationItem)
- Matched field names exactly (`headline` vs `title`, `urgency` vs `priority`)
- Updated status logic to match backend conventions
- All components now work with the exact data structure your backend sends

## Data Object Mappings

### 1. Chat Interface (`components/ChatInterface.tsx`)
**Backend Source:** `dataobjects/chat_logic_loop_20251230_140643.json`

**Data Structure:**
```typescript
interface ChatMessage {
  role: 'Nurse' | 'Patient';
  message: string;
}

interface ChatResponse {
  type: 'chat';
  data: ChatMessage[];
  source: string;
}
```

**Usage:** The component now displays conversation messages with proper role-based styling (Nurse messages on right in blue, Patient messages on left in white).

---

### 2. Diagnostic Interface (`components/DiagnosticInterface.tsx`)
**Backend Source:** `dataobjects/diagnosis_logic_check_20251230_140640.json`

**Data Structure:**
```typescript
interface Diagnosis {
  did: string;
  diagnosis: string;
  indicators_point: string[];
  reasoning: string;
  followup_question: string;
  rank: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Low' | 'Very Low' | string;
}

interface DiagnosisResponse {
  type: 'diagnosis';
  diagnosis: Diagnosis[];
  source: string;
}
```

**Changes:**
- Removed `shortName` field (now generated from diagnosis text)
- Uses `rank` to determine primary vs secondary diagnoses
- Displays all fields from backend including severity levels

---

### 3. Questions Interface (`components/QuestionsInterface.tsx`)
**Backend Source:** `dataobjects/questions_logic_check_20251230_140640.json`

**Data Structure:**
```typescript
interface Question {
  qid: string;
  content: string;
  rank: number;
  status: 'asked' | null;
  answer: string | null;
  headline: string;
  domain: string;
  system_affected: string;
  clinical_intent: string;
  tags: string[];
}

interface QuestionsResponse {
  type: 'questions';
  questions: Question[];
  source: string;
}
```

**Changes:**
- Uses `headline` for display title (directly from backend)
- Uses `content` for question text
- Status logic: `status === 'asked' && answer !== null` = answered
- Urgent questions: `rank <= 2 && rank !== 999`
- Questions with `rank: 999` are treated as already asked/standard questions
- `QuestionCardData` interface now uses `headline` instead of `shortTitle` to match backend

---

### 4. Patient Education Interface (`components/PatientEducationInterface.tsx`)
**Backend Source:** `dataobjects/education_logic_check_20251230_140640.json`

**Data Structure:**
```typescript
interface EducationItem {
  headline: string;
  content: string;
  category: string;
  urgency: 'High' | 'Low' | string;
  context_reference: string;
  status: 'asked' | 'pending';
}

interface EducationResponse {
  type: 'education';
  data: EducationItem[];
  source: string;
}
```

**Changes:**
- Uses `headline` instead of `title`
- Uses `urgency` instead of `priority` ('High' vs 'Low' instead of 'high'/'medium'/'low')
- Uses `status` to determine if delivered ('asked') or pending
- Removed `id` and `deliveredAt` fields (not in backend)

---

### 5. Analytics Data (Not yet implemented in UI)
**Backend Source:** `dataobjects/analytics_logic_loop_20251230_140643.json`

**Data Structure:**
```typescript
interface AnalyticsMetric {
  score: number;
  reasoning: string;
  example_quote?: string;
  feedback?: string;
  turn_taking_ratio?: string;
}

interface AnalyticsData {
  overall_score: number;
  metrics: {
    empathy: AnalyticsMetric;
    clarity: AnalyticsMetric;
    information_gathering: AnalyticsMetric;
    patient_engagement: AnalyticsMetric;
  };
  key_strengths: string[];
  improvement_areas: string[];
  sentiment_trend: string;
}

interface AnalyticsResponse {
  type: 'analytics';
  data: AnalyticsData;
  source: string;
}
```

**Note:** This data structure is defined in `types.ts` but not yet used in any component. Can be used for performance analytics dashboard.

---

### 5. Analytics Data
**Backend Source:** `dataobjects/analytics_logic_loop_20251230_140643.json`

**Data Structure:**
```typescript
interface AnalyticsMetric {
  score: number;
  reasoning: string;
  example_quote?: string;
  feedback?: string;
  turn_taking_ratio?: string;
}

interface AnalyticsData {
  overall_score: number;
  metrics: {
    empathy: AnalyticsMetric;
    clarity: AnalyticsMetric;
    information_gathering: AnalyticsMetric;
    patient_engagement: AnalyticsMetric;
  };
  key_strengths: string[];
  improvement_areas: string[];
  sentiment_trend: string;
}

interface AnalyticsResponse {
  type: 'analytics';
  data: AnalyticsData;
  source: string;
}
```

**Features:**
- Real-time consultation performance metrics
- Circular progress indicators for each metric (Empathy, Clarity, Information Gathering, Patient Engagement)
- Color-coded scores (Green: 8-10, Amber: 6-7, Red: <6)
- Detailed reasoning for each metric
- Example quotes from conversation
- Actionable feedback
- Turn-taking ratio visualization
- Key strengths and improvement areas
- Sentiment trend tracking

**Usage:** The AnalyticsInterface component displays comprehensive consultation analytics with visual metrics and actionable insights for nurse performance improvement.

---

## Integration Notes

1. All type definitions are centralized in `types.ts`
2. Components now use the exact field names from backend JSON
3. Backend response wrappers include `type`, `data`/`diagnosis`/`questions`, and `source` fields
4. All components are ready to receive data via props or state management
5. No breaking changes to component APIs - they still work with mock data for development

## Next Steps for Full Integration

1. Create API service to fetch data from backend
2. Implement WebSocket connection for real-time updates
3. Add state management (Redux/Zustand) to handle backend data
4. Add loading and error states to components
5. Implement data refresh/polling mechanisms
