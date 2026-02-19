'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ban, CheckCheck, Sparkles, Eye, Phone, Video, FileText, ChevronRight,
  ChevronDown, Copy, Trash2, Wand2, PhoneCall
} from 'lucide-react';

import { useAppContext } from '../contexts/AppContext';
import { Message } from '../../types';
import AudioMessageBubble from './AudioMessageBubble';

const MessageBubble: React.FC<{ msg: Message; isOutgoing: boolean; isSMS?: boolean; searchTerm?: string; isGroup?: boolean; senderName?: string; senderId?: string }> = ({ msg, isOutgoing, isSMS, searchTerm = '', isGroup = false, senderName = '', senderId = '' }) => {
    const { setPreviewMedia, currentUser, deleteMessage, activeChat } = useAppContext();
    const router = useRouter();
    const timeStr = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const [showMenu, setShowMenu] = useState(false);

    // Show deleted message placeholder
    if (msg.deletedAt) {
      return (
        <div className={`flex items-center gap-2 text-gray-400 text-sm italic px-4 py-2 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
          <Ban size={14} /> This message was deleted
        </div>
      );
    }

    // Color palette for group participant names
    const senderColors = [
        'text-teal', 'text-purple-600', 'text-blue-600',
        'text-orange-600', 'text-pink-600', 'text-indigo-600'
    ];
    const senderColorIndex = (senderId || '').charCodeAt(0) % senderColors.length;
    const senderColor = senderColors[senderColorIndex];

    // Helper to highlight search terms
    const highlightText = (text: string, search: string) => {
        if (!search.trim()) return text;
        const parts = text.split(new RegExp(`(${search})`, 'gi'));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === search.toLowerCase() ? (
                        <span key={i} className="bg-yellow-200 text-black font-semibold rounded-sm px-0.5">{part}</span>
                    ) : part
                )}
            </>
        );
    };

    // Style logic - Light blue theme for outgoing messages
    const outgoingColor = 'bg-[#dbeafe] text-[#111b21] rounded-tr-none'; // Light blue (#dbeafe = blue-100 equivalent)
    const incomingColor = 'bg-white text-[#111b21] rounded-tl-none';

    return (
        <div className={`flex flex-col mb-2 ${isOutgoing ? 'items-end' : 'items-start'}`}>
            {isGroup && !isOutgoing && senderName && senderName !== currentUser.name && (
                <p className={`text-[11px] font-semibold mb-1 ml-2 ${senderColor}`}>
                    {senderName}
                </p>
            )}
            <div className="relative group" onMouseLeave={() => setShowMenu(false)}>
                <div className={` w-fit   rounded-lg px-2 py-1.5 relative shadow-sm ${
                    msg.metadata?.isCallNote ? 'bg-purple-50 border-l-4 border-l-purple-500' : (isOutgoing ? outgoingColor : incomingColor)
                }`}>
                {msg.metadata?.isCallNote && msg.metadata?.soapNote ? (
                    <div className="p-4 pb-6 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className="text-purple-600" />
                            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Clinical Scribe Summary</span>
                        </div>

                        {msg.metadata.soapNote.subjective && (
                            <div>
                                <p className="text-xs font-bold text-gray-600 mb-1 uppercase">Subjective</p>
                                <p className="text-sm text-gray-700 line-clamp-2">{msg.metadata.soapNote.subjective}</p>
                            </div>
                        )}

                        {msg.metadata.soapNote.objective && (
                            <div>
                                <p className="text-xs font-bold text-gray-600 mb-1 uppercase">Objective</p>
                                <p className="text-sm text-gray-700 line-clamp-2">{msg.metadata.soapNote.objective}</p>
                            </div>
                        )}

                        {msg.metadata.soapNote.assessment && (
                            <div>
                                <p className="text-xs font-bold text-gray-600 mb-1 uppercase">Assessment</p>
                                <p className="text-sm text-gray-700 line-clamp-2">{msg.metadata.soapNote.assessment}</p>
                            </div>
                        )}

                        {msg.metadata.soapNote.plan && (
                            <div>
                                <p className="text-xs font-bold text-gray-600 mb-1 uppercase">Plan</p>
                                <p className="text-sm text-gray-700 line-clamp-2">{msg.metadata.soapNote.plan}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => router.push(`/notes/${msg.metadata?.soapNote?.id || msg.id}`)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-500 text-white rounded-lg font-bold text-xs hover:bg-purple-600 transition-all shadow-sm hover:shadow-md"
                            >
                              <Eye size={14} />
                              View Full Notes
                            </button>
                            {msg.metadata?.callId && (
                              <button
                                onClick={() => router.push(`/calls/${msg.metadata?.callId}`)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/60 text-purple-700 rounded-lg font-bold text-xs hover:bg-white transition-all"
                              >
                                <Phone size={14} />
                                Call Details
                              </button>
                            )}
                        </div>
                    </div>
                ) : msg.type === 'text' && (
                    <div className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words pl-1 pr-16 pt-0.5 pb-2">
                        {highlightText(msg.content, searchTerm)}
                    </div>
                )}
                
                {msg.type === 'image' && (
                    <div className="p-0.5 pb-5">
                        <img 
                            src={msg.metadata?.fileUrl} 
                            onClick={() => setPreviewMedia(msg)}
                            className="rounded-md max-h-64 object-cover cursor-pointer max-w-full" 
                        />
                        {msg.content && (
                            <div className="text-[14.2px] leading-[19px] mt-1 pl-1 pr-16 break-words pb-2">
                                {msg.content}
                            </div>
                        )}
                    </div>
                )}
                
                {msg.type === 'file' && (
                    <div className="flex items-center bg-black/5 rounded p-3 pb-4 mb-1 mt-1 cursor-pointer" onClick={() => setPreviewMedia(msg)}>
                        <FileText size={24} className={isOutgoing ? 'text-teal' : 'text-gray-500'} />
                        <div className="ml-3 flex-1 min-w-0 pr-12">
                            <p className="text-sm font-medium truncate">{msg.metadata?.fileName}</p>
                            <p className="text-xs opacity-70">{msg.metadata?.fileSize} • {msg.metadata?.mimeType?.split('/')[1]?.toUpperCase()}</p>
                        </div>
                    </div>
                )}
                
                {msg.type === 'voice' && (
                    <div className="p-2 w-fit">
                        <AudioMessageBubble message={msg} />
                    </div>
                )}

                {msg.type === 'call_log' && (
                    <div
                        onClick={() => msg.metadata?.callId && router.push(`/calls/${msg.metadata.callId}`)}
                        className="bg-white p-3 pb-5 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors w-full max-w-sm"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-gray-100 p-2 rounded-full">
                                {msg.metadata?.callType === 'video' ? <Video size={20} className="text-teal"/> : <Phone size={20} className="text-teal"/>}
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-gray-800">
                                    {msg.metadata?.callType === 'video' ? 'Video Call' : 'Voice Call'}
                                </p>
                                <p className="text-xs text-gray-500">{msg.metadata?.duration}</p>
                            </div>
                        </div>
                        {msg.metadata?.transcriptionSummary && (
                            <div className="text-xs text-gray-600 border-t border-gray-100 pt-2 mt-1">
                                <p className="line-clamp-3 italic">"{msg.metadata.transcriptionSummary}"</p>
                                <div className="mt-1 text-teal font-medium flex items-center gap-1">
                                    View Transcription <ChevronRight size={12}/>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <span className="text-[11px] opacity-70 absolute right-2 bottom-2 flex items-center gap-1 whitespace-nowrap">
                    {timeStr}
                    {isOutgoing && <CheckCheck size={14} className={msg.isRead ? 'text-[#53bdeb]' : 'text-gray-500'} />}
                </span>
            </div>

            {/* Hover action button */}
            <div className={`absolute ${isOutgoing ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 flex items-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                <button onClick={() => setShowMenu(!showMenu)} className="p-1 bg-white rounded-full shadow text-gray-500 hover:text-gray-700">
                    <ChevronDown size={14} />
                </button>
            </div>

            {/* Context menu dropdown */}
            {showMenu && (
                <div className={`absolute ${isOutgoing ? 'right-0' : 'left-0'} top-8 bg-white rounded-xl shadow-lg border py-1 z-50 min-w-[140px]`}>
                    {msg.content && (
                        <button onClick={() => { navigator.clipboard.writeText(msg.content); setShowMenu(false); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                            <Copy size={14} /> Copy
                        </button>
                    )}
                    {isOutgoing && (
                        <button onClick={() => { deleteMessage(activeChat!.id, msg.id); setShowMenu(false); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                            <Trash2 size={14} /> Delete for me
                        </button>
                    )}
                </div>
            )}
            </div>

            {(msg.metadata?.transcription || msg.metadata?.transcriptionSummary) && (
                <div className={`max-w-[85%] md:max-w-[70%] mt-1 text-xs bg-[#f0f2f5] p-2 rounded-lg text-gray-600 shadow-sm border border-gray-200 ${isOutgoing ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                    <div className="flex items-center gap-1 mb-1 text-teal font-medium">
                        <Wand2 size={12} />
                        <span>AI Summary</span>
                    </div>
                    <p className="italic">{msg.metadata.transcription || msg.metadata.transcriptionSummary}</p>
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
