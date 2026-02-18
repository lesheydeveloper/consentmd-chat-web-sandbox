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

const NoteEditor: React.FC = () => {
    const { noteId } = useParams();
    const { clinicalNotes, chats, updateClinicalNote, acceptSuggestion, dismissSuggestion, generateFullSOAP, isScribeActive, toggleScribe, userPreferences, openTemplatePicker, currentUser } = useAppContext();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<SoapSection>('subjective');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
    const [editedSuggestionText, setEditedSuggestionText] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplateType>(userPreferences.defaultTemplate as NoteTemplateType);
    const [viewMode, setViewMode] = useState<'note' | 'call_scribe'>('note');

    // Create a default note on demand if it doesn't exist yet
    const noteIdStr = Array.isArray(noteId) ? noteId[0] : (noteId || '');
    let note = clinicalNotes[noteIdStr];

    // If note doesn't exist, create an empty one for any noteId
    if (!note && noteIdStr) {
        const isGlobalScribe = noteIdStr === 'global_scribe';
        const targetChat = chats.find(c => c.id === noteIdStr);

        // Create note if it's global_scribe or if a chat exists with this ID
        if (isGlobalScribe || targetChat) {
            note = {
                id: noteIdStr,
                chatId: isGlobalScribe ? '' : noteIdStr,
                templateType: userPreferences.defaultTemplate,
                sections: {},
                suggestions: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
    }

    if (!note) return (
        <div className="h-full flex flex-col items-center justify-center bg-[#f8f9fa] text-gray-400">
            <ClipboardList size={48} className="mb-4 opacity-20" />
            <p>Note not found</p>
        </div>
    );

    const isGlobal = note.id === 'global_scribe';
    const chat = chats.find(c => c.id === note.chatId);
    const title = isGlobal ? 'Global Quick Scribe' : (chat?.name || 'Clinical Note');

    const handleGenerate = async () => {
        if (isGlobal || !chat) return;
        setIsGenerating(true);
        await generateFullSOAP(chat.id);
        setIsGenerating(false);
    };

    const startEditing = (s: any) => {
        setEditingSuggestionId(s.id);
        setEditedSuggestionText(s.text);
    };

    const handleFinalize = (sId: string) => {
        acceptSuggestion(note.id, sId, editedSuggestionText);
        setEditingSuggestionId(null);
        setEditedSuggestionText("");
    };

    // Get template and build tabs dynamically
    const templateType = (selectedTemplate || userPreferences.defaultTemplate) as NoteTemplateType;
    const template = NOTE_TEMPLATES[templateType];
    const tabs = template.sections.map(section => ({
        id: section.id as SoapSection,
        label: section.label,
        full: section.fullName
    }));

    // Ensure activeTab is valid for current template
    useEffect(() => {
        if (!tabs.find(t => t.id === activeTab)) {
            setActiveTab(tabs[0]?.id || 'subjective');
        }
    }, [templateType, tabs]);

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="h-16 bg-white px-4 flex items-center justify-between border-b border-gray-200 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/notes')} className="md:hidden text-gray-600 p-2 -ml-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={24}/></button>
                    <div className="flex items-center gap-3">
                        {isGlobal ? (
                            <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center"><Mic size={20} className="text-teal" /></div>
                        ) : (
                            <img src={chat?.avatar} className="w-10 h-10 rounded-full object-cover" />
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-navy leading-tight">{title}</h2>
                            <p className="text-xs text-gray-500">Last updated {note.updatedAt.toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Mode Tabs - Only show if note has a callId */}
                    {note.callId && (
                      <div className="hidden md:flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => setViewMode('note')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            viewMode === 'note'
                              ? 'bg-white text-teal shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Clinical Note
                        </button>
                        <button
                          onClick={() => setViewMode('call_scribe')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            viewMode === 'call_scribe'
                              ? 'bg-white text-teal shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Call Scribe
                        </button>
                      </div>
                    )}

                    {/* Template Switcher Button */}
                    <button
                      onClick={() => openTemplatePicker(note.id, selectedTemplate || userPreferences.defaultTemplate, (template) => setSelectedTemplate(template))}
                      className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      <Type size={16} />
                      {NOTE_TEMPLATES[(selectedTemplate || userPreferences.defaultTemplate) as NoteTemplateType]?.name || 'Select Template'}
                      <ChevronRight size={14} className="opacity-50" />
                    </button>

                    <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <Sparkles size={16} className={isScribeActive ? 'text-teal animate-pulse' : 'text-gray-400'} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${isScribeActive ? 'text-teal' : 'text-gray-500'}`}>
                            {isScribeActive ? 'Scribe Active' : 'Scribe Paused'}
                        </span>
                        <button onClick={toggleScribe} className={`ml-2 p-1 rounded-full ${isScribeActive ? 'bg-white text-gray-700 shadow-sm' : 'bg-teal text-white'}`}>
                            {isScribeActive ? <CirclePause size={14} /> : <CirclePlay size={14} />}
                        </button>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Share2 size={20}/></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><MoreVertical size={20}/></button>
                </div>
            </div>
            
            {viewMode === 'call_scribe' && note.callId ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <Phone size={24} />
                                <h2 className="text-2xl font-bold">Call Transcription & Scribe</h2>
                            </div>
                            <p className="text-purple-100 text-sm">
                                Full conversation transcript with AI-generated clinical documentation
                            </p>
                        </div>

                        {/* Transcription Section */}
                        {note.callId && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <MessageCircle size={18} className="text-teal" />
                                        Full Conversation Transcript
                                    </h3>
                                </div>

                                {/* Display transcription - we would get this from chats/messages */}
                                <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto custom-scrollbar border border-gray-200">
                                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                        {(() => {
                                            const allMessages = chats.flatMap(c => c.messages);
                                            const callMsg = allMessages.find(m => m.metadata?.callId === note.callId);
                                            return callMsg?.metadata?.transcription || 'No transcription available for this call.';
                                        })()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* AI-Generated Clinical Note */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={18} className="text-purple-500" />
                                <h3 className="font-bold text-gray-900">AI-Generated Clinical Note</h3>
                            </div>

                            {/* Display note sections */}
                            <div className="space-y-4">
                                {(note.sections as Record<string, string>)?.['subjective'] && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">
                                            Subjective
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{(note.sections as Record<string, string>)['subjective']}</p>
                                    </div>
                                )}

                                {(note.sections as Record<string, string>)?.['objective'] && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">
                                            Objective
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{(note.sections as Record<string, string>)['objective']}</p>
                                    </div>
                                )}

                                {(note.sections as Record<string, string>)?.['assessment'] && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">
                                            Assessment
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{(note.sections as Record<string, string>)['assessment']}</p>
                                    </div>
                                )}

                                {(note.sections as Record<string, string>)?.['plan'] && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">
                                            Plan
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{(note.sections as Record<string, string>)['plan']}</p>
                                    </div>
                                )}

                                {!(note.sections as Record<string, string>)?.['subjective'] && !(note.sections as Record<string, string>)?.['objective'] && !(note.sections as Record<string, string>)?.['assessment'] && !(note.sections as Record<string, string>)?.['plan'] && (
                                    <div className="text-center py-8 text-gray-400">
                                        <ClipboardList size={32} className="mx-auto mb-2 opacity-20" />
                                        <p>No clinical note content yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Action: Switch to Edit Mode */}
                            <button
                              onClick={() => setViewMode('note')}
                              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-teal text-white rounded-xl font-bold hover:bg-teal/90 transition-all shadow-md hover:shadow-lg"
                            >
                              <Edit3 size={18} />
                              Edit Clinical Note
                            </button>
                        </div>

                        {/* Link back to Call Details */}
                        <button
                          onClick={() => router.push(`/calls/${note.callId}`)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                          <ExternalLink size={18} />
                          View Call Details
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Col: Editor */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
                        <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-teal bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <span className="md:hidden">{tab.label}</span>
                                    <span className="hidden md:inline">{tab.full}</span>
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal rounded-t-full"></div>}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 p-6 flex flex-col overflow-hidden">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex justify-between items-center shrink-0">
                                <span>Official {template.sections.find(s => s.id === activeTab)?.fullName || activeTab} Records</span>
                                <button className="text-teal flex items-center gap-1 hover:underline"><Edit3 size={12}/> Formatting Options</button>
                            </label>
                            <textarea
                                value={(note.sections as Record<string, string>)?.[activeTab] || ''}
                                onChange={(e) => updateClinicalNote(note.id, activeTab, e.target.value)}
                                placeholder={template.sections.find(s => s.id === activeTab)?.placeholder || `Start documenting ${activeTab} details here...`}
                                className="flex-1 w-full p-4 border rounded-2xl text-[15px] focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none resize-none bg-white border-gray-200 shadow-inner leading-relaxed custom-scrollbar"
                            ></textarea>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || isGlobal}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${isGlobal ? 'bg-gray-200 text-gray-400' : (isGenerating ? 'bg-teal/70 text-white' : 'bg-teal text-white hover:bg-teal/90')}`}
                            >
                                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                {isGlobal ? 'Attach to Chat to Auto-Summarize' : (isGenerating ? 'Generating SOAP...' : 'Auto-Generate Full SOAP')}
                            </button>
                            <button className="px-6 py-3 bg-navy text-white rounded-xl font-bold text-sm hover:bg-navy/90 flex items-center gap-2 transition-all shadow-sm">
                                <Save size={18} /> Save
                            </button>
                        </div>
                    </div>

                    {/* Right Col: Intelligence Feed */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
                        <h3 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 shrink-0">
                            <div className="p-1.5 bg-purple-100 rounded-lg"><Sparkles size={16} className="text-purple-600" /></div>
                            Intelligence Feed
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 pb-4">
                            {note.suggestions.filter(s => s.section === activeTab).length === 0 && (
                                <div className="text-center py-12 px-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 mt-4">
                                    <Wand2 size={32} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm text-gray-500 font-medium">No active captures for {activeTab}.</p>
                                    <p className="text-xs text-gray-400 mt-2">Turn on the Scribe and speak or type to see AI suggestions appear here.</p>
                                </div>
                            )}
                            {note.suggestions.filter(s => s.section === activeTab).map(s => (
                                <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-purple-300 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                                    {editingSuggestionId === s.id ? (
                                        <div className="space-y-3">
                                            <textarea 
                                                value={editedSuggestionText}
                                                onChange={(e) => setEditedSuggestionText(e.target.value)}
                                                className="w-full text-sm p-3 border rounded-xl border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100 min-h-[120px] bg-purple-50/30 font-medium resize-none"
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingSuggestionId(null)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Discard</button>
                                                <button onClick={() => handleFinalize(s.id)} className="px-5 py-2 text-xs bg-purple-600 text-white rounded-lg font-bold shadow-md hover:bg-purple-700">Finalize</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <p className="text-[14px] text-gray-800 leading-relaxed font-medium">"{s.text}"</p>
                                                <button onClick={() => dismissSuggestion(note.id, s.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shrink-0"><Trash2 size={16}/></button>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                                <button onClick={() => startEditing(s)} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-teal bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-teal/10 transition-colors">
                                                    <Edit3 size={14}/> Edit
                                                </button>
                                                <button onClick={() => acceptSuggestion(note.id, s.id)} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-[11px] font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                                                    <CheckCircle2 size={14}/> Accept
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

const PatientView: React.FC = () => {
    const { patients, selectedPatientId, setSelectedPatientId, addPatient } = useAppContext() as any;
    const [isAddingPatient, setIsAddingPatient] = useState(false);
    const [newPatientForm, setNewPatientForm] = useState({ name: '', dob: '', address: '' });

    const selectedPatient = patients.find((p: PatientProfile) => p.id === selectedPatientId);
    const selectedUser = selectedPatientId ? USERS.find(u => u.id === selectedPatient?.userId) : null;

    const handleAddPatient = () => {
        if (!newPatientForm.name || !newPatientForm.dob) {
            alert('Please fill in name and date of birth');
            return;
        }
        addPatient(newPatientForm);
        setNewPatientForm({ name: '', dob: '', address: '' });
        setIsAddingPatient(false);
    };

    return (
        <div className="h-full flex bg-white overflow-hidden">
            {/* Patient List - Left Panel */}
            <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className="p-4 md:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-lg md:text-xl font-bold text-navy">Patients</h1>
                        <button
                            onClick={() => setIsAddingPatient(!isAddingPatient)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Add Patient"
                        >
                            <Plus size={20} className="text-teal" />
                        </button>
                    </div>

                    {/* Add Patient Form */}
                    {isAddingPatient && (
                        <div className="space-y-3 bg-white p-4 rounded-xl border border-teal/20">
                            <input
                                type="text"
                                placeholder="Patient Name"
                                value={newPatientForm.name}
                                onChange={(e) => setNewPatientForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal focus:ring-2 focus:ring-teal/20"
                            />
                            <input
                                type="date"
                                value={newPatientForm.dob}
                                onChange={(e) => setNewPatientForm(prev => ({ ...prev, dob: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal focus:ring-2 focus:ring-teal/20"
                            />
                            <input
                                type="text"
                                placeholder="Address (optional)"
                                value={newPatientForm.address}
                                onChange={(e) => setNewPatientForm(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal focus:ring-2 focus:ring-teal/20"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddPatient}
                                    className="flex-1 px-3 py-2 bg-teal text-white rounded-lg font-bold text-sm hover:bg-teal/90 transition-all"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => setIsAddingPatient(false)}
                                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Patient List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {patients.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No patients yet</div>
                    ) : (
                        <div className="space-y-2 p-4">
                            {patients.map((patient: PatientProfile) => (
                                <button
                                    key={patient.id}
                                    onClick={() => setSelectedPatientId(patient.id)}
                                    className={`w-full text-left p-4 rounded-lg transition-all ${
                                        selectedPatientId === patient.id
                                            ? 'bg-white border-2 border-teal shadow-md'
                                            : 'bg-white border border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="font-bold text-navy text-sm">{USERS.find(u => u.id === patient.userId)?.name || 'Unknown'}</div>
                                    <div className="text-xs text-teal font-bold mt-1">MRN: {patient.mrn}</div>
                                    <div className="text-xs text-gray-500 mt-1">{patient.dob}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Patient Details - Right Panel */}
            {selectedPatient && selectedUser ? (
                <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar animate-[fadeIn_0.3s_ease-out]">
                    <div className="max-w-4xl">
                        {/* Patient Header */}
                        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8 bg-gray-50 p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
                            <img src={selectedUser.avatar} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-white shadow-xl" />
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-2xl md:text-4xl font-black text-navy mb-2">{selectedUser.name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-2 bg-teal text-white px-3 py-1 rounded-full">MRN: {selectedPatient.mrn}</span>
                                    <span className="flex items-center gap-2"><Calendar size={14} className="text-teal"/> {selectedPatient.dob}</span>
                                    <span className="flex items-center gap-2"><MapIcon size={14} className="text-teal"/> {selectedPatient.address || 'No address'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Patient Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {/* Diagnosis */}
                            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[28px] shadow-sm">
                                <h2 className="font-black text-navy mb-4 md:mb-6 flex items-center gap-3 text-base md:text-lg uppercase tracking-tight">
                                    <Stethoscope size={20} className="text-teal" /> Diagnosis
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPatient.diagnosis.length === 0 ? (
                                        <span className="text-gray-500 text-sm">No diagnoses recorded</span>
                                    ) : (
                                        selectedPatient.diagnosis.map((d: string) => (
                                            <span key={d} className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-black border border-red-100">
                                                {d}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Medications */}
                            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[28px] shadow-sm">
                                <h2 className="font-black text-navy mb-4 md:mb-6 flex items-center gap-3 text-base md:text-lg uppercase tracking-tight">
                                    <FileText size={20} className="text-teal" /> Medications
                                </h2>
                                <div className="space-y-3">
                                    {selectedPatient.medications.length === 0 ? (
                                        <span className="text-gray-500 text-sm">No medications recorded</span>
                                    ) : (
                                        selectedPatient.medications.map((m: any) => (
                                            <div key={m.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <span className="font-black text-navy text-sm">{m.name}</span>
                                                <span className="bg-white px-3 py-1 rounded-lg border border-gray-100 text-xs font-black text-teal">{m.dosage}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Allergies */}
                            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[28px] shadow-sm">
                                <h2 className="font-black text-navy mb-4 md:mb-6 flex items-center gap-3 text-base md:text-lg uppercase tracking-tight">
                                    <AlertCircle size={20} className="text-orange-500" /> Allergies
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPatient.allergies.length === 0 ? (
                                        <span className="text-gray-500 text-sm">No allergies recorded</span>
                                    ) : (
                                        selectedPatient.allergies.map((a: string) => (
                                            <span key={a} className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-black border border-orange-100">
                                                {a}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <Users size={48} className="mx-auto mb-4 opacity-30" />
                        <p>Select a patient to view details</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const Sidebar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { currentUser, toggleSettings, updateCurrentUser } = useAppContext();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [editName, setEditName] = useState(currentUser.name);
    const [editPhone, setEditPhone] = useState(currentUser.phoneNumber || '');
    const [editAvatar, setEditAvatar] = useState(currentUser.avatar);

    const NavButton = ({ icon, path, label }: any) => {
        const isActive = path === '/' 
            ? pathname === '/' || pathname.startsWith('/chats') 
            : pathname.startsWith(path);
        
        return (
            <button 
                onClick={() => router.push(path === '/' ? '/chats' : path)}
                className={`flex-1 md:flex-none flex flex-col items-center justify-center gap-1 md:gap-1.5 py-2 md:p-3 md:rounded-2xl transition-all relative group ${isActive ? 'text-teal md:bg-teal md:text-white md:shadow-md' : 'text-gray-400 hover:text-gray-600 md:text-gray-500 md:hover:bg-gray-200'}`}
            >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                    {icon}
                </div>
                <span className={`text-[10px] md:text-[11px] font-semibold tracking-wide ${isActive ? 'text-teal md:text-white' : 'text-gray-400 md:text-gray-500'}`}>{label}</span>
            </button>
        );
    };

    return (
        <div className="w-full md:w-[72px] bg-white md:bg-[#f0f2f5] border-t md:border-t-0 md:border-r border-gray-200 flex md:flex-col items-center justify-between shrink-0 z-50 pb-2 md:pb-4 md:pt-4 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] md:shadow-none relative" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}>
            <div className="flex md:flex-col items-center justify-around w-full md:w-auto px-2 md:px-0 pt-1.5 pb-1 md:py-0 md:gap-4">
                <NavButton icon={<MessageSquare size={24} />} path="/" label="Chats" />
                <NavButton icon={<Phone size={24} />} path="/calls" label="Calls" />
                <NavButton icon={<ClipboardList size={24} />} path="/notes" label="Notes" />
                <NavButton icon={<Users size={24} />} path="/patients" label="Patients" />
            </div>
            
            <div className="hidden md:flex flex-col items-center gap-4">
                <button
                  onClick={toggleSettings}
                  className="p-3 text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"
                  title="Settings"
                >
                    <Settings size={24} />
                </button>
                <img src={currentUser.avatar} onClick={() => { setEditName(currentUser.name); setEditPhone(currentUser.phoneNumber || ''); setEditAvatar(currentUser.avatar); setIsEditProfileOpen(true); }} className="w-10 h-10 rounded-full border border-gray-300 object-cover cursor-pointer" />
            </div>

            {/* Edit Profile Modal */}
            {isEditProfileOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setIsEditProfileOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-teal to-teal/80 text-white p-6 text-center">
                            <img src={editAvatar} className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white/30 object-cover" />
                            <h2 className="text-xl font-bold">Edit Profile</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Display Name</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)}
                                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-teal text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                                <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-teal text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avatar URL</label>
                                <input value={editAvatar} onChange={e => setEditAvatar(e.target.value)}
                                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-teal text-sm" />
                            </div>
                        </div>
                        <div className="border-t p-4 flex justify-end gap-3">
                            <button onClick={() => setIsEditProfileOpen(false)}
                                className="px-5 py-2.5 text-gray-600 rounded-xl font-medium hover:bg-gray-100">
                                Cancel
                            </button>
                            <button onClick={() => { updateCurrentUser({ name: editName, phoneNumber: editPhone, avatar: editAvatar }); setIsEditProfileOpen(false); }}
                                className="px-6 py-2.5 bg-teal text-white rounded-xl font-bold hover:bg-teal/90">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoteEditor;
