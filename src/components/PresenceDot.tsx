'use client';

import React from 'react';

import { useAppContext } from '../contexts/AppContext';

const PresenceDot: React.FC<{ userId: string; size?: 'sm' | 'md' }> = ({ userId, size = 'sm' }) => {
  const { onlineUsers } = useAppContext();
  if (!onlineUsers.has(userId)) return null;
  const s = size === 'sm' ? 'w-2.5 h-2.5 border border-white' : 'w-3.5 h-3.5 border-2 border-white';
  return <span className={`${s} bg-green-500 rounded-full absolute bottom-0 right-0 shrink-0`} />;
};

export default PresenceDot;
