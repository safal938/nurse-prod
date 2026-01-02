# Documentation

This folder contains all project documentation.

## Quick Links

### Getting Started
- [Quick Start Guide](QUICK_START.md) - Get up and running quickly
- [Architecture Diagram](ARCHITECTURE_DIAGRAM.md) - System architecture overview

### Integration & Backend
- [Backend Integration](BACKEND_INTEGRATION.md) - Backend API integration guide
- [WebSocket Integration](WEBSOCKET_INTEGRATION.md) - Real-time WebSocket setup
- [Integration Summary](INTEGRATION_SUMMARY.md) - Overall integration overview

### Features & Updates
- [Voice Consultation Persistence](VOICE_CONSULTATION_PERSISTENCE.md) - Latest voice consultation updates
- [Feature Updates](FEATURE_UPDATES.md) - Recent feature additions
- [Loading States Update](LOADING_STATES_UPDATE.md) - Loading state improvements
- [Routing Update](ROUTING_UPDATE.md) - Routing changes
- [Updates Summary](UPDATES_SUMMARY.md) - General updates
- [Final Updates Summary](FINAL_UPDATES_SUMMARY.md) - Final update notes

### Deployment & Maintenance
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [Codebase Cleanup Summary](CODEBASE_CLEANUP_SUMMARY.md) - Recent cleanup changes

### Design
- [Design System](DESIGN_SYSTEM.md) - UI/UX design guidelines

## Project Overview

This is a clinical consultation application with the following main features:

### Main Route: `/consultation/:patientId`
The primary feature is the consultation page which includes:
- **Voice Consultation** - Real-time voice interaction with AI
- **Chat Interface** - Conversation history and transcription
- **Questions** - Clinical questions to ask during consultation
- **Patient Education** - Educational materials for patients
- **Diagnostics** - AI-powered diagnosis suggestions
- **Checklist** - Clinical safety checklist
- **Analytics** - Consultation quality metrics
- **Report Generation** - Automated clinical reports

### Supporting Route: `/`
Patient list page for selecting patients to consult with.

## Technology Stack
- React + TypeScript
- WebSocket for real-time communication
- Tailwind CSS for styling
- Framer Motion for animations
- Quill for rich text editing

## File Organization
- `/components` - Active React components
- `/services` - WebSocket and API services
- `/dataobjects` - Data files and mock data
- `/archive` - Archived/unused code (preserved for reference)
- `/docs` - This documentation folder
