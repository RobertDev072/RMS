import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar } from '@/components/Calendar';
import { LessonRequestCard } from '@/components/LessonRequestCard';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  GraduationCap,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface EnhancedStudentDashboardProps {
  userName: string;
  onLogout: () => void;
}

export const EnhancedStudentDashboard: React.FC<EnhancedStudentDashboardProps> = ({
  userName,
  onLogout,
}) => {
  const { user } = useAuth();
  const {
    lessons,
    instructors,
    lessonPackages,
    lessonRequests,
    loading,
    fetchLessons,
    fetchInstructors,
    fetchLessonPackages,
    fetchLessonRequests,
    createLessonRequest,
    createPaymentProof,
  } = useData();

  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  const [lessonForm, setLessonForm] = useState({
    instructor_id: '',
    requested_date: new Date(),
    duration_minutes: 60,
    location: '',
    notes: ''
  });

  const [packageForm, setPackageForm] = useState({
    lesson_package_id: '',
    proof_email: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchLessons('student', user.id);
      fetchInstructors();
      fetchLessonPackages();
      fetchLessonRequests('student', user.id);
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authUser.user.id)
        .single();
      if (!profile) return;
      const { data } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('profile_id', profile.id)
        .single();
      
      if (data) {
        setStudentData(data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const loadCalendarEvents = async () => {
    const events: any[] = [];
    
    // Add lessons as events
    lessons.forEach(lesson => {
      events.push({
        id: `lesson-${lesson.id}`,
        title: `Rijles - ${lesson.instructor?.profile?.full_name || 'Onbekend'}`,
        start: lesson.scheduled_at,
        type: 'lesson',
        status: lesson.status,
        instructor: lesson.instructor?.profile?.full_name,
        location: lesson.location,
        notes: lesson.notes
      });
    });
    
    // Add lesson requests as events
    lessonRequests.forEach(request => {
      events.push({
        id: `request-${request.id}`,
        title: `Verzoek - ${request.instructor?.profile?.full_name || 'Onbekend'}`,
        start: request.requested_date,
        type: 'request',
        status: request.status,
        instructor: request.instructor?.profile?.full_name,
        location: request.location,
        notes: request.notes
      });
    });

    // Add instructors' non-availability to calendar
    try {
      const { data: availability } = await supabase
        .from('instructor_availability')
        .select(`
          *,
          instructor:instructors!inner(
            profile:profiles!inner(full_name)
          )
        `)
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      availability?.forEach((a: any) => {
        if (!a.is_available) {
          const startISO = new Date(`${a.date}T${a.start_time}:00`).toISOString();
          const endISO = new Date(`${a.date}T${a.end_time}:00`).toISOString();
          events.push({
            id: `unavail-${a.id}`,
            title: `Niet beschikbaar - ${a.instructor?.profile?.full_name || 'Instructeur'}`,
            start: startISO,
            end: endISO,
            type: 'unavailable'
          });
        }
      });
    } catch (e) {
      console.error('Error fetching availability for calendar:', e);
    }
    
    setCalendarEvents(events);
  };

  useEffect(() => {
    loadCalendarEvents();
  }, [lessons, lessonRequests]);

  const upcomingLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.scheduled_at);
    return lessonDate > new Date() && lesson.status === 'scheduled';
  }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const handleRequestLesson = async () => {
    try {
      await createLessonRequest({
        instructor_id: lessonForm.instructor_id,
        requested_date: lessonForm.requested_date.toISOString(),
        duration_minutes: lessonForm.duration_minutes,
        location: lessonForm.location,
        notes: lessonForm.notes
      });

      await fetchLessonRequests('student', user?.id || '');
      setShowLessonDialog(false);
      setLessonForm({
        instructor_id: '',
        requested_date: new Date(),
        duration_minutes: 60,
        location: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error in handleRequestLesson:', error);
    }
  };

  const handleRequestPackage = async () => {
    try {
      const selectedPackage = lessonPackages.find(pkg => pkg.id === packageForm.lesson_package_id);
      
      await createPaymentProof({
        lesson_package_id: packageForm.lesson_package_id,
        amount: selectedPackage?.price || 0,
        proof_email: packageForm.proof_email
      });

      setShowPackageDialog(false);
      setPackageForm({
        lesson_package_id: '',
        proof_email: ''
      });
    } catch (error) {
      console.error('Error in handleRequestPackage:', error);
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
      {/* Header */}
      <div className="bg-card border-b p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leerling Dashboard</h1>
            <p className="text-muted-foreground">Welkom terug, {userName}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Uitloggen
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="calendar">Agenda</TabsTrigger>
            <TabsTrigger value="requests">Mijn Verzoeken</TabsTrigger>
            <TabsTrigger value="lessons">Lessen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Resterende Lessen</p>
                      <p className="text-2xl font-bold">{studentData?.lessons_remaining || 0}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Komende Lessen</p>
                      <p className="text-2xl font-bold">{upcomingLessons.length}</p>
                    </div>
                    <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Theorie Examen</p>
                      <p className="text-sm font-bold">
                        {studentData?.theory_exam_passed ? 'Geslaagd' : 'Nog Niet Afgelegd'}
                      </p>
                    </div>
                    <GraduationCap className={cn(
                      "h-8 w-8",
                      studentData?.theory_exam_passed ? "text-green-600" : "text-muted-foreground"
                    )} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Rijles Aanvragen
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Nieuwe Rijles Aanvragen</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="instructor">Instructeur</Label>
                          <Select 
                            value={lessonForm.instructor_id} 
                            onValueChange={(value) => setLessonForm({...lessonForm, instructor_id: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kies een instructeur" />
                            </SelectTrigger>
                            <SelectContent>
                              {instructors.map((instructor) => (
                                <SelectItem key={instructor.id} value={instructor.id}>
                                  {instructor.profile?.full_name || 'Onbekende Instructeur'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Gewenste Datum & Tijd</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !lessonForm.requested_date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {lessonForm.requested_date ? 
                                  format(lessonForm.requested_date, 'PPP HH:mm', { locale: nl }) : 
                                  'Selecteer datum en tijd'
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={lessonForm.requested_date}
                                onSelect={(date) => date && setLessonForm({...lessonForm, requested_date: date})}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                              <div className="p-3 border-t">
                                <Label htmlFor="time">Tijd</Label>
                                <Input
                                  id="time"
                                  type="time"
                                  value={format(lessonForm.requested_date, 'HH:mm')}
                                  onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(':');
                                    const newDate = new Date(lessonForm.requested_date);
                                    newDate.setHours(parseInt(hours), parseInt(minutes));
                                    setLessonForm({...lessonForm, requested_date: newDate});
                                  }}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="duration">Duur (minuten)</Label>
                            <Select 
                              value={lessonForm.duration_minutes.toString()} 
                              onValueChange={(value) => setLessonForm({...lessonForm, duration_minutes: parseInt(value)})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="60">60 minuten</SelectItem>
                                <SelectItem value="90">90 minuten</SelectItem>
                                <SelectItem value="120">120 minuten</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="location">Ophaallocatie</Label>
                            <Input
                              id="location"
                              value={lessonForm.location}
                              onChange={(e) => setLessonForm({...lessonForm, location: e.target.value})}
                              placeholder="Bijv. thuis, school..."
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="notes">Opmerkingen (optioneel)</Label>
                          <Textarea
                            id="notes"
                            value={lessonForm.notes}
                            onChange={(e) => setLessonForm({...lessonForm, notes: e.target.value})}
                            placeholder="Bijzondere wensen of opmerkingen..."
                          />
                        </div>

                        <Button onClick={handleRequestLesson} className="w-full">
                          Verzoek Versturen
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Lespakket Aanvragen
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nieuw Lespakket Aanvragen</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="package">Lespakket</Label>
                          <Select value={packageForm.lesson_package_id} onValueChange={(value) => setPackageForm({...packageForm, lesson_package_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kies lespakket" />
                            </SelectTrigger>
                            <SelectContent>
                              {lessonPackages.map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id}>
                                  {pkg.name} - {pkg.lessons_count} lessen - €{pkg.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="proof_email">E-mailadres voor Betaalbewijs</Label>
                          <Input
                            id="proof_email"
                            type="email"
                            value={packageForm.proof_email}
                            onChange={(e) => setPackageForm({...packageForm, proof_email: e.target.value})}
                            placeholder="jouw@email.nl"
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Na het indienen van dit verzoek ontvang je betaalinstructies per e-mail. 
                          Stuur het betaalbewijs naar de rijschool om je pakket te activeren.
                        </div>
                        <Button onClick={handleRequestPackage} className="w-full">
                          Pakket Aanvragen
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Lessons */}
            <Card>
              <CardHeader>
                <CardTitle>Komende Rijlessen</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingLessons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Geen komende lessen ingepland</p>
                    <p className="text-sm mt-1">Vraag een nieuwe les aan om te beginnen</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingLessons.slice(0, 5).map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{lesson.instructor?.profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(lesson.scheduled_at), 'EEEE d MMMM yyyy - HH:mm', { locale: nl })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {lesson.location || 'Locatie wordt nog bepaald'}
                          </p>
                        </div>
                        <Badge variant="default">
                          Ingepland
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
              userRole="student"
              onEventClick={(event) => console.log('Event clicked:', event)}
            />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mijn Lesverzoeken</CardTitle>
              </CardHeader>
              <CardContent>
                {lessonRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Geen lesverzoeken gevonden</p>
                    <p className="text-sm mt-1">Vraag je eerste les aan om te beginnen</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessonRequests.map((request) => (
                      <LessonRequestCard
                        key={request.id}
                        request={request}
                        userRole="student"
                        showActions={false}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alle Lessen</CardTitle>
              </CardHeader>
              <CardContent>
                {lessons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nog geen lessen gevolgd</p>
                    <p className="text-sm mt-1">Je lesgeschiedenis verschijnt hier zodra je je eerste les hebt gehad</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons
                      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
                      .map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{lesson.instructor?.profile?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(lesson.scheduled_at), 'EEEE d MMMM yyyy - HH:mm', { locale: nl })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {lesson.location || 'Locatie niet opgegeven'}
                            </p>
                            {lesson.notes && (
                              <p className="text-sm text-muted-foreground">
                                Notitie: {lesson.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                lesson.status === 'completed' ? 'default' : 
                                lesson.status === 'scheduled' ? 'secondary' : 
                                'destructive'
                              }
                            >
                              {lesson.status === 'scheduled' && (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Ingepland
                                </>
                              )}
                              {lesson.status === 'completed' && (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Voltooid
                                </>
                              )}
                              {lesson.status === 'cancelled' && (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Geannuleerd
                                </>
                              )}
                              {lesson.status === 'no_show' && (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Niet verschenen
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;