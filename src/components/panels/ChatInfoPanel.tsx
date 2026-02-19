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
import PresenceDot from '../PresenceDot';
import { User, Chat, Message, GroupType, UserRole, PatientProfile, CallLog, ClinicalNote, SoapSection, NoteTemplateType, UserPreferences, ConsultationType } from '../../../types';
import { MOCK_CALLS, USERS } from '../../../services/mockData';
import { NOTE_TEMPLATES, getAllTemplates } from '../../../templates/noteTemplates';
import { CONSULTATION_TYPES, getAllConsultationTypes } from '../../../constants/consultationTypes';

const ChatInfoPanel: React.FC = () => {
    const { activeChat, currentUser, isChatInfoOpen, toggleChatInfo, setPreviewMedia, isGroupAdmin, removeGroupMember, openAddMembers, leaveGroup, mutedChats, toggleMuteChat } = useAppContext();
    const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
    const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
    const [isKeyVerifyOpen, setIsKeyVerifyOpen] = useState(false);
    const router = useRouter();

    // Reset state when chat changes
    useEffect(() => {
        setConfirmRemoveId(null);
        setIsGalleryExpanded(false);
        setIsKeyVerifyOpen(false);
    }, [activeChat?.id]);

    // Early return AFTER all hooks
    if (!activeChat || !isChatInfoOpen) return null;

    const mediaMessages = activeChat.messages.filter(m => m.type === 'image' || m.type === 'file');

    const isDirect = activeChat.type === GroupType.DIRECT || activeChat.type === GroupType.SMS;
    const directContact = isDirect ? activeChat.participants.find(p => p.id !== currentUser.id) : null;
    const displayAvatar = isDirect && directContact ? directContact.avatar : activeChat.avatar;
    const displayName = isDirect && directContact ? directContact.name : activeChat.name;
    const canManageGroup = !isDirect && isGroupAdmin(activeChat);

    const handleRemoveClick = (userId: string) => {
        if (confirmRemoveId === userId) {
            removeGroupMember(activeChat.id, userId);
            setConfirmRemoveId(null);
        } else {
            setConfirmRemoveId(userId);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] md:relative md:inset-auto md:w-[350px] bg-[#f0f2f5] border-l border-gray-200 h-full flex flex-col shrink-0 animate-[slideLeft_0.2s_ease-out] md:z-40 overflow-hidden">
            <div className="h-16 bg-white flex items-center px-4 border-b shrink-0">
                <button onClick={toggleChatInfo} className="p-2 hover:bg-gray-100 text-gray-600 rounded-full mr-4 transition-colors">
                    <X size={24}/>
                </button>
                <h3 className="font-medium text-gray-900 text-[17px]">
                    {isDirect ? 'Contact info' : 'Group info'}
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                {/* Profile Block */}
                <div className="bg-white p-6 flex flex-col items-center text-center shadow-sm">
                    <img src={displayAvatar} className="w-48 h-48 rounded-full mb-5 object-cover shadow-sm" alt="Avatar" />
                    <h2 className="text-2xl font-normal text-gray-900 mb-1">{displayName}</h2>
                    {isDirect && directContact ? (
                        <div className="flex flex-col items-center mt-1">
                            <p className="text-[17px] text-gray-700">{directContact.phoneNumber || '+1 (555) 000-0000'}</p>
                            <p className="text-sm text-gray-500 mt-1">{directContact.title || directContact.role}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Group • {activeChat.participants.length} participants
                        </p>
                    )}
                </div>

                {/* Media Block */}
                <div className="bg-white px-4 py-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Media, Links and Docs</h4>
                        <button onClick={() => setIsGalleryExpanded(v => !v)}
                            className="flex items-center text-teal text-sm gap-1 hover:underline">
                            {mediaMessages.length} {isGalleryExpanded ? <ChevronUp size={18}/> : <ChevronRight size={18}/>}
                        </button>
                    </div>

                    {isGalleryExpanded ? (
                        <div className="grid grid-cols-3 gap-1">
                            {mediaMessages.map(m => (
                                <div key={m.id} onClick={() => setPreviewMedia(m)}
                                    className="aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer group relative">
                                    {m.type === 'image' ? (
                                        <img src={m.metadata?.fileUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Media"/>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-teal/10 text-teal gap-1 p-2">
                                            <File size={24}/>
                                            <span className="text-[9px] text-center truncate w-full text-teal/80">{m.metadata?.fileName}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {mediaMessages.length === 0 && <p className="col-span-3 text-xs text-gray-400 italic">No media shared yet.</p>}
                        </div>
                    ) : (
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                            {mediaMessages.slice(0, 3).map(m => (
                                <div key={m.id} onClick={() => setPreviewMedia(m)} className="shrink-0 w-[86px] h-[86px] bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
                                    {m.type === 'image' ? (
                                        <img src={m.metadata?.fileUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Media"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-teal/10 text-teal"><File size={32}/></div>
                                    )}
                                </div>
                            ))}
                            {mediaMessages.length === 0 && <p className="text-xs text-gray-400 italic">No media shared yet.</p>}
                        </div>
                    )}
                </div>

                {/* Settings Block */}
                <div className="bg-white shadow-sm flex flex-col">
                    <div className="flex justify-between items-center p-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50" onClick={() => toggleMuteChat(activeChat.id)}>
                        <div className="flex items-center gap-4 text-gray-800">
                            <Bell size={24} className="text-gray-500 shrink-0" />
                            <span className="text-[17px]">Mute notifications</span>
                        </div>
                        <div className={`w-10 h-[22px] rounded-full relative cursor-pointer transition-colors ${mutedChats.has(activeChat.id) ? 'bg-teal' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${mutedChats.has(activeChat.id) ? 'left-5' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50" onClick={() => setIsKeyVerifyOpen(true)}>
                        <Lock size={22} className="text-gray-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                            <span className="text-[17px] text-gray-800 mb-0.5">Encryption</span>
                            <span className="text-sm text-gray-500 leading-snug">
                                Messages and calls are end-to-end encrypted. Click to verify.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Participants Block */}
                {!isDirect && (
                    <div className="bg-white shadow-sm p-5 pb-8 mb-4">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="text-sm font-medium text-gray-500">{activeChat.participants.length} participants</h4>
                            {canManageGroup && (
                                <button onClick={() => openAddMembers(activeChat.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal/10 text-teal rounded-full text-xs font-bold hover:bg-teal/20 transition-colors">
                                    <UserPlus size={14} /> Add Member
                                </button>
                            )}
                        </div>
                        <div className="space-y-4" onClick={() => setConfirmRemoveId(null)}>
                            {activeChat.participants.map(p => (
                                <div key={p.id} className="group flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                                    <div className="relative shrink-0">
                                        <img src={p.avatar} className="w-[46px] h-[46px] rounded-full object-cover" />
                                        <PresenceDot userId={p.id} size="md" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[17px] text-gray-900 truncate">
                                                {p.id === currentUser.id ? 'You' : p.name}
                                            </span>
                                            <span className="text-sm text-gray-500">{p.role}</span>
                                        </div>
                                        {(activeChat.adminId === p.id || p.role === UserRole.ADMIN) && (
                                            <span className="text-[11px] text-teal border border-teal/40 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                                                {activeChat.adminId === p.id ? 'Group Admin' : 'Admin'}
                                            </span>
                                        )}
                                    </div>
                                    {canManageGroup && p.id !== currentUser.id && activeChat.adminId !== p.id && (
                                        <button
                                            onClick={(e: any) => { e.stopPropagation(); handleRemoveClick(p.id); }}
                                            className={confirmRemoveId === p.id
                                                ? 'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white'
                                                : 'opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all'}
                                        >
                                            <X size={confirmRemoveId === p.id ? 12 : 14} />
                                            {confirmRemoveId === p.id && <span>Remove?</span>}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Danger Zone */}
                <div className="bg-white shadow-sm p-5 pb-8 mb-4">
                    <h4 className="text-sm font-medium text-red-600 mb-4 uppercase tracking-wide">Danger Zone</h4>
                    <div className="space-y-2 flex flex-col">
                        <button onClick={() => { if (!isDirect) { leaveGroup(activeChat.id); toggleChatInfo(); router.push('/chats'); } }}
                            className="text-left text-red-600 text-[17px] hover:bg-red-50 p-3 rounded-lg transition-colors font-medium">
                            {isDirect ? 'Block' : 'Exit group'}
                        </button>
                        <button className="text-left text-red-600 text-[17px] hover:bg-red-50 p-3 rounded-lg transition-colors font-medium">
                            Report {isDirect ? 'user' : 'group'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Verification Modal */}
            {isKeyVerifyOpen && directContact && (() => {
                const hash = (directContact.id + currentUser.id).split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
                const rows = Array.from({length: 12}, (_, i) => ((hash * (i + 7) * 13) % 99999).toString().padStart(5, '0'));
                return (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setIsKeyVerifyOpen(false)}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 text-center">
                                <Shield size={40} className="mx-auto mb-3"/>
                                <h2 className="text-xl font-bold">Safety Numbers</h2>
                                <p className="text-sm text-gray-300 mt-1">Verify with {directContact.name}</p>
                            </div>
                            <div className="p-6">
                                <p className="text-xs text-gray-500 mb-4 text-center">
                                    If these numbers match on both devices, your conversation is end-to-end encrypted.
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                    {rows.map((num, i) => (
                                        <span key={i} className="text-center font-mono text-sm bg-gray-100 rounded p-2">{num}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t p-4 flex justify-end">
                                <button onClick={() => setIsKeyVerifyOpen(false)}
                                    className="px-6 py-2.5 bg-teal text-white rounded-xl font-bold hover:bg-teal/90">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
export default ChatInfoPanel;