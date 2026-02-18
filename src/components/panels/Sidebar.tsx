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

const Sidebar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { currentUser, toggleSettings, updateCurrentUser } = useAppContext();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [editName, setEditName] = useState(currentUser.name);
    const [editPhone, setEditPhone] = useState(currentUser.phoneNumber || '');
    const [editAvatar, setEditAvatar] = useState(currentUser.avatar);

    const NavButton = ({ icon, path, label }: any) => {
        const isActive = path === '/' 
            ? pathname === '/' || pathname.startsWith('/chats') 
            : pathname.startsWith(path);
        
        return (
            <button 
                onClick={() => router.push(path === '/' ? '/chats' : path)}
                className={`flex-1 md:flex-none flex flex-col items-center justify-center gap-1 md:gap-1.5 py-2 md:p-3 md:rounded-2xl transition-all relative group ${isActive ? 'text-teal md:bg-teal md:text-white md:shadow-md' : 'text-gray-400 hover:text-gray-600 md:text-gray-500 md:hover:bg-gray-200'}`}
            >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                    {icon}
                </div>
                <span className={`text-[10px] md:text-[11px] font-semibold tracking-wide ${isActive ? 'text-teal md:text-white' : 'text-gray-400 md:text-gray-500'}`}>{label}</span>
            </button>
        );
    };

    return (
        <div className="w-full md:w-[72px] bg-white md:bg-[#f0f2f5] border-t md:border-t-0 md:border-r border-gray-200 flex md:flex-col items-center justify-between shrink-0 z-50 pb-2 md:pb-4 md:pt-4 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] md:shadow-none relative" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}>
            <div className="flex md:flex-col items-center justify-around w-full md:w-auto px-2 md:px-0 pt-1.5 pb-1 md:py-0 md:gap-4">
                <NavButton icon={<MessageSquare size={24} />} path="/" label="Chats" />
                <NavButton icon={<Phone size={24} />} path="/calls" label="Calls" />
                <NavButton icon={<ClipboardList size={24} />} path="/notes" label="Notes" />
                <NavButton icon={<Users size={24} />} path="/patients" label="Patients" />
            </div>
            
            <div className="hidden md:flex flex-col items-center gap-4">
                <button
                  onClick={toggleSettings}
                  className="p-3 text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"
                  title="Settings"
                >
                    <Settings size={24} />
                </button>
                <img src={currentUser.avatar} onClick={() => { setEditName(currentUser.name); setEditPhone(currentUser.phoneNumber || ''); setEditAvatar(currentUser.avatar); setIsEditProfileOpen(true); }} className="w-10 h-10 rounded-full border border-gray-300 object-cover cursor-pointer" />
            </div>

            {/* Edit Profile Modal */}
            {isEditProfileOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setIsEditProfileOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-teal to-teal/80 text-white p-6 text-center">
                            <img src={editAvatar} className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white/30 object-cover" />
                            <h2 className="text-xl font-bold">Edit Profile</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Display Name</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)}
                                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-teal text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                                <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-teal text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avatar URL</label>
                                <input value={editAvatar} onChange={e => setEditAvatar(e.target.value)}
                                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-teal text-sm" />
                            </div>
                        </div>
                        <div className="border-t p-4 flex justify-end gap-3">
                            <button onClick={() => setIsEditProfileOpen(false)}
                                className="px-5 py-2.5 text-gray-600 rounded-xl font-medium hover:bg-gray-100">
                                Cancel
                            </button>
                            <button onClick={() => { updateCurrentUser({ name: editName, phoneNumber: editPhone, avatar: editAvatar }); setIsEditProfileOpen(false); }}
                                className="px-6 py-2.5 bg-teal text-white rounded-xl font-bold hover:bg-teal/90">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Sidebar;