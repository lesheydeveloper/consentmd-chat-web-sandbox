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

import { useAppContext } from '../contexts/AppContext';
import { User, Chat, Message, GroupType, UserRole, PatientProfile, CallLog, ClinicalNote, SoapSection, NoteTemplateType, UserPreferences, ConsultationType } from '../../types';
import { MOCK_CALLS, USERS } from '../../services/mockData';
import { NOTE_TEMPLATES, getAllTemplates } from '../../templates/noteTemplates';
import { CONSULTATION_TYPES, getAllConsultationTypes } from '../../constants/consultationTypes';

const EmptyWorkspace: React.FC = () => {
    const { toggleNotesPanel } = useAppContext();
    return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-wa-chat-bg relative overflow-hidden border-l border-gray-200">
            <div className="absolute inset-0 wa-bg pointer-events-none opacity-20"></div>
            <div className="z-10 bg-white/90 p-10 rounded-3xl shadow-lg border border-white flex flex-col items-center backdrop-blur-md max-w-sm text-center">
                <div className="w-20 h-20 text-teal flex items-center justify-center mb-4 bg-teal/10 rounded-full"><MessageSquare size={40} strokeWidth={1.5} /></div>
                <h2 className="text-2xl font-light text-gray-800 mb-3">ConsentMD Workspace</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">Select a patient or care team to begin secure clinical communication, or start a standalone scribe session.</p>
                
                <button onClick={toggleNotesPanel} className="mb-6 flex items-center gap-2 px-6 py-3 bg-teal text-white rounded-xl font-bold hover:bg-navy transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    <Mic size={20} />
                    Start Quick Scribe
                </button>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Lock size={12} /> End-to-end encrypted
                </div>
            </div>
        </div>
    );
};
export default EmptyWorkspace;