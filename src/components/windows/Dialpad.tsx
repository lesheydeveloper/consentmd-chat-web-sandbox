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

const Dialpad: React.FC = () => {
    const [digits, setDigits] = useState('');
    const { startCall, startChat } = useAppContext();
    const router = useRouter();

    const formatNumber = (num: string) => {
        if (num.length > 10) return num;
        if (num.length > 7) return `(${num.slice(0,3)}) ${num.slice(3,6)}-${num.slice(6)}`;
        if (num.length > 3) return `${num.slice(0,3)}-${num.slice(3)}`;
        return num;
    };

    const handleCall = (video: boolean) => {
        if (!digits) return;
        const user: User = { 
            id: `u_${Date.now()}`, 
            name: digits, 
            phoneNumber: digits, 
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(digits)}&background=random`, 
            role: UserRole.PATIENT 
        };
        startCall(user, video ? 'video' : 'voice');
    };

    const handleSMS = () => {
        if (!digits) return;
        const chatId = startChat(digits, true);
        router.push(`/chats/${chatId}`);
    };

    const pads = [
        { main: '1', sub: '' }, { main: '2', sub: 'ABC' }, { main: '3', sub: 'DEF' },
        { main: '4', sub: 'GHI' }, { main: '5', sub: 'JKL' }, { main: '6', sub: 'MNO' },
        { main: '7', sub: 'PQRS' }, { main: '8', sub: 'TUV' }, { main: '9', sub: 'WXYZ' },
        { main: '*', sub: '' }, { main: '0', sub: '+' }, { main: '#', sub: '' }
    ];

    return (
        <div className="flex flex-col items-center justify-center flex-1 h-full bg-white animate-[fadeIn_0.2s_ease-out] py-8">
            {/* Number Display */}
            <div className="w-full max-w-xs h-24 flex items-center justify-center relative mb-6">
                <h2 className="text-4xl font-light text-navy tracking-widest">{formatNumber(digits) || ' '}</h2>
                {digits && (
                    <button onClick={() => setDigits(prev => prev.slice(0, -1))} className="absolute right-0 text-gray-400 hover:text-gray-600 p-2 transition-colors">
                        <Delete size={28} />
                    </button>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-x-10 gap-y-6 mb-10">
                {pads.map(pad => (
                    <button 
                        key={pad.main} 
                        onClick={() => setDigits(prev => prev + pad.main)} 
                        className="w-20 h-20 rounded-full bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center transition-colors shadow-sm border border-gray-100 active:bg-gray-200"
                    >
                        <span className="text-[28px] font-normal text-navy leading-none">{pad.main}</span>
                        {pad.sub && <span className="text-[10px] text-gray-500 font-bold mt-0.5 tracking-widest">{pad.sub}</span>}
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-8">
                <button onClick={handleSMS} className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors shadow-sm relative group" title="Send SMS">
                    <MessageSquare size={26} fill="currentColor" className="opacity-90 group-hover:scale-105 transition-transform" />
                    <span className="absolute -bottom-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">SMS</span>
                </button>
                <button onClick={() => handleCall(false)} className="w-20 h-20 rounded-full bg-teal text-white flex items-center justify-center hover:bg-teal/90 transition-transform hover:scale-105 shadow-lg relative group">
                    <Phone size={32} fill="currentColor" />
                    <span className="absolute -bottom-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Call</span>
                </button>
                <button onClick={() => handleCall(true)} className="w-16 h-16 rounded-full bg-gray-100 text-teal flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm relative group" title="Video Call">
                    <Video size={26} fill="currentColor" className="opacity-90 group-hover:scale-105 transition-transform" />
                    <span className="absolute -bottom-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Video</span>
                </button>
            </div>
        </div>
    );
};
export default Dialpad;