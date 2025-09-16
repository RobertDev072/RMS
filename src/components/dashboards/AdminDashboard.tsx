import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Car,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus
} from "lucide-react";

interface AdminDashboardProps {
  userName: string;
  onLogout: () => void;
}

const AdminDashboard = ({ userName, onLogout }: AdminDashboardProps) => {
  // Demo data - in real app this would come from Supabase
  const stats = {
    totalStudents: 47,
    activeInstructors: 8,
    todayLessons: 23,
    monthlyRevenue: 15420,
    completionRate: 89
  };

  const recentActivities = [
    { id: 1, type: 'lesson', student: 'Emma van der Berg', instructor: 'Jan Pietersen', time: '14:30', status: 'completed' },
    { id: 2, type: 'exam', student: 'Tom de Vries', instructor: 'Marie Janssen', time: '15:45', status: 'scheduled' },
    { id: 3, type: 'payment', student: 'Lisa Bakker', amount: '€540', time: '16:20', status: 'paid' },
    { id: 4, type: 'lesson', student: 'Mike Peters', instructor: 'Jan Pietersen', time: '17:00', status: 'cancelled' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'scheduled': return 'bg-primary text-primary-foreground';
      case 'paid': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Voltooid';
      case 'scheduled': return 'Ingepland';
      case 'paid': return 'Betaald';
      case 'cancelled': return 'Geannuleerd';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Leerlingen</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-success">+12% deze maand</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Instructeurs</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeInstructors}</div>
              <p className="text-xs text-muted-foreground">6 beschikbaar vandaag</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessen Vandaag</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayLessons}</div>
              <p className="text-xs text-muted-foreground">18 voltooid, 5 gepland</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Omzet Deze Maand</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-success">+8% vs vorige maand</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recente Activiteiten
              </CardTitle>
              <CardDescription>
                Overzicht van vandaag's activiteiten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {activity.type === 'lesson' && `Les: ${activity.student}`}
                          {activity.type === 'exam' && `Examen: ${activity.student}`}
                          {activity.type === 'payment' && `Betaling: ${activity.student}`}
                        </div>
                        <Badge className={getStatusColor(activity.status)}>
                          {getStatusText(activity.status)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {activity.type !== 'payment' && activity.instructor && `Instructeur: ${activity.instructor} • `}
                        {activity.time}
                        {activity.amount && ` • ${activity.amount}`}
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
              <CardDescription>
                Veelgebruikte functies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-primary hover:bg-primary-hover text-primary-foreground shadow-button">
                <Plus className="w-4 h-4 mr-2" />
                Nieuwe Leerling
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Les Inplannen
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Instructeurs Beheren
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Rapporten Bekijken
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Car className="w-4 h-4 mr-2" />
                Voertuigen Beheer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Prestatie Overzicht
            </CardTitle>
            <CardDescription>
              Belangrijke metrics voor deze maand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{stats.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Slaagpercentage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.8</div>
                <div className="text-sm text-muted-foreground">Gem. Beoordeling</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">156</div>
                <div className="text-sm text-muted-foreground">Lessen Deze Maand</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">12</div>
                <div className="text-sm text-muted-foreground">CBR Examens</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;