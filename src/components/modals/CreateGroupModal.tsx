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
import { MOCK_CALLS, USERS, CURRENT_USER } from '../../../services/mockData';
import { NOTE_TEMPLATES, getAllTemplates } from '../../../templates/noteTemplates';
import { CONSULTATION_TYPES, getAllConsultationTypes } from '../../../constants/consultationTypes';

const CreateGroupModal: React.FC = () => {
  const { isCreateGroupOpen, toggleCreateGroup, createGroupChat } = useAppContext();
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [selectedType, setSelectedType] = useState<GroupType>(GroupType.CARE_TEAM);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  if (!isCreateGroupOpen) return null;

  // Filter available members (exclude current user and already selected)
  const availableMembers = USERS.filter(user => user.id !== CURRENT_USER.id);
  const filteredMembers = availableMembers.filter(user =>
    user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    user.phoneNumber?.includes(memberSearch)
  );

  const GROUP_TYPES = [
    { value: GroupType.CARE_TEAM, label: 'Care Team', desc: 'Clinical team coordinating patient care' },
    { value: GroupType.FAMILY_UPDATE, label: 'Family Update', desc: 'Keep patient family informed' },
    { value: GroupType.INTERNAL_STAFF, label: 'Internal Staff', desc: 'Internal staff coordination' },
    { value: GroupType.BROADCAST, label: 'Broadcast', desc: 'One-way announcements to staff' },
  ];

  const toggleMember = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedUserIds.length < 2) return;

    const newChatId = createGroupChat(groupName, selectedType, selectedUserIds);
    setGroupName('');
    setSelectedUserIds([]);
    setMemberSearch('');
    setSelectedType(GroupType.CARE_TEAM);
    toggleCreateGroup();
    router.push(`/chats/${newChatId}`);
  };

  const isValid = groupName.trim().length > 0 && selectedUserIds.length >= 2;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[260] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal to-teal/80 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Create Group Chat</h2>
            <p className="text-sm text-white/80">Start a conversation with multiple team members</p>
          </div>
          <button onClick={toggleCreateGroup} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Group Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Alice Williams - Care Team"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
            />
          </div>

          {/* Group Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Group Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {GROUP_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedType === type.value
                      ? 'border-teal bg-teal/10 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-gray-900 text-sm">{type.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Member Selection */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-700">
                Select Members <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-600">
                {selectedUserIds.length} selected
              </span>
            </div>

            {/* Search Input */}
            <div className="mb-3 relative">
              <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all text-sm"
              />
            </div>

            {/* Member List */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50">
              {filteredMembers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No members found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMembers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => toggleMember(user.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors text-left"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleMember(user.id)}
                        className="w-5 h-5 rounded border-gray-300 text-teal cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                        <div className="text-xs text-gray-600">{user.title || user.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Validation Message */}
            {selectedUserIds.length === 1 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <AlertCircle size={14} />
                <span>Select at least 2 members to create a group</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3 justify-end bg-gray-50 shrink-0">
          <button
            onClick={toggleCreateGroup}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={!isValid}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
              isValid
                ? 'bg-teal text-white hover:bg-teal/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Users size={18} />
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateGroupModal;