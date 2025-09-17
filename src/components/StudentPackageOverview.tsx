import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { User, Package, BookOpen, History } from 'lucide-react';

interface StudentWithPackages {
  id: string;
  lessons_remaining: number;
  profile: {
    full_name: string;
    email: string;
  };
  payment_proofs: {
    id: string;
    amount: number;
    status: string;
    submitted_at: string;
    approved_at: string | null;
    lesson_package: {
      name: string;
      lessons_count: number;
    };
  }[];
}

export const StudentPackageOverview: React.FC = () => {
  const [students, setStudents] = useState<StudentWithPackages[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithPackages | null>(null);

  useEffect(() => {
    fetchStudentsWithPackages();
  }, []);

  const fetchStudentsWithPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          lessons_remaining,
          profile:profiles!inner(full_name, email),
          payment_proofs(
            id,
            amount,
            status,
            submitted_at,
            approved_at,
            lesson_package:lesson_packages!inner(name, lessons_count)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students with packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'In Behandeling' },
      'accepted': { color: 'bg-blue-100 text-blue-800', text: 'Geaccepteerd' },
      'invoice_sent': { color: 'bg-purple-100 text-purple-800', text: 'Factuur Verstuurd' },
      'payment_received': { color: 'bg-orange-100 text-orange-800', text: 'Betaling Ontvangen' },
      'approved': { color: 'bg-green-100 text-green-800', text: 'Goedgekeurd' },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Afgewezen' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getTotalApprovedLessons = (paymentProofs: any[]) => {
    return paymentProofs
      .filter(proof => proof.status === 'approved')
      .reduce((total, proof) => total + proof.lesson_package.lessons_count, 0);
  };

  const getTotalSpent = (paymentProofs: any[]) => {
    return paymentProofs
      .filter(proof => proof.status === 'approved')
      .reduce((total, proof) => total + proof.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Leerling pakketten laden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Leerling Pakketten Overzicht</h2>
        <Badge variant="outline">
          {students.length} leerlingen
        </Badge>
      </div>

      <div className="grid gap-4">
        {students.map((student) => (
          <Card key={student.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-lg">{student.profile.full_name}</span>
                      <p className="text-sm text-muted-foreground">{student.profile.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-blue-600">{student.lessons_remaining}</p>
                      <p className="text-xs text-blue-600">Lessen Over</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Package className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-green-600">{getTotalApprovedLessons(student.payment_proofs)}</p>
                      <p className="text-xs text-green-600">Totaal Gekocht</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <span className="text-2xl font-bold text-purple-600">€{getTotalSpent(student.payment_proofs).toFixed(2)}</span>
                      <p className="text-xs text-purple-600">Totaal Besteed</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Recente Pakketten:</p>
                    <div className="flex flex-wrap gap-2">
                      {student.payment_proofs.slice(0, 3).map((proof) => (
                        <div key={proof.id} className="flex items-center space-x-2 text-xs bg-muted p-2 rounded">
                          <span>{proof.lesson_package.name}</span>
                          {getStatusBadge(proof.status)}
                        </div>
                      ))}
                      {student.payment_proofs.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{student.payment_proofs.length - 3} meer</span>
                      )}
                    </div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <History className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{student.profile.full_name} - Pakket Geschiedenis</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {student.payment_proofs.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Nog geen pakketten aangevraagd
                        </p>
                      ) : (
                        student.payment_proofs.map((proof) => (
                          <div key={proof.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{proof.lesson_package.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {proof.lesson_package.lessons_count} lessen - €{proof.amount}
                                </p>
                              </div>
                              {getStatusBadge(proof.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>Aangevraagd: {format(new Date(proof.submitted_at), 'dd MMM yyyy HH:mm', { locale: nl })}</p>
                              {proof.approved_at && (
                                <p>Goedgekeurd: {format(new Date(proof.approved_at), 'dd MMM yyyy HH:mm', { locale: nl })}</p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {students.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Geen leerlingen gevonden</h3>
            <p className="text-muted-foreground">
              Er zijn nog geen leerlingen geregistreerd.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};