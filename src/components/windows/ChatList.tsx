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

const ChatList: React.FC = () => {
    const { chats, activeChat, setActiveChat, searchTerm, setSearchTerm, togglePinChat, toggleNotesPanel, toggleContactPicker, toggleCreateGroup, isNotesPanelOpen, currentUser, mutedChats } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();

    // Extract chatId from URL like /chats/c1
    const pathParts = pathname.split('/');
    const currentChatId = pathParts[1] === 'chats' && pathParts.length > 2 ? pathParts[2] : '';

    useEffect(() => {
        if (currentChatId) {
            const chat = chats.find(c => c.id === currentChatId);
            if (chat && chat.id !== activeChat?.id) {
                setActiveChat(chat);
            }
        } else {
            if (activeChat) setActiveChat(null);
        }
    }, [currentChatId, chats, activeChat, setActiveChat]);

    // Deep search: search chat names AND message content
    const filteredAndSortedChats = chats.filter(c => {
        const searchLower = searchTerm.toLowerCase();
        if (!searchLower.trim()) return true;

        // Search in chat name
        if (c.name.toLowerCase().includes(searchLower)) return true;

        // Search in message content
        if (c.messages.some(m =>
            m.content.toLowerCase().includes(searchLower) ||
            m.metadata?.transcription?.toLowerCase().includes(searchLower) ||
            m.metadata?.fileName?.toLowerCase().includes(searchLower)
        )) return true;

        return false;
    }).sort((a, b) => {
        // Pinned chats always on top
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // Then by last message time
        return (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0);
    });

    const filteredChats = filteredAndSortedChats;

    return (
        <div className="flex flex-col h-full bg-white w-full animate-[fadeIn_0.2s_ease-out] shadow-sm">
            <div className="h-16 bg-white px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
                <h1 className="text-xl font-bold text-navy">Chats</h1>
                <div className="flex gap-2 text-teal">
                    <button onClick={toggleContactPicker} className="hover:bg-gray-100 p-2 rounded-full transition-colors" title="New direct chat"><MessageSquare size={20} /></button>
                    <button onClick={toggleCreateGroup} className="hover:bg-gray-100 p-2 rounded-full transition-colors" title="Create group"><Users size={20} /></button>
                    <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Quick Scribe Button */}
            {(currentUser.role === UserRole.DOCTOR || currentUser.role === UserRole.NURSE) && (
                <div className="px-3 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-purple-50/50 shrink-0">
                    <button
                      onClick={() => {
                        if (!isNotesPanelOpen) {
                          toggleNotesPanel();
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal to-teal/90 text-white rounded-2xl font-bold hover:shadow-md hover:shadow-teal/20 transition-all shadow-sm active:scale-95"
                    >
                      <Mic size={18} className="opacity-90" />
                      <span>Start Quick Scribe</span>
                      <Plus size={16} className="opacity-70" />
                    </button>
                </div>
            )}

            <div className="p-2 border-b border-gray-200 shrink-0 bg-white">
                <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5">
                    <Search size={18} className="text-gray-500 mr-3" />
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        className="bg-transparent w-full focus:outline-none text-[15px] text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredChats.map(chat => {
                    const isSelected = currentChatId === chat.id;
                    const timeStr = chat.lastMessageTime ? chat.lastMessageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

                    return (
                        <div
                            key={chat.id}
                            onClick={() => router.push(`/chats/${chat.id}`)}
                            className={`flex gap-4 p-4 border-b border-gray-50 cursor-pointer hover:bg-[#f5f6f6] transition-all group ${isSelected ? 'bg-[#f0f2f5] border-l-4 border-l-teal' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="relative shrink-0">
                                <img src={chat.avatar} className="w-[48px] h-[48px] rounded-full object-cover" />
                                {chat.type === GroupType.DIRECT && chat.participants[1] && (
                                    <PresenceDot userId={chat.participants[1].id} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-[16px] text-navy truncate pr-2 flex items-center gap-1.5">
                                        {chat.name}
                                        {chat.type === GroupType.SMS && <span className="bg-blue-100 text-blue-700 text[9px] px-1 py-0.5 rounded font-bold uppercase tracking-widest shadow-sm">SMS</span>}
                                        {mutedChats.has(chat.id) && <BellOff size={12} className="text-gray-400 shrink-0" />}
                                    </h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); togglePinChat(chat.id); }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full shrink-0"
                                        title={chat.pinned ? "Unpin chat" : "Pin chat"}
                                    >
                                        {chat.pinned ? <Pin size={16} className="text-teal" /> : <Pin size={16} className="text-gray-400" />}
                                    </button>
                                    <span className="text-[12px] text-gray-400 shrink-0">{timeStr}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {chat.lastMessage?.includes('🎤') && <Mic size={14} className="text-gray-400" />}
                                    {chat.lastMessage?.includes('📷') && <ImageIcon size={14} className="text-gray-400" />}
                                    {chat.lastMessage?.includes('📎') && <Paperclip size={14} className="text-gray-400" />}
                                    {chat.lastMessage && <span className="text-sm text-gray-500 truncate flex-1">{chat.lastMessage}</span>}
                                    {chat.pinned && <Pin size={14} className="text-gray-400 rotate-45 shrink-0" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default ChatList;