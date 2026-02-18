'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppContext } from '../../../contexts/AppContext';
import ChatWindow from '../../../components/windows/ChatWindow';

export default function ChatPage() {
  const { chatId } = useParams();
  const { chats, setActiveChat, activeChat } = useAppContext();

  useEffect(() => {
    if (chatId) {
      const chatIdStr = Array.isArray(chatId) ? chatId[0] : chatId;
      const chat = chats.find(c => c.id === chatIdStr);
      if (chat && chat.id !== activeChat?.id) {
        setActiveChat(chat);
      }
    } else {
      if (activeChat) setActiveChat(null);
    }
  }, [chatId, chats, activeChat, setActiveChat]);

  return <ChatWindow />;
}
