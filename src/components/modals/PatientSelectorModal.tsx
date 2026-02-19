'use client';

import React from 'react';
import { X, UserPlus, Users, ChevronRight } from 'lucide-react';

import { useAppContext } from '../../contexts/AppContext';
import { UserRole } from '../../../types';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
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

export default PatientSelectorModal;
