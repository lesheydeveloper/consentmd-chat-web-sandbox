'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { WifiOff } from 'lucide-react';

import { useAppContext } from '../contexts/AppContext';
import { USERS } from '../../services/mockData';
import Sidebar from './panels/Sidebar';
import ChatList from './windows/ChatList';
import CallList from './windows/CallList';
import NotesList from './windows/NotesList';
import EmptyWorkspace from './EmptyWorkspace';
import EmptyNotesWorkspace from './EmptyNotesWorkspace';
import ChatWindow from './windows/ChatWindow';
import CallDetails from './windows/CallDetails';
import NoteEditor from './windows/NoteEditor';
import PatientView from './windows/PatientView';
import NotesPanel from './panels/NotesPanel';
import ChatInfoPanel from './panels/ChatInfoPanel';
import IncomingCallModal from './modals/IncomingCallModal';
import CallPreviewModal from './modals/CallPreviewModal';
import ActiveCallScreen from './modals/ActiveCallScreen';
import MediaPreview from './modals/MediaPreview';
import SettingsModal from './modals/SettingsModal';
import ContactPicker from './modals/ContactPicker';
import CreateGroupModal from './modals/CreateGroupModal';
import AddGroupMembersModal from './modals/AddGroupMembersModal';
import TemplatePickerModal from './modals/TemplatePickerModal';
import PatientSelectorModal from './modals/PatientSelectorModal';
import PatientCreationModal from './modals/PatientCreationModal';
import ConsultationTypePicker from './modals/ConsultationTypePicker';
import ScheduleCallModal from './modals/ScheduleCallModal';
import EventDetailModal from './modals/EventDetailModal';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const {
      isTemplatePickerOpen, closeTemplatePicker, templatePickerContext,
      isPatientSelectorOpen, setIsPatientSelectorOpen,
      isPatientCreationOpen, setIsPatientCreationOpen,
      isConsultationPickerOpen, setIsConsultationPickerOpen,
      handlePatientSelected, handleCreateNewPatient, handleConsultationTypeSelected,
      isAddMembersOpen, addMembersChatId, closeAddMembers,
      isScheduleCallOpen, toggleScheduleCall, scheduleCallContext,
      isEventDetailOpen, eventDetailContext, openEventDetail, closeEventDetail,
      chats, startCall, openScheduleCall,
      isOffline
    } = useAppContext() as any;

    // Determine what to show on mobile
    const isViewingDetails = (pathname.startsWith('/chats/') && pathname.length > 7) ||
                             (pathname.startsWith('/calls/') && pathname.length > 7) ||
                             (pathname.startsWith('/notes/') && pathname.length > 7) ||
                             pathname === '/patients';
    const showListOnMobile = !isViewingDetails;

    // Determine which list to show
    const showChatList = pathname === '/' || pathname.startsWith('/chats');
    const showCallList = pathname.startsWith('/calls');
    const showNotesList = pathname.startsWith('/notes');
    const showAnyList = showChatList || showCallList || showNotesList;

    // Determine which main content to show
    const showChatWindow = pathname.startsWith('/chats/') && pathname.length > 7;
    const showCallDetails = pathname.startsWith('/calls/') && pathname.length > 7;
    const showNoteEditor = pathname.startsWith('/notes/') && pathname.length > 7;
    const showPatientView = pathname === '/patients';
    const showEmptyWorkspace = pathname === '/' || pathname === '/chats' || (pathname === '/calls' && !showCallDetails);
    const showEmptyNotesWorkspace = pathname === '/notes' && !showNoteEditor;

    // Show side panels for chat
    const showSidePanels = showChatWindow;

    return (
        <div className="h-screen w-full flex flex-col-reverse md:flex-row bg-[#d1d7db] overflow-hidden">
            {isOffline && (
                <div className="fixed top-0 left-0 right-0 z-[999] bg-yellow-500 text-white text-center text-sm py-2 font-medium flex items-center justify-center gap-2">
                    <WifiOff size={16}/> You're offline. Messages will send when you reconnect.
                </div>
            )}
            <Sidebar />
            
            {/* Wrap the main content to take flex-1 and manage its own overflow */}
            <div className="flex-1 flex min-h-0 min-w-0 relative w-full pb-20 md:pb-0">
                {showAnyList && (
                  <div className={`w-full md:w-[420px] shrink-0 h-full relative z-30 ${showListOnMobile ? 'block' : 'hidden md:block'}`}>
                      {showChatList && <ChatList />}
                      {showCallList && <CallList />}
                      {showNotesList && <NotesList />}
                  </div>
                )}
                
                <div className={`flex-1 flex min-w-0 relative h-full bg-[#f0f2f5] z-20 ${showAnyList && showListOnMobile ? 'hidden md:flex' : ''}`}>
                    <div className="flex-1 flex flex-col h-full relative min-w-0 w-full">
                        {children ? children : (
                            <>
                                {showEmptyWorkspace && <EmptyWorkspace />}
                                {showChatWindow && <ChatWindow />}
                                {showCallDetails && <CallDetails />}
                                {showEmptyNotesWorkspace && <EmptyNotesWorkspace />}
                                {showNoteEditor && <NoteEditor />}
                                {showPatientView && <PatientView />}
                                {pathname === '/calls' && !showCallDetails && (
                                    <div className="h-full flex items-center justify-center bg-[#f0f2f5]">
                                        <p className="text-gray-400">Select a call</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    {/* Desktop Side Panels */}
                    {showSidePanels && (
                        <div className="hidden md:flex h-full border-l border-gray-200">
                            <NotesPanel />
                            <ChatInfoPanel />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Overlays - using z-50 to cover bottom nav when open */}
            {showSidePanels && (
                <div className="md:hidden z-50">
                    <NotesPanel />
                    <ChatInfoPanel />
                </div>
            )}

            {/* Global Call Modals */}
            <IncomingCallModal />
            <CallPreviewModal />
            <ActiveCallScreen />
            <MediaPreview />

            {/* Settings & Template Selection Modals */}
            <SettingsModal />
            <ContactPicker />
            <CreateGroupModal />
            <AddGroupMembersModal
              isOpen={isAddMembersOpen}
              onClose={closeAddMembers}
              chatId={addMembersChatId}
            />
            <TemplatePickerModal
              isOpen={isTemplatePickerOpen}
              onClose={closeTemplatePicker}
              onSelect={(template) => {
                if (templatePickerContext?.onSelect) {
                  templatePickerContext.onSelect(template);
                  closeTemplatePicker();
                }
              }}
              currentTemplate={templatePickerContext?.currentTemplate}
            />

            {/* Patient & Consultation Modals */}
            <PatientSelectorModal
              isOpen={isPatientSelectorOpen}
              onClose={() => setIsPatientSelectorOpen(false)}
              onSelectExisting={handlePatientSelected}
              onCreateNew={() => {
                setIsPatientSelectorOpen(false);
                setIsPatientCreationOpen(true);
              }}
            />

            <PatientCreationModal
              isOpen={isPatientCreationOpen}
              onClose={() => setIsPatientCreationOpen(false)}
              onSave={handleCreateNewPatient}
            />

            <ConsultationTypePicker
              isOpen={isConsultationPickerOpen}
              onClose={() => setIsConsultationPickerOpen(false)}
              onSelect={handleConsultationTypeSelected}
            />

                <ScheduleCallModal
                  isOpen={isScheduleCallOpen}
                  onClose={toggleScheduleCall}
                  onSchedule={(scheduleData) => {
                    // TODO: Save to schedule/calendar
                    console.log('Scheduled call:', scheduleData);
                    // You can integrate this with your schedule page data
                    toggleScheduleCall();
                  }}
                  context={scheduleCallContext || undefined}
                />

                {/* Event Detail Modal */}
                <EventDetailModal
                  isOpen={isEventDetailOpen}
                  onClose={closeEventDetail}
                  event={eventDetailContext}
                  onEdit={() => {
                    closeEventDetail();
                    if (eventDetailContext) {
                      const participant = USERS.find((u: any) => u.id === eventDetailContext.patientId);
                      if (participant) {
                        openScheduleCall({
                          defaultParticipant: participant.name,
                        });
                      }
                    }
                  }}
                  onJoin={() => {
                    if (eventDetailContext) {
                      const participant = chats
                        .flatMap((c: any) => c.participants)
                        .find((p: any) => p.id === eventDetailContext.patientId);
                      if (participant) {
                        startCall(participant, eventDetailContext.type === 'appointment' ? 'video' : 'voice');
                      }
                      closeEventDetail();
                    }
                  }}
                />
        </div>
    );
};

export default Layout;
