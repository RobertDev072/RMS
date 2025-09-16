import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { User, Clock, MapPin, Calendar, MessageSquare, Check, X } from 'lucide-react';

interface LessonRequest {
  id: string;
  student_id: string;
  instructor_id: string;
  requested_date: string;
  duration_minutes: number;
  location?: string;
  notes?: string;
  instructor_notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'rescheduled';
  created_at: string;
  updated_at: string;
  student?: {
    profile?: {
      full_name: string;
      email: string;
      phone?: string;
    };
  };
  instructor?: {
    profile?: {
      full_name: string;
    };
  };
}

interface LessonRequestCardProps {
  request: LessonRequest;
  onAccept?: (requestId: string, notes?: string) => void;
  onReject?: (requestId: string, notes?: string) => void;
  showActions?: boolean;
  userRole: 'student' | 'instructor' | 'admin';
}

export const LessonRequestCard = ({
  request,
  onAccept,
  onReject,
  showActions = true,
  userRole
}: LessonRequestCardProps) => {
  const [notes, setNotes] = useState('');
  const [showNotesField, setShowNotesField] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In afwachting';
      case 'accepted':
        return 'Geaccepteerd';
      case 'rejected':
        return 'Geweigerd';
      default:
        return status;
    }
  };

  const handleAccept = async () => {
    if (onAccept) {
      setIsProcessing(true);
      await onAccept(request.id, notes);
      setIsProcessing(false);
      setShowNotesField(false);
      setNotes('');
    }
  };

  const handleReject = async () => {
    if (onReject) {
      setIsProcessing(true);
      await onReject(request.id, notes);
      setIsProcessing(false);
      setShowNotesField(false);
      setNotes('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {userRole === 'student' 
                  ? request.instructor?.profile?.full_name || 'Onbekende Instructeur'
                  : request.student?.profile?.full_name || 'Onbekende Leerling'
                }
              </span>
            </div>
            {userRole !== 'student' && request.student?.profile?.email && (
              <div className="text-sm text-muted-foreground">
                {request.student.profile.email}
              </div>
            )}
          </div>
          <Badge className={getStatusColor(request.status)}>
            {getStatusText(request.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Lesson Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(request.requested_date), 'EEEE d MMMM yyyy', { locale: nl })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(request.requested_date), 'HH:mm')} 
              {' '}({request.duration_minutes} min)
            </span>
          </div>
          
          {request.location && (
            <div className="flex items-center gap-2 md:col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{request.location}</span>
            </div>
          )}
        </div>

        {/* Student Notes */}
        {request.notes && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Opmerking van leerling:</Label>
            <div className="text-sm bg-muted p-3 rounded-md">
              {request.notes}
            </div>
          </div>
        )}

        {/* Instructor Notes */}
        {request.instructor_notes && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Reactie van instructeur:</Label>
            <div className="text-sm bg-muted p-3 rounded-md">
              {request.instructor_notes}
            </div>
          </div>
        )}

        {/* Action Buttons for Instructors */}
        {showActions && userRole === 'instructor' && request.status === 'pending' && (
          <div className="space-y-3">
            {!showNotesField && (
              <div className="flex gap-2">
                <Button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accepteren
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNotesField(true)}
                  disabled={isProcessing}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Met reactie
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Weigeren
                </Button>
              </div>
            )}

            {showNotesField && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="instructor-notes">Reactie (optioneel)</Label>
                  <Textarea
                    id="instructor-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Geef een reactie..."
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accepteren
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Weigeren
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNotesField(false);
                    setNotes('');
                  }}
                  size="sm"
                >
                  Annuleren
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Aangevraagd op {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
          {request.status !== 'pending' && (
            <span> • Bijgewerkt op {format(new Date(request.updated_at), 'dd/MM/yyyy HH:mm')}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};