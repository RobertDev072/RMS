import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Car, CheckCircle, Clock, Plus, Settings } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LessonPackageManager } from '@/components/LessonPackageManager';
import { StudentPackageOverview } from '@/components/StudentPackageOverview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { MobileProfileHeader } from '@/components/MobileProfileHeader';

interface EnhancedAdminDashboardProps {
  userName: string;
  onLogout: () => void;
}

export const EnhancedAdminDashboard: React.FC<EnhancedAdminDashboardProps> = ({
  userName,
  onLogout,
}) => {
  const navigate = useNavigate();
  const {
    lessons,
    students,
    instructors,
    cars,
    paymentProofs,
    lessonRequests,
    loading,
    fetchLessons,
    fetchStudents,
    fetchInstructors,
    fetchCars,
    fetchPaymentProofs,
    fetchLessonRequests,
    addCar,
    createInstructor,
    processPaymentProof,
  } = useData();

  const [showInstructorDialog, setShowInstructorDialog] = useState(false);
  const [instructorForm, setInstructorForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    fetchLessons();
    fetchStudents();
    fetchInstructors();
    fetchCars();
    fetchPaymentProofs();
    fetchLessonRequests();
  }, []);

  const todayLessons = lessons.filter(lesson => {
    const today = new Date().toDateString();
    const lessonDate = new Date(lesson.scheduled_at).toDateString();
    return lessonDate === today;
  });

  const pendingPayments = paymentProofs.filter(proof => proof.status === 'pending');

  const handleCreateInstructor = async () => {
    if (!instructorForm.password || instructorForm.password.length < 6) {
      toast({
        title: "Wachtwoord vereist",
        description: "Voer een wachtwoord in van minimaal 6 karakters.",
        variant: "destructive",
      });
      return;
    }

    const result = await createInstructor({
      email: instructorForm.email,
      full_name: instructorForm.full_name,
      phone: instructorForm.phone,
      password: instructorForm.password,
    });

    if (!result.error) {
      setShowInstructorDialog(false);
      setInstructorForm({ email: '', full_name: '', phone: '', password: '' });
    }
  };

  const handlePaymentApproval = async (proofId: string, status: 'approved' | 'rejected') => {
    await processPaymentProof(proofId, status);
    await fetchPaymentProofs();
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
        userRole="admin"
        onLogout={onLogout}
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/students')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Totaal Leerlingen</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/cars')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Auto's Beschikbaar</p>
                  <p className="text-2xl font-bold">{cars.filter(car => car.is_available).length}</p>
                </div>
                <Car className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Openstaande Betalingen</p>
                  <p className="text-2xl font-bold">{pendingPayments.length}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/cars')} 
                className="w-full flex items-center gap-2"
              >
                <Car className="h-4 w-4" />
                Auto's Beheren
              </Button>

              <Button 
                onClick={() => navigate('/students')} 
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Leerlingen Beheren
              </Button>

              <Dialog open={showInstructorDialog} onOpenChange={setShowInstructorDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Instructeur Toevoegen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nieuwe Instructeur Toevoegen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="instructor_email">Email</Label>
                      <Input
                        id="instructor_email"
                        type="email"
                        value={instructorForm.email}
                        onChange={(e) => setInstructorForm({...instructorForm, email: e.target.value})}
                        placeholder="instructeur@rijschool.nl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructor_name">Volledige Naam</Label>
                      <Input
                        id="instructor_name"
                        value={instructorForm.full_name}
                        onChange={(e) => setInstructorForm({...instructorForm, full_name: e.target.value})}
                        placeholder="Jan Janssen"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructor_phone">Telefoon</Label>
                      <Input
                        id="instructor_phone"
                        value={instructorForm.phone}
                        onChange={(e) => setInstructorForm({...instructorForm, phone: e.target.value})}
                        placeholder="06-12345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructor_password">Wachtwoord</Label>
                      <Input
                        id="instructor_password"
                        type="password"
                        value={instructorForm.password}
                        onChange={(e) => setInstructorForm({...instructorForm, password: e.target.value})}
                        placeholder="Minimaal 6 karakters"
                        minLength={6}
                      />
                    </div>
                    <Button onClick={handleCreateInstructor} className="w-full">
                      Instructeur Toevoegen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Leerling Pakketten
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Leerling Pakketten Overzicht</DialogTitle>
                  </DialogHeader>
                  <StudentPackageOverview />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Payment Approvals */}
        {pendingPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Openstaande Betalingsbewijzen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayments.map((proof) => (
                  <div key={proof.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{proof.student?.profile?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {proof.lesson_package?.name} - €{proof.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Factuur naar: {proof.proof_email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ingediend: {format(new Date(proof.submitted_at), 'dd MMM yyyy', { locale: nl })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handlePaymentApproval(proof.id, 'approved')}
                      >
                        Goedkeuren
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handlePaymentApproval(proof.id, 'rejected')}
                      >
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
                        Instructeur: {lesson.instructor?.profile?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(lesson.scheduled_at), 'HH:mm', { locale: nl })} - 
                        {lesson.location || 'Locatie niet opgegeven'}
                      </p>
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

export default EnhancedAdminDashboard;