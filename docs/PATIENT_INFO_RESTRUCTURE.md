# Patient Info Tab Restructure

## Overview
Restructured the Patient Info tab with a nurse-centric UX approach, prioritizing critical information and using visual hierarchy to guide the eye to what matters most.

## UX Design Philosophy

### Information Hierarchy (Nurse's Perspective)
1. **Critical Alerts First** - What needs immediate attention
2. **Chief Complaint** - Why the patient is here
3. **Clinical Findings** - Lab results and diagnosis
4. **Supporting Context** - History and background
5. **Reference Documents** - Full reports when needed

### Visual Design Principles
- **Minimal & Clean**: White backgrounds, subtle borders, no flashy colors
- **Strategic Highlighting**: Orange highlights (like ChatInterface) for key medical terms, values, and medications
- **Size Hierarchy**: Larger, bolder text for critical information
- **Spacing**: More padding and spacing for important sections
- **Scannable**: Bullet points, clear labels, consistent structure

## Changes Made

### 1. New Data Structure
Created three separate JSON files for better organization:

#### `dataobjects/patient_summary.json`
- **Chief Complaint**: Why the patient was taken in
- **Reason for Visit**: Main note for referral
- **Clinical Impression**: Working diagnosis
- **Presenting Symptoms**: List of current symptoms
- **Key Findings**: Important lab and imaging results
- **Timeline**: Chronological sequence of events
- **Alerts**: Critical clinical alerts

#### `dataobjects/referral_info.json`
- **Referral Details**: Who referred, when, urgency level
- **Clinical Context**: Summary of patient situation
- **Concerning Features**: Red flags that prompted referral
- **Actions Taken**: What the referring physician did
- **Questions for Specialist**: Specific consultation questions
- **Attached Documents**: Referral letter with description

#### `dataobjects/medical_history.json`
- **Patient Background**: Demographics, occupation, lifestyle
- **Past Medical History**: Previous conditions with relevance
- **Risk Factors**: Clinical risk factors
- **Medications**: Current, discontinued, and completed medications
- **Laboratory Findings**: Summarized lab results with interpretation
  - Hematology (CBC)
  - Liver Function Tests
  - Toxicology Screen
- **Imaging Studies**: Summarized imaging findings with interpretation
- **Previous Encounters**: Past visits with summaries
- **All Documents**: Complete list of uploaded documents

### 2. Visual Hierarchy Updates

#### Patient Summary Tab (Priority Order)
1. **Clinical Alerts** (Orange background, largest text)
   - Eosinophilia, Transaminitis, Jaundice highlighted
   - Immediate visual attention
   
2. **Chief Complaint** (Large heading, 2xl font)
   - Key symptoms highlighted in orange
   - Clear, scannable format
   
3. **Clinical Impression** (Bold, xl font)
   - Working diagnosis highlighted
   - Prominent placement
   
4. **Presenting Symptoms** (Base font, clear bullets)
   - Specific details highlighted
   
5. **Key Findings** (Base font)
   - Lab values and critical numbers highlighted
   
6. **Timeline** (Smaller, supporting info)
   - Medication names highlighted

#### Referral Letter Tab (Priority Order)
1. **Concerning Features** (Orange background)
   - Why this is urgent
   - Lab values highlighted
   
2. **Clinical Context** (Large paragraph)
   - Key terms highlighted (Augmentin, jaundice, etc.)
   
3. **Actions Already Taken**
   - What's been done
   - Medications and tests highlighted
   
4. **Questions for Specialist**
   - Medical terms highlighted
   
5. **Referral Details** (Grid layout)
   - Urgency highlighted
   
6. **Referral Letter Document**

#### Medical History Tab (Priority Order)
1. **Risk Factors** (Orange background, prominent)
   - Medications highlighted
   - Most critical for decision-making
   
2. **Laboratory Findings** (Largest section)
   - **Liver Function Tests FIRST** (most critical)
     - Larger heading (lg font)
     - Thicker border
     - All values highlighted
     - Interpretation in orange box
   - Hematology second
   - Toxicology third
   
3. **Imaging Studies**
   - Key findings highlighted
   
4. **Past Medical History**
   - Medications highlighted
   - Relevance clearly stated
   
5. **Previous Encounters**
   
6. **Document Gallery** (last, for reference)

### 3. Highlighting Strategy

Using the same orange highlight (`bg-orange-100`) as ChatInterface for:
- **Medical terms**: Augmentin, DILI, jaundice, pruritus, eosinophilia
- **Lab values**: ALT 620 U/L, >10x, >15x, critical
- **Medications**: Tylenol, Acetaminophen, Amoxicillin-Clavulanate
- **Key findings**: elevated, significantly, hepatic steatosis
- **Urgency indicators**: Urgent, critical

### 4. Typography Hierarchy

- **Critical Alerts**: text-base to text-lg, font-medium to font-bold
- **Section Headers**: text-xs, font-bold, uppercase, tracking-wider
- **Main Content**: text-2xl (chief complaint) → text-xl (impression) → text-lg (subsections) → text-base (details)
- **Supporting Text**: text-sm to text-xs
- **Labels**: text-xs, font-bold, uppercase

### 5. Color Strategy

- **Orange tint** (`orange-50/50` background, `orange-200/50` border): Critical sections
- **White**: Main content areas
- **Neutral grays**: Supporting text and borders
- **No bright colors**: Professional, clinical appearance

### 6. Spacing & Padding

- **Critical sections**: p-6 (more breathing room)
- **Standard sections**: p-5 to p-6
- **Inner content**: p-3 to p-4
- **Gaps**: space-y-5 (between major sections), space-y-3 (within sections)

## Key Benefits

1. **Nurse's Eye Flow**: Information arranged by clinical priority
2. **Quick Scanning**: Highlighted key terms catch the eye immediately
3. **No Image Review Needed**: All critical info extracted and summarized
4. **Context Included**: Interpretations and relevance provided
5. **Professional Appearance**: Clean, minimal, clinical aesthetic
6. **Consistent Highlighting**: Same visual language as chat interface

## Usage

The PatientInfo component now provides a nurse-optimized view where:
- Eyes go to alerts first (orange box at top)
- Chief complaint is immediately clear (large, bold)
- Critical lab values pop out (highlighted)
- Supporting details are accessible but not distracting
- Documents are one click away when needed

Each tab follows the same principle: **Most critical information first, largest and most prominent, with strategic highlighting of key medical terms and values.**
