'use client';

import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Video, Phone, Bell, Copy, Check, Users, Edit2, Clock } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { USERS, CURRENT_USER } from '../../../services/mockData';
import { User } from '../../../types';

interface ScheduledItem {
  id: string;
  type: 'consultation' | 'call' | 'appointment' | 'follow-up';
  title: string;
  patientName: string;
  patientId: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  participants?: string[];
  reminder?: string;
}

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ScheduledItem | null;
  onEdit: () => void;
  onJoin: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onJoin,
}) => {
  const [linkCopied, setLinkCopied] = useState(false);

  if (!isOpen || !event) return null;

  const startTime = format(event.scheduledAt, 'h:mm a');
  const endTime = format(
    new Date(event.scheduledAt.getTime() + event.duration * 60 * 1000),
    'h:mm a'
  );
  const itemIsToday = isToday(event.scheduledAt);
  const itemIsTomorrow = isTomorrow(event.scheduledAt);
  const dateStr = itemIsToday
    ? 'Today'
    : itemIsTomorrow
    ? 'Tomorrow'
    : format(event.scheduledAt, 'EEE, MMM d');

  const timeRange = `${dateStr}, ${startTime} – ${endTime}`;

  // Check if current time is within the call's scheduled time frame
  const now = new Date();
  const callStart = event.scheduledAt;
  const callEnd = new Date(callStart.getTime() + event.duration * 60 * 1000);
  const isWithinTimeFrame = now >= callStart && now <= callEnd;
  const canJoin = event.status === 'scheduled' && isWithinTimeFrame;

  const handleCopyLink = () => {
    // Generate a call link (in real app, this would be a proper link)
    const callLink = `${window.location.origin}/call/${event.id}`;
    navigator.clipboard.writeText(callLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleAddToCalendar = () => {
    const startDate = event.scheduledAt;
    const endDate = new Date(startDate.getTime() + event.duration * 60 * 1000);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(
      `${event.title}\n\n` +
      `Type: ${event.type === 'call' ? 'Call' : event.type === 'appointment' ? 'Appointment' : event.type === 'consultation' ? 'Consultation' : 'Follow-up'}\n` +
      `Duration: ${event.duration} minutes`
    );
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
    window.open(googleCalendarUrl, '_blank');
  };

  // Get participants
  const allParticipantIds = event.participants ? [...event.participants, event.patientId] : [event.patientId];
  const participantUsers = allParticipantIds
    .map(id => USERS.find(u => u.id === id))
    .filter((u): u is User => u !== undefined);

  const currentUserParticipant = participantUsers.find(p => p.id === CURRENT_USER.id);
  const otherParticipants = participantUsers.filter(p => p.id !== CURRENT_USER.id && p.id !== event.patientId);

  const callTypeLabel = event.type === 'call' ? 'Call' : event.type === 'appointment' ? 'Video Call' : event.type === 'consultation' ? 'Consultation' : 'Follow-up';
  const callTypeIcon = event.type === 'appointment' ? Video : Phone;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full md:max-w-md md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Event</h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Event Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>

            {/* Date & Time */}
            <div className="flex items-start gap-3 mb-4">
              <CalendarIcon size={20} className="text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-base text-gray-900">{timeRange}</p>
                <button
                  onClick={handleAddToCalendar}
                  className="text-sm text-teal hover:text-teal/80 font-medium mt-1"
                >
                  Add to calendar
                </button>
              </div>
            </div>

            {/* Call Type & Link */}
            <div className="flex items-start gap-3 mb-4">
              {React.createElement(callTypeIcon, { size: 20, className: "text-gray-400 mt-0.5 shrink-0" })}
              <div className="flex-1">
                <p className="text-base text-gray-900">{callTypeLabel}</p>
                <button
                  onClick={handleCopyLink}
                  className="text-sm text-teal hover:text-teal/80 font-medium mt-1 flex items-center gap-1"
                >
                  {linkCopied ? (
                    <>
                      <Check size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Join Button */}
            {event.status === 'scheduled' && (
              <button
                onClick={canJoin ? onJoin : undefined}
                disabled={!canJoin}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors mb-4 ${
                  canJoin
                    ? 'bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50'
                    : 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                {React.createElement(callTypeIcon, { size: 20 })}
                {canJoin ? 'Join' : `Join (available ${format(callStart, 'h:mm a')})`}
              </button>
            )}

            {/* Reminder */}
            <div className="flex items-start gap-3">
              <Bell size={20} className="text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-base text-gray-900">Reminder</p>
                <p className="text-sm text-gray-500 mt-1">
                  {event.reminder || '15 minutes before'}
                </p>
              </div>
            </div>
          </div>

          {/* Attendees Section */}
          {participantUsers.length > 0 && (
            <div className="space-y-4">
              {/* Going */}
              {currentUserParticipant && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Going</h3>
                    <span className="text-sm text-gray-500">{1} person</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUserParticipant.avatar}
                      alt={currentUserParticipant.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">You</p>
                      <p className="text-xs text-gray-500">19 minutes ago</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      Creator
                    </span>
                  </div>
                </div>
              )}

              {/* Not Responded */}
              {otherParticipants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Not responded</h3>
                    <span className="text-sm text-gray-500">{otherParticipants.length} person{otherParticipants.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-3">
                    {otherParticipants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3">
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Edit Event Button */}
        <div className="border-t border-gray-200 p-4 shrink-0">
          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={18} />
            Edit event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
