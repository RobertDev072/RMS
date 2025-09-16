import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { CalendarIcon, Plus, Clock, AlertTriangle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AvailabilityEntry {
  id: string;
  instructor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  reason?: string;
  created_at: string;
}

interface AvailabilityManagerProps {
  onAvailabilityChange?: () => void;
}

export const AvailabilityManager = ({ onAvailabilityChange }: AvailabilityManagerProps) => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    date: new Date(),
    start_time: '09:00',
    end_time: '17:00',
    is_available: false,
    reason: ''
  });

  // Fetch instructor's current availability
  useEffect(() => {
    if (user?.id) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      
      // First get instructor ID
      const { data: instructorData, error: instructorError } = await supabase
        .from('instructors')
        .select('id')
        .eq('profile_id', user?.id)
        .single();

      if (instructorError) {
        console.error('Error fetching instructor:', instructorError);
        return;
      }

      // Fetch availability entries
      const { data: availabilityData, error } = await supabase
        .from('instructor_availability')
        .select('*')
        .eq('instructor_id', instructorData.id)
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching availability:', error);
      } else {
        setAvailability(availabilityData || []);
      }
    } catch (error) {
      console.error('Error in fetchAvailability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Get instructor ID
      const { data: instructorData, error: instructorError } = await supabase
        .from('instructors')
        .select('id')
        .eq('profile_id', user?.id)
        .single();

      if (instructorError) {
        console.error('Error fetching instructor:', instructorError);
        return;
      }

      const { error } = await supabase
        .from('instructor_availability')
        .insert({
          instructor_id: instructorData.id,
          date: format(formData.date, 'yyyy-MM-dd'),
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_available: formData.is_available,
          reason: formData.reason || null
        });

      if (error) {
        console.error('Error creating availability:', error);
      } else {
        await fetchAvailability();
        setShowDialog(false);
        setFormData({
          date: new Date(),
          start_time: '09:00',
          end_time: '17:00',
          is_available: false,
          reason: ''
        });
        onAvailabilityChange?.();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('instructor_availability')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting availability:', error);
      } else {
        await fetchAvailability();
        onAvailabilityChange?.();
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
    }
  };

  const groupedAvailability = availability.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, AvailabilityEntry[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Beschikbaarheid laden...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Beschikbaarheid Beheren</CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Beschikbaarheid Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Beschikbaarheid Instellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Datum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, 'PPP', { locale: nl }) : 'Selecteer datum'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Starttijd</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">Eindtijd</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.is_available ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, is_available: true, reason: '' })}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Beschikbaar
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.is_available ? "destructive" : "outline"}
                      onClick={() => setFormData({ ...formData, is_available: false })}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Niet Beschikbaar
                    </Button>
                  </div>
                </div>

                {!formData.is_available && (
                  <div>
                    <Label htmlFor="reason">Reden (optioneel)</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Bijv. ziek, vakantie, examen..."
                    />
                  </div>
                )}

                <Button onClick={handleSubmit} className="w-full">
                  Opslaan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {Object.keys(groupedAvailability).length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Geen beschikbaarheid ingesteld</p>
            <p className="text-sm mt-1">Klik op "Beschikbaarheid Toevoegen" om te beginnen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedAvailability).map(([date, entries]) => (
              <Card key={date}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {format(new Date(date), 'EEEE d MMMM yyyy', { locale: nl })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {entry.start_time} - {entry.end_time}
                          </span>
                          <Badge 
                            variant={entry.is_available ? "default" : "destructive"}
                            className="ml-2"
                          >
                            {entry.is_available ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Beschikbaar
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Niet Beschikbaar
                              </>
                            )}
                          </Badge>
                          {entry.reason && (
                            <span className="text-sm text-muted-foreground">
                              - {entry.reason}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};