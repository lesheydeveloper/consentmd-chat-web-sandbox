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
import { transcribeAudio } from '../../../services/geminiService';

const ContactPicker: React.FC = () => {
  const { isContactPickerOpen, toggleContactPicker, chats, startChat } = useAppContext();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'all' | 'patients' | 'providers' | 'staff'>('all');

  if (!isContactPickerOpen) return null;

  // Filter contacts by type
  const filteredContacts = USERS.filter(user => {
    if (user.id === CURRENT_USER.id) return false; // Don't show self
    if (selectedType === 'all') return true;
    if (selectedType === 'patients') return user.role === UserRole.PATIENT;
    if (selectedType === 'providers') return [UserRole.DOCTOR, UserRole.NURSE].includes(user.role);
    if (selectedType === 'staff') return [UserRole.ADMIN].includes(user.role);
    return false;
  });

  const handleSelectContact = (user: User) => {
    // Check if chat already exists
    const existingChat = chats.find(c =>
      c.participants.some(p => p.id === user.id) &&
      c.type === GroupType.DIRECT
    );

    if (existingChat) {
      router.push(`/chats/${existingChat.id}`);
    } else {
      const newChatId = startChat(user.phoneNumber || user.name, false);
      // Update the chat with proper user info
      router.push(`/chats/${newChatId}`);
    }
    toggleContactPicker();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[240] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal to-teal/80 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Start New Conversation</h2>
            <p className="text-sm text-white/80">Select a contact to message or start a consultation</p>
          </div>
          <button onClick={toggleContactPicker} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50 shrink-0 overflow-x-auto">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
              selectedType === 'all'
                ? 'bg-teal text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            All Contacts
          </button>
          <button
            onClick={() => setSelectedType('patients')}
            className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
              selectedType === 'patients'
                ? 'bg-teal text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            Patients
          </button>
          <button
            onClick={() => setSelectedType('providers')}
            className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
              selectedType === 'providers'
                ? 'bg-teal text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            Providers
          </button>
          <button
            onClick={() => setSelectedType('staff')}
            className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
              selectedType === 'staff'
                ? 'bg-teal text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            Staff
          </button>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredContacts.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <p>No contacts found in this category</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-12 h-12 rounded-full object-cover shadow-sm group-hover:shadow-md transition-shadow"
                    />
                    <PresenceDot userId={contact.id} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{contact.name}</h3>
                      {contact.title && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {contact.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium capitalize">{contact.role}</span>
                      {contact.phoneNumber && (
                        <span className="text-xs text-gray-400">{contact.phoneNumber}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelectContact(contact); }}
                      className="p-2 bg-teal text-white rounded-full hover:bg-teal/90 transition-all"
                      title="Message"
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all"
                      title="Call"
                    >
                      <Phone size={16} />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-end shrink-0">
          <button
            onClick={toggleContactPicker}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

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

const AddGroupMembersModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  chatId: string | null;
}> = ({ isOpen, onClose, chatId }) => {
  const { chats, addGroupMembers } = useAppContext();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  if (!isOpen || !chatId) return null;

  const chat = chats.find(c => c.id === chatId);
  if (!chat) return null;

  // Get IDs of existing participants
  const existingParticipantIds = new Set(chat.participants.map(p => p.id));

  // Filter available members (those not already in the chat)
  const availableMembers = USERS.filter(user => !existingParticipantIds.has(user.id));
  const filteredMembers = availableMembers.filter(user =>
    user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    user.phoneNumber?.includes(memberSearch)
  );

  const toggleMember = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembers = () => {
    if (selectedUserIds.length === 0) return;
    addGroupMembers(chatId, selectedUserIds);
    setSelectedUserIds([]);
    setMemberSearch('');
    onClose();
  };

  const handleClose = () => {
    setSelectedUserIds([]);
    setMemberSearch('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[260] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal to-teal/80 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Add Members</h2>
            <p className="text-sm text-white/80">Invite more people to this group</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {availableMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={48} className="text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700 mb-1">No Available Members</h3>
              <p className="text-sm text-gray-500">All contacts are already in this group</p>
            </div>
          ) : (
            <>
              {/* Search Input */}
              <div className="mb-4 relative">
                <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e: any) => setMemberSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all text-sm"
                />
              </div>

              {/* Member List */}
              <div className="space-y-0 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                {filteredMembers.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Search size={32} className="mx-auto mb-2 opacity-30" />
                    <p>No members match your search</p>
                  </div>
                ) : (
                  filteredMembers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => toggleMember(user.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-white border-b last:border-b-0 transition-colors text-left"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleMember(user.id)}
                        className="w-5 h-5 rounded border-gray-300 text-teal cursor-pointer"
                        onClick={(e: any) => e.stopPropagation()}
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
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3 justify-end bg-gray-50 shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            disabled={selectedUserIds.length === 0 || availableMembers.length === 0}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
              selectedUserIds.length > 0 && availableMembers.length > 0
                ? 'bg-teal text-white hover:bg-teal/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <UserPlus size={18} />
            {selectedUserIds.length > 0
              ? `Add ${selectedUserIds.length} Member${selectedUserIds.length !== 1 ? 's' : ''}`
              : 'Add Members'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsModal: React.FC = () => {
  const { isSettingsOpen, toggleSettings, userPreferences, updatePreferences } = useAppContext();
  const [selectedTemplate, setSelectedTemplate] = useState(userPreferences.defaultTemplate);
  const [tempFavorites, setTempFavorites] = useState(userPreferences.favoriteTemplates);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    updatePreferences({
      defaultTemplate: selectedTemplate,
      favoriteTemplates: tempFavorites
    });
    toggleSettings();
  };

  const toggleFavorite = (templateId: NoteTemplateType) => {
    setTempFavorites((prev: NoteTemplateType[]) =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal to-teal/80 text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Settings size={28} />
            <div>
              <h2 className="text-2xl font-bold">Clinical Note Settings</h2>
              <p className="text-sm text-white/80">Configure your default note template and preferences</p>
            </div>
          </div>
          <button onClick={toggleSettings} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Default Template Selector */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Default Note Template
            </label>
            <p className="text-sm text-gray-500 mb-4">
              This template will be automatically selected when creating new clinical notes.
              You can override this choice for individual notes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAllTemplates().map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md ${
                    selectedTemplate === template.id
                      ? 'border-teal bg-teal/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{template.name}</h3>
                    {selectedTemplate === template.id && (
                      <CheckCircle2 size={20} className="text-teal shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  {template.specialty && (
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                      {template.specialty}
                    </span>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.sections.slice(0, 6).map(section => (
                      <span key={section.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                        {section.label}
                      </span>
                    ))}
                    {template.sections.length > 6 && (
                      <span className="px-2 py-0.5 text-gray-400 text-[10px]">
                        +{template.sections.length - 6} more
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Eye size={18} className="text-teal" />
              Template Preview: {NOTE_TEMPLATES[selectedTemplate].name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {NOTE_TEMPLATES[selectedTemplate].sections.map(section => (
                <div key={section.id} className="bg-white p-3 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-teal mb-1">{section.label}</div>
                  <div className="text-[11px] text-gray-600 leading-tight">{section.fullName}</div>
                  {section.required && (
                    <span className="text-[9px] text-red-500 font-bold">*Required</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Templates */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
              <Heart size={16} className="text-red-500" />
              Favorite Templates (Quick Access)
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Mark templates as favorites for quick access when creating notes.
            </p>
            <div className="flex flex-wrap gap-2">
              {getAllTemplates().map(template => (
                <button
                  key={template.id}
                  onClick={() => toggleFavorite(template.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    tempFavorites.includes(template.id)
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  {tempFavorites.includes(template.id) && <Heart size={14} className="inline mr-1 fill-current" />}
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6 flex justify-end gap-3 shrink-0 bg-gray-50">
          <button
            onClick={toggleSettings}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-teal text-white rounded-xl font-bold hover:bg-teal/90 transition-all shadow-md hover:shadow-lg"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

const TemplatePickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateType: NoteTemplateType) => void;
  currentTemplate?: NoteTemplateType;
}> = ({ isOpen, onClose, onSelect, currentTemplate }) => {
  const { userPreferences } = useAppContext();
  const favorites = userPreferences.favoriteTemplates || [];

  if (!isOpen) return null;

  const handleSelect = (templateId: NoteTemplateType) => {
    onSelect(templateId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[260] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-teal text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Type size={24} />
            <h2 className="text-2xl font-bold">Choose Note Template</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Heart size={16} className="text-red-500" />
                Your Favorites
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {favorites.map(fav => {
                  const template = NOTE_TEMPLATES[fav];
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                        currentTemplate === template.id
                          ? 'border-red-300 bg-red-50'
                          : 'border-red-200 bg-red-50/50 hover:border-red-300'
                      }`}
                    >
                      <h4 className="font-bold text-gray-900 mb-1">{template.name}</h4>
                      <p className="text-xs text-gray-600">{template.description}</p>
                      {template.specialty && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">
                          {template.specialty}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <hr className="mb-8" />
            </div>
          )}

          {/* All Templates Section */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            All Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getAllTemplates().map(template => (
              <button
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  currentTemplate === template.id
                    ? 'border-teal bg-teal/5 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{template.name}</h4>
                  {currentTemplate === template.id && (
                    <CheckCircle2 size={18} className="text-teal shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                {template.specialty && (
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">
                    {template.specialty}
                  </span>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.sections.slice(0, 4).map(section => (
                    <span key={section.id} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-medium">
                      {section.label}
                    </span>
                  ))}
                  {template.sections.length > 4 && (
                    <span className="px-1.5 py-0.5 text-gray-400 text-[9px]">
                      +{template.sections.length - 4}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const PatientSelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectExisting: (patientId: string) => void;
  onCreateNew: () => void;
  currentChatId?: string;
}> = ({ isOpen, onClose, onSelectExisting, onCreateNew, currentChatId }) => {
  if (!isOpen) return null;

  const { chats } = useAppContext();

  // Get all patients from chats (users with PATIENT role)
  const allPatients = chats
    .flatMap(chat => chat.participants)
    .filter((user, index, self) =>
      user.role === UserRole.PATIENT &&
      self.findIndex(u => u.id === user.id) === index
    );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[260] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal to-teal/80 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Select Patient</h2>
            <p className="text-sm text-white/80">Link this clinical note to a patient record</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Create New Patient Option */}
          <div className="mb-6">
            <button
              onClick={onCreateNew}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
            >
              <UserPlus size={24} />
              <div className="text-left">
                <div className="text-lg">Create New Patient</div>
                <div className="text-sm text-purple-100">Add patient information to create medical record</div>
              </div>
            </button>
          </div>

          {/* Existing Patients List */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
              Select Existing Patient
            </h3>
            {allPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-3 opacity-30" />
                <p>No existing patients found.</p>
                <p className="text-sm">Create a new patient to link this note.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => onSelectExisting(patient.id)}
                    className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-teal rounded-xl transition-all text-left group"
                  >
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.title || 'Patient'}</div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-teal transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const PatientCreationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: { name: string; dob: string; phone?: string }) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim() || !dob.trim()) {
      alert('Please provide at least name and date of birth');
      return;
    }
    onSave({ name: name.trim(), dob, phone: phone.trim() });
    // Reset form
    setName('');
    setDob('');
    setPhone('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[270] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Create New Patient</h2>
            <p className="text-sm text-purple-100">Enter basic patient information</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3 justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all shadow-md"
          >
            Create Patient
          </button>
        </div>
      </div>
    </div>
  );
};

const ConsultationTypePicker: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ConsultationType, reason?: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [visitReason, setVisitReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedType) {
      alert('Please select a consultation type');
      return;
    }
    onSelect(selectedType, visitReason.trim() || undefined);
    setSelectedType(null);
    setVisitReason('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[260] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Select Consultation Type</h2>
            <p className="text-sm text-blue-100">Choose the type of visit for context-aware documentation</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Consultation Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {getAllConsultationTypes().map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{type.name}</h3>
                  {selectedType === type.id && (
                    <CheckCircle2 size={20} className="text-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>

          {/* Visit Reason (Optional) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Visit Reason (Optional)
            </label>
            <textarea
              value={visitReason}
              onChange={(e) => setVisitReason(e.target.value)}
              placeholder="Brief description of visit reason (e.g., 'Chest pain x 2 days', 'Diabetes follow-up', 'Annual wellness exam')..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3 justify-end bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedType}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md ${
              selectedType
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Scribe
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatInfoPanel: React.FC = () => {
    const { activeChat, currentUser, isChatInfoOpen, toggleChatInfo, setPreviewMedia, isGroupAdmin, removeGroupMember, openAddMembers, leaveGroup, mutedChats, toggleMuteChat } = useAppContext();
    const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
    const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
    const [isKeyVerifyOpen, setIsKeyVerifyOpen] = useState(false);
    const router = useRouter();

    if (!activeChat || !isChatInfoOpen) return null;

    const mediaMessages = activeChat.messages.filter(m => m.type === 'image' || m.type === 'file');

    const isDirect = activeChat.type === GroupType.DIRECT || activeChat.type === GroupType.SMS;
    const directContact = isDirect ? activeChat.participants.find(p => p.id !== currentUser.id) : null;
    const displayAvatar = isDirect && directContact ? directContact.avatar : activeChat.avatar;
    const displayName = isDirect && directContact ? directContact.name : activeChat.name;
    const canManageGroup = !isDirect && isGroupAdmin(activeChat);

    // Reset state when chat changes
    useEffect(() => {
        setConfirmRemoveId(null);
        setIsGalleryExpanded(false);
        setIsKeyVerifyOpen(false);
    }, [activeChat?.id]);

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

// Audio Message Component with AI Transcription
const AudioMessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const { updateMessageMetadata, searchTerm } = useAppContext();
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    // Mock play simulation
    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + 2;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handleTranscribe = async () => {
        if (!message.metadata?.transcription) {
            // Set Loading State
            updateMessageMetadata(message.id, message.id, { isTranscribing: true });

            try {
                // Call real AI transcription service
                const transcript = await transcribeAudio(message.metadata?.fileUrl || '');
                updateMessageMetadata(message.id, message.id, {
                    isTranscribing: false,
                    transcription: transcript
                });
            } catch (error) {
                // Fallback to mock if API fails
                setTimeout(() => {
                    const mockTranscript = "Patient is appearing stable today. Wound dressing was changed at 0900 hours. No signs of infection. Will check back in 4 hours.";
                    updateMessageMetadata(message.id, message.id, {
                        isTranscribing: false,
                        transcription: mockTranscript
                    });
                }, 2000);
            }
        }
    };

    // Helper to highlight text in transcription
    const renderTranscription = () => {
        const text = message.metadata?.transcription;
        if (!text) return null;
        if (!searchTerm.trim()) return <p className="leading-snug">{text}</p>;

        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <p className="leading-snug">
                {parts.map((part, i) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <span key={i} className="bg-yellow-200 text-black font-semibold rounded-sm px-0.5">{part}</span>
                    ) : part
                )}
            </p>
        );
    };

    return (
        <div className="min-w-[240px]">
            <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                    <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-full absolute -left-14 top-0 border hidden md:block" />
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition-colors"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                    </button>
                </div>

                <div className="flex-1">
                    {/* Fake Waveform */}
                    <div className="flex items-center gap-[2px] h-8 mb-1 opacity-60">
                         {[...Array(30)].map((_, i) => (
                             <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-300 ${i/30 * 100 < progress ? 'bg-teal' : 'bg-gray-400'}`}
                                style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
                             ></div>
                         ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{isPlaying ? `0:${Math.floor(progress/100 * 24).toString().padStart(2, '0')}` : message.metadata?.duration}</span>
                    </div>
                </div>
            </div>

            {/* Transcription Area */}
            <div className="border-t border-gray-200/50 pt-2 mt-1">
                {!message.metadata?.transcription && !message.metadata?.isTranscribing && (
                    <button
                        onClick={handleTranscribe}
                        className="flex items-center gap-2 text-xs font-medium text-teal hover:text-teal/80 transition-colors bg-teal/10 px-3 py-1.5 rounded-full w-fit"
                    >
                        <Wand2 size={12} />
                        Transcribe Audio
                    </button>
                )}

                {message.metadata?.isTranscribing && (
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                         <div className="w-3 h-3 border-2 border-teal border-t-transparent rounded-full animate-spin"></div>
                         AI is transcribing...
                     </div>
                )}

                {message.metadata?.transcription && (
                    <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 mt-1 relative group">
                        <div className="flex items-center gap-1 mb-1">
                            <Wand2 size={10} className="text-purple-500" />
                            <span className="text-[10px] font-bold text-purple-600 uppercase">Transcribed with AI</span>
                        </div>
                        {renderTranscription()}
                    </div>
                )}
            </div>
        </div>
    );
};

const NotesPanel: React.FC = () => {
    const {
        activeChat, clinicalNotes, updateClinicalNote, isNotesPanelOpen, toggleNotesPanel,
        generateFullSOAP, acceptSuggestion, dismissSuggestion, isScribeActive, toggleScribe, userPreferences,
        promptForPatient, promptForConsultationType, chats, canAccessNotes, currentUser
    } = useAppContext();

    const [activeTab, setActiveTab] = useState<string>('subjective');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
    const [editedSuggestionText, setEditedSuggestionText] = useState("");

    const noteAccess = canAccessNotes(activeChat);
    const isReadOnly = noteAccess === 'readonly';

    if (!isNotesPanelOpen || noteAccess === 'none') return null;

    const chatId = activeChat ? activeChat.id : 'global_scribe';
    const note = clinicalNotes[chatId] || {
        templateType: 'soap' as NoteTemplateType,
        subjective: '', objective: '', assessment: '', plan: '', sections: {}, suggestions: []
    };

    const handleGenerate = async () => {
        if (!activeChat) return;
        setIsGenerating(true);
        await generateFullSOAP(activeChat.id);
        setIsGenerating(false);
    };

    const startEditing = (s: any) => {
        setEditingSuggestionId(s.id);
        setEditedSuggestionText(s.text);
    };

    const handleFinalize = (sId: string) => {
        acceptSuggestion(chatId, sId, editedSuggestionText);
        setEditingSuggestionId(null);
        setEditedSuggestionText("");
    };

    // Get template and build tabs dynamically
    const templateType = note.templateType || userPreferences.defaultTemplate;
    const template = NOTE_TEMPLATES[templateType];

    // Ensure activeTab is valid for current template
    useEffect(() => {
        const validTabIds = template.sections.map(s => s.id);
        if (!validTabIds.includes(activeTab)) {
            setActiveTab(validTabIds[0] || 'subjective');
        }
    }, [template, activeTab]);

    return (
        <div className="fixed inset-0 z-[100] md:relative md:inset-auto md:w-[400px] bg-white border-l border-gray-200 h-full flex flex-col shrink-0 md:z-40 animate-[slideLeft_0.2s_ease-out] shadow-2xl overflow-hidden">
            <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal/10 rounded-lg"><ClipboardList size={20} className="text-teal" /></div>
                    <h2 className="text-navy font-bold">{activeChat ? 'Clinical Scribe' : 'Quick Scribe'}</h2>
                </div>
                <button onClick={toggleNotesPanel} className="text-gray-400 hover:text-navy hover:bg-gray-100 p-2 rounded-full transition-all"><X size={20} /></button>
            </div>

            {/* Read-only banner for patients */}
            {isReadOnly && (
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 text-blue-700 text-sm shrink-0">
                    <Eye size={14} /> Viewing notes shared by your care team (read-only)
                </div>
            )}

            {/* Patient & Consultation Context */}
            <div className="border-b border-gray-200 bg-gray-50/50 p-4 shrink-0">
                {/* Patient Info */}
                {note.patientId ? (
                    <div className="mb-3">
                        {(() => {
                            const patient = chats
                                .flatMap(c => c.participants)
                                .find(u => u.id === note.patientId && u.role === UserRole.PATIENT);
                            return patient ? (
                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
                                    <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full" />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-900">{patient.name}</div>
                                        <div className="text-xs text-gray-500">Patient</div>
                                    </div>
                                    <button
                                        onClick={() => promptForPatient(note.chatId)}
                                        className="text-xs text-teal hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-yellow-50 border-2 border-yellow-200 p-3 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={16} className="text-yellow-600" />
                                        <span className="text-sm text-yellow-900 font-medium">Patient not linked</span>
                                    </div>
                                    <button
                                        onClick={() => promptForPatient(note.chatId)}
                                        className="text-sm font-bold text-yellow-700 hover:underline"
                                    >
                                        Link Patient
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <button
                        onClick={() => promptForPatient(note.chatId)}
                        className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-50 border-2 border-yellow-300 text-yellow-900 rounded-xl font-bold hover:bg-yellow-100 transition-all"
                    >
                        <UserPlus size={16} />
                        Link to Patient
                    </button>
                )}

                {/* Consultation Type */}
                {note.consultationType ? (
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Consultation Type</span>
                            <button
                                onClick={() => promptForConsultationType(note.chatId)}
                                className="text-xs text-teal hover:underline"
                            >
                                Change
                            </button>
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                            {CONSULTATION_TYPES[note.consultationType]?.name}
                        </div>
                        {note.visitReason && (
                            <div className="text-xs text-gray-600 mt-1">{note.visitReason}</div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => promptForConsultationType(note.chatId)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 border-2 border-blue-200 text-blue-900 rounded-xl font-medium hover:bg-blue-100 transition-all text-sm"
                    >
                        <FileCheck size={16} />
                        Set Consultation Type
                    </button>
                )}
            </div>

            <div className="px-4 py-3 border-b bg-teal/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className={isScribeActive ? 'text-teal animate-pulse' : 'text-gray-400'} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isScribeActive ? 'text-teal' : 'text-gray-500'}`}>
                        {isScribeActive ? 'Auto-Scribe Enabled' : 'Auto-Scribe Paused'}
                    </span>
                </div>
                <button 
                    onClick={toggleScribe}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all shadow-sm ${
                        isScribeActive 
                        ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50' 
                        : 'bg-teal text-white hover:bg-teal/90'
                    }`}
                >
                    {isScribeActive ? <CirclePause size={12} /> : <CirclePlay size={12} />}
                </button>
            </div>

            <div className="p-4 flex gap-1 border-b bg-gray-50/50 shrink-0">
                {template.sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveTab(section.id)}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === section.id ? 'bg-teal text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        {section.label}
                        <span className="block text-[8px] font-normal opacity-70 uppercase tracking-tighter">{section.fullName}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/20">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Official {template.sections.find(s => s.id === activeTab)?.fullName || activeTab} Records
                        </label>
                    </div>
                    {!isReadOnly && (
                        <textarea
                            value={(note.sections as Record<string, string>)?.[activeTab] || ''}
                            onChange={(e) => updateClinicalNote(chatId, activeTab, e.target.value)}
                            placeholder={template.sections.find(s => s.id === activeTab)?.placeholder || `Start typing ${activeTab} content...`}
                            className="w-full h-40 p-4 border rounded-2xl text-sm focus:ring-1 focus:ring-teal outline-none resize-none bg-white border-gray-200 shadow-sm leading-relaxed"
                        ></textarea>
                    )}
                    {isReadOnly && (
                        <div className="w-full h-40 p-4 border rounded-2xl text-sm outline-none resize-none bg-gray-50 border-gray-200 shadow-sm leading-relaxed text-gray-700 overflow-y-auto">
                            {(note.sections as Record<string, string>)?.[activeTab] || '(No content)'}
                        </div>
                    )}
                </div>

                <div className="mt-6 border-t pt-6">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Sparkles size={14} className="text-purple-500" /> Intelligence Feed
                    </h3>
                    <div className="space-y-4">
                        {note.suggestions.filter(s => s.section === activeTab).length === 0 && (
                            <div className="text-center py-12 px-6 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-xs text-gray-400 italic">No AI captures detected yet. Start chatting or dictate to see insights.</p>
                            </div>
                        )}
                        {note.suggestions.filter(s => s.section === activeTab).map(s => (
                            <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-purple-200 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500/30"></div>
                                {editingSuggestionId === s.id && !isReadOnly ? (
                                    <div className="space-y-3">
                                        <textarea
                                            value={editedSuggestionText}
                                            onChange={(e) => setEditedSuggestionText(e.target.value)}
                                            className="w-full text-sm p-3 border rounded-xl border-purple-200 focus:outline-none min-h-[100px] bg-purple-50/30 font-medium"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingSuggestionId(null)} className="px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 rounded-lg">Discard</button>
                                            <button onClick={() => handleFinalize(s.id)} className="px-5 py-2 text-xs bg-purple-600 text-white rounded-lg font-bold shadow-md hover:bg-purple-700">Finalize</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <p className="text-sm text-gray-700 leading-relaxed font-medium">"{s.text}"</p>
                                            {!isReadOnly && (
                                                <button onClick={() => dismissSuggestion(chatId, s.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shrink-0"><Trash2 size={16}/></button>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                            {!isReadOnly && (
                                                <button onClick={() => startEditing(s)} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-teal">
                                                    <Edit3 size={14}/> Edit Draft
                                                </button>
                                            )}
                                            {!isReadOnly && (
                                                <button onClick={() => acceptSuggestion(chatId, s.id)} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-[10px] font-bold hover:bg-purple-600 hover:text-white transition-all">
                                                    <CheckCircle2 size={14}/> Accept
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 shrink-0 pb-safe">
                {!isReadOnly && (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !activeChat}
                        className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${(!activeChat || isGenerating) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-teal text-white hover:shadow-teal/20'}`}
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        {!activeChat ? 'Attach Chat to Summarize' : isGenerating ? 'Summarizing...' : 'Summarize Full Chat'}
                    </button>
                )}
                <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-navy text-white rounded-xl font-bold text-xs hover:bg-navy/90 flex items-center justify-center gap-2 transition-all shadow-sm">
                        <Save size={16} /> Save Narrative
                    </button>
                    <button className="p-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-navy hover:border-navy transition-all shadow-sm">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

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
                <div className={`max-w-[85%] md:max-w-[70%] rounded-lg px-2 py-1.5 relative shadow-sm ${
                    msg.metadata?.isCallNote ? 'bg-purple-50 border-l-4 border-l-purple-500' : (isOutgoing ? outgoingColor : incomingColor)
                }`}>
                {msg.metadata?.isCallNote && msg.metadata?.soapNote ? (
                    <div className="p-4 space-y-3">
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
                                onClick={() => msg.metadata?.callId && router.push(`/calls/${msg.metadata.callId}`)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/60 text-purple-700 rounded-lg font-bold text-xs hover:bg-white transition-all"
                              >
                                <Phone size={14} />
                                Call Details
                              </button>
                            )}
                        </div>
                    </div>
                ) : msg.type === 'text' && (
                    <div className="text-[14.2px] leading-[19px] whitespace-pre-wrap pl-1 pr-14 pt-0.5 pb-1">
                        {highlightText(msg.content, searchTerm)}
                    </div>
                )}
                
                {msg.type === 'image' && (
                    <div className="p-0.5 pb-5">
                        <img 
                            src={msg.metadata?.fileUrl} 
                            onClick={() => setPreviewMedia(msg)}
                            className="rounded-md max-h-64 object-cover cursor-pointer" 
                        />
                        <div className="text-[14.2px] leading-[19px] mt-1 pl-1 pr-14">
                            {msg.content}
                        </div>
                    </div>
                )}
                
                {msg.type === 'file' && (
                    <div className="flex items-center bg-black/5 rounded p-3 mb-1 mt-1 cursor-pointer" onClick={() => setPreviewMedia(msg)}>
                        <FileText size={24} className={isOutgoing ? 'text-teal' : 'text-gray-500'} />
                        <div className="ml-3 flex-1 min-w-0 pr-8">
                            <p className="text-sm font-medium truncate">{msg.metadata?.fileName}</p>
                            <p className="text-xs opacity-70">{msg.metadata?.fileSize} • {msg.metadata?.mimeType?.split('/')[1]?.toUpperCase()}</p>
                        </div>
                    </div>
                )}
                
                {msg.type === 'voice' && (
                    <div className="p-2">
                        <AudioMessageBubble message={msg} />
                    </div>
                )}

                {msg.type === 'call_log' && (
                    <div
                        onClick={() => msg.metadata?.callId && router.push(`/calls/${msg.metadata.callId}`)}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors w-full max-w-sm"
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
                                <p className="line-clamp-3 italic">"{msg.metadata?.transcriptionSummary}"</p>
                                <div className="mt-1 text-teal font-medium flex items-center gap-1">
                                    View Transcription <ChevronRight size={12}/>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <span className="text-[11px] opacity-70 absolute right-2 bottom-1 flex items-center gap-1">
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
                    <p className="italic">{msg.metadata?.transcription || msg.metadata?.transcriptionSummary}</p>
                </div>
            )}
        </div>
    );
};

// Presence Indicator Component
const PresenceDot: React.FC<{ userId: string; size?: 'sm' | 'md' }> = ({ userId, size = 'sm' }) => {
  const { onlineUsers } = useAppContext();
  if (!onlineUsers.has(userId)) return null;
  const s = size === 'sm' ? 'w-2.5 h-2.5 border border-white' : 'w-3.5 h-3.5 border-2 border-white';
  return <span className={`${s} bg-green-500 rounded-full absolute bottom-0 right-0 shrink-0`} />;
};

const ChatWindow: React.FC = () => {
    const { activeChat, currentUser, sendMessage, isNotesPanelOpen, toggleNotesPanel, isScribeActive, toggleChatInfo, isChatInfoOpen, searchTerm, startCall, togglePatientNotesVisibility, simulateTyping, typingUsers } = useAppContext();
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
            <div className="h-16 bg-[#f0f2f5] px-4 py-2 flex items-center justify-between z-30 shrink-0 relative shadow-sm border-l border-white/50">
                <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={toggleChatInfo}>
                    <button onClick={(e) => { e.stopPropagation(); router.push('/chats'); }} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors shrink-0"><ArrowLeft size={24} /></button>
                    <img src={activeChat.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="Avatar" />
                    <div className="flex flex-col min-w-0">
                        <h2 className="text-gray-900 font-normal text-[16px] truncate flex items-center gap-2">
                            {activeChat.name}
                            {isSMS && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">SMS</span>}
                        </h2>
                        <span className="text-[13px] text-gray-500 truncate">
                            {isDirect ? 'tap here for contact info' : (isSMS ? 'Standard SMS rates may apply' : participantNames)}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-500 shrink-0 ml-4 relative">
                    <button onClick={toggleNotesPanel} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all mr-2 ${isNotesPanelOpen ? 'bg-teal text-white shadow-md' : 'bg-white border border-gray-200 text-teal hover:bg-gray-50'}`}><ClipboardList size={16} /> <span className="hidden md:inline">Scribe</span></button>
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
            
            <div className="flex-1 overflow-y-auto p-4 md:px-[6%] lg:px-[10%] custom-scrollbar flex flex-col z-0">
                <div className="flex justify-center mb-6">
                    <div className="bg-[#fff5c4] text-[#856c12] text-xs px-3 py-1.5 rounded shadow-sm text-center max-w-sm flex items-center justify-center gap-1.5 font-medium border border-[#ffe066]/50">
                        <Lock size={12} className="shrink-0" /> Messages and calls are end-to-end encrypted. No one outside of this chat, not even ConsentMD, can read or listen to them. Click to learn more.
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
            <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-3 z-20 shrink-0 relative">
                <button className="text-gray-500 hover:text-gray-700 p-2"><Smile size={26} strokeWidth={1.5} /></button>
                
                {/* Hidden File Inputs */}
                <input type="file" ref={docInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" />
                <input type="file" ref={mediaInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,video/*" />
                <input type="file" ref={cameraInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,video/*" capture="environment" />

                {/* Attachment Menu */}
                <div className="relative">
                    <button onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)} className={`text-gray-500 hover:text-gray-700 p-2 relative z-50 transition-transform duration-200 ${isAttachMenuOpen ? 'rotate-45' : ''}`}>
                        <Plus size={26} strokeWidth={1.5} />
                    </button>
                    
                    {isAttachMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsAttachMenuOpen(false)}></div>
                            <div className="absolute bottom-14 left-0 bg-white rounded-2xl shadow-xl py-2 w-56 animate-[fadeIn_0.1s_ease-out] z-50 border border-gray-100">
                                <button onClick={() => { docInputRef.current?.click(); setIsAttachMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                                    <div className="bg-[#7F66FF] text-white p-2.5 rounded-full shadow-sm"><FileText size={20}/></div>
                                    <span className="text-[16px] text-gray-800 font-medium">Document</span>
                                </button>
                                <button onClick={() => { mediaInputRef.current?.click(); setIsAttachMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                                    <div className="bg-[#007DFC] text-white p-2.5 rounded-full shadow-sm"><ImageIcon size={20}/></div>
                                    <span className="text-[16px] text-gray-800 font-medium">Photos & videos</span>
                                </button>
                                <button onClick={() => { cameraInputRef.current?.click(); setIsAttachMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                                    <div className="bg-[#FF2E74] text-white p-2.5 rounded-full shadow-sm"><Camera size={20}/></div>
                                    <span className="text-[16px] text-gray-800 font-medium">Camera</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Typing indicator */}
                {(typingUsers[activeChat?.id || ''] || []).length > 0 && (
                    <div className="px-4 py-1 flex items-center gap-2 text-xs text-gray-500 bg-white/80">
                        <div className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                        </div>
                        <span>{typingUsers[activeChat!.id][0]} is typing...</span>
                    </div>
                )}

                <div className="flex-1 bg-white rounded-lg px-4 py-2.5 flex items-center shadow-sm">
                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isSMS ? "Type an SMS message" : "Type a message"} className="flex-1 focus:outline-none text-[15px] text-gray-700 bg-transparent placeholder-gray-500" />
                </div>
                {inputText.trim() ? (
                    <button onClick={handleSend} className="text-teal p-2"><Send size={24} fill="currentColor" className="ml-1" /></button>
                ) : (
                    <button className="text-gray-500 hover:text-gray-700 p-2"><Mic size={26} strokeWidth={1.5} /></button>
                )}
            </div>
        </div>
    );
};

// --- NEW CHAT LIST COMPONENT ---
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

// --- NEW DIALPAD COMPONENT ---
const Dialpad: React.FC = () => {
    const [digits, setDigits] = useState('');
    const { startCall, startChat } = useAppContext();
    const router = useRouter();

    const formatNumber = (num: string) => {
        if (num.length > 10) return num;
        if (num.length > 7) return `(${num.slice(0,3)}) ${num.slice(3,6)}-${num.slice(6)}`;
        if (num.length > 3) return `${num.slice(0,3)}-${num.slice(3)}`;
        return num;
    };

    const handleCall = (video: boolean) => {
        if (!digits) return;
        const user: User = { 
            id: `u_${Date.now()}`, 
            name: digits, 
            phoneNumber: digits, 
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(digits)}&background=random`, 
            role: UserRole.PATIENT 
        };
        startCall(user, video ? 'video' : 'voice');
    };

    const handleSMS = () => {
        if (!digits) return;
        const chatId = startChat(digits, true);
        router.push(`/chats/${chatId}`);
    };

    const pads = [
        { main: '1', sub: '' }, { main: '2', sub: 'ABC' }, { main: '3', sub: 'DEF' },
        { main: '4', sub: 'GHI' }, { main: '5', sub: 'JKL' }, { main: '6', sub: 'MNO' },
        { main: '7', sub: 'PQRS' }, { main: '8', sub: 'TUV' }, { main: '9', sub: 'WXYZ' },
        { main: '*', sub: '' }, { main: '0', sub: '+' }, { main: '#', sub: '' }
    ];

    return (
        <div className="flex flex-col items-center justify-center flex-1 h-full bg-white animate-[fadeIn_0.2s_ease-out] py-8">
            {/* Number Display */}
            <div className="w-full max-w-xs h-24 flex items-center justify-center relative mb-6">
                <h2 className="text-4xl font-light text-navy tracking-widest">{formatNumber(digits) || ' '}</h2>
                {digits && (
                    <button onClick={() => setDigits(prev => prev.slice(0, -1))} className="absolute right-0 text-gray-400 hover:text-gray-600 p-2 transition-colors">
                        <Delete size={28} />
                    </button>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-x-10 gap-y-6 mb-10">
                {pads.map(pad => (
                    <button 
                        key={pad.main} 
                        onClick={() => setDigits(prev => prev + pad.main)} 
                        className="w-20 h-20 rounded-full bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center transition-colors shadow-sm border border-gray-100 active:bg-gray-200"
                    >
                        <span className="text-[28px] font-normal text-navy leading-none">{pad.main}</span>
                        {pad.sub && <span className="text-[10px] text-gray-500 font-bold mt-0.5 tracking-widest">{pad.sub}</span>}
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-8">
                <button onClick={handleSMS} className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors shadow-sm relative group" title="Send SMS">
                    <MessageSquare size={26} fill="currentColor" className="opacity-90 group-hover:scale-105 transition-transform" />
                    <span className="absolute -bottom-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">SMS</span>
                </button>
                <button onClick={() => handleCall(false)} className="w-20 h-20 rounded-full bg-teal text-white flex items-center justify-center hover:bg-teal/90 transition-transform hover:scale-105 shadow-lg relative group">
                    <Phone size={32} fill="currentColor" />
                    <span className="absolute -bottom-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Call</span>
                </button>
                <button onClick={() => handleCall(true)} className="w-16 h-16 rounded-full bg-gray-100 text-teal flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm relative group" title="Video Call">
                    <Video size={26} fill="currentColor" className="opacity-90 group-hover:scale-105 transition-transform" />
                    <span className="absolute -bottom-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Video</span>
                </button>
            </div>
        </div>
    );
};

// --- NEW CALL COMPONENTS ---
const CallList: React.FC = () => {
    const router = useRouter();
    const { callId } = useParams();
    const { simulateIncomingCall } = useAppContext();
    const [activeTab, setActiveTab] = useState<'history' | 'dialpad'>('history');

    return (
        <div className="flex flex-col h-full bg-white w-full animate-[fadeIn_0.2s_ease-out] shadow-sm">
            <div className="h-16 bg-white px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
                <h1 className="text-xl font-bold text-navy">Calls</h1>
                <div className="flex gap-4 text-teal">
                    <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><Wifi size={20} /></button>
                    <button onClick={simulateIncomingCall} className="hover:bg-gray-100 p-2 rounded-full transition-colors" title="Simulate Incoming Call"><PhoneCall size={20}/></button>
                </div>
            </div>
            
            <div className="flex border-b border-gray-200 shrink-0">
                <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors ${activeTab === 'history' ? 'text-teal border-b-[3px] border-teal' : 'text-gray-400 hover:text-gray-600'}`}>Call History</button>
                <button onClick={() => setActiveTab('dialpad')} className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors ${activeTab === 'dialpad' ? 'text-teal border-b-[3px] border-teal' : 'text-gray-400 hover:text-gray-600'}`}>Dialpad</button>
            </div>

            {activeTab === 'history' ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {MOCK_CALLS.map(call => {
                        const user = USERS.find(u => u.id === call.userId);
                        if (!user) return null;
                        
                        const isSelected = callId === call.id;
                        const dateStr = `${call.timestamp.getMonth()+1}/${call.timestamp.getDate()}/${call.timestamp.getFullYear()}`;
                        
                        const CallIcon = () => {
                            if (call.direction === 'outgoing') return <ArrowUpRight size={14} className="text-[#53bdeb]" />;
                            if (call.direction === 'incoming' && call.status === 'answered') return <ArrowDownLeft size={14} className="text-teal" />;
                            return <ArrowDownLeft size={14} className="text-red-500" />;
                        };

                        return (
                            <div 
                                key={call.id} 
                                onClick={() => router.push(`/calls/${call.id}`)}
                                className={`flex gap-4 p-4 border-b border-gray-50 cursor-pointer hover:bg-[#f5f6f6] transition-all ${isSelected ? 'bg-[#f0f2f5] border-l-4 border-l-teal' : 'border-l-4 border-l-transparent'}`}
                            >
                                <img src={user.avatar} className="w-12 h-12 rounded-full object-cover shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <div className="flex items-center gap-1.5 truncate pr-2">
                                            <span className="font-bold text-navy text-[15px] truncate">{user.name}</span>
                                            <span className="text-xs text-gray-500 truncate">({user.title})</span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 font-medium shrink-0">{dateStr}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 font-medium">
                                        <CallIcon />
                                        <span>{call.direction === 'outgoing' ? 'Outgoing' : 'Incoming'} {call.type} call &bull; {call.duration}</span>
                                    </div>
                                    
                                    {call.summary && (
                                        <div className="bg-[#f8f9fa] rounded-lg p-2.5 border border-gray-100 shadow-sm group hover:border-teal/20 transition-colors">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Wand2 size={12} className="text-gray-400" />
                                                <span className="text-[9px] font-bold text-teal uppercase tracking-widest">Call Summary</span>
                                            </div>
                                            <p className="text-[11px] text-gray-600 italic leading-relaxed line-clamp-2">{call.summary}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2 text-teal shrink-0">
                                    {call.type === 'video' ? <Video size={22}/> : <Phone size={22}/>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <Dialpad />
            )}
        </div>
    );
};

const CallDetails: React.FC = () => {
    const { callId } = useParams();
    const router = useRouter();
    const { chats, startCall, startChat, clinicalNotes } = useAppContext();
    
    const call = MOCK_CALLS.find(c => c.id === callId);
    const user = USERS.find(u => u.id === call?.userId);

    if (!call || !user) return (
        <div className="h-full flex flex-col items-center justify-center bg-[#f0f2f5] text-gray-400">
            <Phone size={48} className="mb-4 opacity-20" />
            <p>Select a call to view details</p>
        </div>
    );

    const timeStr = call.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isOutgoing = call.direction === 'outgoing';

    const handleMessage = () => {
        const directChat = chats.find(c => c.type === GroupType.DIRECT && c.participants.some(p => p.id === user.id));
        if (directChat) {
            router.push(`/chats/${directChat.id}`);
        } else {
            const newChatId = startChat(user.phoneNumber || user.name, false);
            router.push(`/chats/${newChatId}`);
        }
    };

    const ActionBtn = ({ icon, label, onClick }: any) => (
        <button onClick={onClick} className="flex flex-col items-center gap-2 text-teal hover:opacity-80 transition-opacity">
            <div className="p-3 border border-gray-200 rounded-full bg-white shadow-sm group-hover:bg-gray-50">{icon}</div>
            <span className="text-xs font-bold">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-[#f0f2f5] overflow-y-auto custom-scrollbar animate-[fadeIn_0.2s_ease-out]">
            <div className="h-16 bg-white px-4 flex items-center gap-4 border-b border-gray-200 shrink-0 sticky top-0 z-10 shadow-sm">
                <button onClick={() => router.push('/calls')} className="md:hidden text-gray-600 p-2 -ml-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={24}/></button>
                <h2 className="text-lg font-medium text-gray-800">Call info</h2>
            </div>
            
            <div className="p-8 flex flex-col items-center border-b border-gray-200 bg-white">
                <img src={user.avatar} className="w-28 h-28 rounded-full mb-5 shadow-md object-cover" />
                <h1 className="text-3xl font-normal text-gray-900 mb-1">{user.name}</h1>
                <p className="text-sm text-gray-500 mb-3">{user.title}</p>
                <p className="text-lg text-gray-800 tracking-wide">{user.phoneNumber || '+1 (555) 000-0000'}</p>
                <p className="text-xs text-gray-400 mb-8 font-bold uppercase tracking-widest mt-1">Mobile</p>
                
                <div className="flex gap-12 md:gap-16">
                    <ActionBtn icon={<MessageCircle size={22} />} label="Message" onClick={handleMessage} />
                    <ActionBtn icon={<Phone size={22} />} label="Audio" onClick={() => startCall(user, 'voice')} />
                    <ActionBtn icon={<Video size={22} />} label="Video" onClick={() => startCall(user, 'video')} />
                </div>
            </div>
            
            <div className="bg-white mt-2 p-6 md:p-8 flex-1 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-widest">Yesterday</p>
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
                    <div className="flex gap-4">
                        <div className="mt-1">
                            {isOutgoing ? <ArrowUpRight className="text-[#53bdeb]" size={22} /> : <ArrowDownLeft className="text-teal" size={22} />}
                        </div>
                        <div>
                            <p className="text-[15px] font-bold text-gray-900 mb-1">{isOutgoing ? 'Outgoing' : 'Incoming'}</p>
                            <p className="text-sm text-gray-500 font-medium">{call.duration} &bull; {call.dataUsage || 'Unknown data'}</p>
                        </div>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{timeStr}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                    <Wand2 size={16} className="text-teal" />
                    <h3 className="text-[11px] font-bold text-teal uppercase tracking-widest">Transcription / Scribe</h3>
                </div>
                <div className="bg-[#f8f9fa] rounded-2xl p-5 text-sm text-gray-700 border border-gray-200 shadow-inner leading-relaxed font-medium mb-8">
                    {call.transcription || call.summary || "No transcription available for this call."}
                </div>

                {/* SOAP Note Section */}
                {call.metadata?.soapNote && (
                    <div className="border-t pt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <ClipboardList size={16} className="text-purple-600" />
                            <h3 className="text-[11px] font-bold text-purple-600 uppercase tracking-widest">Clinical SOAP Note</h3>
                        </div>

                        <div className="space-y-4 mb-6">
                            {call.metadata.soapNote.subjective && (
                                <button
                                  onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                                  className="w-full text-left bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg p-4 border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-purple-50 transition-all group shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">Subjective</p>
                                        <ChevronRight size={14} className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{call.metadata.soapNote.subjective}</p>
                                </button>
                            )}

                            {call.metadata.soapNote.objective && (
                                <button
                                  onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                                  className="w-full text-left bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg p-4 border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-purple-50 transition-all group shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">Objective</p>
                                        <ChevronRight size={14} className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{call.metadata.soapNote.objective}</p>
                                </button>
                            )}

                            {call.metadata.soapNote.assessment && (
                                <button
                                  onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                                  className="w-full text-left bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg p-4 border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-purple-50 transition-all group shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">Assessment</p>
                                        <ChevronRight size={14} className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{call.metadata.soapNote.assessment}</p>
                                </button>
                            )}

                            {call.metadata.soapNote.plan && (
                                <button
                                  onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                                  className="w-full text-left bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg p-4 border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-purple-50 transition-all group shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">Plan</p>
                                        <ChevronRight size={14} className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{call.metadata.soapNote.plan}</p>
                                </button>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white border-t border-gray-100 p-6 -mx-6 -mb-6 flex gap-3 flex-wrap">
                            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide w-full">
                                Clinical Notes Actions
                            </h3>

                            {/* View Full Notes Button */}
                            <button
                              onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-teal text-white rounded-xl font-bold hover:bg-teal/90 transition-all shadow-md hover:shadow-lg"
                            >
                              <Eye size={18} />
                              View Full Notes
                            </button>

                            {/* Edit Notes Button */}
                            <button
                              onClick={() => router.push(`/notes/${call.metadata?.soapNote?.id || call.id}`)}
                              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all shadow-md hover:shadow-lg"
                            >
                              <Edit3 size={18} />
                              Edit Notes
                            </button>

                            {/* Share Notes Button */}
                            <button
                              onClick={() => alert('Share functionality coming soon')}
                              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all border-2 border-gray-300"
                            >
                              <Share2 size={18} />
                              Share Notes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- NEW FULL PAGE NOTES COMPONENTS ---
const NotesList: React.FC = () => {
    const { clinicalNotes, chats, searchTerm, setSearchTerm } = useAppContext();
    const router = useRouter();
    const { noteId } = useParams();

    const notesArray = Object.values(clinicalNotes)
        .filter((n: ClinicalNote) => {
            const chat = chats.find(c => c.id === n.chatId);
            const title = n.id === 'global_scribe' ? 'Global Quick Scribe' : (chat?.name || 'Unknown');
            return title.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .sort((a: ClinicalNote, b: ClinicalNote) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
        <div className="flex flex-col h-full bg-white w-full animate-[fadeIn_0.2s_ease-out] shadow-sm relative">
            <div className="h-16 bg-white px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
                <h1 className="text-xl font-bold text-navy">Notes & Scribe</h1>
                <div className="flex gap-4 text-teal">
                    <button onClick={() => router.push('/notes/global_scribe')} className="hover:bg-gray-100 p-2 rounded-full transition-colors"><Plus size={20} /></button>
                </div>
            </div>
            
            <div className="p-2 border-b border-gray-200 shrink-0 bg-white">
                <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5">
                    <Search size={18} className="text-gray-500 mr-3" />
                    <input 
                        type="text" 
                        placeholder="Search notes" 
                        className="bg-transparent w-full focus:outline-none text-[15px] text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {notesArray.map((note: ClinicalNote) => {
                    const isGlobal = note.id === 'global_scribe';
                    const chat = chats.find(c => c.id === note.chatId);
                    const title = isGlobal ? 'Global Quick Scribe' : (chat?.name || 'Unknown Record');
                    const isSelected = noteId === note.id;
                    
                    const preview = note.sections?.subjective || note.sections?.objective || note.sections?.assessment || note.sections?.plan || 'No content yet...';

                    return (
                        <div 
                            key={note.id} 
                            onClick={() => router.push(`/notes/${note.id}`)}
                            className={`flex items-center px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] transition-colors border-b border-gray-50 ${isSelected ? 'bg-[#f0f2f5] border-l-4 border-l-teal' : 'border-l-4 border-l-transparent'}`}
                        >
                            {isGlobal ? (
                                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mr-3 shrink-0">
                                    <Mic size={24} className="text-teal" />
                                </div>
                            ) : (
                                <img src={chat?.avatar} className="w-12 h-12 rounded-full mr-3 object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-[16px] text-navy truncate">{title}</h3>
                                    <span className="text-[11px] text-gray-400 shrink-0">{note.updatedAt.toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-500 truncate flex-1">{preview}</p>
                                    {note.suggestions.length > 0 && (
                                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                            <Sparkles size={10} /> {note.suggestions.length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const NoteEditor: React.FC = () => {
    const { noteId } = useParams();
    const { clinicalNotes, chats, updateClinicalNote, acceptSuggestion, dismissSuggestion, generateFullSOAP, isScribeActive, toggleScribe, userPreferences, openTemplatePicker } = useAppContext();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<SoapSection>('subjective');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
    const [editedSuggestionText, setEditedSuggestionText] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplateType>('soap');
    const [viewMode, setViewMode] = useState<'note' | 'call_scribe'>('note');

    // Create a default note on demand if it doesn't exist yet
    const noteIdStr = Array.isArray(noteId) ? noteId[0] : (noteId || '');
    let note = clinicalNotes[noteIdStr];

    // If note doesn't exist, create an empty one for any noteId
    if (!note && noteIdStr) {
        const isGlobalScribe = noteIdStr === 'global_scribe';
        const targetChat = chats.find(c => c.id === noteIdStr);

        // Create note if it's global_scribe or if a chat exists with this ID
        if (isGlobalScribe || targetChat) {
            note = {
                id: noteIdStr,
                chatId: isGlobalScribe ? '' : noteIdStr,
                templateType: userPreferences.defaultTemplate,
                sections: {},
                suggestions: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
    }

    if (!note) return (
        <div className="h-full flex flex-col items-center justify-center bg-[#f8f9fa] text-gray-400">
            <ClipboardList size={48} className="mb-4 opacity-20" />
            <p>Note not found</p>
        </div>
    );

    const isGlobal = note.id === 'global_scribe';
    const chat = chats.find(c => c.id === note.chatId);
    const title = isGlobal ? 'Global Quick Scribe' : (chat?.name || 'Clinical Note');

    const handleGenerate = async () => {
        if (isGlobal || !chat) return;
        setIsGenerating(true);
        await generateFullSOAP(chat.id);
        setIsGenerating(false);
    };

    const startEditing = (s: any) => {
        setEditingSuggestionId(s.id);
        setEditedSuggestionText(s.text);
    };

    const handleFinalize = (sId: string) => {
        acceptSuggestion(note.id, sId, editedSuggestionText);
        setEditingSuggestionId(null);
        setEditedSuggestionText("");
    };

    // Get template and build tabs dynamically
    const templateType = selectedTemplate || userPreferences.defaultTemplate;
    const template = NOTE_TEMPLATES[templateType];
    const tabs = template.sections.map(section => ({
        id: section.id as SoapSection,
        label: section.label,
        full: section.fullName
    }));

    // Ensure activeTab is valid for current template
    useEffect(() => {
        if (!tabs.find(t => t.id === activeTab)) {
            setActiveTab(tabs[0]?.id || 'subjective');
        }
    }, [templateType, tabs]);

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="h-16 bg-white px-4 flex items-center justify-between border-b border-gray-200 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/notes')} className="md:hidden text-gray-600 p-2 -ml-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={24}/></button>
                    <div className="flex items-center gap-3">
                        {isGlobal ? (
                            <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center"><Mic size={20} className="text-teal" /></div>
                        ) : (
                            <img src={chat?.avatar} className="w-10 h-10 rounded-full object-cover" />
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-navy leading-tight">{title}</h2>
                            <p className="text-xs text-gray-500">Last updated {note.updatedAt.toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Mode Tabs - Only show if note has a callId */}
                    {note.callId && (
                      <div className="hidden md:flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => setViewMode('note')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            viewMode === 'note'
                              ? 'bg-white text-teal shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Clinical Note
                        </button>
                        <button
                          onClick={() => setViewMode('call_scribe')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            viewMode === 'call_scribe'
                              ? 'bg-white text-teal shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Call Scribe
                        </button>
                      </div>
                    )}

                    {/* Template Switcher Button */}
                    <button
                      onClick={() => openTemplatePicker(note.id, selectedTemplate || userPreferences.defaultTemplate, (template) => setSelectedTemplate(template))}
                      className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      <Type size={16} />
                      {NOTE_TEMPLATES[selectedTemplate || userPreferences.defaultTemplate]?.name || 'Select Template'}
                      <ChevronRight size={14} className="opacity-50" />
                    </button>

                    <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <Sparkles size={16} className={isScribeActive ? 'text-teal animate-pulse' : 'text-gray-400'} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${isScribeActive ? 'text-teal' : 'text-gray-500'}`}>
                            {isScribeActive ? 'Scribe Active' : 'Scribe Paused'}
                        </span>
                        <button onClick={toggleScribe} className={`ml-2 p-1 rounded-full ${isScribeActive ? 'bg-white text-gray-700 shadow-sm' : 'bg-teal text-white'}`}>
                            {isScribeActive ? <CirclePause size={14} /> : <CirclePlay size={14} />}
                        </button>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Share2 size={20}/></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><MoreVertical size={20}/></button>
                </div>
            </div>
            
            {viewMode === 'call_scribe' && note.callId ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <Phone size={24} />
                                <h2 className="text-2xl font-bold">Call Transcription & Scribe</h2>
                            </div>
                            <p className="text-purple-100 text-sm">
                                Full conversation transcript with AI-generated clinical documentation
                            </p>
                        </div>

                        {/* Transcription Section */}
                        {note.callId && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <MessageCircle size={18} className="text-teal" />
                                        Full Conversation Transcript
                                    </h3>
                                </div>

                                {/* Display transcription - we would get this from chats/messages */}
                                <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto custom-scrollbar border border-gray-200">
                                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                        {(() => {
                                            const allMessages = chats.flatMap(c => c.messages);
                                            const callMsg = allMessages.find(m => m.metadata?.callId === note.callId);
                                            return callMsg?.metadata?.transcription || 'No transcription available for this call.';
                                        })()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* AI-Generated Clinical Note */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={18} className="text-purple-500" />
                                <h3 className="font-bold text-gray-900">AI-Generated Clinical Note</h3>
                            </div>

                            {/* Display note sections */}
                            <div className="space-y-4">
                                {(note.sections as Record<string, string>)?.['subjective'] && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">
                                            Subjective
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{(note.sections as Record<string, string>)['subjective']}</p>
                                    </div>
                                )}

                                {(note.sections as Record<string, string>)?.['objective'] && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">
                                            Objective
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{(note.sections as Record<string, string>)['objective']}</p>
                                    </div>
                                )}

                                {(note.sections as Record<string, string>)?.['assessment'] && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">
                                            Assessment
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{(note.sections as Record<string, string>)['assessment']}</p>
                                    </div>
                                )}

                                {(note.sections as Record<string, string>)?.['plan'] && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">
                                            Plan
                                        </h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{(note.sections as Record<string, string>)['plan']}</p>
                                    </div>
                                )}

                                {!(note.sections as Record<string, string>)?.['subjective'] && !(note.sections as Record<string, string>)?.['objective'] && !(note.sections as Record<string, string>)?.['assessment'] && !(note.sections as Record<string, string>)?.['plan'] && (
                                    <div className="text-center py-8 text-gray-400">
                                        <ClipboardList size={32} className="mx-auto mb-2 opacity-20" />
                                        <p>No clinical note content yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Action: Switch to Edit Mode */}
                            <button
                              onClick={() => setViewMode('note')}
                              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-teal text-white rounded-xl font-bold hover:bg-teal/90 transition-all shadow-md hover:shadow-lg"
                            >
                              <Edit3 size={18} />
                              Edit Clinical Note
                            </button>
                        </div>

                        {/* Link back to Call Details */}
                        <button
                          onClick={() => router.push(`/calls/${note.callId}`)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                          <ExternalLink size={18} />
                          View Call Details
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Col: Editor */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
                        <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-teal bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <span className="md:hidden">{tab.label}</span>
                                    <span className="hidden md:inline">{tab.full}</span>
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal rounded-t-full"></div>}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 p-6 flex flex-col overflow-hidden">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex justify-between items-center shrink-0">
                                <span>Official {template.sections.find(s => s.id === activeTab)?.fullName || activeTab} Records</span>
                                <button className="text-teal flex items-center gap-1 hover:underline"><Edit3 size={12}/> Formatting Options</button>
                            </label>
                            <textarea
                                value={(note.sections as Record<string, string>)?.[activeTab] || ''}
                                onChange={(e) => updateClinicalNote(note.id, activeTab, e.target.value)}
                                placeholder={template.sections.find(s => s.id === activeTab)?.placeholder || `Start documenting ${activeTab} details here...`}
                                className="flex-1 w-full p-4 border rounded-2xl text-[15px] focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none resize-none bg-white border-gray-200 shadow-inner leading-relaxed custom-scrollbar"
                            ></textarea>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || isGlobal}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${isGlobal ? 'bg-gray-200 text-gray-400' : (isGenerating ? 'bg-teal/70 text-white' : 'bg-teal text-white hover:bg-teal/90')}`}
                            >
                                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                {isGlobal ? 'Attach to Chat to Auto-Summarize' : (isGenerating ? 'Generating SOAP...' : 'Auto-Generate Full SOAP')}
                            </button>
                            <button className="px-6 py-3 bg-navy text-white rounded-xl font-bold text-sm hover:bg-navy/90 flex items-center gap-2 transition-all shadow-sm">
                                <Save size={18} /> Save
                            </button>
                        </div>
                    </div>

                    {/* Right Col: Intelligence Feed */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
                        <h3 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 shrink-0">
                            <div className="p-1.5 bg-purple-100 rounded-lg"><Sparkles size={16} className="text-purple-600" /></div>
                            Intelligence Feed
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 pb-4">
                            {note.suggestions.filter(s => s.section === activeTab).length === 0 && (
                                <div className="text-center py-12 px-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 mt-4">
                                    <Wand2 size={32} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm text-gray-500 font-medium">No active captures for {activeTab}.</p>
                                    <p className="text-xs text-gray-400 mt-2">Turn on the Scribe and speak or type to see AI suggestions appear here.</p>
                                </div>
                            )}
                            {note.suggestions.filter(s => s.section === activeTab).map(s => (
                                <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-purple-300 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                                    {editingSuggestionId === s.id ? (
                                        <div className="space-y-3">
                                            <textarea 
                                                value={editedSuggestionText}
                                                onChange={(e) => setEditedSuggestionText(e.target.value)}
                                                className="w-full text-sm p-3 border rounded-xl border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100 min-h-[120px] bg-purple-50/30 font-medium resize-none"
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingSuggestionId(null)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Discard</button>
                                                <button onClick={() => handleFinalize(s.id)} className="px-5 py-2 text-xs bg-purple-600 text-white rounded-lg font-bold shadow-md hover:bg-purple-700">Finalize</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <p className="text-[14px] text-gray-800 leading-relaxed font-medium">"{s.text}"</p>
                                                <button onClick={() => dismissSuggestion(note.id, s.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shrink-0"><Trash2 size={16}/></button>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                                <button onClick={() => startEditing(s)} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-teal bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-teal/10 transition-colors">
                                                    <Edit3 size={14}/> Edit
                                                </button>
                                                <button onClick={() => acceptSuggestion(note.id, s.id)} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-[11px] font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                                                    <CheckCircle2 size={14}/> Accept
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};
export default ContactPicker;