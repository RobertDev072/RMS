import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  User,
  Car,
  MapPin,
  Star,
  CheckCircle,
  BookOpen,
  Settings,
  Plus,
  CreditCard,
  Trophy,
  Target
} from "lucide-react";

interface StudentDashboardProps {
  userName: string;
  onLogout: () => void;
}

const StudentDashboard = ({ userName, onLogout }: StudentDashboardProps) => {
  // Demo data - in real app this would come from Supabase
  const studentData = {
    lessonsLeft: 12,
    totalLessons: 20,
    nextLesson: {
      date: 'Morgen',
      time: '14:00-15:00',
      instructor: 'Jan Pietersen',
      location: 'Centrum Amsterdam',
      type: 'Rijles'
    },
    progress: 65,
    examDate: '15 December 2024',
    instructor: {
      name: 'Jan Pietersen',
      rating: 4.9,
      experience: '8 jaar'
    }
  };

  const upcomingLessons = [
    { id: 1, date: 'Morgen', time: '14:00-15:00', instructor: 'Jan Pietersen', location: 'Centrum', type: 'Rijles' },
    { id: 2, date: 'Dinsdag', time: '16:00-17:00', instructor: 'Jan Pietersen', location: 'Noord', type: 'Parkeren' },
    { id: 3, date: 'Donderdag', time: '10:00-11:00', instructor: 'Jan Pietersen', location: 'West', type: 'Snelweg' }
  ];

  const recentLessons = [
    { id: 1, date: 'Gisteren', type: 'Rijles', score: 8, feedback: 'Goede vooruitgang met parkeren!' },
    { id: 2, date: '3 dagen geleden', type: 'Theorie', score: 9, feedback: 'Uitstekend begrip van verkeersborden.' },
    { id: 3, date: '1 week geleden', type: 'Rijles', score: 7, feedback: 'Werk aan spiegels controleren.' }
  ];

  const skillsProgress = [
    { name: 'Sturen', progress: 85, color: 'bg-success' },
    { name: 'Parkeren', progress: 60, color: 'bg-warning' },
    { name: 'Snelweg', progress: 45, color: 'bg-primary' },
    { name: 'Verkeersborden', progress: 90, color: 'bg-success' },
    { name: 'Voorrang', progress: 75, color: 'bg-accent' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Leerling Dashboard</h1>
              <p className="text-muted-foreground">Welkom terug, {userName}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Profiel
              </Button>
              <Button variant="destructive" size="sm" onClick={onLogout}>
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <Card className="shadow-card bg-gradient-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{studentData.lessonsLeft}</div>
                <div className="text-sm text-muted-foreground">Lessen Resterend</div>
                <div className="text-xs text-muted-foreground">van {studentData.totalLessons} totaal</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">{studentData.progress}%</div>
                <div className="text-sm text-muted-foreground">Voortgang</div>
                <Progress value={studentData.progress} className="mt-2 h-2" />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">
                  <Trophy className="w-8 h-8 mx-auto" />
                </div>
                <div className="text-sm text-muted-foreground">CBR Examen</div>
                <div className="text-xs font-medium text-foreground">{studentData.examDate}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Lesson & Upcoming */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Volgende Les & Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Next Lesson Highlight */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold text-primary">Volgende Les</div>
                  <Badge className="bg-primary text-primary-foreground">
                    {studentData.nextLesson.type}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {studentData.nextLesson.date} {studentData.nextLesson.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {studentData.nextLesson.instructor}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {studentData.nextLesson.location}
                  </div>
                  <Button size="sm" className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground">
                    Locatie Bekijken
                  </Button>
                </div>
              </div>

              {/* Upcoming Lessons */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Komende Lessen</div>
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-sm font-medium">{lesson.date} {lesson.time}</div>
                        <Badge variant="outline">{lesson.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{lesson.instructor}</span>
                        <span>{lesson.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Snelle Acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-primary hover:bg-primary-hover text-primary-foreground shadow-button">
                <Plus className="w-4 h-4 mr-2" />
                Nieuwe Les Boeken
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Planning Bekijken
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                Lessen Bijkopen
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Theorie Oefenen
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Mijn Instructeur
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Skills Progress & Recent Lessons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Progress */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Vaardigheidsvoortgang
              </CardTitle>
              <CardDescription>
                Jouw ontwikkeling per onderdeel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillsProgress.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.progress}%</span>
                    </div>
                    <Progress value={skill.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Lessons & Feedback */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recente Lessen
              </CardTitle>
              <CardDescription>
                Feedback van je instructeur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLessons.map((lesson) => (
                  <div key={lesson.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{lesson.date}</span>
                        <Badge variant="outline">{lesson.type}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-warning" />
                        <span className={`text-sm font-medium ${getScoreColor(lesson.score)}`}>
                          {lesson.score}/10
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{lesson.feedback}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructor Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Mijn Instructeur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                  JP
                </div>
                <div>
                  <div className="font-semibold">{studentData.instructor.name}</div>
                  <div className="text-sm text-muted-foreground">{studentData.instructor.experience} ervaring</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-warning" />
                    <span className="font-semibold">{studentData.instructor.rating}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Beoordeling</div>
                </div>
                <Button variant="outline" size="sm">
                  Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;