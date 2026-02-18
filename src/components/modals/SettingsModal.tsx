'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import {
  MessageSquare, Users, Phone, Video, Mic, Paperclip, Send,
  Settings, LogOut, Calendar, X, Check, CheckCheck,
  MoreVertical, Search, FileText, Stethoscope, Plus, Smile, Image as ImageIcon,
  PhoneOff, Play, Pause, Download, Share2, ChevronLeft, ChevronRight,
  File, ZoomIn, ZoomOut, Minimize2, Wand2, PhoneCall, MessageCircle, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Bell, Ban, ThumbsDown, Lock, Wifi, Pin, PinOff, MonitorUp, Captions, Type, Delete, Grid, ArrowDownLeft, ArrowUpRight,
  ClipboardList, Sparkles, RefreshCw, Save, Trash2, Edit3, CheckCircle2, CirclePause, CirclePlay, Loader2,
  Heart, User as UserIcon, Clock, Info, ExternalLink, Maximize2, Map as MapIcon, ArrowLeft, MicOff, VideoOff,
  Camera, Eye, UserPlus, FileCheck, AlertCircle,
  Copy, ChevronDown, ChevronUp, WifiOff, Shield, BellOff
} from 'lucide-react';

import { useAppContext } from '../../contexts/AppContext';
import { User, Chat, Message, GroupType, UserRole, PatientProfile, CallLog, ClinicalNote, SoapSection, NoteTemplateType, UserPreferences, ConsultationType } from '../../../types';
import { MOCK_CALLS, USERS } from '../../../services/mockData';
import { NOTE_TEMPLATES, getAllTemplates } from '../../../templates/noteTemplates';
import { CONSULTATION_TYPES, getAllConsultationTypes } from '../../../constants/consultationTypes';

const SettingsModal: React.FC = () => {
  const { isSettingsOpen, toggleSettings, userPreferences, updatePreferences } = useAppContext();
  const [selectedTemplate, setSelectedTemplate] = useState(userPreferences.defaultTemplate);
  const [tempFavorites, setTempFavorites] = useState(userPreferences.favoriteTemplates);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    updatePreferences({
      defaultTemplate: selectedTemplate,
      favoriteTemplates: tempFavorites
    });
    toggleSettings();
  };

  const toggleFavorite = (templateId: NoteTemplateType) => {
    setTempFavorites((prev: NoteTemplateType[]) =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal to-teal/80 text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Settings size={28} />
            <div>
              <h2 className="text-2xl font-bold">Clinical Note Settings</h2>
              <p className="text-sm text-white/80">Configure your default note template and preferences</p>
            </div>
          </div>
          <button onClick={toggleSettings} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Default Template Selector */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Default Note Template
            </label>
            <p className="text-sm text-gray-500 mb-4">
              This template will be automatically selected when creating new clinical notes.
              You can override this choice for individual notes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAllTemplates().map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md ${
                    selectedTemplate === template.id
                      ? 'border-teal bg-teal/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{template.name}</h3>
                    {selectedTemplate === template.id && (
                      <CheckCircle2 size={20} className="text-teal shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  {template.specialty && (
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                      {template.specialty}
                    </span>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.sections.slice(0, 6).map(section => (
                      <span key={section.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                        {section.label}
                      </span>
                    ))}
                    {template.sections.length > 6 && (
                      <span className="px-2 py-0.5 text-gray-400 text-[10px]">
                        +{template.sections.length - 6} more
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Eye size={18} className="text-teal" />
              Template Preview: {NOTE_TEMPLATES[selectedTemplate].name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {NOTE_TEMPLATES[selectedTemplate].sections.map(section => (
                <div key={section.id} className="bg-white p-3 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-teal mb-1">{section.label}</div>
                  <div className="text-[11px] text-gray-600 leading-tight">{section.fullName}</div>
                  {section.required && (
                    <span className="text-[9px] text-red-500 font-bold">*Required</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Templates */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
              <Heart size={16} className="text-red-500" />
              Favorite Templates (Quick Access)
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Mark templates as favorites for quick access when creating notes.
            </p>
            <div className="flex flex-wrap gap-2">
              {getAllTemplates().map(template => (
                <button
                  key={template.id}
                  onClick={() => toggleFavorite(template.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    tempFavorites.includes(template.id)
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  {tempFavorites.includes(template.id) && <Heart size={14} className="inline mr-1 fill-current" />}
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6 flex justify-end gap-3 shrink-0 bg-gray-50">
          <button
            onClick={toggleSettings}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-teal text-white rounded-xl font-bold hover:bg-teal/90 transition-all shadow-md hover:shadow-lg"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;