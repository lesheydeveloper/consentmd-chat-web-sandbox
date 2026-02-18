'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import NoteEditor from '../../../components/windows/NoteEditor';

export default function NotePage() {
  const { noteId } = useParams();

  // NoteEditor component handles the noteId from params internally
  return <NoteEditor />;
}
