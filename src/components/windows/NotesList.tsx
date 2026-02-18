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

const NotesList: React.FC = () => {
    const { clinicalNotes, chats, searchTerm, setSearchTerm } = useAppContext();
    const router = useRouter();
    const { noteId } = useParams();

    const notesArray = Object.values(clinicalNotes)
        .filter((n: ClinicalNote) => {
            const chat = chats.find(c => c.id === n.chatId);
            const title = n.id === 'global_scribe' ? 'Global Quick Scribe' : (chat?.name || 'Unknown');
            return title.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .sort((a: ClinicalNote, b: ClinicalNote) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
        <div className="flex flex-col h-full bg-white w-full animate-[fadeIn_0.2s_ease-out] shadow-sm relative">
            <div className="h-16 bg-white px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
                <h1 className="text-xl font-bold text-navy">Notes & Scribe</h1>
                <div className="flex gap-4 text-teal">
                    <button onClick={() => router.push('/notes/global_scribe')} className="hover:bg-gray-100 p-2 rounded-full transition-colors"><Plus size={20} /></button>
                </div>
            </div>
            
            <div className="p-2 border-b border-gray-200 shrink-0 bg-white">
                <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5">
                    <Search size={18} className="text-gray-500 mr-3" />
                    <input 
                        type="text" 
                        placeholder="Search notes" 
                        className="bg-transparent w-full focus:outline-none text-[15px] text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {notesArray.map((note: ClinicalNote) => {
                    const isGlobal = note.id === 'global_scribe';
                    const chat = chats.find(c => c.id === note.chatId);
                    const title = isGlobal ? 'Global Quick Scribe' : (chat?.name || 'Unknown Record');
                    const isSelected = noteId === note.id;
                    
                    const preview = note.sections?.subjective || note.sections?.objective || note.sections?.assessment || note.sections?.plan || 'No content yet...';

                    return (
                        <div 
                            key={note.id} 
                            onClick={() => router.push(`/notes/${note.id}`)}
                            className={`flex items-center px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] transition-colors border-b border-gray-50 ${isSelected ? 'bg-[#f0f2f5] border-l-4 border-l-teal' : 'border-l-4 border-l-transparent'}`}
                        >
                            {isGlobal ? (
                                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mr-3 shrink-0">
                                    <Mic size={24} className="text-teal" />
                                </div>
                            ) : (
                                <img src={chat?.avatar} className="w-12 h-12 rounded-full mr-3 object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-[16px] text-navy truncate">{title}</h3>
                                    <span className="text-[11px] text-gray-400 shrink-0">{note.updatedAt.toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-500 truncate flex-1">{preview}</p>
                                    {note.suggestions.length > 0 && (
                                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                            <Sparkles size={10} /> {note.suggestions.length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default NotesList;