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
import { TbMessagePlus } from "react-icons/tb";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { PiUsersThreeBold, PiUserBold } from "react-icons/pi";

import { useAppContext } from '../../contexts/AppContext';
import PresenceDot from '../PresenceDot';
import { User, Chat, Message, GroupType, UserRole, PatientProfile, CallLog, ClinicalNote, SoapSection, NoteTemplateType, UserPreferences, ConsultationType } from '../../../types';
import { MOCK_CALLS, USERS } from '../../../services/mockData';
import { NOTE_TEMPLATES, getAllTemplates } from '../../../templates/noteTemplates';
import { CONSULTATION_TYPES, getAllConsultationTypes } from '../../../constants/consultationTypes';

type FilterType = 'all' | 'groups' | 'unread' | 'personal' | 'business';

const ChatList: React.FC = () => {
    const { chats, activeChat, setActiveChat, searchTerm, setSearchTerm, togglePinChat, toggleNotesPanel, toggleContactPicker, toggleCreateGroup, isNotesPanelOpen, currentUser, mutedChats } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

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

    // Helper function to check if chat has unread messages
    const hasUnreadMessages = (chat: Chat) => {
        return chat.messages.some(m => !m.isRead && m.senderId !== currentUser.id);
    };

    // Apply filter
    const applyFilter = (chat: Chat) => {
        switch (activeFilter) {
            case 'groups':
                return chat.type !== GroupType.DIRECT;
            case 'unread':
                return hasUnreadMessages(chat);
            case 'personal':
                return chat.type === GroupType.DIRECT;
            case 'business':
                return chat.type === GroupType.SMS;
            default:
                return true;
        }
    };

    // Calculate filter counts
    const filterCounts = {
        all: chats.length,
        groups: chats.filter(c => c.type !== GroupType.DIRECT).length,
        unread: chats.filter(hasUnreadMessages).length,
        personal: chats.filter(c => c.type === GroupType.DIRECT).length,
        business: chats.filter(c => c.type === GroupType.SMS).length,
    };

    // Deep search: search chat names AND message content
    const filteredAndSortedChats = chats.filter(c => {
        // Apply active filter first
        if (!applyFilter(c)) return false;

        // Then apply search filter
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
            <div className="h-14 md:h-16 bg-white px-3 md:px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
                <h1 className="text-lg md:text-xl font-bold text-navy">Chats</h1>
                <div className="flex gap-1 md:gap-2 text-teal">
                    <button onClick={toggleContactPicker} className="hover:bg-gray-100 p-1.5 md:p-2 rounded-full transition-colors" title="New direct chat"><TbMessagePlus size={20} className="md:w-[23px] md:h-[23px]" /></button>
                    <button onClick={toggleCreateGroup} className="hover:bg-gray-100 p-1.5 md:p-2 rounded-full transition-colors" title="Create group"><AiOutlineUsergroupAdd size={20} className="md:w-[23px] md:h-[23px]" /></button>
                    <button className="hover:bg-gray-100 p-1.5 md:p-2 rounded-full transition-colors"><MoreVertical size={18} className="md:w-[20px] md:h-[20px]" /></button>
                </div>
            </div>

            {/* Quick Scribe Button */}
            {(currentUser.role === UserRole.DOCTOR || currentUser.role === UserRole.NURSE) && (
                <div className="px-2 md:px-3 py-2 md:py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-purple-50/50 shrink-0">
                    <button
                      onClick={() => {
                        if (!isNotesPanelOpen) {
                          toggleNotesPanel();
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-teal to-teal/90 text-white rounded-full font-bold hover:shadow-md hover:shadow-teal/20 transition-all shadow-sm active:scale-95 text-sm md:text-base"
                    >
                      <Mic size={16} className="md:w-[18px] md:h-[18px] opacity-90" />
                      <span>Start Quick Scribe</span>
                      <Plus size={14} className="md:w-[16px] md:h-[16px] opacity-70" />
                    </button>
                </div>
            )}

            <div className="p-2 md:p-2 border-b border-gray-200 shrink-0 bg-white">
                <div className="bg-[#f0f2f5] rounded-lg flex items-center px-2 md:px-3 py-1.5 mb-2">
                    <Search size={16} className="md:w-[18px] md:h-[18px] text-gray-500 mr-2 md:mr-3 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        className="bg-transparent w-full focus:outline-none text-sm md:text-[15px] text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Filter Buttons */}
                <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all border shrink-0 ${
                            activeFilter === 'all'
                                ? 'bg-teal text-white border-teal shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        All
                        {filterCounts.all > 0 && (
                            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                                activeFilter === 'all' ? 'bg-white/20' : 'bg-gray-100'
                            }`}>
                                {filterCounts.all}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveFilter('groups')}
                        className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-1 md:gap-1.5 shrink-0 ${
                            activeFilter === 'groups'
                                ? 'bg-teal text-white border-teal shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <PiUsersThreeBold size={12} className="md:w-[14px] md:h-[14px]" />
                        Groups
                        {filterCounts.groups > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                activeFilter === 'groups' ? 'bg-white/20' : 'bg-gray-100'
                            }`}>
                                {filterCounts.groups}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveFilter('unread')}
                        className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-1 md:gap-1.5 shrink-0 ${
                            activeFilter === 'unread'
                                ? 'bg-teal text-white border-teal shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <MessageCircle size={12} className="md:w-[14px] md:h-[14px]" />
                        Unread
                        {filterCounts.unread > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                                activeFilter === 'unread' ? 'bg-white/20' : 'bg-red-100 text-red-600'
                            }`}>
                                {filterCounts.unread}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveFilter('personal')}
                        className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-1 md:gap-1.5 shrink-0 ${
                            activeFilter === 'personal'
                                ? 'bg-teal text-white border-teal shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <PiUserBold size={12} className="md:w-[14px] md:h-[14px]" />
                        Personal
                        {filterCounts.personal > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                activeFilter === 'personal' ? 'bg-white/20' : 'bg-gray-100'
                            }`}>
                                {filterCounts.personal}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveFilter('business')}
                        className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-1 md:gap-1.5 shrink-0 ${
                            activeFilter === 'business'
                                ? 'bg-teal text-white border-teal shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <Phone size={12} className="md:w-[14px] md:h-[14px]" />
                        Business
                        {filterCounts.business > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                activeFilter === 'business' ? 'bg-white/20' : 'bg-gray-100'
                            }`}>
                                {filterCounts.business}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredChats.map(chat => {
                    const isSelected = currentChatId === chat.id;
                    const timeStr = chat.lastMessageTime ? chat.lastMessageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                    const hasUnread = hasUnreadMessages(chat);
                    const unreadCount = hasUnread ? chat.messages.filter(m => !m.isRead && m.senderId !== currentUser.id).length : 0;

                    return (
                        <div
                            key={chat.id}
                            onClick={() => router.push(`/chats/${chat.id}`)}
                            className={`flex gap-2 md:gap-4 p-3 md:p-4 border-b border-gray-50 cursor-pointer hover:bg-[#f5f6f6] transition-all group ${isSelected ? 'bg-[#f0f2f5] border-l-4 border-l-teal' : 'border-l-4 border-l-transparent'} ${hasUnread ? 'bg-[#f0f2f5]' : ''}`}
                        >
                            <div className="relative shrink-0">
                                <img src={chat.avatar} className="w-12 h-12 md:w-[48px] md:h-[48px] rounded-full object-cover" />
                                {chat.type === GroupType.DIRECT && chat.participants[1] && (
                                    <PresenceDot userId={chat.participants[1].id} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-baseline mb-0.5 md:mb-1 gap-2">
                                    <h3 className={`font-bold text-sm md:text-[16px] truncate flex items-center gap-1 md:gap-1.5 min-w-0 ${hasUnread ? 'text-navy font-bold' : 'text-navy'}`}>
                                        {chat.name}
                                        {chat.type === GroupType.SMS && <span className="bg-blue-100 text-blue-700 text-[8px] md:text[9px] px-1 py-0.5 rounded font-bold uppercase tracking-widest shadow-sm shrink-0">SMS</span>}
                                        {mutedChats.has(chat.id) && <BellOff size={10} className="md:w-[12px] md:h-[12px] text-gray-400 shrink-0" />}
                                    </h3>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {hasUnread && (
                                            <span className="bg-teal text-white text-[10px] md:text-xs font-bold rounded-full min-w-[18px] md:min-w-[20px] h-[18px] md:h-[20px] flex items-center justify-center px-1.5 md:px-2">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); togglePinChat(chat.id); }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full shrink-0"
                                            title={chat.pinned ? "Unpin chat" : "Pin chat"}
                                        >
                                            {chat.pinned ? <Pin size={14} className="md:w-[16px] md:h-[16px] text-teal" /> : <Pin size={14} className="md:w-[16px] md:h-[16px] text-gray-400" />}
                                        </button>
                                        <span className={`text-[11px] md:text-[12px] shrink-0 whitespace-nowrap ${hasUnread ? 'text-navy font-semibold' : 'text-gray-400'}`}>{timeStr}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 min-w-0">
                                    {chat.lastMessage?.includes('🎤') && <Mic size={12} className="md:w-[14px] md:h-[14px] text-gray-400 shrink-0" />}
                                    {chat.lastMessage?.includes('📷') && <ImageIcon size={12} className="md:w-[14px] md:h-[14px] text-gray-400 shrink-0" />}
                                    {chat.lastMessage?.includes('📎') && <Paperclip size={12} className="md:w-[14px] md:h-[14px] text-gray-400 shrink-0" />}
                                    {chat.lastMessage && (
                                        <span className={`text-xs md:text-sm truncate flex-1 min-w-0 whitespace-nowrap ${hasUnread ? 'text-navy font-semibold' : 'text-gray-500'}`}>
                                            {chat.lastMessage.replace(/[🎤📷📎📄]/g, '').trim()}
                                        </span>
                                    )}
                                    {chat.pinned && <Pin size={12} className="md:w-[14px] md:h-[14px] text-gray-400 rotate-45 shrink-0" />}
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