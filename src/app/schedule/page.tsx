'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calender';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  CalendarDays,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  Stethoscope,
  CalendarPlus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, isTomorrow, isSameDay, startOfDay } from 'date-fns';
import { useAppContext } from '@/contexts/AppContext';
import { BsCalendarX } from 'react-icons/bs';
import { AiOutlineUser } from 'react-icons/ai';
import { PiClockCountdownFill } from 'react-icons/pi';
import { ArrowLeft, List, Calendar as CalendarViewIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { USERS } from '../../../services/mockData';

interface ScheduledItem {
  id: string;
  type: 'consultation' | 'call' | 'appointment' | 'follow-up';
  title: string;
  patientName: string;
  patientId: string;
  scheduledAt: Date;
  duration: number; // in minutes
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  participants?: string[];
}

// Mock scheduled items for chat app
const MOCK_SCHEDULED_ITEMS: ScheduledItem[] = [
  {
    id: 's1',
    type: 'call',
    title: "blessednur67's call",
    patientName: 'blessednur67',
    patientId: 'u5',
    scheduledAt: (() => {
      const today = new Date();
      today.setHours(17, 30, 0, 0); // 5:30 PM today
      return today;
    })(),
    duration: 30,
    status: 'scheduled',
    participants: ['u1', 'u2'],
  },
  {
    id: 's2',
    type: 'call',
    title: 'Video Call',
    patientName: 'Mark Johnson',
    patientId: 'u3',
    scheduledAt: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    duration: 15,
    status: 'scheduled',
    participants: ['u1'],
  },
  {
    id: 's3',
    type: 'appointment',
    title: 'Team Meeting',
    patientName: 'Dr. Emily Chen',
    patientId: 'u2',
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    duration: 45,
    location: 'Conference Room',
    status: 'scheduled',
    notes: 'Discuss patient cases',
  },
  {
    id: 's4',
    type: 'call',
    title: 'Follow-up Call',
    patientName: 'Alice Williams',
    patientId: 'u5',
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    duration: 20,
    status: 'completed',
  },
  {
    id: 's5',
    type: 'call',
    title: 'Consultation Call',
    patientName: 'Mark Johnson',
    patientId: 'u3',
    scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    duration: 30,
    status: 'completed',
  },
];

const SchedulePage = () => {
  const { chats, startCall, openScheduleCall, openEventDetail } = useAppContext();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null);
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const today = new Date();
  const [isLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Track which items have been added to calendar
  const [addedToCalendarIds, setAddedToCalendarIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem('schedule_added_to_calendar');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('schedule_added_to_calendar', JSON.stringify(Array.from(addedToCalendarIds)));
    }
  }, [addedToCalendarIds]);

  React.useEffect(() => {
    const updateHeight = () => {
      if (calendarRef.current) {
        setCalendarHeight(calendarRef.current.offsetHeight);
      }
    };

    const timeoutId = setTimeout(updateHeight, 0);
    window.addEventListener('resize', updateHeight);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateHeight);
    };
  }, [selectedDate]);

  // Get scheduled items for selected date
  const selectedDateItems = useMemo(
    () =>
      MOCK_SCHEDULED_ITEMS.filter(
        (item) =>
          item.scheduledAt.toDateString() === selectedDate.toDateString()
      ),
    [selectedDate]
  );

  // Group scheduled items by date for list view
  const groupedScheduledItems = useMemo(() => {
    const groups: Record<string, ScheduledItem[]> = {};
    const todayStart = startOfDay(new Date());
    
    MOCK_SCHEDULED_ITEMS
      .filter(item => item.status === 'scheduled')
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
      .forEach(item => {
        const itemDate = startOfDay(item.scheduledAt);
        let groupKey: string;
        
        if (isToday(itemDate)) {
          groupKey = 'Today';
        } else if (isTomorrow(itemDate)) {
          groupKey = 'Tomorrow';
        } else {
          groupKey = format(itemDate, 'EEEE, MMMM d, yyyy');
        }
        
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
      });
    
    return groups;
  }, []);

  // Get dates that have scheduled items
  const scheduledDates = MOCK_SCHEDULED_ITEMS.map((item) => item.scheduledAt);

  // Get unique dates with item counts
  const datesWithItems = useMemo(() => {
    const dateMap = new Map<string, number>();
    MOCK_SCHEDULED_ITEMS.forEach((item) => {
      const dateKey = item.scheduledAt.toDateString();
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    });
    return dateMap;
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    const now = new Date();
    const upcoming = MOCK_SCHEDULED_ITEMS.filter(
      (item) => new Date(item.scheduledAt) > now && item.status === 'scheduled'
    );
    const past = MOCK_SCHEDULED_ITEMS.filter(
      (item) => new Date(item.scheduledAt) <= now || item.status === 'completed'
    );

    return {
      total: MOCK_SCHEDULED_ITEMS.length,
      scheduled: MOCK_SCHEDULED_ITEMS.filter((item) => item.status === 'scheduled').length,
      completed: MOCK_SCHEDULED_ITEMS.filter((item) => item.status === 'completed').length,
      cancelled: MOCK_SCHEDULED_ITEMS.filter((item) => item.status === 'cancelled').length,
      upcomingCount: upcoming.length,
      pastCount: past.length,
    };
  }, []);

  const getTypeIcon = (type: ScheduledItem['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'consultation':
        return <Stethoscope className="h-4 w-4" />;
      case 'appointment':
        return <CalendarIcon className="h-4 w-4" />;
      case 'follow-up':
        return <Clock className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: ScheduledItem['type']) => {
    switch (type) {
      case 'call':
        return 'Phone Call';
      case 'consultation':
        return 'Consultation';
      case 'appointment':
        return 'Appointment';
      case 'follow-up':
        return 'Follow-up';
    }
  };

  const getTypeColor = (type: ScheduledItem['type']) => {
    switch (type) {
      case 'call':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200';
      case 'consultation':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
      case 'appointment':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
      case 'follow-up':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200';
    }
  };

  const getStatusColor = (status: ScheduledItem['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200';
    }
  };

  const handleTodayClick = () => {
    setSelectedDate(today);
  };

  // Dashboard cards data
  const dashboardCards = useMemo(() => {
    return [
      {
        description: 'Scheduled',
        value: statistics.scheduled.toString(),
        change: '0%',
        trend: 'neutral' as const,
        footerText: 'Currently scheduled',
        footerDescription: '',
      },
      {
        description: 'Completed',
        value: statistics.completed.toString(),
        change: '0%',
        trend: 'neutral' as const,
        footerText: 'Finished items',
        footerDescription: '',
      },
      {
        description: 'Cancelled',
        value: statistics.cancelled.toString(),
        change: '0%',
        trend: 'neutral' as const,
        footerText: 'Cancelled items',
        footerDescription: '',
      },
      {
        description: 'Total',
        value: statistics.total.toString(),
        change: '0%',
        trend: 'neutral' as const,
        footerText: 'All scheduled items',
        footerDescription: '',
      },
    ];
  }, [statistics]);

  // Check if a date is selected
  const isDateSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Check if a date has scheduled items
  const hasScheduledItems = (date: Date) => {
    return scheduledDates.some((d) => d.toDateString() === date.toDateString());
  };

  // Get item count for a date
  const getItemCount = (date: Date) => {
    return datesWithItems.get(date.toDateString()) || 0;
  };

  // Add to Google Calendar
  const addToGoogleCalendar = (item: ScheduledItem) => {
    const startDate = new Date(item.scheduledAt);
    const endDate = new Date(startDate.getTime() + item.duration * 60 * 1000);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = encodeURIComponent(`${item.title} - ${item.patientName}`);
    const details = encodeURIComponent(
      `${item.title} with ${item.patientName}\n\n` +
      `Type: ${item.type}\n` +
      `Duration: ${item.duration} minutes\n` +
      (item.location ? `Location: ${item.location}\n` : '') +
      (item.notes ? `Notes: ${item.notes}\n` : '')
    );
    const location = encodeURIComponent(item.location || '');
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;

    window.open(googleCalendarUrl, '_blank');
    setAddedToCalendarIds((prev) => new Set([...prev, item.id]));
  };

  const isAddedToCalendar = (itemId: string) => {
    return addedToCalendarIds.has(itemId);
  };

  return (
    <div className="h-full overflow-y-auto bg-white md:bg-[#f0f2f5]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white md:bg-transparent border-b border-gray-200 md:border-none">
        <div className="px-4 md:px-8 py-3 md:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg md:text-2xl font-semibold text-gray-900">Scheduled calls</h1>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* View Toggle - Extra clear on mobile */}
            <div
              className="w-full md:w-auto flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200"
              role="tablist"
              aria-label="Schedule view"
            >
              <button
                onClick={() => setViewMode('list')}
                role="tab"
                aria-selected={viewMode === 'list'}
                className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-teal shadow-sm ring-1 ring-teal/20'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <List size={16} />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                role="tab"
                aria-selected={viewMode === 'calendar'}
                className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-teal shadow-sm ring-1 ring-teal/20'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <CalendarViewIcon size={16} />
                <span>Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-4 md:pb-8">
        {/* Schedule Call Button */}
        <button
          onClick={() => openScheduleCall()}
          className="w-full md:w-auto flex items-center gap-3 p-4 md:p-3 bg-white md:bg-transparent hover:bg-gray-50 md:hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors mb-4 md:mb-6 border-b md:border-b-0 border-gray-100"
        >
          <div className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
            <CalendarIcon size={24} className="md:w-5 md:h-5 text-teal" />
          </div>
          <span className="text-base md:text-sm font-medium text-gray-900">Schedule call</span>
        </button>

        {viewMode === 'list' ? (
          /* List View */
          <div className="space-y-6">
            {Object.keys(groupedScheduledItems).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BsCalendarX className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">No scheduled calls</p>
                <p className="text-xs text-gray-500 mb-4">Schedule your first call to get started</p>
                <Button variant="outline" size="sm" onClick={() => openScheduleCall()}>
                  Schedule Call
                </Button>
              </div>
            ) : (
              Object.entries(groupedScheduledItems).map(([groupKey, items]) => (
                <div key={groupKey} className="space-y-2">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">
                    {groupKey}
                  </h2>
                  {items.map((item) => {
                    const startTime = format(item.scheduledAt, 'h:mm a');
                    const endTime = format(
                      new Date(item.scheduledAt.getTime() + item.duration * 60 * 1000),
                      'h:mm a'
                    );
                    const timeRange = `${startTime} - ${endTime}`;
                    const itemIsToday = isToday(item.scheduledAt);
                    const itemIsTomorrow = isTomorrow(item.scheduledAt);
                    const dateStr = itemIsToday
                      ? 'Today'
                      : itemIsTomorrow
                      ? 'Tomorrow'
                      : format(item.scheduledAt, 'EEEE, MMMM d, yyyy');

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-white md:bg-transparent hover:bg-gray-50 md:hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        onClick={() => {
                          openEventDetail(item);
                        }}
                      >
                        <div className="relative shrink-0">
                          {(() => {
                            const user = USERS.find(u => u.id === item.patientId || u.name === item.patientName);
                            return user?.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={item.patientName}
                                className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover"
                              />
                            ) : (
                              <Avatar className="h-12 w-12 md:h-14 md:w-14">
                                <AvatarFallback className="bg-teal/10 text-teal font-semibold">
                                  {item.patientName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            );
                          })()}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <CalendarIcon size={12} className="text-teal" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-0.5 truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500">
                            {dateStr}, {timeRange}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 shrink-0"
                        >
                          Creator
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Calendar View */
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button variant="outline" onClick={handleTodayClick}>
                Today
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Calendar Section */}
          <div className="lg:col-span-2" ref={calendarRef}>
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="w-full"
                  captionLayout="dropdown"
                  modifiers={{
                    hasScheduledItem: scheduledDates,
                  }}
                  modifiersClassNames={{
                    hasScheduledItem: 'relative',
                  }}
                  components={{
                    DayButton: ({ day, modifiers, ...props }) => {
                      const date = day.date;
                      const isSelected = isDateSelected(date);
                      const hasItem = hasScheduledItems(date);
                      const itemCount = getItemCount(date);

                      return (
                        <div className="relative w-full h-full">
                          <button
                            {...props}
                            className={`relative w-full h-full min-h-12 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-teal text-white font-semibold shadow-none'
                                : hasItem
                                ? 'bg-gray-100 hover:bg-gray-200'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-sm">{date.getDate()}</span>
                            {hasItem && !isSelected && (
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal"></div>
                                {itemCount > 1 && (
                                  <span className="text-[10px] font-medium text-teal">
                                    {itemCount}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                          {isSelected && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-full max-w-[90%] bg-teal text-white text-[10px] font-semibold px-2 py-0.5 rounded-t-md shadow-none">
                              {itemCount > 0
                                ? `${itemCount} Item${itemCount > 1 ? 's' : ''}`
                                : 'Selected'}
                            </div>
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Items for Selected Date */}
          <div>
            <Card
              className="flex flex-col"
              style={
                calendarHeight ? { height: `${calendarHeight}px` } : undefined
              }
            >
              <CardHeader className="pb-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {selectedDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {selectedDateItems.length} item{selectedDateItems.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedDateItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <BsCalendarX className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        No items scheduled
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Select a date with scheduled items or create a new one
                      </p>
                      <Button variant="outline" size="sm" onClick={() => openScheduleCall()}>
                        Schedule Item
                      </Button>
                    </div>
                  ) : (
                    selectedDateItems
                      .sort((a, b) => {
                        const timeA = format(a.scheduledAt, 'HH:mm');
                        const timeB = format(b.scheduledAt, 'HH:mm');
                        return timeA.localeCompare(timeB);
                      })
                      .map((item) => {
                        const startTime = format(item.scheduledAt, 'h:mm a');
                        const endTime = format(
                          new Date(item.scheduledAt.getTime() + item.duration * 60 * 1000),
                          'h:mm a'
                        );
                        const timeRange = `${startTime} - ${endTime}`;
                        const itemIsToday = isToday(item.scheduledAt);
                        const itemIsTomorrow = isTomorrow(item.scheduledAt);
                        const dateStr = itemIsToday
                          ? 'Today'
                          : itemIsTomorrow
                          ? 'Tomorrow'
                          : format(item.scheduledAt, 'EEEE, MMMM d, yyyy');

                        const user = USERS.find(u => u.id === item.patientId || u.name === item.patientName);

                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
                            onClick={() => {
                              openEventDetail(item);
                            }}
                          >
                            <div className="relative shrink-0">
                              {user?.avatar ? (
                                <img 
                                  src={user.avatar} 
                                  alt={item.patientName}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="bg-teal/10 text-teal font-semibold">
                                    {item.patientName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <CalendarIcon size={12} className="text-teal" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate">
                                {item.patientName}
                              </h3>
                              <p className="text-xs text-gray-500 mb-1 truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {dateStr}, {timeRange}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1"
                              >
                                Creator
                              </Badge>
                              {item.type === 'call' && item.status === 'scheduled' ? (
                                <Button
                                  size="sm"
                                  className="h-8 text-xs font-medium bg-teal hover:bg-teal/90"
                                  onClick={() => {
                                    const participant = chats
                                      .flatMap((c) => c.participants)
                                      .find((p) => p.id === item.patientId);
                                    if (participant) {
                                      startCall(participant, 'voice');
                                    }
                                  }}
                                >
                                  <Phone className="h-3 w-3 mr-1" />
                                  Start Call
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs font-medium"
                                  onClick={() => addToGoogleCalendar(item)}
                                  disabled={isAddedToCalendar(item.id)}
                                >
                                  {isAddedToCalendar(item.id) ? (
                                    <>
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Added
                                    </>
                                  ) : (
                                    <>
                                      <CalendarPlus className="h-3 w-3 mr-1" />
                                      Add
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
        )}
      </div>

    </div>
  );
};

export default SchedulePage;
