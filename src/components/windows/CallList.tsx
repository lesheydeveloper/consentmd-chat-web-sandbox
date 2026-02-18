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
import Dialpad from './Dialpad';
import { User, Chat, Message, GroupType, UserRole, PatientProfile, CallLog, ClinicalNote, SoapSection, NoteTemplateType, UserPreferences, ConsultationType } from '../../../types';
import { MOCK_CALLS, USERS } from '../../../services/mockData';
import { NOTE_TEMPLATES, getAllTemplates } from '../../../templates/noteTemplates';
import { CONSULTATION_TYPES, getAllConsultationTypes } from '../../../constants/consultationTypes';

const CallList: React.FC = () => {
    const router = useRouter();
    const { callId } = useParams();
    const { simulateIncomingCall } = useAppContext();
    const [activeTab, setActiveTab] = useState<'history' | 'dialpad'>('history');

    return (
        <div className="flex flex-col h-full bg-white w-full animate-[fadeIn_0.2s_ease-out] shadow-sm">
            <div className="h-16 bg-white px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
                <h1 className="text-xl font-bold text-navy">Calls</h1>
                <div className="flex gap-4 text-teal">
                    <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><Wifi size={20} /></button>
                    <button onClick={simulateIncomingCall} className="hover:bg-gray-100 p-2 rounded-full transition-colors" title="Simulate Incoming Call"><PhoneCall size={20}/></button>
                </div>
            </div>
            
            <div className="flex border-b border-gray-200 shrink-0">
                <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors ${activeTab === 'history' ? 'text-teal border-b-[3px] border-teal' : 'text-gray-400 hover:text-gray-600'}`}>Call History</button>
                <button onClick={() => setActiveTab('dialpad')} className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors ${activeTab === 'dialpad' ? 'text-teal border-b-[3px] border-teal' : 'text-gray-400 hover:text-gray-600'}`}>Dialpad</button>
            </div>

            {activeTab === 'history' ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {MOCK_CALLS.map(call => {
                        const user = USERS.find(u => u.id === call.userId);
                        if (!user) return null;
                        
                        const isSelected = callId === call.id;
                        const dateStr = `${call.timestamp.getMonth()+1}/${call.timestamp.getDate()}/${call.timestamp.getFullYear()}`;
                        
                        const CallIcon = () => {
                            if (call.direction === 'outgoing') return <ArrowUpRight size={14} className="text-[#53bdeb]" />;
                            if (call.direction === 'incoming' && call.status === 'answered') return <ArrowDownLeft size={14} className="text-teal" />;
                            return <ArrowDownLeft size={14} className="text-red-500" />;
                        };

                        return (
                            <div 
                                key={call.id} 
                                onClick={() => router.push(`/calls/${call.id}`)}
                                className={`flex gap-4 p-4 border-b border-gray-50 cursor-pointer hover:bg-[#f5f6f6] transition-all ${isSelected ? 'bg-[#f0f2f5] border-l-4 border-l-teal' : 'border-l-4 border-l-transparent'}`}
                            >
                                <img src={user.avatar} className="w-12 h-12 rounded-full object-cover shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <div className="flex items-center gap-1.5 truncate pr-2">
                                            <span className="font-bold text-navy text-[15px] truncate">{user.name}</span>
                                            <span className="text-xs text-gray-500 truncate">({user.title})</span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 font-medium shrink-0">{dateStr}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 font-medium">
                                        <CallIcon />
                                        <span>{call.direction === 'outgoing' ? 'Outgoing' : 'Incoming'} {call.type} call &bull; {call.duration}</span>
                                    </div>
                                    
                                    {call.summary && (
                                        <div className="bg-[#f8f9fa] rounded-lg p-2.5 border border-gray-100 shadow-sm group hover:border-teal/20 transition-colors">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Wand2 size={12} className="text-gray-400" />
                                                <span className="text-[9px] font-bold text-teal uppercase tracking-widest">Call Summary</span>
                                            </div>
                                            <p className="text-[11px] text-gray-600 italic leading-relaxed line-clamp-2">{call.summary}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2 text-teal shrink-0">
                                    {call.type === 'video' ? <Video size={22}/> : <Phone size={22}/>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <Dialpad />
            )}
        </div>
    );
};
export default CallList;