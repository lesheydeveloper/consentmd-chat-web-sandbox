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

const CallDetails: React.FC = () => {
    const { callId } = useParams();
    const router = useRouter();
    const { chats, startCall, startChat, clinicalNotes } = useAppContext();
    
    const call = MOCK_CALLS.find(c => c.id === callId);
    const user = USERS.find(u => u.id === call?.userId);

    if (!call || !user) return (
        <div className="h-full flex flex-col items-center justify-center bg-[#f0f2f5] text-gray-400">
            <Phone size={48} className="mb-4 opacity-20" />
            <p>Select a call to view details</p>
        </div>
    );

    const timeStr = call.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isOutgoing = call.direction === 'outgoing';

    const handleMessage = () => {
        const directChat = chats.find(c => c.type === GroupType.DIRECT && c.participants.some(p => p.id === user.id));
        if (directChat) {
            router.push(`/chats/${directChat.id}`);
        } else {
            const newChatId = startChat(user.phoneNumber || user.name, false);
            router.push(`/chats/${newChatId}`);
        }
    };

    const ActionBtn = ({ icon, label, onClick }: any) => (
        <button onClick={onClick} className="flex flex-col items-center gap-2 text-teal hover:opacity-80 transition-opacity">
            <div className="p-3 border border-gray-200 rounded-full bg-white shadow-sm group-hover:bg-gray-50">{icon}</div>
            <span className="text-xs font-bold">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-[#f0f2f5] overflow-y-auto custom-scrollbar animate-[fadeIn_0.2s_ease-out]">
            <div className="h-16 bg-white px-4 flex items-center gap-4 border-b border-gray-200 shrink-0 sticky top-0 z-10 shadow-sm">
                <button onClick={() => router.push('/calls')} className="md:hidden text-gray-600 p-2 -ml-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={24}/></button>
                <h2 className="text-lg font-medium text-gray-800">Call info</h2>
            </div>
            
            <div className="p-8 flex flex-col items-center border-b border-gray-200 bg-white">
                <img src={user.avatar} className="w-28 h-28 rounded-full mb-5 shadow-md object-cover" />
                <h1 className="text-3xl font-normal text-gray-900 mb-1">{user.name}</h1>
                <p className="text-sm text-gray-500 mb-3">{user.title}</p>
                <p className="text-lg text-gray-800 tracking-wide">{user.phoneNumber || '+1 (555) 000-0000'}</p>
                <p className="text-xs text-gray-400 mb-8 font-bold uppercase tracking-widest mt-1">Mobile</p>
                
                <div className="flex gap-12 md:gap-16">
                    <ActionBtn icon={<MessageCircle size={22} />} label="Message" onClick={handleMessage} />
                    <ActionBtn icon={<Phone size={22} />} label="Audio" onClick={() => startCall(user, 'voice')} />
                    <ActionBtn icon={<Video size={22} />} label="Video" onClick={() => startCall(user, 'video')} />
                </div>
            </div>
            
            <div className="bg-white mt-2 p-6 md:p-8 flex-1 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-widest">Yesterday</p>
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
                    <div className="flex gap-4">
                        <div className="mt-1">
                            {isOutgoing ? <ArrowUpRight className="text-[#53bdeb]" size={22} /> : <ArrowDownLeft className="text-teal" size={22} />}
                        </div>
                        <div>
                            <p className="text-[15px] font-bold text-gray-900 mb-1">{isOutgoing ? 'Outgoing' : 'Incoming'}</p>
                            <p className="text-sm text-gray-500 font-medium">{call.duration} &bull; {call.dataUsage || 'Unknown data'}</p>
                        </div>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{timeStr}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                    <Wand2 size={16} className="text-teal" />
                    <h3 className="text-[11px] font-bold text-teal uppercase tracking-widest">Transcription / Scribe</h3>
                </div>
                <div className="bg-[#f8f9fa] rounded-2xl p-5 text-sm text-gray-700 border border-gray-200 shadow-inner leading-relaxed font-medium mb-8">
                    {call.transcription || call.summary || "No transcription available for this call."}
                </div>

                {/* SOAP Note Section */}
                {call.metadata?.soapNote && (
                    <div className="border-t pt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <ClipboardList size={16} className="text-purple-600" />
                            <h3 className="text-[11px] font-bold text-purple-600 uppercase tracking-widest">Clinical SOAP Note</h3>
                        </div>

                        <div className="space-y-4 mb-6">
                            {call.metadata.soapNote.subjective && (
                                <button
                                  onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                                  className="w-full text-left bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg p-4 border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-purple-50 transition-all group shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">Subjective</p>
                                        <ChevronRight size={14} className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{call.metadata.soapNote.subjective}</p>
                                </button>
                            )}

                            {call.metadata.soapNote.objective && (
                                <button
                                  onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                                  className="w-full text-left bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg p-4 border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-purple-50 transition-all group shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">Objective</p>
                                        <ChevronRight size={14} className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{call.metadata.soapNote.objective}</p>
                                </button>
                            )}

                            {call.metadata.soapNote.assessment && (
                                <button
                                  onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                                  className="w-full text-left bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg p-4 border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-purple-50 transition-all group shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">Assessment</p>
                                        <ChevronRight size={14} className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{call.metadata.soapNote.assessment}</p>
                                </button>
                            )}

                            {call.metadata.soapNote.plan && (
                                <button
                                  onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                                  className="w-full text-left bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg p-4 border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-purple-50 transition-all group shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">Plan</p>
                                        <ChevronRight size={14} className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{call.metadata.soapNote.plan}</p>
                                </button>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white border-t border-gray-100 p-6 -mx-6 -mb-6 flex gap-3 flex-wrap">
                            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide w-full">
                                Clinical Notes Actions
                            </h3>

                            {/* View Full Notes Button */}
                            <button
                              onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-teal text-white rounded-xl font-bold hover:bg-teal/90 transition-all shadow-md hover:shadow-lg"
                            >
                              <Eye size={18} />
                              View Full Notes
                            </button>

                            {/* Edit Notes Button */}
                            <button
                              onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all shadow-md hover:shadow-lg"
                            >
                              <Edit3 size={18} />
                              Edit Notes
                            </button>

                            {/* Share Notes Button */}
                            <button
                              onClick={() => alert('Share functionality coming soon')}
                              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all border-2 border-gray-300"
                            >
                              <Share2 size={18} />
                              Share Notes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default CallDetails;