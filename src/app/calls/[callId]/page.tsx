'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import CallDetails from '../../../components/windows/CallDetails';

export default function CallPage() {
  const { callId } = useParams();

  // CallDetails component handles the callId from params internally
  return <CallDetails />;
}
