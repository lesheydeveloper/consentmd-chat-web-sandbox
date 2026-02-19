'use client';

import React, { useState, useEffect } from 'react';
import { X, Video, Phone, Clock, Calendar as CalendarIcon, Bell, ChevronRight, ChevronDown, Users, Repeat, Tag, FileText, Globe, Lock, Eye, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { USERS, CURRENT_USER } from '../../../services/mockData';
import { User } from '../../../types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ScheduleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduleData: {
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    duration?: number; // in minutes
    callType: 'voice' | 'video';
    reminder: string;
    participants?: User[];
    recurring?: {
      frequency: 'none' | 'daily' | 'weekly' | 'monthly';
      endDate?: Date;
    };
    tags?: string[];
    notes?: string;
    timezone?: string;
    privacy?: 'public' | 'private';
  }) => void;
  context?: {
    initialParticipant?: User;
    initialDate?: Date;
  };
}

const ScheduleCallModal: React.FC<ScheduleCallModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  context,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(context?.initialDate || new Date());
  const [startTime, setStartTime] = useState('17:00');
  const [endDate, setEndDate] = useState<Date | null>(context?.initialDate || new Date());
  const [endTime, setEndTime] = useState('17:30');
  const [duration, setDuration] = useState(30); // in minutes
  const [useDuration, setUseDuration] = useState(false); // Toggle between duration and end time
  const [callType, setCallType] = useState<'voice' | 'video'>('video');
  const [reminder, setReminder] = useState('15 minutes before');
  const [showReminderDropdown, setShowReminderDropdown] = useState(false);
  const [participants, setParticipants] = useState<User[]>(context?.initialParticipant ? [context.initialParticipant] : []);
  const [showParticipantPicker, setShowParticipantPicker] = useState(false);
  const [recurring, setRecurring] = useState<{ frequency: 'none' | 'daily' | 'weekly' | 'monthly'; endDate?: Date }>({ frequency: 'none' });
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [notes, setNotes] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('private');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'time']));

  useEffect(() => {
    if (context?.initialParticipant) {
      setTitle(`${context.initialParticipant.name}'s call`);
      setParticipants([context.initialParticipant]);
    }
  }, [context]);

  if (!isOpen) return null;

  const reminderOptions = [
    'None',
    '5 minutes before',
    '10 minutes before',
    '15 minutes before',
    '30 minutes before',
    '1 hour before',
    '2 hours before',
    '1 day before',
    '2 days before',
  ];

  const durationOptions = [15, 30, 45, 60, 90, 120]; // in minutes

  const callTypeOptions: Array<{ value: 'voice' | 'video'; label: string; icon: React.ReactNode }> = [
    { value: 'video', label: 'Video', icon: <Video size={20} /> },
    { value: 'voice', label: 'Voice', icon: <Phone size={20} /> },
  ];

  const recurringOptions: Array<{ value: 'none' | 'daily' | 'weekly' | 'monthly'; label: string }> = [
    { value: 'none', label: 'Does not repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const availableUsers = USERS.filter(u => u.id !== CURRENT_USER.id);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const addParticipant = (user: User) => {
    if (!participants.find(p => p.id === user.id)) {
      setParticipants([...participants, user]);
    }
    setShowParticipantPicker(false);
  };

  const removeParticipant = (userId: string) => {
    setParticipants(participants.filter(p => p.id !== userId));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSchedule = () => {
    if (!title.trim()) {
      alert('Please enter a call title');
      return;
    }

    // Combine date and time for start
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    // Calculate end date/time
    let endDateTime: Date | undefined;
    if (useDuration) {
      endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
    } else if (endDate) {
      const [endHour, endMinute] = endTime.split(':').map(Number);
      endDateTime = new Date(endDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);
    }

    onSchedule({
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: startDateTime,
      endDate: endDateTime,
      duration: useDuration ? duration : undefined,
      callType,
      reminder,
      participants: participants.length > 0 ? participants : undefined,
      recurring: recurring.frequency !== 'none' ? recurring : undefined,
      tags: tags.length > 0 ? tags : undefined,
      notes: notes.trim() || undefined,
      timezone,
      privacy,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setStartDate(new Date());
    setStartTime('17:00');
    setEndDate(new Date());
    setEndTime('17:30');
    setDuration(30);
    setUseDuration(false);
    setCallType('video');
    setReminder('15 minutes before');
    setParticipants([]);
    setRecurring({ frequency: 'none' });
    setTags([]);
    setNotes('');
    setPrivacy('private');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full md:max-w-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-[slideUp_0.3s_ease-out] mb-20 md:mb-0">
        {/* Header */}
        <div className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Schedule call</h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Basic Info Section */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('basic')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${expandedSections.has('basic') ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.has('basic') && (
              <div className="space-y-3 pl-2">
                {/* Call Title */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Call title"
                      className="flex-1 text-lg md:text-xl font-semibold text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-400"
                    />
                    {title && (
                      <button
                        onClick={() => setTitle('')}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (Optional)"
                    className="w-full text-sm text-gray-500 bg-transparent border-none outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Participants */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={18} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Participants</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {participants.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                      >
                        <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" />
                        <span className="text-sm text-gray-700">{user.name}</span>
                        <button
                          onClick={() => removeParticipant(user.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowParticipantPicker(!showParticipantPicker)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal/10 text-teal rounded-full text-sm font-medium hover:bg-teal/20"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                  {showParticipantPicker && (
                    <div className="border border-gray-200 rounded-lg p-2 max-h-48 overflow-y-auto space-y-1">
                      {availableUsers
                        .filter(u => !participants.find(p => p.id === u.id))
                        .map((user) => (
                          <button
                            key={user.id}
                            onClick={() => addParticipant(user)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left"
                          >
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                            <span className="text-sm text-gray-900">{user.name}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date and Time Section */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('time')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-sm font-semibold text-gray-900">Date & Time</h3>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${expandedSections.has('time') ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.has('time') && (
              <div className="space-y-3 pl-2">
                {/* Start Date/Time */}
                <div className="flex items-center gap-3">
                  <CalendarIcon size={20} className="text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Start</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={format(startDate, 'yyyy-MM-dd')}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none"
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration or End Time Toggle */}
                <div className="flex items-center gap-2 ml-8">
                  <button
                    onClick={() => setUseDuration(!useDuration)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      useDuration
                        ? 'bg-teal/10 text-teal'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Duration
                  </button>
                  <button
                    onClick={() => setUseDuration(!useDuration)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      !useDuration
                        ? 'bg-teal/10 text-teal'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    End Time
                  </button>
                </div>

                {/* Duration Selector */}
                {useDuration && (
                  <div className="flex items-center gap-3 ml-8">
                    <Clock size={20} className="text-gray-400 shrink-0" />
                    <div className="flex-1">
                      <div className="flex gap-2 flex-wrap">
                        {durationOptions.map((dur) => (
                          <button
                            key={dur}
                            onClick={() => setDuration(dur)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              duration === dur
                                ? 'bg-teal/10 text-teal border border-teal'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {dur} min
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* End Date/Time */}
                {!useDuration && (
                  <>
                    <div className="flex items-center gap-3 ml-8">
                      <CalendarIcon size={20} className="text-gray-400 shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">End</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                            onChange={(e) => setEndDate(new Date(e.target.value))}
                            className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none"
                          />
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Timezone */}
                <div className="flex items-center gap-3 ml-8">
                  <Globe size={18} className="text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Timezone</div>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none"
                    >
                      <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Chicago">America/Chicago (CST)</option>
                      <option value="America/Denver">America/Denver (MST)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Europe/Paris">Europe/Paris (CET)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Call Type & Reminder */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('settings')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-sm font-semibold text-gray-900">Settings</h3>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${expandedSections.has('settings') ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.has('settings') && (
              <div className="space-y-3 pl-2">
                {/* Call Type */}
                <div className="flex items-center gap-3">
                  <Video size={20} className="text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-2">Call type</div>
                    <div className="flex gap-3">
                      {callTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setCallType(option.value)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            callType === option.value
                              ? 'bg-teal/10 text-teal border border-teal'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reminder */}
                <div className="flex items-center gap-3 relative">
                  <Bell size={20} className="text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">Reminder</div>
                    <button
                      onClick={() => setShowReminderDropdown(!showReminderDropdown)}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 w-full text-left"
                    >
                      {reminder}
                      <ChevronDown size={16} className="ml-auto" />
                    </button>
                    {showReminderDropdown && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {reminderOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setReminder(option);
                              setShowReminderDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                              reminder === option ? 'bg-teal/10 text-teal' : 'text-gray-700'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Privacy */}
                <div className="flex items-center gap-3">
                  {privacy === 'public' ? <Eye size={20} className="text-gray-400 shrink-0" /> : <Lock size={20} className="text-gray-400 shrink-0" />}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-2">Privacy</div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPrivacy('public')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          privacy === 'public'
                            ? 'bg-teal/10 text-teal border border-teal'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Eye size={16} />
                        Public
                      </button>
                      <button
                        onClick={() => setPrivacy('private')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          privacy === 'private'
                            ? 'bg-teal/10 text-teal border border-teal'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Lock size={16} />
                        Private
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recurring */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('recurring')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-sm font-semibold text-gray-900">Recurring</h3>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${expandedSections.has('recurring') ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.has('recurring') && (
              <div className="space-y-3 pl-2">
                <div className="flex items-center gap-3">
                  <Repeat size={20} className="text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <div className="flex gap-2 flex-wrap">
                      {recurringOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setRecurring({ ...recurring, frequency: option.value })}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            recurring.frequency === option.value
                              ? 'bg-teal/10 text-teal border border-teal'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {recurring.frequency !== 'none' && (
                      <div className="mt-2">
                        <input
                          type="date"
                          value={recurring.endDate ? format(recurring.endDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) => setRecurring({ ...recurring, endDate: new Date(e.target.value) })}
                          placeholder="End date (Optional)"
                          className="text-sm text-gray-900 bg-transparent border border-gray-200 rounded-lg px-3 py-2 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('tags')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${expandedSections.has('tags') ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.has('tags') && (
              <div className="space-y-2 pl-2">
                <div className="flex items-center gap-2">
                  <Tag size={18} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag"
                    className="flex-1 text-sm text-gray-900 bg-transparent border border-gray-200 rounded-lg px-3 py-2 outline-none"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal/90"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 bg-teal/10 text-teal rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-teal hover:text-teal/80"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('notes')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${expandedSections.has('notes') ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections.has('notes') && (
              <div className="pl-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes or agenda items..."
                  rows={4}
                  className="w-full text-sm text-gray-900 bg-transparent border border-gray-200 rounded-lg px-3 py-2 outline-none resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            className="px-6 py-2 bg-teal text-white rounded-lg font-semibold hover:bg-teal/90 transition-colors shadow-lg"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCallModal;
