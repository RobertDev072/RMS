import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  User,
  Package,
  AlertCircle
} from 'lucide-react';

interface PaymentProof {
  id: string;
  student_id: string;
  lesson_package_id: string;
  amount: number;
  proof_email: string;
  status: string;
  submitted_at: string;
  processed_at?: string;
  processed_by?: string;
  admin_notes?: string;
  rejection_reason?: string;
  lessons_added: boolean;
  student: {
    profile: {
      full_name: string;
      email: string;
    };
  };
  lesson_package: {
    name: string;
    lessons_count: number;
  };
}

export const PaymentProofManager: React.FC = () => {
  const { user } = useAuth();
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPaymentProofs();
  }, []);

  const fetchPaymentProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_proofs')
        .select(`
          *,
          student:students!inner(
            profile:profiles!inner(full_name, email)
          ),
          lesson_package:lesson_packages!inner(name, lessons_count)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setPaymentProofs(data || []);
    } catch (error) {
      console.error('Error fetching payment proofs:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptPayment = async (proofId: string, invoiceEmail?: string) => {
    try {
      const { error } = await supabase.rpc('accept_payment_proof', {
        payment_proof_id: proofId,
        admin_user_id: user?.id,
        invoice_email: invoiceEmail
      });

      if (error) throw error;
      await fetchPaymentProofs();
    } catch (error) {
      console.error('Error accepting payment:', error);
    }
  };

  const markInvoiceSent = async (proofId: string) => {
    try {
      const { error } = await supabase.rpc('mark_invoice_sent', {
        payment_proof_id: proofId,
        admin_user_id: user?.id
      });

      if (error) throw error;
      await fetchPaymentProofs();
    } catch (error) {
      console.error('Error marking invoice as sent:', error);
    }
  };

  const markPaymentReceived = async (proofId: string) => {
    try {
      const { error } = await supabase.rpc('mark_payment_received', {
        payment_proof_id: proofId,
        admin_user_id: user?.id
      });

      if (error) throw error;
      await fetchPaymentProofs();
    } catch (error) {
      console.error('Error marking payment as received:', error);
    }
  };

  const updatePaymentStatus = async (proofId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase.rpc('update_payment_status', {
        payment_proof_id: proofId,
        new_status: status,
        admin_user_id: user?.id,
        notes: notes
      });

      if (error) throw error;
      await fetchPaymentProofs();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const approvePayment = async (proofId: string) => {
    try {
      const { error } = await supabase.rpc('approve_payment_and_add_lessons', {
        payment_proof_id: proofId,
        admin_user_id: user?.id
      });

      if (error) throw error;
      await fetchPaymentProofs();
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const rejectPayment = async (proofId: string, reason: string) => {
    try {
      const { error } = await supabase.rpc('reject_payment', {
        payment_proof_id: proofId,
        admin_user_id: user?.id,
        reason: reason
      });

      if (error) throw error;
      await fetchPaymentProofs();
    } catch (error) {
      console.error('Error rejecting payment:', error);
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

  const handleStatusChange = async () => {
    if (!selectedProof) return;

    try {
      if (newStatus === 'accepted' && selectedProof.status === 'pending') {
        await acceptPayment(selectedProof.id);
      } else if (newStatus === 'invoice_sent' && selectedProof.status === 'accepted') {
        await markInvoiceSent(selectedProof.id);
      } else if (newStatus === 'payment_received' && selectedProof.status === 'invoice_sent') {
        await markPaymentReceived(selectedProof.id);
      } else if (newStatus === 'approved' && selectedProof.status === 'payment_received') {
        await approvePayment(selectedProof.id);
      } else if (newStatus === 'rejected') {
        await rejectPayment(selectedProof.id, rejectionReason);
      } else {
        await updatePaymentStatus(selectedProof.id, newStatus, adminNotes);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }

    setSelectedProof(null);
    setNewStatus('');
    setAdminNotes('');
    setRejectionReason('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Betalingsverzoeken laden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Betalingsverzoeken</h2>
        <Badge variant="outline">
          {paymentProofs.filter(p => ['pending', 'accepted'].includes(p.status)).length} te behandelen
        </Badge>
      </div>

      <div className="grid gap-4">
        {paymentProofs.map((proof) => (
          <Card key={proof.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{proof.student.profile.full_name}</span>
                    <span className="text-sm text-muted-foreground">({proof.student.profile.email})</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{proof.lesson_package.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {proof.lesson_package.lessons_count} lessen - €{proof.amount}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Factuur naar: {proof.proof_email || proof.student.profile.email || 'Geen e-mail opgegeven'}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Aangevraagd: {format(new Date(proof.submitted_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                  </div>

                  {proof.admin_notes && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <strong>Admin notities:</strong> {proof.admin_notes}
                    </div>
                  )}

                  {proof.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      <strong>Reden afwijzing:</strong> {proof.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(proof.status)}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedProof(proof);
                          setNewStatus(proof.status);
                          setAdminNotes(proof.admin_notes || '');
                        }}
                      >
                        Beheren
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Betalingsverzoek Beheren</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded">
                          <h4 className="font-medium">{proof.student.profile.full_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {proof.lesson_package.name} - €{proof.amount}
                          </p>
                        </div>

                        <div>
                          <Label>Status</Label>
                          <Select 
                            value={newStatus} 
                            onValueChange={setNewStatus}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">In Behandeling</SelectItem>
                              <SelectItem value="accepted">Accepteren</SelectItem>
                              <SelectItem value="invoice_sent">Factuur Verstuurd</SelectItem>
                              <SelectItem value="payment_received">Betaling Ontvangen</SelectItem>
                              <SelectItem value="approved">Goedkeuren & Lessen Toevoegen</SelectItem>
                              <SelectItem value="rejected">Afwijzen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {newStatus === 'rejected' && (
                          <div>
                            <Label>Reden voor afwijzing</Label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Leg uit waarom dit verzoek wordt afgewezen..."
                            />
                          </div>
                        )}

                        <div>
                          <Label>Admin notities</Label>
                          <Textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Interne notities..."
                          />
                        </div>

                        <Button onClick={handleStatusChange} className="w-full">
                          Status Bijwerken
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paymentProofs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Geen betalingsverzoeken</h3>
            <p className="text-muted-foreground">
              Er zijn nog geen lespakket aanvragen ingediend.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};