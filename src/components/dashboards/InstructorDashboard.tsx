import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User,
  Car,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  MessageSquare
} from "lucide-react";

interface InstructorDashboardProps {
  userName: string;
  onLogout: () => void;
}

const InstructorDashboard = ({ userName, onLogout }: InstructorDashboardProps) => {
  // Demo data - in real app this would come from Supabase
  const todayLessons = [
    { id: 1, student: 'Emma van der Berg', time: '09:00-10:00', location: 'Centrum Amsterdam', type: 'Rijles', status: 'completed' },
    { id: 2, student: 'Tom de Vries', time: '10:30-11:30', location: 'Noord Amsterdam', type: 'Examentraining', status: 'current' },
    { id: 3, student: 'Lisa Bakker', time: '14:00-15:00', location: 'West Amsterdam', type: 'Rijles', status: 'scheduled' },
    { id: 4, student: 'Mike Peters', time: '15:30-16:30', location: 'Zuid Amsterdam', type: 'Parkeerles', status: 'scheduled' },
    { id: 5, student: 'Sarah Jansen', time: '17:00-18:00', location: 'Oost Amsterdam', type: 'CBR Examen', status: 'scheduled' }
  ];

  const myStudents = [
    { id: 1, name: 'Emma van der Berg', lessonsLeft: 8, nextLesson: 'Morgen 09:00', progress: 85 },
    { id: 2, name: 'Tom de Vries', lessonsLeft: 12, nextLesson: 'Vandaag 10:30', progress: 65 },
    { id: 3, name: 'Lisa Bakker', lessonsLeft: 15, nextLesson: 'Vandaag 14:00', progress: 45 },
    { id: 4, name: 'Mike Peters', lessonsLeft: 6, nextLesson: 'Vandaag 15:30', progress: 78 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'current': return 'bg-warning text-warning-foreground';
      case 'scheduled': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Voltooid';
      case 'current': return 'Bezig';
      case 'scheduled': return 'Gepland';
      default: return status;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-success';
    if (progress >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Instructeur Dashboard</h1>
              <p className="text-muted-foreground">Welkom terug, {userName}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Instellingen
              </Button>
              <Button variant="destructive" size="sm" onClick={onLogout}>
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{todayLessons.length}</div>
                  <div className="text-sm text-muted-foreground">Lessen Vandaag</div>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{myStudents.length}</div>
                  <div className="text-sm text-muted-foreground">Mijn Leerlingen</div>
                </div>
                <User className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">4.9</div>
                  <div className="text-sm text-muted-foreground">Gemiddelde Score</div>
                </div>
                <Star className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">Honda Civic</div>
                  <div className="text-sm text-muted-foreground">Toegewezen Auto</div>
                </div>
                <Car className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Planning Vandaag
              </CardTitle>
              <CardDescription>
                Jouw lessen voor vandaag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-sm font-medium">{lesson.student}</div>
                        <Badge className={getStatusColor(lesson.status)}>
                          {getStatusText(lesson.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lesson.location}
                        </div>
                        <div className="text-primary font-medium">
                          {lesson.type}
                        </div>
                      </div>
                    </div>
                    {lesson.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Feedback
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Snelle Acties</CardTitle>
              <CardDescription>
                Veelgebruikte functies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-primary hover:bg-primary-hover text-primary-foreground shadow-button">
                <Plus className="w-4 h-4 mr-2" />
                Nieuwe Les Plannen
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Beschikbaarheid
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Feedback Geven
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Leerling Profiel
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Car className="w-4 h-4 mr-2" />
                Auto Status
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Students Overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Mijn Leerlingen
            </CardTitle>
            <CardDescription>
              Overzicht van jouw leerlingen en hun voortgang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myStudents.map((student) => (
                <div key={student.id} className="p-4 rounded-lg border border-border hover:shadow-md transition-smooth">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">{student.name}</div>
                    <div className={`text-sm font-medium ${getProgressColor(student.progress)}`}>
                      {student.progress}%
                    </div>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2 mb-3">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-smooth" 
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Resterende lessen: <span className="font-medium text-foreground">{student.lessonsLeft}</span></div>
                    <div>Volgende les: <span className="font-medium text-foreground">{student.nextLesson}</span></div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      Bekijk Profiel
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;