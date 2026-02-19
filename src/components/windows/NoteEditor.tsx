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

export default NoteEditor;
