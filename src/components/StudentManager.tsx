import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/use-toast';
import { Edit, Users, GraduationCap } from 'lucide-react';

export const StudentManager: React.FC = () => {
  const { students, fetchStudents } = useData();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    lessons_remaining: 0,
    theory_exam_passed: false,
    license_type: 'B'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const resetForm = () => {
    setForm({
      full_name: '',
      email: '',
      phone: '',
      lessons_remaining: 0,
      theory_exam_passed: false,
      license_type: 'B'
    });
    setEditingStudent(null);
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setForm({
      full_name: student.profile?.full_name || '',
      email: student.profile?.email || '',
      phone: student.profile?.phone || '',
      lessons_remaining: student.lessons_remaining || 0,
      theory_exam_passed: student.theory_exam_passed || false,
      license_type: student.license_type || 'B'
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      if (editingStudent) {
        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: form.full_name,
            email: form.email,
            phone: form.phone
          })
          .eq('id', editingStudent.profile_id);

        if (profileError) throw profileError;

        // Update student specific data
        const { error: studentError } = await supabase
          .from('students')
          .update({
            lessons_remaining: form.lessons_remaining,
            theory_exam_passed: form.theory_exam_passed,
            license_type: form.license_type
          })
          .eq('id', editingStudent.id);

        if (studentError) throw studentError;

        toast({ title: "Leerling bijgewerkt", description: "De leerling is succesvol bijgewerkt." });
      }

      setShowDialog(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      toast({ 
        title: "Fout", 
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive" 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leerlingen Beheren</CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nog geen leerlingen geregistreerd</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{student.profile?.full_name}</h3>
                    {student.theory_exam_passed && (
                      <GraduationCap className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{student.profile?.email}</p>
                  {student.profile?.phone && (
                    <p className="text-sm text-muted-foreground">{student.profile?.phone}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">
                      {student.lessons_remaining || 0} lessen over
                    </Badge>
                    <Badge variant={student.theory_exam_passed ? "default" : "secondary"}>
                      Theorie: {student.theory_exam_passed ? 'Geslaagd' : 'Nog niet'}
                    </Badge>
                    <Badge variant="outline">
                      Rijbewijs {student.license_type}
                    </Badge>
                  </div>
                </div>
                <Dialog open={showDialog && editingStudent?.id === student.id} onOpenChange={(open) => {
                  setShowDialog(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Bewerken
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Leerling Bewerken</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="full_name">Volledige Naam</Label>
                        <Input
                          id="full_name"
                          value={form.full_name}
                          onChange={(e) => setForm({...form, full_name: e.target.value})}
                          placeholder="Jan Janssen"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({...form, email: e.target.value})}
                          placeholder="jan@email.nl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefoon</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({...form, phone: e.target.value})}
                          placeholder="06-12345678"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lessons_remaining">Resterende Lessen</Label>
                        <Input
                          id="lessons_remaining"
                          type="number"
                          value={form.lessons_remaining}
                          onChange={(e) => setForm({...form, lessons_remaining: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="license_type">Rijbewijs Type</Label>
                        <select
                          id="license_type"
                          value={form.license_type}
                          onChange={(e) => setForm({...form, license_type: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="B">B (Auto)</option>
                          <option value="A">A (Motor)</option>
                          <option value="C">C (Vrachtwagen)</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="theory_exam_passed"
                          checked={form.theory_exam_passed}
                          onCheckedChange={(checked) => setForm({...form, theory_exam_passed: checked})}
                        />
                        <Label htmlFor="theory_exam_passed">Theorie Examen Geslaagd</Label>
                      </div>
                      <Button onClick={handleSubmit} className="w-full">
                        Bijwerken
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};