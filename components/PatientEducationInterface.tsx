import React, { useState, useEffect } from 'react';
import { Circle, ChevronDown, Info, BookOpen } from 'lucide-react';
import { EducationItem } from '../types';

const BACKEND_EDUCATION_ITEMS: EducationItem[] = [
  {
    headline: "Emergency Red Flags for Sepsis",
    content: "If you develop a high fever, chills, or notice the red area on your skin spreading rapidly, you must seek emergency care at the hospital immediately.",
    reasoning: "This warning is required to mitigate 'Failure to Warn' liability. Providing specific 'stop-use' and 'seek-care' triggers shifts the burden of action to the patient, protecting the clinic in the event of rapid clinical deterioration.",
    category: "Safety",
    urgency: "High",
    context_reference: "Patient mentioned the redness on their leg has been there for two days.",
    status: "pending"
  },
  {
    headline: "Antibiotic Compliance Requirement",
    content: "You must complete the entire 7-day course of antibiotics even if the skin looks normal after a few days. Do not stop early.",
    reasoning: "Failure to disclose the risks of non-compliance (antibiotic resistance and secondary infection) constitutes a breach of the 'Duty of Care.' Documentation of this instruction prevents negligence claims if the infection returns due to patient error.",
    category: "Medication Risk",
    urgency: "Normal",
    context_reference: "Nurse provided a prescription for Amoxicillin.",
    status: "pending"
  },
  {
    headline: "NSAID Gastric Risk Warning",
    content: "Take the Ibuprofen only with food. If you experience sharp stomach pain or notice black, tarry stools, stop the medication immediately and contact us.",
    reasoning: "Under the 'Informed Consent Doctrine,' clinicians must disclose 'material risks.' Gastric bleeding is a known risk of NSAIDs; failing to provide this warning leaves the clinic vulnerable to a malpractice suit if a GI bleed occurs.",
    category: "Medication Risk",
    urgency: "Normal",
    context_reference: "Nurse suggested taking Advil (Ibuprofen) for the pain.",
    status: "asked"
  },
  {
    headline: "Diagnostic Limitations Disclosure",
    content: "This is a preliminary assessment based on your current symptoms. A physical examination is required if symptoms do not improve within 48 hours.",
    reasoning: "This is a legal safeguard for remote or preliminary consultations. It establishes that the assessment has limitations and clearly defines the timeframe for follow-up, protecting the doctor against 'Failure to Diagnose' claims.",
    category: "Legal/Informed Consent",
    urgency: "Normal",
    context_reference: "Nurse stated 'It looks like a simple skin infection.'",
    status: "asked"
  },
  {
    headline: "Expected Skin Tenderness",
    content: "It is normal for the area to remain slightly tender and warm for the next 24 hours as the medication begins to work. This is an expected part of the healing process.",
    reasoning: "Strategic 'Reassurance' prevents 'Anxiety-based Litigation.' By defining what is 'normal,' the clinic prevents the patient from claiming they were 'misled' or 'frightened' by standard recovery symptoms.",
    category: "Reassurance",
    urgency: "Low",
    context_reference: "Patient asked if it was okay that the leg felt hot.",
    status: "asked"
  }
];

interface EducationCardProps {
  item: EducationItem;
}

// Education Card Component
const EducationCard: React.FC<EducationCardProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isHighUrgency = item.urgency === 'High';
  const isDelivered = item.status === 'asked';
  
  const containerClasses = (isHighUrgency && !isDelivered)
    ? "bg-red-50 border-red-200 shadow-[0_0_0_1px_rgba(254,202,202,0.4)]"
    : "bg-neutral-50 border-neutral-200 hover:border-neutral-300";

  const innerCardClasses = (isHighUrgency && !isDelivered) ? "border-red-100 shadow-sm" : "border-neutral-100 shadow-sm";
  
  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className={`rounded-xl p-2 border cursor-pointer group select-none relative overflow-hidden ${containerClasses}`}
    >
      <div className={`bg-white rounded-lg p-3 border relative z-10 transition-colors ${innerCardClasses}`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[8px] font-medium uppercase tracking-wide ${
            (isHighUrgency && !isDelivered) ? 'text-red-400' : 'text-neutral-400'
          }`}>
            {item.category}
          </span>
          {item.reasoning && (
            <div>
              <ChevronDown size={14} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          )}
        </div>
        <h3 className={`font-semibold mb-2 ${
          (isHighUrgency && !isDelivered) ? 'text-black' : 'text-neutral-900'
        } ${
          isDelivered ? 'text-[10px]' : 'text-[15px]'
        }`}>
          {item.headline}
        </h3>
        <p className={`leading-relaxed ${
          (isHighUrgency && !isDelivered) ? 'text-red-800' : 'text-neutral-600'
        } ${
          isDelivered ? 'text-[9px]' : 'text-xs'
        }`}>
          {item.content}
        </p>
      </div>
      {isHighUrgency && !isDelivered && (
        <div className="px-3 py-0.5">
          <span className="text-[7px] text-red-400 font-semibold uppercase tracking-wide">
            High Priority
          </span>
        </div>
      )}
      {item.reasoning && (
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="px-3 pb-2 pt-3">
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Info size={12} className="text-neutral-500" />
                  </div>
                  <p className="text-[9px]  text-neutral-600 leading-relaxed py-0.5">{item.reasoning}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PatientEducationInterface: React.FC<{ educationItems?: EducationItem[] }> = ({ educationItems: externalItems = [] }) => {
  // Use backend data immediately, fall back to dummy data if no external data
  const [items, setItems] = useState<EducationItem[]>(BACKEND_EDUCATION_ITEMS);

  // Update when external items change
  useEffect(() => {
    if (externalItems.length > 0) {
      setItems(externalItems);
    }
  }, [externalItems]);

  const pendingItems = items.filter(item => item.status === 'pending');
  const deliveredItems = items.filter(item => item.status === 'asked');
  const highPriorityItems = pendingItems.filter(item => item.urgency === 'High');
  const otherPendingItems = pendingItems.filter(item => item.urgency !== 'High');

  return (
    <div className="h-full flex gap-4">
      {/* Left Column - Things to Say (66%) */}
      <div className="flex-[2] flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50 shrink-0">
          <h2 className="text-[10px] font-semibold text-neutral-800">Remaining Education</h2>
          <p className="text-[10px] text-neutral-500 mt-1">
            {pendingItems.length} pending
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* High Urgency Items - Full Width */}
          {highPriorityItems.length > 0 && (
            <div className="space-y-3 mb-4">
              {highPriorityItems.map((item, index) => (
                <EducationCard key={`${item.headline}-${index}`} item={item} />
              ))}
            </div>
          )}

          {/* Other Pending Items - 2 Column Grid */}
          {otherPendingItems.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {otherPendingItems.map((item, index) => (
                <EducationCard key={`${item.headline}-${index}`} item={item} />
              ))}
            </div>
          )}

          {pendingItems.length === 0 && (
            <div className="flex items-center justify-center h-full text-center py-12">
              <div>
                <Circle size={48} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">All information delivered</p>
                <p className="text-xs text-neutral-400 mt-1">Great job!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Things Already Said (33%) */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50 shrink-0">
          <h2 className="text-[10px] font-semibold text-neutral-800">Educated Content</h2>
          <p className="text-[10px] text-neutral-500 mt-1">
            {deliveredItems.length} delivered
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {deliveredItems.map((item, index) => (
            <EducationCard key={`${item.headline}-${index}`} item={item} />
          ))}

          {deliveredItems.length === 0 && (
            <div className="flex items-center justify-center h-full text-center py-12">
              <div>
                <Circle size={48} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">Nothing delivered yet</p>
                <p className="text-xs text-neutral-400 mt-1">Start educating the patient</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
