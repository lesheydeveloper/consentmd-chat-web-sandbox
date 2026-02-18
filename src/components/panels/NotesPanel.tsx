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

const NotesPanel: React.FC = () => {
    const {
        activeChat, clinicalNotes, updateClinicalNote, isNotesPanelOpen, toggleNotesPanel,
        generateFullSOAP, acceptSuggestion, dismissSuggestion, isScribeActive, toggleScribe, userPreferences,
        promptForPatient, promptForConsultationType, chats, canAccessNotes, currentUser
    } = useAppContext();

    const [activeTab, setActiveTab] = useState<string>('subjective');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
    const [editedSuggestionText, setEditedSuggestionText] = useState("");

    const noteAccess = canAccessNotes(activeChat);
    const isReadOnly = noteAccess === 'readonly';

    if (!isNotesPanelOpen || noteAccess === 'none') return null;

    const chatId = activeChat ? activeChat.id : 'global_scribe';
    const note = clinicalNotes[chatId] || {
        templateType: 'soap' as NoteTemplateType,
        subjective: '', objective: '', assessment: '', plan: '', sections: {}, suggestions: []
    };

    const handleGenerate = async () => {
        if (!activeChat) return;
        setIsGenerating(true);
        await generateFullSOAP(activeChat.id);
        setIsGenerating(false);
    };

    const startEditing = (s: any) => {
        setEditingSuggestionId(s.id);
        setEditedSuggestionText(s.text);
    };

    const handleFinalize = (sId: string) => {
        acceptSuggestion(chatId, sId, editedSuggestionText);
        setEditingSuggestionId(null);
        setEditedSuggestionText("");
    };

    // Get template and build tabs dynamically
    const templateType = note.templateType || userPreferences.defaultTemplate;
    const template = NOTE_TEMPLATES[templateType];

    // Ensure activeTab is valid for current template
    useEffect(() => {
        const validTabIds = template.sections.map(s => s.id);
        if (!validTabIds.includes(activeTab)) {
            setActiveTab(validTabIds[0] || 'subjective');
        }
    }, [template, activeTab]);

    return (
        <div className="fixed inset-0 z-[100] md:relative md:inset-auto md:w-[400px] bg-white border-l border-gray-200 h-full flex flex-col shrink-0 md:z-40 animate-[slideLeft_0.2s_ease-out] shadow-2xl overflow-hidden">
            <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal/10 rounded-lg"><ClipboardList size={20} className="text-teal" /></div>
                    <h2 className="text-navy font-bold">{activeChat ? 'Clinical Scribe' : 'Quick Scribe'}</h2>
                </div>
                <button onClick={toggleNotesPanel} className="text-gray-400 hover:text-navy hover:bg-gray-100 p-2 rounded-full transition-all"><X size={20} /></button>
            </div>

            {/* Read-only banner for patients */}
            {isReadOnly && (
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 text-blue-700 text-sm shrink-0">
                    <Eye size={14} /> Viewing notes shared by your care team (read-only)
                </div>
            )}

            {/* Patient & Consultation Context */}
            <div className="border-b border-gray-200 bg-gray-50/50 p-4 shrink-0">
                {/* Patient Info */}
                {note.patientId ? (
                    <div className="mb-3">
                        {(() => {
                            const patient = chats
                                .flatMap(c => c.participants)
                                .find(u => u.id === note.patientId && u.role === UserRole.PATIENT);
                            return patient ? (
                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
                                    <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full" />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-900">{patient.name}</div>
                                        <div className="text-xs text-gray-500">Patient</div>
                                    </div>
                                    <button
                                        onClick={() => promptForPatient(note.chatId)}
                                        className="text-xs text-teal hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-yellow-50 border-2 border-yellow-200 p-3 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={16} className="text-yellow-600" />
                                        <span className="text-sm text-yellow-900 font-medium">Patient not linked</span>
                                    </div>
                                    <button
                                        onClick={() => promptForPatient(note.chatId)}
                                        className="text-sm font-bold text-yellow-700 hover:underline"
                                    >
                                        Link Patient
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <button
                        onClick={() => promptForPatient(note.chatId)}
                        className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-50 border-2 border-yellow-300 text-yellow-900 rounded-xl font-bold hover:bg-yellow-100 transition-all"
                    >
                        <UserPlus size={16} />
                        Link to Patient
                    </button>
                )}

                {/* Consultation Type */}
                {note.consultationType ? (
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Consultation Type</span>
                            <button
                                onClick={() => promptForConsultationType(note.chatId)}
                                className="text-xs text-teal hover:underline"
                            >
                                Change
                            </button>
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                            {CONSULTATION_TYPES[note.consultationType]?.name}
                        </div>
                        {note.visitReason && (
                            <div className="text-xs text-gray-600 mt-1">{note.visitReason}</div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => promptForConsultationType(note.chatId)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 border-2 border-blue-200 text-blue-900 rounded-xl font-medium hover:bg-blue-100 transition-all text-sm"
                    >
                        <FileCheck size={16} />
                        Set Consultation Type
                    </button>
                )}
            </div>

            <div className="px-4 py-3 border-b bg-teal/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className={isScribeActive ? 'text-teal animate-pulse' : 'text-gray-400'} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isScribeActive ? 'text-teal' : 'text-gray-500'}`}>
                        {isScribeActive ? 'Auto-Scribe Enabled' : 'Auto-Scribe Paused'}
                    </span>
                </div>
                <button 
                    onClick={toggleScribe}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all shadow-sm ${
                        isScribeActive 
                        ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50' 
                        : 'bg-teal text-white hover:bg-teal/90'
                    }`}
                >
                    {isScribeActive ? <CirclePause size={12} /> : <CirclePlay size={12} />}
                </button>
            </div>

            <div className="p-4 flex gap-1 border-b bg-gray-50/50 shrink-0">
                {template.sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveTab(section.id)}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === section.id ? 'bg-teal text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        {section.label}
                        <span className="block text-[8px] font-normal opacity-70 uppercase tracking-tighter">{section.fullName}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/20">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Official {template.sections.find(s => s.id === activeTab)?.fullName || activeTab} Records
                        </label>
                    </div>
                    {!isReadOnly && (
                        <textarea
                            value={(note.sections as Record<string, string>)?.[activeTab] || ''}
                            onChange={(e) => updateClinicalNote(chatId, activeTab, e.target.value)}
                            placeholder={template.sections.find(s => s.id === activeTab)?.placeholder || `Start typing ${activeTab} content...`}
                            className="w-full h-40 p-4 border rounded-2xl text-sm focus:ring-1 focus:ring-teal outline-none resize-none bg-white border-gray-200 shadow-sm leading-relaxed"
                        ></textarea>
                    )}
                    {isReadOnly && (
                        <div className="w-full h-40 p-4 border rounded-2xl text-sm outline-none resize-none bg-gray-50 border-gray-200 shadow-sm leading-relaxed text-gray-700 overflow-y-auto">
                            {(note.sections as Record<string, string>)?.[activeTab] || '(No content)'}
                        </div>
                    )}
                </div>

                <div className="mt-6 border-t pt-6">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Sparkles size={14} className="text-purple-500" /> Intelligence Feed
                    </h3>
                    <div className="space-y-4">
                        {note.suggestions.filter(s => s.section === activeTab).length === 0 && (
                            <div className="text-center py-12 px-6 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-xs text-gray-400 italic">No AI captures detected yet. Start chatting or dictate to see insights.</p>
                            </div>
                        )}
                        {note.suggestions.filter(s => s.section === activeTab).map(s => (
                            <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-purple-200 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500/30"></div>
                                {editingSuggestionId === s.id && !isReadOnly ? (
                                    <div className="space-y-3">
                                        <textarea
                                            value={editedSuggestionText}
                                            onChange={(e) => setEditedSuggestionText(e.target.value)}
                                            className="w-full text-sm p-3 border rounded-xl border-purple-200 focus:outline-none min-h-[100px] bg-purple-50/30 font-medium"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingSuggestionId(null)} className="px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 rounded-lg">Discard</button>
                                            <button onClick={() => handleFinalize(s.id)} className="px-5 py-2 text-xs bg-purple-600 text-white rounded-lg font-bold shadow-md hover:bg-purple-700">Finalize</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <p className="text-sm text-gray-700 leading-relaxed font-medium">"{s.text}"</p>
                                            {!isReadOnly && (
                                                <button onClick={() => dismissSuggestion(chatId, s.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shrink-0"><Trash2 size={16}/></button>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                            {!isReadOnly && (
                                                <button onClick={() => startEditing(s)} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-teal">
                                                    <Edit3 size={14}/> Edit Draft
                                                </button>
                                            )}
                                            {!isReadOnly && (
                                                <button onClick={() => acceptSuggestion(chatId, s.id)} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-[10px] font-bold hover:bg-purple-600 hover:text-white transition-all">
                                                    <CheckCircle2 size={14}/> Accept
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 shrink-0 pb-safe">
                {!isReadOnly && (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !activeChat}
                        className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${(!activeChat || isGenerating) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-teal text-white hover:shadow-teal/20'}`}
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        {!activeChat ? 'Attach Chat to Summarize' : isGenerating ? 'Summarizing...' : 'Summarize Full Chat'}
                    </button>
                )}
                <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-navy text-white rounded-xl font-bold text-xs hover:bg-navy/90 flex items-center justify-center gap-2 transition-all shadow-sm">
                        <Save size={16} /> Save Narrative
                    </button>
                    <button className="p-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-navy hover:border-navy transition-all shadow-sm">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default NotesPanel;