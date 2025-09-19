import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { Calendar } from '@/components/Calendar';
import { LessonRequestCard } from '@/components/LessonRequestCard';
import { AvailabilityManager } from '@/components/AvailabilityManager';
import { LessonFeedbackManager } from '@/components/LessonFeedbackManager';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, addWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { nl } from 'date-fns/locale';
import { CalendarDays, Users, AlertCircle, UserPlus, Settings, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { MobileProfileHeader } from '@/components/MobileProfileHeader';

interface EnhancedInstructorDashboardProps {
  userName: string;
  onLogout: () => void;
}

export const EnhancedInstructorDashboard: React.FC<EnhancedInstructorDashboardProps> = ({
  userName,
  onLogout,
}) => {
  const { user } = useAuth();
  const {
    lessons,
    students,
    lessonRequests,
    lessonPackages,
    loading,
    fetchLessons,
    fetchStudents,
    fetchLessonRequests,
    fetchLessonPackages,
    createStudent,
    updateLessonRequestStatus,
  } = useData();

  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [credentials, setCredentials] = useState<{email: string; password: string} | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [studentForm, setStudentForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    license_type: 'B'
  });
  
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchLessons('instructor', user.id);
      fetchStudents();
      fetchLessonRequests('instructor', user.id);
      fetchLessonPackages();
    }
  }, [user]);

  const loadCalendarEvents = async () => {
    if (!user?.id) return;
    
    try {
      const events: any[] = [];
      
      // Add lessons as events
      lessons.forEach(lesson => {
        events.push({
          id: `lesson-${lesson.id}`,
          title: `Les - ${lesson.student?.profile?.full_name || 'Onbekend'}`,
          start: lesson.scheduled_at,
          end: lesson.scheduled_at, // TODO: calculate from duration
          type: 'lesson',
          status: lesson.status,
          student: lesson.student?.profile?.full_name,
          instructor: lesson.instructor?.profile?.full_name,
          location: lesson.location,
          notes: lesson.notes
        });
      });
      
      // Add lesson requests as events
      lessonRequests.forEach(request => {
        events.push({
          id: `request-${request.id}`,
          title: `Verzoek - ${request.student?.profile?.full_name || 'Onbekend'}`,
          start: request.requested_date,
          type: 'request',
          status: request.status,
          student: request.student?.profile?.full_name,
          location: request.location,
          notes: request.notes
        });
      });

      // Fetch instructor availability and add as events
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', authUser.user.id)
          .single();

        if (profile) {
          const { data: instructor } = await supabase
            .from('instructors')
            .select('id')
            .eq('profile_id', profile.id)
            .single();

          if (instructor) {
            const { data: availability } = await supabase
              .from('instructor_availability')
              .select('*')
              .eq('instructor_id', instructor.id)
              .gte('date', format(new Date(), 'yyyy-MM-dd'))
              .order('date', { ascending: true })
              .order('start_time', { ascending: true });

            availability?.forEach((a: any) => {
              if (!a.is_available) {
                try {
                  const startISO = new Date(`${a.date}T${a.start_time}:00`).toISOString();
                  const endISO = new Date(`${a.date}T${a.end_time}:00`).toISOString();
                  events.push({
                    id: `unavail-${a.id}`,
                    title: `Niet beschikbaar`,
                    start: startISO,
                    end: endISO,
                    type: 'unavailable'
                  });
                } catch (error) {
                  console.error('Error parsing availability date/time:', a, error);
                }
              }
            });
          }
        }
      }
      
      setCalendarEvents(events);
      console.log('Calendar events loaded:', events.length, 'events');
      console.log('Lesson requests in calendar:', events.filter(e => e.type === 'request'));
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  };

  useEffect(() => {
    loadCalendarEvents();
  }, [lessons, lessonRequests]);

  const todayLessons = lessons.filter(lesson => {
    const today = new Date().toDateString();
    const lessonDate = new Date(lesson.scheduled_at).toDateString();
    return lessonDate === today;
  });

  // Also get accepted lesson requests for today
  const todayAcceptedRequests = lessonRequests.filter(request => {
    const today = new Date().toDateString();
    const requestDate = new Date(request.requested_date).toDateString();
    // Consider any non-empty, non-pending status as accepted
    const isAccepted = request.status && request.status.trim() !== '' && request.status !== 'pending' && request.status !== 'rejected';
    return requestDate === today && isAccepted;
  });

  const pendingRequests = lessonRequests.filter(request => request.status === 'pending');

  const handleCreateStudent = async () => {
    const result = await createStudent({
      email: studentForm.email,
      full_name: studentForm.full_name,
      phone: studentForm.phone,
      license_type: studentForm.license_type,
    });

    if (!result.error && result.credentials) {
      setCredentials(result.credentials);
      setStudentForm({ email: '', full_name: '', phone: '', license_type: 'B' });
      setShowStudentDialog(false);
    }
  };

  const handleRequestResponse = async (
    requestId: string, 
    status: 'accepted' | 'rejected',
    notes?: string
  ) => {
    await updateLessonRequestStatus(requestId, status, notes);
    if (user?.id) {
      fetchLessonRequests('instructor', user.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Gegevens laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileProfileHeader 
        userName={userName}
        userRole="instructor"
        onLogout={onLogout}
        onTabChange={setActiveTab}
      />

      <div className="p-4 md:p-6">
        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-5 text-xs sm:text-sm">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="calendar">Agenda</TabsTrigger>
            <TabsTrigger value="requests">
              Verzoeken {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="availability">
              <span className="hidden sm:inline">Beschikbaarheid</span>
              <span className="sm:hidden">Schema</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Lessen Vandaag</p>
                      <p className="text-2xl font-bold">{todayLessons.length + todayAcceptedRequests.length}</p>
                    </div>
                    <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Mijn Leerlingen</p>
                      <p className="text-2xl font-bold">{students.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Openstaande Verzoeken</p>
                      <p className="text-2xl font-bold">{pendingRequests.length}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Snelle Acties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full text-sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Leerling Aanmaken
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nieuwe Leerling Aanmaken</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="student_email">Email</Label>
                          <Input
                            id="student_email"
                            type="email"
                            value={studentForm.email}
                            onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                            placeholder="leerling@email.nl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="student_name">Volledige Naam</Label>
                          <Input
                            id="student_name"
                            value={studentForm.full_name}
                            onChange={(e) => setStudentForm({...studentForm, full_name: e.target.value})}
                            placeholder="Jan Janssen"
                          />
                        </div>
                        <div>
                          <Label htmlFor="student_phone">Telefoon</Label>
                          <Input
                            id="student_phone"
                            value={studentForm.phone}
                            onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                            placeholder="06-12345678"
                          />
                        </div>
                        <div>
                          <Label htmlFor="license_type">Rijbewijs Type</Label>
                          <Select value={studentForm.license_type} onValueChange={(value) => setStudentForm({...studentForm, license_type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B">B (Auto)</SelectItem>
                              <SelectItem value="A">A (Motor)</SelectItem>
                              <SelectItem value="C">C (Vrachtwagen)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleCreateStudent} className="w-full">
                          Leerling Aanmaken
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full text-sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Leerlingen Beheren
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Credentials Display */}
            {credentials && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Inloggegevens Nieuwe Leerling</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> {credentials.email}</p>
                    <p><strong>Tijdelijk Wachtwoord:</strong> {credentials.password}</p>
                    <p className="text-sm text-muted-foreground">
                      Geef deze gegevens door aan de leerling. De leerling kan het wachtwoord later wijzigen.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCredentials(null)}
                    >
                      Sluiten
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Planning Vandaag</CardTitle>
              </CardHeader>
              <CardContent>
                {todayLessons.length === 0 && todayAcceptedRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Geen lessen ingepland voor vandaag</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Show actual lessons */}
                    {todayLessons.map((lesson) => (
                      <div key={`lesson-${lesson.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{lesson.student?.profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(lesson.scheduled_at), 'HH:mm', { locale: nl })} - 
                            {lesson.location || 'Locatie niet opgegeven'}
                          </p>
                          {lesson.notes && (
                            <p className="text-sm text-muted-foreground">
                              Notitie: {lesson.notes}
                            </p>
                          )}
                        </div>
                        <Badge variant={lesson.status === 'completed' ? 'default' : 'secondary'}>
                          {lesson.status === 'scheduled' && 'Ingepland'}
                          {lesson.status === 'completed' && 'Voltooid'}
                          {lesson.status === 'cancelled' && 'Geannuleerd'}
                          {lesson.status === 'no_show' && 'Niet verschenen'}
                        </Badge>
                      </div>
                    ))}
                    
                    {/* Show accepted lesson requests */}
                    {todayAcceptedRequests.map((request) => (
                      <div key={`request-${request.id}`} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                        <div>
                          <p className="font-medium">{request.student?.profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.requested_date), 'HH:mm', { locale: nl })} - 
                            {request.location || 'Locatie niet opgegeven'}
                          </p>
                          {request.notes && (
                            <p className="text-sm text-muted-foreground">
                              Notitie: {request.notes}
                            </p>
                          )}
                          {request.instructor_notes && (
                            <p className="text-sm text-green-700">
                              Instructeur notitie: {request.instructor_notes}
                            </p>
                          )}
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          {request.status || 'Goedgekeurd'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Calendar
              events={calendarEvents}
              userRole="instructor"
              onEventClick={(event) => console.log('Event clicked:', event)}
            />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesverzoeken ({pendingRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Geen openstaande verzoeken</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <LessonRequestCard
                        key={request.id}
                        request={request}
                        onAccept={(id, notes) => handleRequestResponse(id, 'accepted', notes)}
                        onReject={(id, notes) => handleRequestResponse(id, 'rejected', notes)}
                        userRole="instructor"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <LessonFeedbackManager />
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <AvailabilityManager onAvailabilityChange={loadCalendarEvents} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedInstructorDashboard;