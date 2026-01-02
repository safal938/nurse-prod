# Project Structure

## Overview
This is a clinical consultation application focused on AI-powered voice consultations with real-time transcription, diagnosis, and clinical decision support.

## Main Application Route
**`/consultation/:patientId`** - The primary consultation interface

## Quick Start
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to see the patient list, then click any patient to start a consultation.

## Folder Structure

```
├── components/              # React components (active only)
│   ├── ConsultationPage.tsx           # Main consultation container
│   ├── ChatInterface.tsx              # Voice chat interface
│   ├── QuestionsInterface.tsx         # Clinical questions
│   ├── PatientEducationInterface.tsx  # Patient education
│   ├── DiagnosticInterface.tsx        # Diagnosis display
│   ├── ChecklistInterface.tsx         # Clinical checklist
│   ├── ReportInterface.tsx            # Report generation
│   ├── AnalyticsInterface.tsx         # Analytics dashboard
│   ├── PatientInfo.tsx                # Patient info display
│   ├── Header.tsx                     # App header
│   ├── PatientCard.tsx                # Patient list card
│   ├── Pagination.tsx                 # Pagination component
│   └── interaction/
│       └── QuestionCard.tsx           # Question card component
│
├── services/
│   └── websocket.ts         # WebSocket connection management
│
├── dataobjects/             # Data files
│   ├── patient_info_data.json
│   └── new_format/          # Current data format
│       ├── chat.json
│       ├── diagnosis.json
│       ├── analytics.json
│       ├── checklist.json
│       └── education.json
│
├── docs/                    # All documentation
│   ├── README.md                           # Documentation index
│   ├── QUICK_START.md                      # Getting started
│   ├── BACKEND_INTEGRATION.md              # Backend setup
│   ├── WEBSOCKET_INTEGRATION.md            # WebSocket guide
│   ├── VOICE_CONSULTATION_PERSISTENCE.md   # Voice features
│   ├── CODEBASE_CLEANUP_SUMMARY.md         # Recent cleanup
│   └── ... (more docs)
│
├── archive/                 # Archived code (preserved for reference)
│   ├── unused_components/   # Old/unused components
│   ├── sample_data/         # Sample data files
│   └── test_files/          # Test files
│
├── public/                  # Static assets
├── App.tsx                  # Main app component
├── index.tsx                # Entry point
├── types.ts                 # TypeScript types
└── constants.ts             # App constants
```

## Key Features

### 1. Voice Consultation
- Real-time voice interaction with AI
- Automatic transcription
- Persistent across tab navigation
- Global voice indicator

### 2. Clinical Decision Support
- AI-powered diagnosis suggestions
- Ranked clinical questions
- Patient education materials
- Safety checklist

### 3. Analytics & Reporting
- Consultation quality metrics
- Automated report generation
- Rich text editing

## Documentation
All documentation is in the `/docs` folder. Start with:
- [docs/README.md](docs/README.md) - Documentation index
- [docs/QUICK_START.md](docs/QUICK_START.md) - Getting started guide
- [docs/CODEBASE_CLEANUP_SUMMARY.md](docs/CODEBASE_CLEANUP_SUMMARY.md) - Recent changes

## Development

### Active Routes
- `/` - Patient list
- `/consultation/:patientId` - Consultation page (main feature)

### WebSocket Connection
The app connects to: `wss://clinic-hepa-v2-481780815788.europe-west1.run.app`

See [docs/WEBSOCKET_INTEGRATION.md](docs/WEBSOCKET_INTEGRATION.md) for details.

### Component Dependencies
```
ConsultationPage
├── PatientInfo
├── ChatInterface
├── QuestionsInterface
│   └── QuestionCard
├── PatientEducationInterface
├── DiagnosticInterface
├── ChecklistInterface
├── ReportInterface
└── AnalyticsInterface
```

## Archived Code
Old/unused components are preserved in `/archive` for reference:
- Old patient detail views
- Experimental interfaces
- Design showcase pages
- Debug components

These are not imported or used in the current application.

## Recent Changes
See [docs/CODEBASE_CLEANUP_SUMMARY.md](docs/CODEBASE_CLEANUP_SUMMARY.md) for details on the recent cleanup that:
- Moved all documentation to `/docs`
- Archived unused components
- Simplified routing to focus on consultation page
- Organized data files

## Contributing
When adding new features:
1. Keep components in `/components`
2. Update documentation in `/docs`
3. Follow existing patterns in ConsultationPage
4. Test with WebSocket connection
