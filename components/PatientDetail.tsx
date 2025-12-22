import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, FileText, MessageSquare, 
  CheckCircle, ChevronRight, ChevronLeft, Download,
  Activity, Calendar, Phone, Briefcase, X, Maximize2,
  Image as ImageIcon, Smartphone, FileCheck, User,
  Stethoscope
} from 'lucide-react';
import { Patient, PatientStatus } from '../types';

// Enhanced Mock Data for Documents
const MOCK_DOCUMENTS = [
  {
    id: 1,
    title: 'Hematology (CBC)',
    type: 'report',
    source: 'Metro Detroit Urgent Care',
    date: '23 Oct 2023',
    hasStamp: true,
    color: 'text-blue-600',
    content: 'labs',
    image: '/images/lab1.png'
  },
  {
    id: 2,
    title: 'Blood Panel Results',
    type: 'report',
    source: 'Central Lab',
    date: '22 Oct 2023',
    hasStamp: true,
    color: 'text-blue-600',
    content: 'labs',
    image: '/images/lab2.png'
  },
  {
    id: 3,
    title: 'Urgent Care Referral',
    type: 'letter',
    source: 'Dr. A. Gupta',
    date: '21 Oct 2023',
    hasStamp: false,
    color: 'text-amber-600',
    content: 'text',
    image: '/images/referal_letter.png'
  },
  {
    id: 4,
    title: 'Appt. Confirmation',
    type: 'app',
    source: 'NHS App',
    date: '20 Oct 2023',
    hasStamp: false,
    color: 'text-sky-600',
    content: 'mobile',
    image: '/images/nhs_screenshot.png'
  },
  {
    id: 5,
    title: 'Abdominal Ultrasound',
    type: 'image',
    source: 'Radiology Dept',
    date: '19 Oct 2023',
    hasStamp: true,
    color: 'text-neutral-600',
    content: 'image',
    image: '/images/radiology.png'
  },
  {
    id: 6,
    title: 'Clinical History',
    type: 'letter',
    source: 'Midtown Primary',
    date: '18 Oct 2023',
    hasStamp: false,
    color: 'text-neutral-600',
    content: 'text',
    image: '/images/clinicnote1.png'
  },
  {
    id: 7,
    title: 'Follow-up Notes',
    type: 'letter',
    source: 'Midtown Primary',
    date: '15 Oct 2023',
    hasStamp: false,
    color: 'text-neutral-600',
    content: 'text',
    image: '/images/clinicnote2.png'
  }
];

// Helper Component for Document Thumbnails using actual images
const DocumentThumbnail = ({ doc }: { doc: typeof MOCK_DOCUMENTS[0] }) => {
  return (
    <div className="w-full h-full bg-white relative overflow-hidden select-none">
      <img 
        src={doc.image} 
        alt={doc.title}
        className="w-full h-full object-cover"
      />
      {/* Stamp */}
      {doc.hasStamp && (
        <div className="absolute bottom-2 right-2 w-8 h-8 border border-blue-200/50 rounded-full flex items-center justify-center rotate-[-12deg] opacity-50 bg-white/80">
           <div className="text-[3px] text-blue-300 font-bold uppercase">Verified</div>
        </div>
      )}
    </div>
  );
};

// Full Scale Document View with click-to-zoom
const FullDocumentView = ({ doc }: { doc: typeof MOCK_DOCUMENTS[0] }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging) return;
    if (isZoomed) {
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isZoomed) {
      setIsDragging(false);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isZoomed && e.buttons === 1) {
      setIsDragging(true);
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setTimeout(() => setIsDragging(false), 0);
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Image Container */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
      >
        <img
          src={doc.image}
          alt={doc.title}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
          style={{
            transform: `scale(${isZoomed ? 2.5 : 1}) translate(${position.x / 2.5}px, ${position.y / 2.5}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};

// Mock data generator
const getPatientDetails = (patient: Patient) => {
  return {
    occupation: 'Site Foreman',
    contact: '+44 7700 900555',
    lastVisit: '2023-10-24',
    tags: patient.diagnosis.split(' ').map(s => s.replace(/&/g, '').trim()).filter(s => s.length > 2),
    medicalHistory: [
      'Dental Abscess (Recent)',
      'Mild Hypertension (2019)',
      'Appendectomy (2010)'
    ],
    summary: `Mr. ${patient.lastName} is a ${patient.age}-year-old ${patient.gender.toLowerCase()} presenting with a history of ${patient.diagnosis.toLowerCase()}. History significant for recent dental abscess treated with Amoxicillin-Clavulanate and high-dose acetaminophen.`,
    dob: '1978-08-14'
  };
};

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack }) => {
  const details = getPatientDetails(patient);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // State for selected document (Lightbox)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedDoc = selectedIndex !== null ? MOCK_DOCUMENTS[selectedIndex] : null;

  const getStatusColor = (status: PatientStatus) => {
     switch (status) {
      case PatientStatus.Critical: return 'bg-red-50 text-red-700 border-red-200';
      case PatientStatus.Stable: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case PatientStatus.Recovering: return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null && selectedIndex < MOCK_DOCUMENTS.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev, closeLightbox]);

  return (
    <div className="min-h-screen bg-secondary/30 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Lightbox Modal */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={closeLightbox}
        >
          {/* Navigation Arrows (Floating) */}
          {selectedIndex !== null && selectedIndex > 0 && (
             <button 
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
             >
                <ChevronLeft size={48} strokeWidth={1} />
             </button>
          )}
          {selectedIndex !== null && selectedIndex < MOCK_DOCUMENTS.length - 1 && (
             <button 
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
             >
                <ChevronRight size={48} strokeWidth={1} />
             </button>
          )}

          {/* Modal Content Container */}
          <div 
            className="w-full h-full flex flex-col relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-transparent absolute top-0 left-0 right-0 z-50 pointer-events-none">
               <div onClick={e => e.stopPropagation()} className="flex items-center gap-4 pointer-events-auto bg-black/50 backdrop-blur-md p-2 pl-3 pr-4 rounded-full border border-white/10">
                  <div className={`p-2 rounded-full ${
                     selectedDoc.type === 'image' || selectedDoc.type === 'app' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/20 text-white'
                  }`}>
                    {selectedDoc.type === 'report' ? <FileText size={18} /> : 
                     selectedDoc.type === 'image' ? <ImageIcon size={18} /> :
                     selectedDoc.type === 'app' ? <Smartphone size={18} /> : <FileCheck size={18} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{selectedDoc.title}</h3>
                    <p className="text-xs text-white/60">{selectedDoc.date} • {selectedDoc.source}</p>
                  </div>
               </div>
               
               <div onClick={e => e.stopPropagation()} className="flex gap-2 pointer-events-auto">
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-full text-white/80 font-medium transition-colors text-sm border border-white/10 bg-black/50 backdrop-blur-md">
                     <Download size={16} /> <span className="hidden sm:inline">Download</span>
                  </button>
                  <button 
                    onClick={closeLightbox}
                    className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/60 transition-colors border border-white/10 bg-black/50 backdrop-blur-md"
                  >
                     <X size={24} />
                  </button>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-0 sm:p-4 md:p-12">
               <FullDocumentView doc={selectedDoc} />
            </div>
            
            {/* Footer Pagination Dot Indicator */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none">
               {MOCK_DOCUMENTS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all ${idx === selectedIndex ? 'bg-white scale-110' : 'bg-white/20'}`} 
                  />
               ))}
            </div>
          </div>
        </div>
      )}

      {/* 1. App Header */}
      <div className="bg-white border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="w-[90%] max-w-[1920px] mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-normal text-neutral-900 leading-none mb-1">
                {patient.lastName}, {patient.firstName} {patient.middleName}
              </h1>
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                 <span className="font-mono text-neutral-400">{patient.id}</span>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide border ${getStatusColor(patient.status)}`}>
            {patient.status}
          </div>
        </div>
      </div>

      <div className="w-[90%] max-w-[1920px] mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 2. LEFT COLUMN: Patient Context */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100">
                   <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Demographics</span>
                </div>
                <div className="p-4 space-y-4">
                   <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                         <User size={14} />
                         <span className="text-[10px] font-medium uppercase tracking-wider">Age / Gender</span>
                      </div>
                      <div className="text-sm font-medium text-neutral-900 ml-6">{patient.age}y {patient.gender}</div>
                   </div>
                  
                   <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                         <Briefcase size={14} />
                         <span className="text-[10px] font-medium uppercase tracking-wider">Occupation</span>
                      </div>
                      <div className="text-sm font-medium text-neutral-900 ml-6">{details.occupation}</div>
                   </div>
                   <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                         <Phone size={14} />
                         <span className="text-[10px] font-medium uppercase tracking-wider">Contact</span>
                      </div>
                      <div className="text-sm font-medium text-neutral-900 ml-6">{details.contact}</div>
                   </div>
                   <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                         <Calendar size={14} />
                         <span className="text-[10px] font-medium uppercase tracking-wider">Last Visit</span>
                      </div>
                      <div className="text-sm font-medium text-neutral-900 ml-6">{details.lastVisit}</div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100">
                   <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Medical History</span>
                </div>
                <ul className="p-4 space-y-3">
                   {details.medicalHistory.map((item, idx) => (
                     <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                       <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-1.5 shrink-0"></span>
                       {item}
                     </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* 3. CENTER COLUMN: Clinical Assessment */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 sm:p-8">
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 text-primary">
                   <Activity size={16} />
                   <span className="text-xs font-medium uppercase tracking-wide">Presenting Complaint</span>
                </div>
                <h2 className="text-2xl font-normal text-neutral-900 mb-3 tracking-tight">
                  {patient.diagnosis}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {details.tags.map((tag) => (
                    <span key={tag} className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-2 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-full"></div>
                <div className="pl-5 py-1">
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-2">Clinical Note & HPI</span>
                  <p className="text-neutral-800 leading-relaxed text-[18px] font-serif">
                    {details.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Gallery */}
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
               <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-white">
                  <div className="flex items-center gap-2">
                     <FileText size={20} className="text-primary" />
                     <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wide">Documents & Attachments</h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <span className="text-xs font-medium bg-neutral-100 text-neutral-500 px-3 py-1 rounded-full border border-neutral-200">7 Files</span>
                     <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                        <button 
                           onClick={() => scroll('left')}
                           className="p-1.5 hover:bg-neutral-50 text-neutral-500 border-r border-neutral-200 transition-colors"
                        >
                           <ChevronLeft size={16} />
                        </button>
                        <button 
                           onClick={() => scroll('right')}
                           className="p-1.5 hover:bg-neutral-50 text-neutral-500 transition-colors"
                        >
                           <ChevronRight size={16} />
                        </button>
                     </div>
                  </div>
               </div>
               
               <div className="bg-neutral-50/50 p-6">
                  <div 
                      ref={scrollContainerRef}
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                      {MOCK_DOCUMENTS.map((doc, index) => (
                        <div 
                          key={doc.id} 
                          onClick={() => setSelectedIndex(index)}
                          className="flex-shrink-0 w-44 group cursor-pointer perspective-1000"
                        >
                          {/* Document Container */}
                          <div className="aspect-[1/1.41] bg-white rounded-sm shadow-sm border border-neutral-200 relative overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/30">
                              
                              <DocumentThumbnail doc={doc} />

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/5 transition-colors flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-700 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200">
                                    <Maximize2 size={16} />
                                </div>
                              </div>
                          </div>
                          
                          <div className="mt-3 px-1 text-center">
                              <h4 className="text-xs font-medium text-neutral-700 truncate">{doc.title}</h4>
                              <p className="text-[10px] text-neutral-400 mt-0.5">{doc.date}</p>
                          </div>
                        </div>
                      ))}
                  </div>
               </div>
            </div>
          </div>

          {/* 4. RIGHT COLUMN: Pre-Consultation Card & Actions */}
          <div className="lg:col-span-3 flex flex-col gap-6 sticky top-24 h-fit">
             
            {/* Chat Entry Card */}
            <div
                className="group relative bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-neutral-300 transition-all flex flex-col"
            >
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white z-10">
                    <h2 className="text-base font-medium text-neutral-800 flex items-center">
                        <MessageSquare className="mr-2 text-neutral-400 group-hover:text-neutral-900 transition-colors" size={18} />
                        Pre-Consultation
                    </h2>
                    <div className="p-1.5 bg-neutral-50 rounded-full group-hover:bg-neutral-100 group-hover:text-neutral-900 transition-colors">
                        <ChevronRight size={18} className="text-neutral-400 group-hover:text-neutral-900" />
                    </div>
                </div>

                <div className="flex-grow bg-neutral-50/50 p-6 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                    <div className="space-y-4 filter blur-[1px] opacity-60 group-hover:blur-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out text-sm">
                        <div className="flex justify-end mb-2">
                            <div className="bg-white text-neutral-700 border border-neutral-200 rounded-2xl rounded-tr-none shadow-sm max-w-[95%] p-3 text-xs md:text-sm">
                                <p className="mb-3 font-medium">Done. I filled out the form.</p>
                                <div className="bg-neutral-50 rounded-xl p-3 text-neutral-800 shadow-sm border border-neutral-200">
                                    <div className="flex items-center gap-2 mb-3 border-b border-neutral-200 pb-2">
                                        <CheckCircle size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-medium uppercase text-neutral-500 tracking-wide">Intake Form Submitted</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <span className="block text-[9px] font-medium text-neutral-400 uppercase">Full Name</span>
                                            <span className="font-medium text-xs text-neutral-700">{patient.firstName} {patient.middleName} {patient.lastName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] font-medium text-neutral-400 uppercase">DOB</span>
                                            <span className="font-medium text-xs text-neutral-700">{details.dob}</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <span className="block text-[9px] font-medium text-neutral-400 uppercase mb-1">Chief Complaint</span>
                                        <div className="bg-neutral-100 text-neutral-900 border border-neutral-200 px-2 py-1.5 rounded-lg text-xs font-medium">
                                            {patient.diagnosis}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="bg-white border border-neutral-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm max-w-[90%] text-xs md:text-sm text-neutral-600">
                                <p>Thanks, {patient.firstName}. Your profile is updated...</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <button className="bg-white/90 backdrop-blur-sm border border-neutral-200 text-neutral-800 font-medium px-6 py-2.5 rounded-full shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 hover:bg-neutral-900 hover:text-white hover:border-neutral-900">
                            View Chat History <ArrowLeft size={16} className="rotate-180" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white border-t border-neutral-100 text-xs text-neutral-400 flex justify-between items-center">
                    <span>25 messages</span>
                    <span className="flex items-center text-emerald-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                        Completed
                    </span>
                </div>
            </div>

             {/* Separator */}
             <div className="border-t border-neutral-200"></div>

             {/* Action Button */}
             <button className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 active:scale-[0.98]">
                <Stethoscope size={20} />
                Start Assessment
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};