import React from 'react';
import { 
  User, Activity, Calendar, Clock, ChevronRight, MoreHorizontal, 
  AlertCircle, FileText, Hash, Shield, Tag, Clipboard, Share2, 
  MoreVertical, HeartPulse, Thermometer
} from 'lucide-react';
import { Patient, PatientStatus } from '../types';

// Mock patient for display
const DEMO_PATIENT: Patient = {
  id: 'P0001',
  firstName: 'Marcus',
  middleName: 'Mark Elias',
  lastName: 'Thorne',
  age: 46,
  gender: 'Male',
  diagnosis: 'Jaundice & Severe Itching',
  status: PatientStatus.Critical,
  lastUpdate: '2023-10-24'
};

const DEMO_PATIENT_STABLE: Patient = {
  ...DEMO_PATIENT,
  firstName: 'Sarah',
  lastName: 'Jenkins',
  status: PatientStatus.Stable,
  diagnosis: 'Migraine with Aura'
};

interface CardProps {
  patient: Patient;
}

// --- Variation 1: Modern Minimalist ---
const CardVariation1: React.FC<CardProps> = ({ patient }) => (
  <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all border border-neutral-100 cursor-pointer group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:bg-primary group-hover:text-white transition-colors">
          <User size={18} />
        </div>
        <div>
          <h3 className="font-bold text-neutral-900 leading-tight">
            {patient.firstName} {patient.lastName}
          </h3>
          <span className="text-xs text-neutral-500 font-medium">ID: {patient.id}</span>
        </div>
      </div>
      <div className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
        patient.status === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
      }`}>
        {patient.status}
      </div>
    </div>
    
    <div className="space-y-2 mb-5">
      <div className="flex items-start gap-2">
        <Activity size={16} className="text-neutral-400 mt-0.5" />
        <p className="text-sm font-medium text-neutral-700">{patient.diagnosis}</p>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-neutral-400" />
        <p className="text-sm text-neutral-500">{patient.age} Yrs, {patient.gender}</p>
      </div>
    </div>

    <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
      <span className="text-xs text-neutral-400">Updated {patient.lastUpdate}</span>
      <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform flex items-center">
        View Details <ChevronRight size={12} className="ml-1" />
      </span>
    </div>
  </div>
);

// --- Variation 2: Clinical Status (Triage) ---
const CardVariation2: React.FC<CardProps> = ({ patient }) => {
  const statusColor = patient.status === 'Critical' ? 'bg-red-500' : 'bg-emerald-500';
  const statusBg = patient.status === 'Critical' ? 'bg-red-50' : 'bg-emerald-50';
  const statusText = patient.status === 'Critical' ? 'text-red-700' : 'text-emerald-700';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden cursor-pointer hover:border-neutral-300 transition-colors flex">
      <div className={`w-1.5 ${statusColor} flex-shrink-0`} />
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
             <div className="flex items-baseline gap-2">
              <h3 className="text-lg font-bold text-neutral-900">
                {patient.lastName}, {patient.firstName}
              </h3>
              <span className="text-xs font-mono text-neutral-400">{patient.id}</span>
             </div>
             <p className="text-sm text-neutral-500">{patient.age} / {patient.gender === 'Male' ? 'M' : 'F'}</p>
          </div>
          <button className="text-neutral-300 hover:text-neutral-600">
            <MoreHorizontal size={20} />
          </button>
        </div>

        <div className={`mt-3 p-3 rounded-md ${statusBg} flex gap-3 items-start`}>
          <AlertCircle size={18} className={`${statusText} mt-0.5 flex-shrink-0`} />
          <div>
            <p className={`text-xs font-bold uppercase mb-0.5 ${statusText}`}>{patient.status}</p>
            <p className="text-sm font-medium text-neutral-900 leading-snug">{patient.diagnosis}</p>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-end text-xs text-neutral-400">
          <Calendar size={12} className="mr-1" /> {patient.lastUpdate}
        </div>
      </div>
    </div>
  );
};

// --- Variation 3: Structured Grid ---
const CardVariation3: React.FC<CardProps> = ({ patient }) => (
  <div className="bg-white border border-neutral-200 rounded-lg p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
    <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-neutral-400" />
        <span className="font-mono text-xs font-semibold text-neutral-500">{patient.id}</span>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
        patient.status === 'Critical' 
          ? 'bg-white border-red-200 text-red-600' 
          : 'bg-white border-green-200 text-green-600'
      }`}>
        {patient.status}
      </span>
    </div>
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-xl font-bold text-neutral-400">
          {patient.firstName[0]}{patient.lastName[0]}
        </div>
        <div>
          <h3 className="font-bold text-neutral-900">{patient.firstName} {patient.lastName}</h3>
          <p className="text-xs text-neutral-500">{patient.age} years • {patient.gender}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-[80px_1fr] text-sm gap-2">
          <span className="text-neutral-400">Diagnosis</span>
          <span className="font-medium text-neutral-800 truncate">{patient.diagnosis}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] text-sm gap-2">
          <span className="text-neutral-400">Updated</span>
          <span className="text-neutral-800">{patient.lastUpdate}</span>
        </div>
      </div>
    </div>
  </div>
);

// --- Variation 4: Soft SaaS ---
const CardVariation4: React.FC<CardProps> = ({ patient }) => (
  <div className="bg-white rounded-2xl p-1 border border-neutral-100 shadow-sm hover:shadow-lg transition-all cursor-pointer">
    <div className="bg-neutral-50 rounded-xl p-4 mb-2">
        <div className="flex justify-between items-start">
           <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-100 flex items-center justify-center shadow-sm text-neutral-700">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">{patient.firstName} {patient.lastName}</h3>
                <p className="text-xs text-neutral-500">{patient.gender}, {patient.age} yrs</p>
              </div>
           </div>
           <div className={`w-2 h-2 rounded-full mt-2 ${patient.status === 'Critical' ? 'bg-red-500' : 'bg-green-500'}`} />
        </div>
    </div>
    <div className="px-4 pb-4 pt-2">
      <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">Diagnosis</p>
      <p className="text-sm font-medium text-neutral-900 mb-4">{patient.diagnosis}</p>
      <div className="flex items-center gap-2">
         <div className={`px-2 py-1 rounded text-xs font-medium ${
            patient.status === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
         }`}>
            {patient.status}
         </div>
         <div className="flex-1 border-b border-dashed border-neutral-200"></div>
         <span className="text-xs text-neutral-400">{patient.id}</span>
      </div>
    </div>
  </div>
);

// --- Variation 5: Split Action ---
const CardVariation5: React.FC<CardProps> = ({ patient }) => (
  <div className="bg-white border border-neutral-200 rounded-lg hover:border-primary/50 transition-colors group cursor-pointer flex flex-col h-full">
    <div className="p-5 flex-1">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-mono text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded">{patient.id}</span>
        {patient.status === 'Critical' && (
             <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
             </span>
        )}
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-1">{patient.firstName} {patient.lastName}</h3>
      <p className="text-sm text-neutral-500 mb-4">{patient.diagnosis}</p>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-50 text-neutral-600 text-xs">
           <User size={12} className="mr-1" /> {patient.age} Yrs
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-50 text-neutral-600 text-xs">
           <Calendar size={12} className="mr-1" /> {patient.lastUpdate}
        </span>
      </div>
    </div>
    <div className="bg-neutral-50 p-3 border-t border-neutral-200 group-hover:bg-primary/5 transition-colors">
       <div className="w-full text-center text-sm font-medium text-neutral-600 group-hover:text-primary">
         Open Patient Record
       </div>
    </div>
  </div>
);

// --- Variation 6: The Medical File ---
// Focus: Skeuomorphic folder look, warmer tones
const CardVariation6: React.FC<CardProps> = ({ patient }) => (
  <div className="relative pt-6 cursor-pointer group">
     {/* Tab */}
     <div className="absolute top-0 left-0 w-32 h-8 bg-amber-100 rounded-t-lg border-t border-l border-r border-amber-200 flex items-center px-4">
        <span className="text-xs font-bold text-amber-800 tracking-wider">FILE {patient.id}</span>
     </div>
     {/* Main Card */}
     <div className="bg-amber-50/50 rounded-b-lg rounded-tr-lg border border-amber-200 p-5 shadow-sm relative z-10 group-hover:bg-amber-50 transition-colors">
        <div className="flex justify-between items-start mb-4">
           <div>
             <h3 className="font-serif text-lg font-bold text-neutral-900">{patient.lastName}, {patient.firstName}</h3>
             <p className="text-sm text-neutral-500 italic">{patient.diagnosis}</p>
           </div>
           {patient.status === 'Critical' && <AlertCircle className="text-red-500" size={20} />}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mt-4 border-t border-amber-200/50 pt-4">
           <div>
              <span className="block text-xs text-amber-800/60 uppercase">Age/Sex</span>
              <span className="font-medium text-neutral-800">{patient.age} / {patient.gender}</span>
           </div>
           <div>
              <span className="block text-xs text-amber-800/60 uppercase">Status</span>
              <span className="font-medium text-neutral-800">{patient.status}</span>
           </div>
        </div>
     </div>
  </div>
);

// --- Variation 7: Gradient Header ---
// Focus: Modern aesthetic, colored header
const CardVariation7: React.FC<CardProps> = ({ patient }) => {
  const isCritical = patient.status === 'Critical';
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:translate-y-[-2px] transition-transform">
       <div className={`h-16 p-4 flex justify-between items-center bg-gradient-to-r ${
          isCritical ? 'from-red-500 to-orange-500' : 'from-blue-500 to-cyan-500'
       }`}>
          <div className="text-white">
             <h3 className="font-bold text-lg leading-none">{patient.firstName} {patient.lastName}</h3>
             <span className="text-white/80 text-xs">{patient.id}</span>
          </div>
          <User className="text-white/20" size={32} />
       </div>
       <div className="p-4">
          <div className="mb-4">
             <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Diagnosis</span>
             <p className="font-medium text-neutral-800">{patient.diagnosis}</p>
          </div>
          <div className="flex items-center justify-between text-sm text-neutral-500">
             <span className="flex items-center gap-1"><Clock size={14}/> {patient.age} years</span>
             <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                isCritical ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
             }`}>{patient.status}</span>
          </div>
       </div>
    </div>
  );
};

// --- Variation 8: Metric Focused ---
// Focus: Big numbers for quick scanning
const CardVariation8: React.FC<CardProps> = ({ patient }) => (
  <div className="bg-white border border-neutral-200 rounded-xl p-5 cursor-pointer hover:border-primary transition-colors">
     <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-neutral-300"></div>
           <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Patient</span>
        </div>
        <MoreHorizontal size={16} className="text-neutral-300" />
     </div>
     
     <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-1">{patient.firstName} {patient.lastName}</h3>
        <p className="text-sm text-neutral-500">{patient.diagnosis}</p>
     </div>

     <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-4">
        <div className="text-center border-r border-neutral-100">
           <span className="block text-xs text-neutral-400 uppercase">Age</span>
           <span className="block text-lg font-bold text-neutral-800">{patient.age}</span>
        </div>
        <div className="text-center border-r border-neutral-100">
           <span className="block text-xs text-neutral-400 uppercase">Sex</span>
           <span className="block text-lg font-bold text-neutral-800">{patient.gender === 'Male' ? 'M' : 'F'}</span>
        </div>
        <div className="text-center">
           <span className="block text-xs text-neutral-400 uppercase">Stat</span>
           <span className={`block text-lg font-bold ${
              patient.status === 'Critical' ? 'text-red-500' : 'text-green-500'
           }`}>{patient.status === 'Critical' ? 'CRIT' : 'STBL'}</span>
        </div>
     </div>
  </div>
);

// --- Variation 9: ID Badge ---
// Focus: Visual metaphor of an ID card
const CardVariation9: React.FC<CardProps> = ({ patient }) => (
  <div className="relative bg-white rounded-lg shadow-sm border border-neutral-200 p-0 overflow-hidden cursor-pointer group hover:shadow-md transition-shadow text-center">
     {/* Lanyard Hole */}
     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-neutral-100 rounded-full border border-neutral-200"></div>
     
     <div className="bg-neutral-50 pt-8 pb-4 border-b border-neutral-100">
        <div className="w-16 h-16 mx-auto bg-white rounded-full border-2 border-white shadow-sm flex items-center justify-center text-neutral-300 mb-3">
           <User size={32} />
        </div>
        <h3 className="font-bold text-neutral-900">{patient.firstName} {patient.lastName}</h3>
        <span className="inline-block mt-1 px-2 py-0.5 bg-neutral-200 text-neutral-600 text-[10px] font-mono rounded">{patient.id}</span>
     </div>
     
     <div className="p-4 text-left">
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
           <Activity size={14} className="text-primary" />
           <span className="truncate">{patient.diagnosis}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
           <Shield size={14} className={patient.status === 'Critical' ? 'text-red-500' : 'text-green-500'} />
           <span>{patient.status}</span>
        </div>
     </div>
     <div className="h-1 w-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
  </div>
);

// --- Variation 10: Contextual Alert ---
// Focus: Entire card changes color based on status
const CardVariation10: React.FC<CardProps> = ({ patient }) => {
  const isCritical = patient.status === 'Critical';
  const baseClasses = isCritical 
     ? 'bg-red-50 border-red-200 hover:border-red-300' 
     : 'bg-white border-neutral-200 hover:border-neutral-300';
  
  return (
    <div className={`rounded-lg border p-5 cursor-pointer transition-colors ${baseClasses}`}>
       <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100 text-red-600' : 'bg-neutral-100 text-neutral-600'}`}>
                {isCritical ? <HeartPulse size={20} /> : <User size={20} />}
             </div>
             <div>
                <h3 className={`font-bold ${isCritical ? 'text-red-900' : 'text-neutral-900'}`}>
                   {patient.lastName}, {patient.firstName}
                </h3>
                <p className={`text-xs ${isCritical ? 'text-red-700' : 'text-neutral-500'}`}>
                   Admitted: {patient.lastUpdate}
                </p>
             </div>
          </div>
       </div>
       
       <div className={`p-3 rounded ${isCritical ? 'bg-white/60' : 'bg-neutral-50'}`}>
          <p className={`text-sm font-medium ${isCritical ? 'text-red-800' : 'text-neutral-700'}`}>
             {patient.diagnosis}
          </p>
       </div>
       
       {isCritical && (
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wide">
             <AlertCircle size={12} /> Critical Attention Needed
          </div>
       )}
    </div>
  );
};

// --- Variation 11: Technical Receipt ---
// Focus: Monospaced, dashed lines, data-heavy
const CardVariation11: React.FC<CardProps> = ({ patient }) => (
  <div className="bg-white border border-neutral-300 p-0 font-mono text-sm cursor-pointer hover:shadow-lg transition-shadow">
     <div className="bg-neutral-100 p-2 border-b border-neutral-300 flex justify-between">
        <span>PATIENT_REC</span>
        <span>#{patient.id}</span>
     </div>
     <div className="p-4 space-y-3">
        <div className="flex justify-between">
           <span className="text-neutral-500">NAME:</span>
           <span className="font-bold">{patient.lastName.toUpperCase()}, {patient.firstName.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
           <span className="text-neutral-500">AGE/SEX:</span>
           <span>{patient.age}/{patient.gender.charAt(0)}</span>
        </div>
        <div className="border-b border-dashed border-neutral-300 my-2"></div>
        <div className="block">
           <span className="text-neutral-500 block mb-1">DIAGNOSIS:</span>
           <span className="block font-bold">{patient.diagnosis}</span>
        </div>
        <div className="block">
           <span className="text-neutral-500 block mb-1">STATUS:</span>
           <span className={`inline-block px-1 border ${
              patient.status === 'Critical' ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'
           }`}>[{patient.status.toUpperCase()}]</span>
        </div>
     </div>
  </div>
);

// --- Variation 12: Left Sidebar ---
// Focus: Vertical sidebar for metadata
const CardVariation12: React.FC<CardProps> = ({ patient }) => (
  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden flex h-40 cursor-pointer hover:shadow-md transition-shadow">
     {/* Sidebar */}
     <div className={`w-14 flex flex-col items-center justify-between py-4 ${
        patient.status === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-neutral-50 text-neutral-500'
     }`}>
        <User size={18} />
        <span className="vertical-rl transform rotate-180 text-xs font-bold tracking-widest uppercase opacity-70">
           {patient.status}
        </span>
     </div>
     
     {/* Main Content */}
     <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
           <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg text-neutral-900">{patient.firstName} {patient.lastName}</h3>
              <span className="text-xs text-neutral-400">{patient.id}</span>
           </div>
           <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{patient.diagnosis}</p>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-neutral-500">
           <span className="flex items-center gap-1"><Calendar size={12}/> {patient.lastUpdate}</span>
           <span className="flex items-center gap-1"><Tag size={12}/> {patient.age} Yrs</span>
        </div>
     </div>
  </div>
);

// --- Variation 13: Modern Depth (Redesigned) ---
// Focus: No floating avatar, cleaner layout, includes Age
const CardVariation13: React.FC<CardProps> = ({ patient }) => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 cursor-pointer hover:border-primary transition-all hover:shadow-md group">
     <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
            {/* Avatar inside */}
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
               <span className="font-bold text-lg">{patient.firstName[0]}{patient.lastName[0]}</span>
            </div>
            <div>
                <h3 className="font-bold text-lg text-neutral-900 leading-tight">{patient.firstName} {patient.lastName}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{patient.id}</span>
                    <span className="text-xs text-neutral-500 font-medium">{patient.age} Yrs • {patient.gender}</span>
                </div>
            </div>
        </div>
        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
           patient.status === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
            {patient.status}
        </div>
     </div>
     
     <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-700 mb-4 border border-neutral-100">
        <span className="text-xs text-neutral-400 uppercase font-bold block mb-1">Chief Complaint</span>
        <p className="line-clamp-2 font-medium">{patient.diagnosis}</p>
     </div>
     
     <div className="flex justify-between items-center text-xs text-neutral-400 border-t border-neutral-50 pt-3">
        <span>Updated {patient.lastUpdate}</span>
        <ChevronRight size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0"/>
     </div>
  </div>
);

// --- Variation 14: Horizontal Compact ---
// Focus: Row layout, fits many on a page
const CardVariation14: React.FC<CardProps> = ({ patient }) => (
  <div className="bg-white rounded-lg border border-neutral-200 p-3 hover:border-primary transition-colors cursor-pointer flex items-center gap-4 shadow-sm">
     <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 flex-shrink-0">
        <User size={18} />
     </div>
     
     <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
           <h3 className="font-bold text-sm text-neutral-900 truncate">{patient.lastName}, {patient.firstName}</h3>
           <span className="text-[10px] text-neutral-400 ml-2">{patient.id}</span>
        </div>
        <p className="text-xs text-neutral-500 truncate">{patient.diagnosis}</p>
     </div>
     
     <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
        patient.status === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
     }`}>
        {patient.status}
     </div>
  </div>
);

// --- Variation 15: Glass/Frost (Simulated) ---
// Focus: Airy, light, subtle borders
const CardVariation15: React.FC<CardProps> = ({ patient }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
     <div className="flex items-start justify-between mb-4">
        <div>
           <span className="text-xs font-bold text-primary tracking-wider uppercase mb-1 block">Patient Record</span>
           <h3 className="text-xl font-light text-neutral-900">{patient.firstName} <span className="font-bold">{patient.lastName}</span></h3>
        </div>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
           <Share2 size={14} className="text-neutral-500" />
        </div>
     </div>
     
     <div className="space-y-3">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <Activity size={16} />
           </div>
           <div>
              <p className="text-xs text-neutral-400">Diagnosis</p>
              <p className="text-sm font-medium text-neutral-800">{patient.diagnosis}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
              <Thermometer size={16} />
           </div>
           <div>
              <p className="text-xs text-neutral-400">Status</p>
              <p className="text-sm font-medium text-neutral-800">{patient.status}</p>
           </div>
        </div>
     </div>
  </div>
);

export const CardShowcase: React.FC = () => {
  return (
    <div className="w-[90%] max-w-[1920px] mx-auto py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Card Design Variations</h1>
        <p className="text-neutral-600 max-w-2xl">
          Below are 15 different approaches to the patient card. 
          Each serves a slightly different priority (Status visibility, Data density, Aesthetics, etc).
        </p>
      </div>

      <div className="space-y-16 pb-20">
        {/* Row 1 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">1. Modern Minimalist</h2>
             <p className="text-sm text-neutral-500">Clean, airy, utilizes whitespace. Good for general dashboards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation1 patient={DEMO_PATIENT} />
            <CardVariation1 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 2 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">2. Clinical Triage (Accent Border)</h2>
             <p className="text-sm text-neutral-500">Left-border coding allows rapid scanning of critical patients. High contrast status area.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation2 patient={DEMO_PATIENT} />
            <CardVariation2 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 3 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">3. Structured Data Grid</h2>
             <p className="text-sm text-neutral-500">High information density. Separates header and body clearly. Good for "technical" feel.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation3 patient={DEMO_PATIENT} />
            <CardVariation3 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 4 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">4. Soft SaaS</h2>
             <p className="text-sm text-neutral-500">Rounded, friendly, approachable. Nested containers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation4 patient={DEMO_PATIENT} />
            <CardVariation4 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 5 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">5. Split Action</h2>
             <p className="text-sm text-neutral-500">Clear call-to-action area at the bottom. Good for touch targets.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation5 patient={DEMO_PATIENT} />
            <CardVariation5 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 6 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">6. The Medical File</h2>
             <p className="text-sm text-neutral-500">Skeuomorphic folder tab design with warmer tones.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation6 patient={DEMO_PATIENT} />
            <CardVariation6 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 7 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">7. Gradient Header</h2>
             <p className="text-sm text-neutral-500">Modern vibrant gradient headers for strong branding.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation7 patient={DEMO_PATIENT} />
            <CardVariation7 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 8 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">8. Metric Focused</h2>
             <p className="text-sm text-neutral-500">Emphasizes key metrics (Age, Sex, Status) with large typography.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation8 patient={DEMO_PATIENT} />
            <CardVariation8 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 9 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">9. ID Badge</h2>
             <p className="text-sm text-neutral-500">Mimics a physical ID badge with a centered layout.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation9 patient={DEMO_PATIENT} />
            <CardVariation9 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 10 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">10. Contextual Alert</h2>
             <p className="text-sm text-neutral-500">The entire card changes color state based on criticality.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation10 patient={DEMO_PATIENT} />
            <CardVariation10 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 11 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">11. Technical Receipt</h2>
             <p className="text-sm text-neutral-500">Monospaced font, dashed lines, looks like a printed report.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation11 patient={DEMO_PATIENT} />
            <CardVariation11 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 12 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">12. Left Sidebar</h2>
             <p className="text-sm text-neutral-500">Vertical orientation for status metadata.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation12 patient={DEMO_PATIENT} />
            <CardVariation12 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 13 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">13. Modern Depth (Internal Avatar)</h2>
             <p className="text-sm text-neutral-500">Updated design: Standard avatar placement with Age & Gender visibility.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation13 patient={DEMO_PATIENT} />
            <CardVariation13 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 14 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">14. Horizontal Compact</h2>
             <p className="text-sm text-neutral-500">High density row-style card.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardVariation14 patient={DEMO_PATIENT} />
            <CardVariation14 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

        {/* Row 15 */}
        <section>
          <div className="mb-4 border-b border-neutral-200 pb-2">
             <h2 className="text-xl font-bold text-neutral-900">15. Glass/Frost Simulated</h2>
             <p className="text-sm text-neutral-500">Light, clean, modern feel using subtle blurs and shadows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardVariation15 patient={DEMO_PATIENT} />
            <CardVariation15 patient={DEMO_PATIENT_STABLE} />
          </div>
        </section>

      </div>
    </div>
  );
};
