import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, isToday } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, User, MapPin, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: 'lesson' | 'unavailable' | 'request';
  status?: 'scheduled' | 'completed' | 'cancelled' | 'pending' | 'accepted' | 'rejected';
  student?: string;
  instructor?: string;
  location?: string;
  notes?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  view?: 'week' | 'day';
  selectedDate?: Date;
  userRole?: 'student' | 'instructor' | 'admin';
}

export const Calendar = ({ 
  events = [], 
  onDateClick, 
  onEventClick, 
  view = 'week',
  selectedDate = new Date(),
  userRole = 'student'
}: CalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(selectedDate, { locale: nl }));

  useEffect(() => {
    setCurrentWeek(startOfWeek(selectedDate, { locale: nl }));
  }, [selectedDate]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00

  // Filter events for instructor view (only show next 2 weeks)
  const filteredEvents = userRole === 'instructor' 
    ? events.filter(event => {
        const eventDate = new Date(event.start);
        const twoWeeksFromNow = addWeeks(new Date(), 2);
        return eventDate <= twoWeeksFromNow;
      })
    : events;

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = parseISO(event.start);
      return isSameDay(eventDate, date);
    });
  };

  const getEventStyle = (event: CalendarEvent) => {
    const isPast = new Date(event.start) < new Date();
    let baseClasses = "absolute left-0 right-0 mx-1 p-1 rounded text-xs overflow-hidden z-10 ";
    
    // Add strikethrough and opacity for past events (instructor view only)
    if (userRole === 'instructor' && isPast && event.type === 'lesson') {
      baseClasses += "line-through opacity-75 ";
    }
    
    switch (event.type) {
      case 'lesson':
        switch (event.status) {
          case 'scheduled':
            return cn(baseClasses, "bg-primary text-primary-foreground");
          case 'completed':
            return cn(baseClasses, "bg-green-500 text-white");
          case 'cancelled':
            return cn(baseClasses, "bg-red-500 text-white line-through");
          default:
            return cn(baseClasses, "bg-primary text-primary-foreground");
        }
      case 'request':
        switch (event.status) {
          case 'pending':
            return cn(baseClasses, "bg-yellow-400 text-yellow-900 border-2 border-yellow-600");
          case 'accepted':
            return cn(baseClasses, "bg-green-400 text-green-900");
          case 'rejected':
            return cn(baseClasses, "bg-red-400 text-red-900");
          default:
            return cn(baseClasses, "bg-yellow-400 text-yellow-900");
        }
      case 'unavailable':
        return cn(baseClasses, "bg-gray-400 text-white opacity-75");
      default:
        return cn(baseClasses, "bg-secondary text-secondary-foreground");
    }
  };

  const formatEventTime = (start: string, end?: string) => {
    const startTime = format(parseISO(start), 'HH:mm');
    if (end) {
      const endTime = format(parseISO(end), 'HH:mm');
      return `${startTime}-${endTime}`;
    }
    return startTime;
  };

  const getEventPosition = (start: string) => {
    const startDate = parseISO(start);
    const hour = startDate.getHours();
    const minutes = startDate.getMinutes();
    const position = ((hour - 8) * 60 + minutes) / 60; // Position in hours from 8:00
    return position * 60; // Convert to pixels (60px per hour)
  };

  const getEventHeight = (start: string, end?: string) => {
    if (!end) return 30; // Default height for events without end time
    
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    return Math.max(30, durationHours * 60); // Minimum 30px, 60px per hour
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {format(currentWeek, 'MMMM yyyy', { locale: nl })}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(startOfWeek(new Date(), { locale: nl }))}
            >
              Vandaag
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 text-sm font-medium text-center">Tijd</div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "p-2 text-sm font-medium text-center border-l cursor-pointer hover:bg-muted",
                isToday(day) && "bg-primary/10"
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div>{format(day, 'EEE', { locale: nl })}</div>
              <div className={cn(
                "text-lg",
                isToday(day) && "text-primary font-bold"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8 overflow-y-auto max-h-[600px]">
          {/* Time column */}
          <div>
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] border-b text-xs text-muted-foreground flex items-start p-1">
                {hour}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDate(day);
            
            return (
              <div key={dayIndex} className="border-l relative">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b hover:bg-muted/50 cursor-pointer relative"
                    onClick={() => onDateClick?.(new Date(day.setHours(hour, 0, 0, 0)))}
                  >
                    {hour === 8 && onDateClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDateClick(new Date(day.setHours(hour, 0, 0, 0)));
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {/* Events overlay */}
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={getEventStyle(event)}
                    style={{
                      top: `${getEventPosition(event.start)}px`,
                      height: `${getEventHeight(event.start, event.end)}px`
                    }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="font-semibold truncate">
                      {event.type === 'request' ? '📋 ' : event.type === 'lesson' ? '🚗 ' : '❌ '}
                      {formatEventTime(event.start, event.end)}
                    </div>
                    <div className="truncate">{event.title}</div>
                    {event.student && (
                      <div className="truncate text-xs opacity-80">
                        <User className="inline h-3 w-3 mr-1" />
                        {event.student}
                      </div>
                    )}
                    {event.location && (
                      <div className="truncate text-xs opacity-80">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {event.location}
                      </div>
                    )}
                    {event.status && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {event.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};