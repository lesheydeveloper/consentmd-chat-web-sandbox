'use client';

import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';

import { useAppContext } from '../../contexts/AppContext';
import { USERS } from '../../../services/mockData';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
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
              <UserPlus size={48} className="text-gray-300 mb-3" />
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

export default AddGroupMembersModal;
