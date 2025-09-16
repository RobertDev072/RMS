import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, Plus, CheckCircle, X } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
  const [studentForm, setStudentForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    license_type: 'B',
  });
  const [credentials, setCredentials] = useState<{email: string, password: string} | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchLessons('instructor', user.id);
      fetchStudents();
      fetchLessonRequests('instructor', user.id);
      fetchLessonPackages();
    }
  }, [user?.id]);

  const todayLessons = lessons.filter(lesson => {
    const today = new Date().toDateString();
    const lessonDate = new Date(lesson.scheduled_at).toDateString();
    return lessonDate === today;
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
      {/* Header */}
      <div className="bg-card border-b p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Instructeur Dashboard</h1>
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
                  <p className="text-sm font-medium text-muted-foreground">Lessen Vandaag</p>
                  <p className="text-2xl font-bold">{todayLessons.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Openstaande Verzoeken</p>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
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
              <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
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

              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Beschikbaarheid Instellen
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

        {/* Lesson Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Openstaande Lesverzoeken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{request.student?.profile?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Gewenste datum: {format(new Date(request.requested_date), 'dd MMM yyyy HH:mm', { locale: nl })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duur: {request.duration_minutes} minuten
                      </p>
                      {request.notes && (
                        <p className="text-sm text-muted-foreground">
                          Notitie: {request.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleRequestResponse(request.id, 'accepted')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accepteren
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRequestResponse(request.id, 'rejected')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Afwijzen
                      </Button>
                    </div>
                  </div>
                ))}
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
            {todayLessons.length === 0 ? (
              <p className="text-muted-foreground">Geen lessen ingepland voor vandaag.</p>
            ) : (
              <div className="space-y-4">
                {todayLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedInstructorDashboard;