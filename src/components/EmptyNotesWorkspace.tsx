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

const EmptyNotesWorkspace: React.FC = () => {
    const router = useRouter();
    return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-[#f8f9fa] relative overflow-hidden hidden md:flex border-l border-gray-200">
            <div className="z-10 bg-white/90 p-10 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center backdrop-blur-md max-w-md text-center">
                <div className="w-20 h-20 text-teal flex items-center justify-center mb-4 bg-teal/10 rounded-full"><ClipboardList size={40} strokeWidth={1.5} /></div>
                <h2 className="text-2xl font-bold text-navy mb-3">Clinical Scribe & Notes</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">Select an existing note from the sidebar or start a new global scribe session to begin dictating without attaching to a specific chat.</p>
                
                <button onClick={() => router.push('/notes/global_scribe')} className="flex items-center gap-2 px-6 py-3 bg-teal text-white rounded-xl font-bold hover:bg-navy transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    <Mic size={20} />
                    Open Global Scribe
                </button>
            </div>
        </div>
    );
};
export default EmptyNotesWorkspace;