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

const MediaPreview: React.FC = () => {
    const { previewMedia, setPreviewMedia } = useAppContext();
    const [zoomLevel, setZoomLevel] = useState(1);

    if (!previewMedia) return null;

    const handleDownload = () => {
        if (previewMedia.metadata?.fileUrl) {
            window.open(previewMedia.metadata.fileUrl, '_blank');
        }
    };

    const zoomOut = () => setZoomLevel(prev => Math.max(1, prev - 0.5));
    const zoomIn = () => setZoomLevel(prev => Math.min(3, prev + 0.5));
    const resetZoom = () => setZoomLevel(1);

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col animate-[fadeIn_0.2s_ease-out]">
            <div className="h-16 flex items-center justify-between px-6 text-white bg-black/50">
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{previewMedia.metadata?.fileName || 'Media Preview'}</span>
                    <span className="text-[10px] opacity-70">{previewMedia.timestamp.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4">
                    {previewMedia.type === 'image' && (
                        <>
                            <span className="text-sm text-white/70 px-3 py-1 bg-white/10 rounded-full font-medium">
                                {zoomLevel.toFixed(1)}x
                            </span>
                            <button onClick={zoomOut} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Zoom Out"><ZoomOut size={20}/></button>
                            <button onClick={resetZoom} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Reset Zoom"><Minimize2 size={20}/></button>
                            <button onClick={zoomIn} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Zoom In"><ZoomIn size={20}/></button>
                        </>
                    )}
                    <button onClick={handleDownload} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Download or Open"><Download size={20}/></button>
                    <button onClick={() => setPreviewMedia(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                {previewMedia.type === 'image' ? (
                    <img
                        src={previewMedia.metadata?.fileUrl}
                        className="shadow-2xl rounded-lg transition-transform duration-200"
                        style={{ transform: `scale(${zoomLevel})` }}
                        alt="Preview"
                    />
                ) : (
                    <div className="bg-white/10 p-12 rounded-3xl flex flex-col items-center gap-6 max-w-lg w-full">
                        <File size={80} className="text-teal" />
                        <div className="text-center">
                            <h3 className="text-white font-bold text-xl mb-1">{previewMedia.metadata?.fileName}</h3>
                            <p className="text-white/50 text-sm">{previewMedia.metadata?.fileSize} &bull; {previewMedia.metadata?.mimeType}</p>
                        </div>
                        <button onClick={handleDownload} className="w-full py-4 bg-teal text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal/90 transition-all">
                            <ExternalLink size={20} /> Open Document
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default MediaPreview;