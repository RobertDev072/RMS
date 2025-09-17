import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Euro,
  Package,
  AlertCircle,
  CreditCard
} from 'lucide-react';

interface PaymentProof {
  id: string;
  lesson_package_id: string;
  amount: number;
  status: string;
  submitted_at: string;
  invoice_sent_at?: string;
  payment_received_at?: string;
  approved_at?: string;
  processed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  lessons_added: boolean;
  invoice_email?: string;
  lesson_package: {
    name: string;
    lessons_count: number;
  };
}

export const StudentPaymentStatus: React.FC = () => {
  const { user } = useAuth();
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentProofs();
  }, [user]);

  const fetchPaymentProofs = async () => {
    if (!user) return;
    
    try {
      // First get the student record
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', (await supabase.from('profiles').select('id').eq('user_id', user.id).single()).data?.id)
        .single();

      if (!student) return;

      const { data, error } = await supabase
        .from('payment_proofs')
        .select(`
          *,
          lesson_package:lesson_packages!inner(name, lessons_count)
        `)
        .eq('student_id', student.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setPaymentProofs(data || []);
    } catch (error) {
      console.error('Error fetching payment proofs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'In Behandeling' },
      'accepted': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Geaccepteerd' },
      'invoice_sent': { color: 'bg-purple-100 text-purple-800', icon: Mail, text: 'Factuur Verstuurd' },
      'payment_received': { color: 'bg-orange-100 text-orange-800', icon: Euro, text: 'Betaling Ontvangen' },
      'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Goedgekeurd' },
      'rejected': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Afgewezen' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getStatusDescription = (proof: PaymentProof) => {
    switch (proof.status) {
      case 'pending':
        return 'Je verzoek is ontvangen en wordt beoordeeld door onze administratie.';
      case 'accepted':
        return 'Je verzoek is geaccepteerd! Een factuur wordt binnenkort naar je e-mailadres gestuurd.';
      case 'invoice_sent':
        return `Factuur is verstuurd naar ${proof.invoice_email || 'je e-mailadres'}. Gelieve te betalen volgens de instructies in de factuur.`;
      case 'payment_received':
        return 'We hebben je betaling ontvangen! Het pakket wordt nu verwerkt en de lessen worden toegevoegd aan je account.';
      case 'approved':
        return `Gefeliciteerd! Je pakket is goedgekeurd en ${proof.lesson_package.lessons_count} lessen zijn toegevoegd aan je account.`;
      case 'rejected':
        return proof.rejection_reason || 'Je verzoek is helaas afgewezen. Neem contact op voor meer informatie.';
      default:
        return 'Status onbekend.';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Pakketten laden...</div>
      </div>
    );
  }

  if (paymentProofs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Geen lespakketten</h3>
          <p className="text-muted-foreground">
            Je hebt nog geen lespakketten aangevraagd.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {paymentProofs.map((proof) => (
        <Card key={proof.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {proof.lesson_package.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {proof.lesson_package.lessons_count} lessen - €{proof.amount}
                </p>
              </div>
              {getStatusBadge(proof.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">{getStatusDescription(proof)}</p>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Aangevraagd: {format(new Date(proof.submitted_at), 'dd MMM yyyy HH:mm', { locale: nl })}
              </div>

              {proof.invoice_sent_at && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 mr-1" />
                  Factuur verstuurd: {format(new Date(proof.invoice_sent_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                </div>
              )}

              {proof.payment_received_at && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Betaling ontvangen: {format(new Date(proof.payment_received_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                </div>
              )}

              {proof.approved_at && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Goedgekeurd: {format(new Date(proof.approved_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                </div>
              )}

              {proof.status === 'rejected' && proof.rejection_reason && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  <strong>Reden afwijzing:</strong> {proof.rejection_reason}
                </div>
              )}

              {proof.admin_notes && proof.status !== 'rejected' && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Opmerking:</strong> {proof.admin_notes}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};