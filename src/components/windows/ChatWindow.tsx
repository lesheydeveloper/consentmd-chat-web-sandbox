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
import EmptyWorkspace from '../EmptyWorkspace';
import MessageBubble from '../MessageBubble';
import { User, Chat, Message, GroupType, UserRole, PatientProfile, CallLog, ClinicalNote, SoapSection, NoteTemplateType, UserPreferences, ConsultationType } from '../../../types';
import { MOCK_CALLS, USERS } from '../../../services/mockData';
import { NOTE_TEMPLATES, getAllTemplates } from '../../../templates/noteTemplates';
import { CONSULTATION_TYPES, getAllConsultationTypes } from '../../../constants/consultationTypes';

const ChatWindow: React.FC = () => {
    const { activeChat, currentUser, sendMessage, isNotesPanelOpen, toggleNotesPanel, isScribeActive, toggleChatInfo, isChatInfoOpen, searchTerm, startCall, togglePatientNotesVisibility, simulateTyping, typingUsers, openScheduleCall } = useAppContext();
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Attachment State
    const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
    const [pendingAttachment, setPendingAttachment] = useState<{file: File, dataUrl: string, type: 'image' | 'file', sizeStr: string} | null>(null);
    const [attachmentCaption, setAttachmentCaption] = useState('');

    const docInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Message Pagination
    const [visibleCount, setVisibleCount] = useState(30);
    useEffect(() => { setVisibleCount(30); }, [activeChat?.id]);

    // Auto-scroll
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeChat?.messages]);

    const handleSend = () => {
        if (activeChat && inputText.trim()) {
            sendMessage(activeChat.id, inputText);
            setInputText('');

            // Simulate typing response from most recent non-current participant
            const otherParticipant = activeChat.participants.find(p => p.id !== currentUser.id);
            if (otherParticipant) {
                setTimeout(() => simulateTyping(activeChat.id, otherParticipant.name, 2500), 1200);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChat) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const isImage = file.type.startsWith('image/');
            const type = isImage ? 'image' : 'file';
            
            let sizeStr = '';
            if (file.size < 1024 * 1024) {
                sizeStr = (file.size / 1024).toFixed(1) + ' KB';
            } else {
                sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
            }

            setPendingAttachment({ file, dataUrl, type, sizeStr });
            setAttachmentCaption('');
            setIsAttachMenuOpen(false);
        };
        reader.readAsDataURL(file);
        
        // Reset inputs so same file can be selected again
        if (docInputRef.current) docInputRef.current.value = '';
        if (mediaInputRef.current) mediaInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    const handleSendAttachment = () => {
        if (!activeChat || !pendingAttachment) return;
        const { file, dataUrl, type, sizeStr } = pendingAttachment;
        
        sendMessage(activeChat.id, attachmentCaption || (type === 'file' ? file.name : ''), type, {
            fileUrl: dataUrl,
            fileName: file.name,
            fileSize: sizeStr,
            mimeType: file.type
        });
        setPendingAttachment(null);
        setAttachmentCaption('');
    };

    if (!activeChat) return <EmptyWorkspace />;

    const participantNames = activeChat.participants.map(p => p.id === currentUser.id ? 'You' : p.name).join(', ');
    const isDirect = activeChat.type === GroupType.DIRECT;
    const isSMS = activeChat.type === GroupType.SMS;

    return (
        <div className="flex-1 flex flex-col h-full bg-[#efeae2] relative min-w-0 border-l border-gray-200 animate-[fadeIn_0.3s_ease-out]">
            <div className="absolute inset-0 wa-bg pointer-events-none opacity-30"></div>
            
            {/* Attachment Preview Overlay */}
            {pendingAttachment && (
                <div className="absolute inset-0 bg-[#e9edef] z-[60] flex flex-col animate-[fadeIn_0.2s_ease-out]">
                    <div className="h-16 bg-[#f0f2f5] px-4 flex items-center shadow-sm shrink-0">
                        <button onClick={() => setPendingAttachment(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                            <X size={24}/>
                        </button>
                        <span className="ml-4 font-medium text-gray-800 text-[16px]">Preview</span>
                    </div>
                    <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
                        {pendingAttachment.type === 'image' ? (
                            <img src={pendingAttachment.dataUrl} className="max-w-full max-h-full object-contain shadow-lg rounded-md" />
                        ) : (
                            <div className="bg-white p-10 rounded-2xl shadow-lg flex flex-col items-center gap-4">
                                <FileText size={64} className="text-teal" />
                                <div className="text-center max-w-sm">
                                    <h3 className="text-gray-900 font-bold truncate">{pendingAttachment.file.name}</h3>
                                    <p className="text-sm text-gray-500">{pendingAttachment.sizeStr} • {pendingAttachment.file.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-[#f0f2f5] px-4 py-4 flex items-center gap-4 shrink-0">
                        <div className="flex-1 bg-white rounded-xl px-4 py-3 flex items-center shadow-sm">
                            <input 
                                type="text" 
                                value={attachmentCaption} 
                                onChange={(e) => setAttachmentCaption(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && handleSendAttachment()}
                                placeholder="Add a caption..." 
                                className="flex-1 focus:outline-none text-[15px] text-gray-700 bg-transparent placeholder-gray-500" 
                            />
                        </div>
                        <button onClick={handleSendAttachment} className="bg-teal text-white p-3.5 rounded-full hover:bg-teal/90 transition-transform hover:scale-105 shadow-md shrink-0">
                            <Send size={24} className="ml-0.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="h-14 md:h-16 bg-[#f0f2f5] px-3 md:px-4 py-2 flex items-center justify-between z-30 shrink-0 relative shadow-sm border-l border-white/50">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 cursor-pointer" onClick={toggleChatInfo}>
                    <button onClick={(e) => { e.stopPropagation(); router.push('/chats'); }} className="md:hidden p-1.5 -ml-1 text-gray-600 hover:bg-gray-200 rounded-full transition-colors shrink-0"><ArrowLeft size={20} /></button>
                    <img src={activeChat.avatar} className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0" alt="Avatar" />
                    <div className="flex flex-col min-w-0">
                        <h2 className="text-gray-900 font-normal text-sm md:text-[16px] truncate flex items-center gap-1.5 md:gap-2">
                            {activeChat.name}
                            {isSMS && <span className="bg-blue-100 text-blue-700 text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm shrink-0">SMS</span>}
                        </h2>
                        <span className="text-xs md:text-[13px] text-gray-500 truncate">
                            {isDirect ? 'tap here for contact info' : (isSMS ? 'Standard SMS rates may apply' : participantNames)}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2 text-gray-500 shrink-0 ml-2 md:ml-4 relative">
                    <button onClick={toggleNotesPanel} className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium transition-all mr-1 md:mr-2 ${isNotesPanelOpen ? 'bg-teal text-white shadow-md' : 'bg-white border border-gray-200 text-teal hover:bg-gray-50'}`}><ClipboardList size={14} className="md:w-[16px] md:h-[16px]" /> <span className="hidden md:inline">Scribe</span></button>
                    <button onClick={() => {
                        if (activeChat && activeChat.participants.length > 1) {
                            const otherParticipant = activeChat.participants.find(p => p.id !== currentUser.id) || activeChat.participants[0];
                            startCall(otherParticipant, 'voice');
                        }
                    }} className="p-2.5 hover:bg-green-100 text-teal rounded-full transition-colors hidden md:block" title="Start voice call"><Phone size={20}/></button>
                    <button onClick={() => {
                        if (activeChat && activeChat.participants.length > 1) {
                            const otherParticipant = activeChat.participants.find(p => p.id !== currentUser.id) || activeChat.participants[0];
                            startCall(otherParticipant, 'video');
                        }
                    }} className="p-2.5 hover:bg-blue-100 text-teal rounded-full transition-colors hidden md:block" title="Start video call"><Video size={20}/></button>
                    <button onClick={() => {
                        if (activeChat && activeChat.participants.length > 1) {
                            const otherParticipant = activeChat.participants.find(p => p.id !== currentUser.id) || activeChat.participants[0];
                            openScheduleCall({ defaultParticipant: otherParticipant.name });
                        } else {
                            openScheduleCall({ defaultTitle: activeChat?.name || 'Call' });
                        }
                    }} className="p-2.5 hover:bg-purple-100 text-teal rounded-full transition-colors" title="Schedule call"><Calendar size={20}/></button>
                    <button className="p-2.5 hover:bg-gray-200 rounded-full transition-colors border-l border-gray-300 ml-1 pl-3"><Search size={20}/></button>
                    <button onClick={toggleChatInfo} className="p-2.5 hover:bg-gray-200 rounded-full transition-colors" title={isDirect || isSMS ? "Contact Info" : "Group Info"}>
                        <Info size={20}/>
                    </button>
                    {(currentUser.role === UserRole.DOCTOR || currentUser.role === UserRole.NURSE) && activeChat && !isDirect && (
                        <button
                            onClick={() => togglePatientNotesVisibility(activeChat.id)}
                            title={activeChat.patientNotesVisible ? "Revoke patient note access" : "Allow patient to view notes"}
                            className={`p-2.5 rounded-full transition-colors ${activeChat.patientNotesVisible ? 'text-teal bg-teal/10' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            <FileText size={20} />
                        </button>
                    )}
                    {/* Dropdown Menu Toggle */}
                    <div className="relative">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 hover:bg-gray-200 rounded-full transition-colors">
                            <MoreVertical size={20}/>
                        </button>
                        
                        {/* Dropdown Menu Content */}
                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded shadow-xl py-2 z-50 border border-gray-100 animate-[fadeIn_0.1s_ease-out]">
                                    <button onClick={() => { toggleChatInfo(); setIsMenuOpen(false); }} className="w-full text-left px-5 py-3 hover:bg-gray-100 text-[15px] text-gray-800">
                                        {isDirect || isSMS ? 'Contact info' : 'Group info'}
                                    </button>
                                    <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-5 py-3 hover:bg-gray-100 text-[15px] text-gray-800">Select messages</button>
                                    <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-5 py-3 hover:bg-gray-100 text-[15px] text-gray-800">Mute notifications</button>
                                    <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-5 py-3 hover:bg-gray-100 text-[15px] text-gray-800">Clear messages</button>
                                    <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-5 py-3 hover:bg-gray-100 text-[15px] text-gray-800">Delete chat</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 md:p-4 md:px-[6%] custom-scrollbar flex flex-col z-0 min-w-0">
                <div className="flex justify-center mb-4 md:mb-6">
                    <div className="bg-[#fff5c4] text-[#856c12] text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded shadow-sm text-center max-w-sm flex items-center justify-center gap-1 md:gap-1.5 font-medium border border-[#ffe066]/50">
                        <Lock size={10} className="md:w-[12px] md:h-[12px] shrink-0" /> Messages and calls are end-to-end encrypted. No one outside of this chat, not even ConsentMD, can read or listen to them. Click to learn more.
                    </div>
                </div>
                {activeChat.messages.length > visibleCount && (
                    <div className="flex justify-center py-3">
                        <button onClick={() => setVisibleCount(v => v + 20)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm font-medium transition-colors">
                            <ChevronUp size={16}/> Load earlier messages
                        </button>
                    </div>
                )}
                {activeChat.messages.slice(-visibleCount).map((msg) => {
                    const sender = activeChat.participants.find(p => p.id === msg.senderId);
                    return (
                        <MessageBubble
                            key={msg.id}
                            msg={msg}
                            isOutgoing={msg.senderId === currentUser.id}
                            isSMS={isSMS}
                            searchTerm={searchTerm}
                            isGroup={activeChat.type !== GroupType.DIRECT && activeChat.type !== GroupType.SMS}
                            senderName={sender?.name}
                            senderId={msg.senderId}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="bg-[#f0f2f5] px-2 md:px-4 py-2 md:py-3 flex items-center gap-1.5 md:gap-3 z-20 shrink-0 relative">
                <button className="text-gray-500 hover:text-gray-700 p-1.5 md:p-2"><Smile size={22} className="md:w-[26px] md:h-[26px]" strokeWidth={1.5} /></button>
                
                {/* Hidden File Inputs */}
                <input type="file" ref={docInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" />
                <input type="file" ref={mediaInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,video/*" />
                <input type="file" ref={cameraInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,video/*" capture="environment" />

                {/* Attachment Menu */}
                <div className="relative">
                    <button onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)} className={`text-gray-500 hover:text-gray-700 p-1.5 md:p-2 relative z-50 transition-transform duration-200 ${isAttachMenuOpen ? 'rotate-45' : ''}`}>
                        <Plus size={22} className="md:w-[26px] md:h-[26px]" strokeWidth={1.5} />
                    </button>
                    
                    {isAttachMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsAttachMenuOpen(false)}></div>
                            <div className="absolute bottom-12 md:bottom-14 left-0 bg-white rounded-2xl shadow-xl py-2 w-52 md:w-56 animate-[fadeIn_0.1s_ease-out] z-50 border border-gray-100">
                                <button onClick={() => { docInputRef.current?.click(); setIsAttachMenuOpen(false); }} className="w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-2.5 md:py-3 hover:bg-gray-50 transition-colors">
                                    <div className="bg-[#7F66FF] text-white p-2 md:p-2.5 rounded-full shadow-sm"><FileText size={18} className="md:w-[20px] md:h-[20px]"/></div>
                                    <span className="text-sm md:text-[16px] text-gray-800 font-medium">Document</span>
                                </button>
                                <button onClick={() => { mediaInputRef.current?.click(); setIsAttachMenuOpen(false); }} className="w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-2.5 md:py-3 hover:bg-gray-50 transition-colors">
                                    <div className="bg-[#007DFC] text-white p-2 md:p-2.5 rounded-full shadow-sm"><ImageIcon size={18} className="md:w-[20px] md:h-[20px]"/></div>
                                    <span className="text-sm md:text-[16px] text-gray-800 font-medium">Photos & videos</span>
                                </button>
                                <button onClick={() => { cameraInputRef.current?.click(); setIsAttachMenuOpen(false); }} className="w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-2.5 md:py-3 hover:bg-gray-50 transition-colors">
                                    <div className="bg-[#FF2E74] text-white p-2 md:p-2.5 rounded-full shadow-sm"><Camera size={18} className="md:w-[20px] md:h-[20px]"/></div>
                                    <span className="text-sm md:text-[16px] text-gray-800 font-medium">Camera</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Typing indicator */}
                {(typingUsers[activeChat?.id || ''] || []).length > 0 && (
                    <div className="px-3 md:px-4 py-1 flex items-center gap-2 text-[10px] md:text-xs text-gray-500 bg-white/80">
                        <div className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                        </div>
                        <span>{typingUsers[activeChat!.id][0]} is typing...</span>
                    </div>
                )}

                <div className="flex-1 bg-white rounded-lg px-3 md:px-4 py-2 md:py-2.5 flex items-center shadow-sm">
                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isSMS ? "Type an SMS message" : "Type a message"} className="flex-1 focus:outline-none text-sm md:text-[15px] text-gray-700 bg-transparent placeholder-gray-500" />
                </div>
                {inputText.trim() ? (
                    <button onClick={handleSend} className="text-teal p-1.5 md:p-2"><Send size={20} className="md:w-[24px] md:h-[24px]" fill="currentColor" /></button>
                ) : (
                    <button className="text-gray-500 hover:text-gray-700 p-1.5 md:p-2"><Mic size={22} className="md:w-[26px] md:h-[26px]" strokeWidth={1.5} /></button>
                )}
            </div>
        </div>
    );
};
export default ChatWindow;