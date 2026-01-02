import React from 'react';
import { AlertCircle, Info, CheckCircle, Lightbulb, Bell, Heart, Shield, Zap, Star, BookOpen } from 'lucide-react';
import { EducationItem } from '../types';

const SAMPLE_ITEM: EducationItem = {
  headline: 'Stop Tylenol Immediately',
  content: 'Please stop taking all acetaminophen products (Tylenol, Tylenol PM, Extra Strength Tylenol) until further notice.',
  category: 'Medication',
  urgency: 'High',
  context_reference: 'Patient reports taking Tylenol frequently',
  status: 'pending'
};

// Design 1: Minimal with Left Border
export const Design1: React.FC<{ item: EducationItem }> = ({ item }) => (
  <div className={`bg-white border-l-4 border-r border-t border-b rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
    item.urgency === 'High' ? 'border-l-red-500 border-neutral-200' :
    'border-l-blue-500 border-neutral-200'
  }`}>
    <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide block mb-2">
      {item.category}
    </span>
    <h3 className="text-sm font-semibold text-neutral-900 mb-2">
      {item.headline}
    </h3>
    <p className="text-xs text-neutral-600 leading-relaxed">
      {item.content}
    </p>
  </div>
);

// Design 2: Card with Icon Badge
export const Design2: React.FC<{ item: EducationItem }> = ({ item }) => (
  <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer">
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        item.urgency === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
      }`}>
        <AlertCircle size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide block mb-1">
          {item.category}
        </span>
        <h3 className="text-sm font-semibold text-neutral-900 mb-2">
          {item.headline}
        </h3>
        <p className="text-xs text-neutral-600 leading-relaxed">
          {item.content}
        </p>
      </div>
    </div>
  </div>
);

// Design 3: Colored Background
export const Design3: React.FC<{ item: EducationItem }> = ({ item }) => (
  <div className={`rounded-lg p-4 border cursor-pointer hover:shadow-md transition-all ${
    item.urgency === 'High' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
  }`}>
    <div className="flex items-center gap-2 mb-2">
      <span className={`text-[10px] font-bold uppercase tracking-wider ${
        item.urgency === 'High' ? 'text-red-700' : 'text-blue-700'
      }`}>
        {item.category}
      </span>
    </div>
    <h3 className="text-sm font-semibold text-neutral-900 mb-2">
      {item.headline}
    </h3>
    <p className="text-xs text-neutral-700 leading-relaxed">
      {item.content}
    </p>
  </div>
);

// Design 4: Card with Top Accent
export const Design4: React.FC<{ item: EducationItem }> = ({ item }) => (
  <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer">
    <div className={`h-1 ${
      item.urgency === 'High' ? 'bg-red-500' : 'bg-blue-500'
    }`}></div>
    <div className="p-4">
      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide block mb-2">
        {item.category}
      </span>
      <h3 className="text-sm font-semibold text-neutral-900 mb-2">
        {item.headline}
      </h3>
      <p className="text-xs text-neutral-600 leading-relaxed">
        {item.content}
      </p>
    </div>
  </div>
);

// Design 5: Gradient Border
export const Design5: React.FC<{ item: EducationItem }> = ({ item }) => (
  <div className="relative bg-white rounded-lg p-[1px] hover:shadow-md transition-all cursor-pointer">
    <div className={`absolute inset-0 rounded-lg ${
      item.urgency === 'High' ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
    }`}></div>
    <div className="relative bg-white rounded-lg p-4">
      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide block mb-2">
        {item.category}
      </span>
      <h3 className="text-sm font-semibold text-neutral-900 mb-2">
        {item.headline}
      </h3>
      <p className="text-xs text-neutral-600 leading-relaxed">
        {item.content}
      </p>
    </div>
  </div>
);

// Design 6: Badge Style
export const Design6: React.FC<{ item: EducationItem }> = ({ item }) => (
  <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 transition-all cursor-pointer">
    <div className="flex items-center gap-2 mb-3">
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
        item.urgency === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {item.category}
      </span>
      <span className={`w-2 h-2 rounded-full ${
        item.urgency === 'High' ? 'bg-red-500' : 'bg-blue-500'
      }`}></span>
    </div>
    <h3 className="text-sm font-semibold text-neutral-900 mb-2">
      {item.headline}
    </h3>
    <p className="text-xs text-neutral-600 leading-relaxed">
      {item.content}
    </p>
  </div>
);

// Design 7: Shadow Accent
export const Design7: React.FC<{ item: EducationItem }> = ({ item }) => (
  <div className={`bg-white border border-neutral-200 rounded-lg p-4 cursor-pointer transition-all hover:translate-y-[-2px] ${
    item.urgency === 'High' ? 'hover:shadow-lg hover:shadow-red-100' : 'hover:shadow-lg hover:shadow-blue-100'
  }`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">
        {item.category}
      </span>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
        item.urgency === 'High' ? 'bg-red-100' : 'bg-blue-100'
      }`}>
        <Info size={12} className={
          item.urgency === 'High' ? 'text-red-600' : 'text-blue-600'
        } />
      </div>
    </div>
    <h3 className="text-sm font-semibold text-neutral-900 mb-2">
      {item.headline}
    </h3>
    <p className="text-xs text-neutral-600 leading-relaxed">
      {item.content}
    </p>
  </div>
);

// Design 8: Outlined with Dot
export const Design8: React.FC<{ item: EducationItem }> = ({ item }) => (
  <div className={`bg-white border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
    item.urgency === 'High' ? 'border-red-200 hover:border-red-300' : 'border-blue-200 hover:border-blue-300'
  }`}>
    <div className="flex items-start gap-3">
      <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
        item.urgency === 'High' ? 'bg-red-500' : 'bg-blue-500'
      }`}></div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide block mb-1">
          {item.category}
        </span>
        <h3 className="text-sm font-semibold text-neutral-900 mb-2">
          {item.headline}
        </h3>
        <p className="text-xs text-neutral-600 leading-relaxed">
          {item.content}
        </p>
      </div>
    </div>
  </div>
);

// Design 9: Minimal Modern
export const Design9: React.FC<{ item: EducationItem }> = ({ item }) => (
  <div className="bg-neutral-50 hover:bg-white border border-neutral-200 rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-1 h-6 rounded-full ${
        item.urgency === 'High' ? 'bg-red-500' : 'bg-blue-500'
      }`}></div>
      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
        {item.category}
      </span>
    </div>
    <h3 className="text-sm font-semibold text-neutral-900 mb-2">
      {item.headline}
    </h3>
    <p className="text-xs text-neutral-600 leading-relaxed">
      {item.content}
    </p>
  </div>
);

// Design 10: Card with Corner Badge
export const Design10: React.FC<{ item: EducationItem }> = ({ item }) => (
  <div className="relative bg-white border border-neutral-200 rounded-lg p-4 cursor-pointer hover:border-neutral-300 hover:shadow-md transition-all overflow-hidden">
    <div className={`absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 rotate-45 ${
      item.urgency === 'High' ? 'bg-red-500' : 'bg-blue-500'
    }`}></div>
    <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide block mb-2">
      {item.category}
    </span>
    <h3 className="text-sm font-semibold text-neutral-900 mb-2">
      {item.headline}
    </h3>
    <p className="text-xs text-neutral-600 leading-relaxed">
      {item.content}
    </p>
  </div>
);

// Showcase Component
export const EducationCardDesigns: React.FC = () => {
  const designs = [
    { name: 'Design 1: Minimal Left Border', component: Design1 },
    { name: 'Design 2: Icon Badge', component: Design2 },
    { name: 'Design 3: Colored Background', component: Design3 },
    { name: 'Design 4: Top Accent', component: Design4 },
    { name: 'Design 5: Gradient Border', component: Design5 },
    { name: 'Design 6: Badge Style', component: Design6 },
    { name: 'Design 7: Shadow Accent', component: Design7 },
    { name: 'Design 8: Outlined with Dot', component: Design8 },
    { name: 'Design 9: Minimal Modern', component: Design9 },
    { name: 'Design 10: Corner Badge', component: Design10 },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Patient Education Card Designs</h1>
          <p className="text-neutral-600">Choose your preferred card design for the patient education interface</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {designs.map((design, index) => {
            const DesignComponent = design.component;
            return (
              <div key={index} className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-800">{design.name}</h3>
                <div className="space-y-3">
                  <DesignComponent item={{ ...SAMPLE_ITEM, urgency: 'High' }} />
                  <DesignComponent item={{ ...SAMPLE_ITEM, urgency: 'Low', headline: 'Follow-up Labs Required', category: 'Follow-up' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
