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

const ActiveCallScreen: React.FC = () => {
    const { activeCallSession, endCall, currentUser, setCallTranscription } = useAppContext();
    const [timer, setTimer] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [liveTranscription, setLiveTranscription] = useState('');
    const [callTranscriptSegments, setCallTranscriptSegments] = useState<string[]>([]);

    // Mock live transcription - simulate real-time caption updates
    useEffect(() => {
        if (!activeCallSession) return;

        const mockTranscripts = [
            "Good morning, how are you feeling today?",
            "Patient reports feeling much better after the medication adjustment.",
            "Blood pressure is currently stable at 120/80 millimeters of mercury.",
            "No signs of infection or adverse reactions observed.",
            "Continue current dosage for the next two weeks.",
            "Schedule follow-up appointment after lab work.",
            "Take all medications with food to avoid stomach upset.",
            "Call immediately if experiencing severe symptoms."
        ];

        let currentIndex = 0;

        const transcriptInterval = setInterval(() => {
            if (currentIndex < mockTranscripts.length && activeCallSession) {
                const text = mockTranscripts[currentIndex];
                setLiveTranscription(text);
                setCallTranscriptSegments(prev => {
                    const updated = [...prev, text];
                    // Update context with full transcription
                    setCallTranscription(updated.join(' '));
                    return updated;
                });
                currentIndex++;
            }
        }, 4000); // New transcription every 4 seconds

        return () => clearInterval(transcriptInterval);
    }, [activeCallSession]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (activeCallSession) {
            setTimer(0);
            interval = setInterval(() => setTimer(prev => prev + 1), 1000);
        }
        return () => {
            if (interval !== undefined) {
                clearInterval(interval);
            }
        };
    }, [activeCallSession]);

    if (!activeCallSession) return null;

    const isVideoCall = activeCallSession.type === 'video';

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const CtrlBtn = ({ icon, active = false, onClick, colorClass = 'bg-white/10 text-white hover:bg-white/20' }: any) => (
        <button onClick={onClick} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md ${active ? 'bg-white text-[#111b21]' : colorClass}`}>
            {icon}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[99999] bg-[#111b21] flex flex-col text-white animate-[fadeIn_0.2s_ease-out] overflow-hidden">
            {/* Header (floating) */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center gap-2 text-gray-300 text-xs tracking-wide font-medium bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                    <Lock size={12} /> End-to-end encrypted
                </div>
                <button className="bg-black/20 p-2.5 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md">
                    <Users size={20} />
                </button>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 relative flex flex-col items-center justify-center">
                {isVideoCall ? (
                    // VIDEO CALL LAYOUT
                    <>
                        {/* Remote Video (Simulated) */}
                        <div className="absolute inset-0 bg-gray-900">
                            {isVideoOff ? (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                                        <img src={activeCallSession.user.avatar} className="w-full h-full rounded-full object-cover opacity-50" />
                                    </div>
                                    <p className="text-xl font-medium">{activeCallSession.user.name}</p>
                                </div>
                            ) : (
                                <img src={activeCallSession.user.avatar} className="w-full h-full object-cover opacity-90 blur-[2px] scale-105" alt="Remote User Video Background" />
                            )}
                            {/* Clearer version of remote user for mock purposes if video is not "off" */}
                            {!isVideoOff && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <img src={activeCallSession.user.avatar} className="w-full h-full object-contain max-h-[80vh]" alt="Remote User" />
                                </div>
                            )}
                        </div>

                        {/* Local Video PiP */}
                        <div className="absolute bottom-32 right-6 w-28 h-40 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/10 z-20 transition-all hover:scale-105 cursor-move">
                            <img src={currentUser.avatar} className="w-full h-full object-cover" alt="Local User Video" />
                            {isMuted && (
                                <div className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
                                    <MicOff size={14} className="text-red-400" />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // AUDIO CALL LAYOUT
                    <div className="flex flex-col items-center justify-center z-10 mt-10">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-[#00a884] rounded-full animate-ping opacity-20 scale-150"></div>
                            <div className="w-40 h-40 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-2xl relative z-10 border-[6px] border-[#111b21]">
                                <img src={activeCallSession.user.avatar} className="w-full h-full rounded-full object-cover" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-medium mb-3 tracking-wide drop-shadow-md">{activeCallSession.user.phoneNumber || activeCallSession.user.name}</h2>
                        <p className="text-gray-400 font-mono text-xl">{formatTime(timer)}</p>
                    </div>
                )}

                {/* Live Scribe Overlay (Shared) */}
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-30">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal"></div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-teal animate-pulse" />
                                <span className="text-[10px] font-bold text-teal uppercase tracking-widest">Live Scribe Active</span>
                            </div>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-200 italic leading-relaxed font-medium">
                            "Patient reports feeling much better after the medication adjustment. Blood pressure is currently stable at 120/80..."
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="h-28 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-4 md:gap-6 px-6 shrink-0 z-40 pb-6">
                <CtrlBtn 
                    icon={isMuted ? <MicOff size={24}/> : <Mic size={24}/>} 
                    active={isMuted} 
                    onClick={() => setIsMuted(!isMuted)} 
                    colorClass={isMuted ? 'bg-white text-gray-900' : 'bg-black/40 text-white hover:bg-black/60'}
                />
                <CtrlBtn 
                    icon={isVideoOff ? <VideoOff size={24}/> : <Video size={24}/>} 
                    active={isVideoOff}
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    colorClass={isVideoOff ? 'bg-white text-gray-900' : 'bg-black/40 text-white hover:bg-black/60'}
                />
                <button onClick={endCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.4)] mx-2">
                    <PhoneOff size={28} />
                </button>
                <CtrlBtn icon={<MonitorUp size={24}/>} colorClass="bg-black/40 text-white hover:bg-black/60" />
                <CtrlBtn icon={<MoreVertical size={24}/>} colorClass="bg-black/40 text-white hover:bg-black/60" />
            </div>
        </div>
    );
};
export default ActiveCallScreen;