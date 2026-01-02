import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, ChevronRight, ChevronLeft, Maximize2,
  User, Briefcase, Phone, Calendar, Activity,
  ImageIcon, Smartphone, FileCheck, X, Download,
  MessageSquare, CheckCircle, ArrowLeft, Stethoscope,
  ZoomIn, Clock, Mail, AlertCircle, History, Paperclip
} from 'lucide-react';
import { Patient, ChatMessage } from '../types';
import patientInfoData from '../patient_info.json';

// Image component with fallback
const ImageWithFallback = ({ src, alt, onClick }: { src: string; alt: string; onClick?: () => void }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full bg-white flex flex-col items-center justify-center text-neutral-400 border border-neutral-200 rounded-xl p-4 text-center min-h-[120px]">
        <ImageIcon size={24} className="mb-2 opacity-50" />
        <span className="text-xs font-medium text-neutral-500">Image not found</span>
        <span className="text-[10px] font-mono mt-1 opacity-50 break-all select-all">{src}</span>
      </div>
    );
  }

  return (
    <div
      className="mt-2 rounded-xl overflow-hidden border border-black/5 cursor-pointer hover:opacity-90 transition-opacity bg-white min-h-[100px]"
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-contain max-h-72 bg-white"
        onError={() => setError(true)}
      />
    </div>
  );
};


// Helper Component for Document Thumbnails
const DocumentThumbnail = ({ doc }: { doc: typeof patientInfoData.documents[0] }) => {
  return (
    <div className="w-full h-full bg-white relative overflow-hidden select-none">
      <img 
        src={doc.image} 
        alt={doc.title}
        className="w-full h-full object-cover"
      />
      {doc.hasStamp && (
        <div className="absolute bottom-2 right-2 w-8 h-8 border border-blue-200/50 rounded-full flex items-center justify-center rotate-[-12deg] opacity-50 bg-white/80">
           <div className="text-[3px] text-blue-300 font-bold uppercase">Verified</div>
        </div>
      )}
    </div>
  );
};

// Full Scale Document View
const FullDocumentView = ({ doc }: { doc: typeof patientInfoData.documents[0] }) => {
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
  const profile = patientInfoData.patientProfile;
  const clinical = patientInfoData.clinicalSummary;
  const encounter = patientInfoData.encounterDetails;
  
  return {
    occupation: profile.occupation,
    contact: profile.contact.phone,
    lastVisit: encounter.lastEncounterDate,
    tags: clinical.chiefComplaint.split(' ').map(s => s.replace(/[()&.,]/g, '').trim()).filter(s => s.length > 2),
    medicalHistory: clinical.riskFactors,
    summary: clinical.hpiSummary,
    dob: profile.dob,
    referral: {
      referredBy: encounter.referralSource,
      previousProvider: encounter.consultant,
      referralDate: encounter.referralDate
    },
    preConsultation: {
      messageCount: 25,
      status: encounter.status
    },
    chief_complaint: clinical.chiefComplaint,
    fullName: profile.fullName,
    address: profile.contact.address,
    email: profile.contact.email,
    nextOfKin: profile.nextOfKin,
    insurance: profile.insurance,
    clinicalImpression: clinical.clinicalImpression,
    alerts: clinical.alerts
  };
};

interface PatientInfoProps {
  patient: Patient;
}

export const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  const details = getPatientDetails(patient);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'referral' | 'history' | 'chat' | 'contact'>('summary');
  const [documents, setDocuments] = useState(patientInfoData.documents);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const selectedDoc = selectedIndex !== null ? documents[selectedIndex] : null;
  const chatHistory = patient.pre_consultation?.chat || [];

  const getSection = (index: number, msg: ChatMessage): { label: string; icon: React.ElementType } | null => {
    if (msg.object?.availableSlots) return { label: "Appointment Booking", icon: Calendar };
    const text = msg.message?.toLowerCase() || "";
    if (text.includes("upload the screenshots") || text.includes("recent lab results")) {
      return { label: "Medical Records Upload", icon: Paperclip };
    }
    if (index === 0) return { label: "Patient Intake", icon: User };
    return null;
  };

  const medicalHistoryStartIndex = chatHistory.findIndex(m =>
    m.message?.toLowerCase().includes("upload the screenshots") ||
    m.message?.toLowerCase().includes("recent lab results")
  );

  const medicalHistoryImages = chatHistory
    .slice(medicalHistoryStartIndex > -1 ? medicalHistoryStartIndex : chatHistory.length)
    .filter(m => m.attachment)
    .map(m => m.attachment as string);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null && selectedIndex < documents.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const closeLightbox = () => setSelectedIndex(null);

  const tabs = [
    { id: 'summary' as const, label: 'Patient summary' },
    { id: 'referral' as const, label: 'Referral letter' },
    { id: 'history' as const, label: 'Medical history' },
    { id: 'chat' as const, label: 'Pre consultation chat' },
    { id: 'contact' as const, label: 'Patient contact' }
  ];

  return (
    <>
      {/* Lightbox Modal */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={closeLightbox}
        >
          {selectedIndex !== null && selectedIndex > 0 && (
             <button 
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
             >
                <ChevronLeft size={48} strokeWidth={1} />
             </button>
          )}
          {selectedIndex !== null && selectedIndex < documents.length - 1 && (
             <button 
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
             >
                <ChevronRight size={48} strokeWidth={1} />
             </button>
          )}

          <div className="w-full h-full flex flex-col relative">
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

            <div className="flex-1 overflow-hidden flex items-center justify-center p-0 sm:p-4 md:p-12">
               <FullDocumentView doc={selectedDoc} />
            </div>
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none">
               {documents.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all ${idx === selectedIndex ? 'bg-white scale-110' : 'bg-white/20'}`} 
                  />
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-neutral-200 mb-5 rounded-md">
          <div className="flex gap-1 px-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-all relative rounded-t-lg ${
                  activeTab === tab.id
                    ? 'text-neutral-900 bg-neutral-50'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-2">
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* MAIN COLUMN: Clinical Assessment */}
              <div className="lg:col-span-12 space-y-5">
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5">
                  
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Activity size={15} />
                      <span className="text-xs font-medium uppercase tracking-wide">Presenting Complaint</span>
                    </div>
                    <h2 className="text-2xl font-normal text-neutral-900 mb-2.5 tracking-tight">
                      {details.chief_complaint}
                    </h2>
                    
                    {/* Clinical Alerts */}
                    {details.alerts && details.alerts.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {details.alerts.map((alert, idx) => (
                          <span key={idx} className="text-xs text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
                            {alert}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full"></div>
                    <div className="pl-4 py-1">
                      <div>
                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-2">History of Present Illness</span>
                        <p className="text-neutral-800 leading-relaxed text-[15px]">
                          {details.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical Impression - Separate Box */}
                {details.clinicalImpression && (
                  <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3 text-primary">
                      <Activity size={15} />
                      <span className="text-xs font-medium uppercase tracking-wide">Clinical Impression</span>
                    </div>
                    <p className="text-neutral-900 leading-relaxed text-[17px] font-medium">
                      {details.clinicalImpression}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'referral' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Referral Information</span>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <Stethoscope size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Referred By</span>
                    </div>
                    <div className="text-base font-medium text-neutral-900 ml-5">{details.referral.referredBy}</div>
                  </div>
                
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <User size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Previous Provider</span>
                    </div>
                    <div className="text-base font-medium text-neutral-900 ml-5">{details.referral.previousProvider}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <Calendar size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Referral Date</span>
                    </div>
                    <div className="text-base font-medium text-neutral-900 ml-5">{details.referral.referralDate}</div>
                  </div>

                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-400 mb-2">
                      <FileText size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Referral Letter</span>
                    </div>
                    <div className="ml-5">
                      {documents.filter(doc => doc.type === 'letter').map((doc) => (
                        <div 
                          key={doc.id}
                          onClick={() => setSelectedIndex(documents.indexOf(doc))}
                          className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer mb-2"
                        >
                          <div className="w-12 h-16 bg-white rounded shadow-sm border border-neutral-200 overflow-hidden flex-shrink-0">
                            <DocumentThumbnail doc={doc} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-neutral-700">{doc.title}</h4>
                            <p className="text-xs text-neutral-400 mt-0.5">{doc.date} • {doc.source}</p>
                          </div>
                          <Maximize2 size={16} className="text-neutral-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Medical History & Risk Factors</span>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {details.medicalHistory.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base text-neutral-700 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Documents Gallery */}
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-white">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wide">Documents & Attachments</h3>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-medium bg-neutral-100 text-neutral-500 px-2.5 py-1 rounded-full border border-neutral-200">{documents.length} Files</span>
                    <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => scroll('left')}
                        className="p-1.5 hover:bg-neutral-50 text-neutral-500 border-r border-neutral-200 transition-colors"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button 
                        onClick={() => scroll('right')}
                        className="p-1.5 hover:bg-neutral-50 text-neutral-500 transition-colors"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-neutral-50/50 p-5">
                  <div 
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {documents.map((doc, index) => (
                      <div 
                        key={doc.id} 
                        onClick={() => setSelectedIndex(index)}
                        className="flex-shrink-0 w-36 group cursor-pointer"
                      >
                        <div className="aspect-[1/1.41] bg-white rounded-sm shadow-sm border border-neutral-200 relative overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/30">
                          
                          <DocumentThumbnail doc={doc} />

                          <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/5 transition-colors flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-700 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200">
                              <Maximize2 size={15} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2.5 px-1 text-center">
                          <h4 className="text-xs font-medium text-neutral-700 truncate">{doc.title}</h4>
                          <p className="text-[10px] text-neutral-400 mt-0.5">{doc.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && chatHistory.length > 0 && (
            <div className="w-full max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute left-[24px] top-4 bottom-0 w-[3px] bg-neutral-200/80 z-0 rounded-full"></div>
                <div className="w-full space-y-6">
                  {chatHistory.map((msg, index) => {
                    const isAdmin = msg.role === 'admin';
                    const section = getSection(index, msg);

                    return (
                      <div key={index} className={`relative ${section ? 'pt-8' : ''}`}>
                        {section && (
                          <div className="relative flex items-center mb-10 z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white border-4 border-white z-10">
                              <section.icon size={24} />
                            </div>
                            <div className="flex-grow ml-4 border-b-2 border-neutral-200/60 pb-2 flex justify-between items-end">
                              <h3 className="text-lg font-bold text-neutral-800 uppercase tracking-tight">{section.label}</h3>
                              <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-1">
                                Step {index === 0 ? 1 : index > 10 ? 3 : 2}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="pl-[60px]">
                          <div className={`flex w-full items-start gap-3 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                            {isAdmin && (
                              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-neutral-200 border-2 border-white shadow-sm flex items-center justify-center">
                                <Stethoscope size={16} className="text-neutral-600" />
                              </div>
                            )}

                            <div
                              className={`relative max-w-[100%] md:max-w-[85%] p-5 shadow-sm text-sm md:text-base transition-all ${
                                isAdmin
                                  ? 'bg-white rounded-2xl rounded-tl-none text-neutral-700 border border-neutral-100 shadow-sm'
                                  : 'bg-primary rounded-2xl rounded-tr-none text-white shadow-md shadow-primary/20'
                              }`}
                            >
                              {msg.message && <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                              {msg.attachment && (
                                <ImageWithFallback src={msg.attachment} alt="Attachment" onClick={() => setZoomedImage(msg.attachment || null)} />
                              )}

                              {msg.object && (
                                <div className="mt-4 w-full text-left">
                                  {msg.object.formType === 'emptyRequest' && (
                                    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                                      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex items-center gap-2">
                                        <div className="bg-white p-1.5 rounded-lg border border-indigo-100 shadow-sm text-indigo-600">
                                          <FileText size={16} />
                                        </div>
                                        <span className="font-bold text-indigo-900 text-sm uppercase tracking-wide">Intake Form Requested</span>
                                      </div>
                                      <div className="p-4 grid grid-cols-1 gap-y-4">
                                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
                                          <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                              <User size={10} /> Full Name
                                            </p>
                                            <div className="h-8 bg-neutral-50 border border-neutral-200 rounded-lg w-full"></div>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                              <Calendar size={10} /> DOB
                                            </p>
                                            <div className="h-8 bg-neutral-50 border border-neutral-200 rounded-lg w-full"></div>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
                                          <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                              <Mail size={10} /> Email
                                            </p>
                                            <div className="h-8 bg-neutral-50 border border-neutral-200 rounded-lg w-full"></div>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                              <Phone size={10} /> Phone
                                            </p>
                                            <div className="h-8 bg-neutral-50 border border-neutral-200 rounded-lg w-full"></div>
                                          </div>
                                        </div>
                                        <div className="pb-4 border-b border-neutral-100">
                                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                            <AlertCircle size={10} /> Chief Complaint
                                          </p>
                                          <div className="h-16 bg-neutral-50 border border-neutral-200 rounded-lg w-full"></div>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                            <History size={10} /> Medical History
                                          </p>
                                          <div className="h-8 bg-neutral-50 border border-neutral-200 rounded-lg w-3/4"></div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {msg.object.formType === 'filledResponse' && (
                                    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden text-left">
                                      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
                                        <div className="bg-white p-1.5 rounded-lg border border-neutral-200 shadow-sm">
                                          <CheckCircle size={16} className="text-emerald-500" />
                                        </div>
                                        <span className="font-bold text-neutral-700 text-sm uppercase tracking-wide">Intake Form Submitted</span>
                                      </div>
                                      <div className="p-4 grid grid-cols-1 gap-y-4">
                                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
                                          <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                              <User size={10} /> Full Name
                                            </p>
                                            <p className="font-semibold text-neutral-800 text-sm">{msg.object.firstName} {msg.object.lastName}</p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                              <Calendar size={10} /> DOB
                                            </p>
                                            <p className="font-semibold text-neutral-800 text-sm">{msg.object.dob}</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
                                          <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                              <Mail size={10} /> Email
                                            </p>
                                            <p className="font-semibold text-neutral-800 text-sm truncate" title={msg.object.email}>{msg.object.email}</p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                              <Phone size={10} /> Phone
                                            </p>
                                            <p className="font-semibold text-neutral-800 text-sm">{msg.object.phone}</p>
                                          </div>
                                        </div>
                                        <div className="pb-4 border-b border-neutral-100">
                                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <AlertCircle size={10} /> Chief Complaint
                                          </p>
                                          <p className="font-medium text-neutral-800 text-sm bg-amber-50 border border-amber-100 p-2 rounded-lg">
                                            {msg.object.complaint}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <History size={10} /> Medical History
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {msg.object.medicalHistory?.map((h, i) => (
                                              <span key={i} className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">
                                                {h}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {msg.object.availableSlots && (
                                    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                                      <div className="bg-gradient-to-r from-neutral-50 to-white px-5 py-4 border-b border-neutral-100">
                                        <h4 className="font-bold text-neutral-800">Select an Appointment</h4>
                                        <p className="text-xs text-neutral-500 mt-0.5">Dr. A. Gupta • Hepatology • Urgent</p>
                                      </div>
                                      <div className="p-2 bg-neutral-50/50">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                          {msg.object.availableSlots.map(slot => (
                                            <button key={slot.slotId} className="relative flex flex-col items-center justify-center bg-white p-3 rounded-xl border-2 border-neutral-100 hover:border-primary hover:shadow-md transition-all group text-center">
                                              <span className="text-xs font-bold text-neutral-400 mb-1">{slot.date}</span>
                                              <span className="text-lg font-bold text-neutral-800 group-hover:text-primary">{slot.time}</span>
                                              <div className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded group-hover:bg-primary/10 group-hover:text-primary">
                                                Available
                                              </div>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {msg.object.appointmentId && (
                                    <div className="relative bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
                                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500"></div>
                                      <div className="p-5 pl-7">
                                        <div className="flex items-center gap-2 mb-4">
                                          <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                                            <CheckCircle size={16} />
                                          </div>
                                          <span className="font-bold text-emerald-700 text-sm uppercase tracking-wide">Confirmed</span>
                                        </div>
                                        <div className="flex flex-col gap-1 mb-4">
                                          <h2 className="text-xl font-bold text-neutral-800">{msg.object.schedule?.provider}</h2>
                                          <p className="text-sm text-neutral-500">{msg.object.schedule?.location}</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                                          <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-neutral-400" />
                                            <span className="font-semibold text-neutral-700 text-sm">{msg.object.schedule?.date}</span>
                                          </div>
                                          <div className="w-px h-4 bg-neutral-300"></div>
                                          <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-neutral-400" />
                                            <span className="font-semibold text-neutral-700 text-sm">{msg.object.schedule?.time}</span>
                                          </div>
                                        </div>
                                        <div className="mt-3 text-xs text-neutral-400 bg-white border border-neutral-100 px-3 py-2 rounded-lg italic">
                                          Note: {msg.object.schedule?.instructions}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {!isAdmin && (
                              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 border-2 border-white shadow-sm flex items-center justify-center">
                                <User size={16} className="text-primary" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {medicalHistoryImages.length > 0 && (
                    <div className="relative pt-12">
                      <div className="relative flex items-center mb-10 z-10">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-800 shadow-lg shadow-neutral-300 flex items-center justify-center text-white border-4 border-white z-10">
                          <FileText size={24} />
                        </div>
                        <div className="flex-grow ml-4 border-b-2 border-neutral-200/60 pb-2 flex justify-between items-end">
                          <h3 className="text-lg font-bold text-neutral-800 uppercase tracking-tight">Documents & Reports</h3>
                          <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-1">Summary</span>
                        </div>
                      </div>
                      <div className="pl-[60px]">
                        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                          <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-wide mb-4">
                            Uploaded Files ({medicalHistoryImages.length})
                          </h4>
                          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                            {medicalHistoryImages.map((img, idx) => (
                              <div
                                key={idx}
                                onClick={() => setZoomedImage(img)}
                                className="snap-start flex-shrink-0 w-40 h-40 bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm cursor-pointer hover:shadow-md hover:border-primary transition-all relative group"
                              >
                                <img
                                  src={img}
                                  alt="Doc"
                                  className="w-full h-full object-contain p-2 bg-white"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden absolute inset-0 flex-col items-center justify-center text-neutral-400 p-2 text-center bg-white">
                                  <ImageIcon size={24} />
                                  <span className="text-[10px] mt-1">Preview Unavailable</span>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && chatHistory.length === 0 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden p-12 text-center">
                <MessageSquare size={48} className="mx-auto text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-600 mb-2">No Chat History</h3>
                <p className="text-sm text-neutral-400">Pre-consultation chat messages will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Contact Information Card - 1st */}
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Contact Information</span>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <User size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Full Name</span>
                    </div>
                    <div className="text-base font-medium text-neutral-900 ml-5">
                      {details.fullName}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <Phone size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Phone Number</span>
                    </div>
                    <div className="text-base font-medium text-neutral-900 ml-5">{details.contact}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <Calendar size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Date of Birth</span>
                    </div>
                    <div className="text-base font-medium text-neutral-900 ml-5">{details.dob}</div>
                  </div>

                  {details.address && (
                    <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <User size={13} />
                        <span className="text-[9px] font-medium uppercase tracking-wider">Address</span>
                      </div>
                      <div className="text-base font-medium text-neutral-900 ml-5">{details.address}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next of Kin Card - 2nd */}
              {details.nextOfKin && (
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Next of Kin</span>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <User size={13} />
                        <span className="text-[9px] font-medium uppercase tracking-wider">Name</span>
                      </div>
                      <div className="text-base font-medium text-neutral-900 ml-5">{details.nextOfKin.name}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <User size={13} />
                        <span className="text-[9px] font-medium uppercase tracking-wider">Relation</span>
                      </div>
                      <div className="text-base font-medium text-neutral-900 ml-5">{details.nextOfKin.relation}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <Phone size={13} />
                        <span className="text-[9px] font-medium uppercase tracking-wider">Phone</span>
                      </div>
                      <div className="text-base font-medium text-neutral-900 ml-5">{details.nextOfKin.phone}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Insurance Card - 3rd */}
              {details.insurance && (
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Insurance Information</span>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <FileCheck size={13} />
                        <span className="text-[9px] font-medium uppercase tracking-wider">Provider</span>
                      </div>
                      <div className="text-base font-medium text-neutral-900 ml-5">{details.insurance.provider}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <FileText size={13} />
                        <span className="text-[9px] font-medium uppercase tracking-wider">Policy Number</span>
                      </div>
                      <div className="text-base font-medium text-neutral-900 ml-5">{details.insurance.policyNumber}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-neutral-400 mb-1">
                        <CheckCircle size={13} />
                        <span className="text-[9px] font-medium uppercase tracking-wider">Status</span>
                      </div>
                      <div className="text-base font-medium text-neutral-900 ml-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {details.insurance.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Demographics Card - 4th */}
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Demographics</span>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <User size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Age / Gender</span>
                    </div>
                    <div className="text-base font-medium text-neutral-900 ml-5">{patient.age} years • {patient.gender}</div>
                  </div>
                
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <Briefcase size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Occupation</span>
                    </div>
                    <div className="text-base font-medium text-neutral-900 ml-5">{details.occupation}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <Phone size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Contact</span>
                    </div>
                    <div className="text-base font-medium text-neutral-900 ml-5">{details.contact}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-1">
                      <Calendar size={13} />
                      <span className="text-[9px] font-medium uppercase tracking-wider">Last Visit</span>
                    </div>
                    <div className="text-base font-medium text-neutral-900 ml-5">{details.lastVisit}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal for Chat Images */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
          >
            <X size={28} />
          </button>
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
            <img
              src={zoomedImage}
              alt="Zoomed Detail"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};
