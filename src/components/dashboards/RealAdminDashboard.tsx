import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, BookOpen, TrendingUp, LogOut, Euro } from "lucide-react";
import { useData } from "@/hooks/useData";
import { PaymentProofManager } from "@/components/PaymentProofManager";

interface RealAdminDashboardProps {
  userName: string;
  onLogout: () => void;
}

const RealAdminDashboard = ({ userName, onLogout }: RealAdminDashboardProps) => {
  const { lessons, students, instructors, lessonPackages, loading, fetchLessons, fetchStudents, fetchInstructors, fetchLessonPackages } = useData();
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalStudents: 0,
    totalInstructors: 0,
    revenue: 0
  });

  useEffect(() => {
    // Fetch all data on component mount
    fetchLessons();
    fetchStudents();
    fetchInstructors();
    fetchLessonPackages();
  }, []);

  useEffect(() => {
    // Calculate stats when data changes
    const completedLessons = lessons.filter(lesson => lesson.status === 'completed').length;
    const revenue = lessonPackages.reduce((sum, pkg) => sum + Number(pkg.price), 0);
    
    setStats({
      totalLessons: lessons.length,
      completedLessons,
      totalStudents: students.length,
      totalInstructors: instructors.length,
      revenue
    });
  }, [lessons, students, instructors, lessonPackages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Voltooid';
      case 'scheduled': return 'Gepland';
      case 'cancelled': return 'Geannuleerd';
      case 'no_show': return 'Niet verschenen';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welkom, {userName}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-4">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="payments">Betalingen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totaal Lessen</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLessons}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedLessons} voltooid
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Actieve Leerlingen</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Geregistreerde gebruikers
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Instructeurs</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInstructors}</div>
                  <p className="text-xs text-muted-foreground">
                    Actieve instructeurs
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Omzet Pakketten</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats.revenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Beschikbare pakketten
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Lessons */}
            <Card>
              <CardHeader>
                <CardTitle>Recente Lessen</CardTitle>
                <CardDescription>Overzicht van alle geplande en voltooide lessen</CardDescription>
              </CardHeader>
              <CardContent>
                {lessons.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nog geen lessen gepland</p>
                ) : (
                  <div className="space-y-4">
                    {lessons.slice(0, 10).map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {lesson.student?.profile?.full_name || 'Onbekende leerling'}
                            </span>
                            <span className="text-muted-foreground">met</span>
                            <span className="font-medium">
                              {lesson.instructor?.profile?.full_name || 'Onbekende instructeur'}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(lesson.scheduled_at).toLocaleDateString('nl-NL', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {lesson.location && (
                            <div className="text-sm text-muted-foreground">
                              📍 {lesson.location}
                            </div>
                          )}
                        </div>
                        <Badge className={getStatusColor(lesson.status)}>
                          {getStatusText(lesson.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Students and Instructors */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Leerlingen</CardTitle>
                  <CardDescription>Geregistreerde leerlingen</CardDescription>
                </CardHeader>
                <CardContent>
                  {students.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nog geen leerlingen geregistreerd</p>
                  ) : (
                    <div className="space-y-3">
                      {students.slice(0, 5).map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{student.profile.full_name}</p>
                            <p className="text-sm text-muted-foreground">{student.profile.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{student.lessons_remaining} lessen over</p>
                            <p className="text-xs text-muted-foreground">
                              {student.theory_exam_passed ? '✅ Theorie gehaald' : '⏳ Theorie nog niet gehaald'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Instructeurs</CardTitle>
                  <CardDescription>Actieve instructeurs</CardDescription>
                </CardHeader>
                <CardContent>
                  {instructors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nog geen instructeurs geregistreerd</p>
                  ) : (
                    <div className="space-y-3">
                      {instructors.slice(0, 5).map((instructor) => (
                        <div key={instructor.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{instructor.profile.full_name}</p>
                            <p className="text-sm text-muted-foreground">{instructor.profile.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Max {instructor.max_lessons_per_day} lessen/dag</p>
                            <p className="text-xs text-muted-foreground">
                              {instructor.specializations.join(', ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <PaymentProofManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RealAdminDashboard;