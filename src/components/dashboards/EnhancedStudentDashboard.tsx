import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, CreditCard, Plus } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

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
  } = useData();

  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [requestForm, setRequestForm] = useState({
    instructor_id: '',
    requested_date: '',
    duration_minutes: '60',
    location: '',
    notes: '',
  });
  const [packageForm, setPackageForm] = useState({
    lesson_package_id: '',
    proof_email: '',
  });
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetchLessons('student', user.id);
      fetchInstructors();
      fetchLessonPackages();
      fetchLessonRequests('student', user.id);
      fetchStudentData();
    }
  }, [user?.id]);

  const fetchStudentData = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles!inner(*)
      `)
      .eq('profile.user_id', user.id)
      .single();

    if (data) {
      setStudentData(data);
    }
  };

  const upcomingLessons = lessons.filter(lesson => {
    const now = new Date();
    const lessonDate = new Date(lesson.scheduled_at);
    return lessonDate > now;
  }).slice(0, 5);

  const handleRequestLesson = async () => {
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .insert([{
          student_id: studentData?.id,
          instructor_id: requestForm.instructor_id,
          requested_date: requestForm.requested_date,
          duration_minutes: parseInt(requestForm.duration_minutes),
          location: requestForm.location,
          notes: requestForm.notes,
        }]);

      if (error) {
        console.error('Error requesting lesson:', error);
        return;
      }

      setShowRequestDialog(false);
      setRequestForm({
        instructor_id: '',
        requested_date: '',
        duration_minutes: '60',
        location: '',
        notes: '',
      });

      if (user?.id) {
        fetchLessonRequests('student', user.id);
      }
    } catch (error) {
      console.error('Error in handleRequestLesson:', error);
    }
  };

  const handleRequestPackage = async () => {
    try {
      const selectedPackage = lessonPackages.find(p => p.id === packageForm.lesson_package_id);
      
      const { error } = await supabase
        .from('payment_proofs')
        .insert([{
          student_id: studentData?.id,
          lesson_package_id: packageForm.lesson_package_id,
          proof_email: packageForm.proof_email,
          amount: selectedPackage?.price || 0,
        }]);

      if (error) {
        console.error('Error requesting package:', error);
        return;
      }

      setShowPackageDialog(false);
      setPackageForm({
        lesson_package_id: '',
        proof_email: '',
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

      <div className="p-6 space-y-6">
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
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Theorie Examen</p>
                  <p className="text-2xl font-bold">
                    {studentData?.theory_exam_passed ? '✓' : '✗'}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-muted-foreground" />
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
              <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Rijles Aanvragen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nieuwe Rijles Aanvragen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="instructor">Instructeur</Label>
                      <Select value={requestForm.instructor_id} onValueChange={(value) => setRequestForm({...requestForm, instructor_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kies instructeur" />
                        </SelectTrigger>
                        <SelectContent>
                          {instructors.map((instructor) => (
                            <SelectItem key={instructor.id} value={instructor.id}>
                              {instructor.profile.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Gewenste Datum & Tijd</Label>
                      <Input
                        id="date"
                        type="datetime-local"
                        value={requestForm.requested_date}
                        onChange={(e) => setRequestForm({...requestForm, requested_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duur (minuten)</Label>
                      <Select value={requestForm.duration_minutes} onValueChange={(value) => setRequestForm({...requestForm, duration_minutes: value})}>
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
                        value={requestForm.location}
                        onChange={(e) => setRequestForm({...requestForm, location: e.target.value})}
                        placeholder="Bijv. Thuis, Centraal Station"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Opmerkingen</Label>
                      <Textarea
                        id="notes"
                        value={requestForm.notes}
                        onChange={(e) => setRequestForm({...requestForm, notes: e.target.value})}
                        placeholder="Eventuele opmerkingen of wensen"
                      />
                    </div>
                    <Button onClick={handleRequestLesson} className="w-full">
                      Verzoek Indienen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
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
              <p className="text-muted-foreground">Geen komende lessen ingepland.</p>
            ) : (
              <div className="space-y-4">
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {format(new Date(lesson.scheduled_at), 'dd MMM yyyy', { locale: nl })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(lesson.scheduled_at), 'HH:mm', { locale: nl })} - 
                        Instructeur: {lesson.instructor?.profile?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Locatie: {lesson.location || 'Niet opgegeven'}
                      </p>
                    </div>
                    <Badge variant={lesson.status === 'scheduled' ? 'default' : 'secondary'}>
                      {lesson.status === 'scheduled' && 'Ingepland'}
                      {lesson.status === 'completed' && 'Voltooid'}
                      {lesson.status === 'cancelled' && 'Geannuleerd'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lesson Requests Status */}
        {lessonRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Status Lesverzoeken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessonRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {format(new Date(request.requested_date), 'dd MMM yyyy HH:mm', { locale: nl })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Instructeur: {request.instructor?.profile?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duur: {request.duration_minutes} minuten
                      </p>
                      {request.instructor_notes && (
                        <p className="text-sm text-muted-foreground">
                          Notitie: {request.instructor_notes}
                        </p>
                      )}
                    </div>
                    <Badge variant={
                      request.status === 'accepted' ? 'default' : 
                      request.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }>
                      {request.status === 'pending' && 'In behandeling'}
                      {request.status === 'accepted' && 'Geaccepteerd'}
                      {request.status === 'rejected' && 'Afgewezen'}
                      {request.status === 'rescheduled' && 'Opnieuw ingepland'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;