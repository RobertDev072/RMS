import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, isToday } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, User, MapPin, Plus, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: 'lesson' | 'unavailable' | 'request';
  status?: string; // Made more flexible to handle any status value
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setCurrentWeek(startOfWeek(selectedDate, { locale: nl }));
  }, [selectedDate]);

  // Show fewer days on mobile
  const daysToShow = isMobile ? 3 : 7;
  const weekDays = Array.from({ length: daysToShow }, (_, i) => addDays(currentWeek, i));
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
    let baseClasses = isMobile 
      ? "absolute left-0 right-0 mx-0.5 p-0.5 rounded text-[10px] overflow-hidden z-10 leading-tight "
      : "absolute left-0 right-0 mx-1 p-1 rounded text-xs overflow-hidden z-10 ";
    
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
        // Handle non-standard statuses - treat any non-empty, non-pending, non-rejected as accepted
        if (event.status === 'pending') {
          return cn(baseClasses, "bg-yellow-400 text-yellow-900 border-2 border-yellow-600");
        } else if (event.status === 'rejected') {
          return cn(baseClasses, "bg-red-400 text-red-900");
        } else if (event.status === 'accepted' || (typeof event.status === 'string' && event.status.trim() !== '' && event.status !== 'pending' && event.status !== 'rejected')) {
          // Treat any non-empty status that's not pending/rejected as accepted/approved
          return cn(baseClasses, "bg-green-400 text-green-900");
        } else {
          // Empty status or pending by default
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
      return isMobile ? startTime : `${startTime}-${endTime}`;
    }
    return startTime;
  };

  const getEventPosition = (start: string) => {
    const startDate = parseISO(start);
    const hour = startDate.getHours();
    const minutes = startDate.getMinutes();
    const position = ((hour - 8) * 60 + minutes) / 60; // Position in hours from 8:00
    return position * (isMobile ? 40 : 60); // Smaller height on mobile
  };

  const getEventHeight = (start: string, end?: string) => {
    if (!end) return isMobile ? 20 : 30; // Smaller default height on mobile
    
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    return Math.max(isMobile ? 20 : 30, durationHours * (isMobile ? 40 : 60)); // Smaller on mobile
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            <span className="text-sm md:text-lg">
              {isMobile 
                ? format(currentWeek, 'MMM yyyy', { locale: nl })
                : format(currentWeek, 'MMMM yyyy', { locale: nl })
              }
            </span>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              className={isMobile ? "h-8 w-8 p-0" : ""}
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              className={isMobile ? "text-xs px-2" : ""}
              onClick={() => setCurrentWeek(startOfWeek(new Date(), { locale: nl }))}
            >
              {isMobile ? 'Nu' : 'Vandaag'}
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              className={isMobile ? "h-8 w-8 p-0" : ""}
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={cn("grid border-b", isMobile ? "grid-cols-4" : "grid-cols-8")}>
          <div className={cn("p-2 font-medium text-center", isMobile ? "text-xs" : "text-sm")}>
            {isMobile ? 'T' : 'Tijd'}
          </div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "p-2 font-medium text-center border-l cursor-pointer hover:bg-muted",
                isMobile ? "text-xs" : "text-sm",
                isToday(day) && "bg-primary/10"
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div>{format(day, isMobile ? 'E' : 'EEE', { locale: nl })}</div>
              <div className={cn(
                isMobile ? "text-sm" : "text-lg",
                isToday(day) && "text-primary font-bold"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className={cn("grid overflow-y-auto", 
          isMobile ? "grid-cols-4 max-h-[400px]" : "grid-cols-8 max-h-[600px]"
        )}>
          {/* Time column */}
          <div>
            {hours.map((hour) => (
              <div key={hour} className={cn(
                "border-b text-muted-foreground flex items-start p-1",
                isMobile ? "h-[40px] text-[10px]" : "h-[60px] text-xs"
              )}>
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
                    className={cn(
                      "border-b hover:bg-muted/50 cursor-pointer relative",
                      isMobile ? "h-[40px]" : "h-[60px]"
                    )}
                    onClick={() => onDateClick?.(new Date(day.setHours(hour, 0, 0, 0)))}
                  >
                    {hour === 8 && onDateClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "absolute top-1 right-1 p-0 opacity-0 hover:opacity-100 transition-opacity",
                          isMobile ? "h-4 w-4" : "h-6 w-6"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDateClick(new Date(day.setHours(hour, 0, 0, 0)));
                        }}
                      >
                        <Plus className={isMobile ? "h-2 w-2" : "h-3 w-3"} />
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
                    <div className={cn("font-semibold truncate", isMobile ? "text-[9px]" : "")}>
                      {event.type === 'request' ? '📋 ' : event.type === 'lesson' ? '🚗 ' : '❌ '}
                      {formatEventTime(event.start, event.end)}
                    </div>
                    <div className={cn("truncate", isMobile ? "text-[9px]" : "")}>
                      {isMobile ? event.student || event.title.split(' - ')[1] || 'Les' : event.title}
                    </div>
                    {!isMobile && event.student && (
                      <div className="truncate text-xs opacity-80">
                        <User className="inline h-3 w-3 mr-1" />
                        {event.student}
                      </div>
                    )}
                     {!isMobile && event.location && (
                       <div className="truncate text-xs opacity-80">
                         <MapPin className="inline h-3 w-3 mr-1" />
                         {event.location}
                       </div>
                     )}
                     {/* Show notes for instructors, status for others */}
                     {!isMobile && userRole === 'instructor' ? (
                       event.notes && (
                         <div className="truncate text-xs opacity-80">
                           <MessageCircle className="inline h-3 w-3 mr-1" />
                           {event.notes}
                         </div>
                       )
                     ) : (
                       !isMobile && event.status && (
                         <Badge variant="secondary" className="text-[10px] mt-1">
                           {event.status === 'pending' ? 'Wachtend' : 
                            event.status === 'rejected' ? 'Afgewezen' :
                            event.status === 'accepted' ? 'Geaccepteerd' :
                            event.status === 'completed' ? 'Voltooid' :
                            event.status === 'scheduled' ? 'Ingepland' :
                           (typeof event.status === 'string' && event.status.trim() !== '') ? `Status: ${event.status}` : 'Wachtend'}
                         </Badge>
                       )
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