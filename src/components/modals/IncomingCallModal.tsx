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

const IncomingCallModal: React.FC = () => {
    const { incomingCall, acceptCall, declineCall } = useAppContext();
    const [ringCount, setRingCount] = useState(0);

    // Simulate ringing animation
    useEffect(() => {
        const ringInterval = setInterval(() => {
            setRingCount(prev => (prev + 1) % 4);
        }, 500);
        return () => clearInterval(ringInterval);
    }, []);

    if (!incomingCall) return null;

    return (
        <div className="fixed top-4 right-4 md:top-8 md:right-8 w-80 bg-white rounded-3xl shadow-2xl z-[9999] overflow-hidden animate-[slideDown_0.3s_ease-out] border border-gray-100">
            <div className="p-8 flex flex-col items-center text-center relative bg-gradient-to-b from-white to-blue-50">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-100 to-transparent"></div>

                {/* Animated Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className={`absolute rounded-full border-2 border-teal/30 transition-all duration-500 ${
                                ringCount > i ? 'opacity-0 scale-150' : 'opacity-100 scale-100'
                            }`}
                            style={{
                                width: `${100 + i * 40}px`,
                                height: `${100 + i * 40}px`
                            }}
                        ></div>
                    ))}
                </div>

                <img src={incomingCall.user.avatar} className="w-24 h-24 rounded-full mb-4 shadow-xl relative z-10 border-4 border-white object-cover" />
                <h3 className="text-2xl font-bold text-gray-900 relative z-10 mb-1">{incomingCall.user.name}</h3>
                <p className="text-sm text-gray-500 mb-3 relative z-10">{incomingCall.user.title}</p>
                <div className="flex items-center gap-2 text-[11px] font-bold text-teal uppercase tracking-wider relative z-10 bg-teal/10 px-3 py-1.5 rounded-full">
                    {incomingCall.type === 'video' ? <Video size={14} /> : <PhoneIncoming size={14} />}
                    INCOMING {incomingCall.type.toUpperCase()} CALL
                </div>
            </div>

            <div className="flex border-t border-gray-100">
                <button
                    onClick={declineCall}
                    className="flex-1 py-5 flex flex-col items-center gap-2 hover:bg-red-50 text-red-500 transition-all hover:scale-105 active:scale-95"
                >
                    <PhoneOff size={26} />
                    <span className="text-xs font-bold">Decline</span>
                </button>
                <div className="w-px bg-gray-100"></div>
                <button
                    onClick={acceptCall}
                    className="flex-1 py-5 flex flex-col items-center gap-2 hover:bg-green-50 text-green-500 transition-all hover:scale-105 active:scale-95 font-bold"
                >
                    <Phone size={26} className="fill-current animate-pulse" />
                    <span className="text-xs font-bold">Accept</span>
                </button>
            </div>
        </div>
    );
};
export default IncomingCallModal;