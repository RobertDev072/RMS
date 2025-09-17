import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, User, Mail, Phone, Calendar, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
      
      // Fetch student specific data if user is a student
      if (profile.role === 'student') {
        fetchStudentData();
      }
    }
  }, [profile]);

  const fetchStudentData = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('profile_id', profile?.id)
        .single();
      
      if (error) throw error;
      setStudentData(data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'instructor': return 'bg-blue-500';
      case 'student': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Beheerder';
      case 'instructor': return 'Instructeur';
      case 'student': return 'Leerling';
      default: return role;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast({
        title: "Profiel bijgewerkt",
        description: "Je gegevens zijn succesvol opgeslagen.",
      });
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-friendly header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>
          <h1 className="text-xl font-bold text-foreground">Mijn Profiel</h1>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Header Card */}
        <Card className="animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <Avatar className="h-20 w-20">
                <AvatarFallback className={`${getRoleColor(profile.role)} text-white text-xl`}>
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                <Badge variant="outline" className="text-sm">
                  {getRoleLabel(profile.role)}
                </Badge>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Stats (only for students) */}
        {profile.role === 'student' && studentData && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Leerling Statistieken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {studentData.lessons_remaining || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Lessen Over</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {studentData.theory_exam_passed ? 'Ja' : 'Nee'}
                  </div>
                  <div className="text-sm text-muted-foreground">Theorie Geslaagd</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {studentData.license_type || 'B'}
                  </div>
                  <div className="text-sm text-muted-foreground">Rijbewijs Type</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Form */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Persoonlijke Gegevens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Volledige Naam
                </Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Voer je volledige naam in"
                  className="animate-fade-in"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mailadres
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Voer je e-mailadres in"
                  className="animate-fade-in"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefoonnummer
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Voer je telefoonnummer in"
                  className="animate-fade-in"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full animate-fade-in hover-scale"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Opslaan...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Opslaan
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};