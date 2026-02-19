'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare, Phone, X, MessageCircle
} from 'lucide-react';

import { useAppContext } from '../../contexts/AppContext';
import { User, GroupType, UserRole } from '../../../types';
import { USERS, CURRENT_USER } from '../../../services/mockData';
import PresenceDot from '../PresenceDot';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
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

export default ContactPicker;
