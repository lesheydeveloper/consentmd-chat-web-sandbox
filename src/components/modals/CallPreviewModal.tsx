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

const CallPreviewModal: React.FC = () => {
    const { callPreview, acceptCallPreview, declineCallPreview } = useAppContext();
    const [elapsedTime, setElapsedTime] = useState(0);

    // Reset timer when preview opens/closes, and increment during preview
    useEffect(() => {
        if (!callPreview) {
            setElapsedTime(0);
            return;
        }

        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [callPreview]);

    if (!callPreview) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-96 animate-[slideUp_0.3s_ease-out] border border-gray-100">
                {/* Header Background */}
                <div className="relative h-32 bg-gradient-to-br from-teal/20 via-blue-50 to-purple-50 flex flex-col items-center justify-center">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-teal/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-100/30 rounded-full -ml-16 -mb-16"></div>
                </div>

                {/* Content */}
                <div className="relative px-6 py-8 flex flex-col items-center text-center -mt-16">
                    {/* Avatar */}
                    <img
                        src={callPreview.user.avatar}
                        className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover mb-4 relative z-10"
                        alt={callPreview.user.name}
                    />

                    {/* Name & Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{callPreview.user.name}</h2>
                    <p className="text-sm text-gray-500 mb-4">{callPreview.user.title}</p>

                    {/* Call Type Badge */}
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider bg-teal px-4 py-2 rounded-full mb-6 shadow-md">
                        {callPreview.type === 'video' ? (
                            <>
                                <Video size={14} className="animate-pulse" />
                                VIDEO CALL
                            </>
                        ) : (
                            <>
                                <Phone size={14} className="animate-pulse" />
                                VOICE CALL
                            </>
                        )}
                    </div>

                    {/* Timer */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 justify-center text-gray-600 mb-2">
                            <Clock size={16} />
                            <span className="text-sm font-medium">Elapsed time</span>
                        </div>
                        <div className="text-4xl font-mono font-bold text-teal tracking-wider">
                            {formatTime(elapsedTime)}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="w-full space-y-3">
                        {/* Accept Button */}
                        <button
                            onClick={acceptCallPreview}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-3 shadow-md"
                        >
                            <Phone size={20} className="fill-current" />
                            <span>Accept Call</span>
                        </button>

                        {/* Decline Button */}
                        <button
                            onClick={declineCallPreview}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition-all hover:shadow-md active:scale-95 flex items-center justify-center gap-3 border border-red-200"
                        >
                            <PhoneOff size={20} />
                            <span>Decline</span>
                        </button>

                        {/* More Info Button */}
                        <button
                            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 border border-gray-200 text-sm"
                        >
                            <Info size={16} />
                            <span>More Info</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CallPreviewModal;