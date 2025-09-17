import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Star } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export const LessonFeedbackManager: React.FC = () => {
  const { user } = useAuth();
  const { lessons, fetchLessons } = useData();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [feedback, setFeedback] = useState({
    driving_skills: 3,
    parking_skills: 3,
    traffic_awareness: 3,
    overall_progress: 3,
    comments: '',
    recommendations: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchLessons('instructor', user.id);
    }
  }, [user]);

  const completedLessons = lessons.filter(lesson => 
    lesson.status === 'completed' && 
    new Date(lesson.scheduled_at) <= new Date()
  );

  const handleGiveFeedback = (lesson: any) => {
    setSelectedLesson(lesson);
    setFeedback({
      driving_skills: 3,
      parking_skills: 3,
      traffic_awareness: 3,
      overall_progress: 3,
      comments: '',
      recommendations: ''
    });
    setShowDialog(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedLesson) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // Get instructor ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) throw new Error('Profiel niet gevonden');

      const { data: instructor } = await supabase
        .from('instructors')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!instructor) throw new Error('Instructeur niet gevonden');

      const { error } = await supabase
        .from('lesson_feedback')
        .insert({
          lesson_id: selectedLesson.id,
          instructor_id: instructor.id,
          driving_skills: feedback.driving_skills,
          parking_skills: feedback.parking_skills,
          traffic_awareness: feedback.traffic_awareness,
          overall_progress: feedback.overall_progress,
          comments: feedback.comments,
          recommendations: feedback.recommendations
        });

      if (error) throw error;

      toast({ 
        title: "Feedback gegeven", 
        description: "Je feedback is opgeslagen en de leerling kan deze bekijken." 
      });

      setShowDialog(false);
      setSelectedLesson(null);
    } catch (error: any) {
      toast({ 
        title: "Fout", 
        description: error.message || "Er is een fout opgetreden.",
        variant: "destructive" 
      });
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Geven</CardTitle>
      </CardHeader>
      <CardContent>
        {completedLessons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Geen voltooide lessen om feedback voor te geven</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{lesson.student?.profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(lesson.scheduled_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    📍 {lesson.location || 'Geen locatie'}
                  </p>
                  <Badge variant="default" className="mt-1">
                    Voltooid
                  </Badge>
                </div>
                <Dialog open={showDialog && selectedLesson?.id === lesson.id} onOpenChange={(open) => {
                  setShowDialog(open);
                  if (!open) setSelectedLesson(null);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => handleGiveFeedback(lesson)}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Feedback Geven
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Feedback voor {lesson.student?.profile?.full_name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Rijvaardigheden</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              value={[feedback.driving_skills]}
                              onValueChange={(value) => setFeedback({...feedback, driving_skills: value[0]})}
                              max={5}
                              min={1}
                              step={1}
                              className="flex-1"
                            />
                            <div className={`flex items-center gap-1 ${getRatingColor(feedback.driving_skills)}`}>
                              <Star className="h-4 w-4 fill-current" />
                              <span className="font-medium">{feedback.driving_skills}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Parkeervaardigheden</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              value={[feedback.parking_skills]}
                              onValueChange={(value) => setFeedback({...feedback, parking_skills: value[0]})}
                              max={5}
                              min={1}
                              step={1}
                              className="flex-1"
                            />
                            <div className={`flex items-center gap-1 ${getRatingColor(feedback.parking_skills)}`}>
                              <Star className="h-4 w-4 fill-current" />
                              <span className="font-medium">{feedback.parking_skills}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Verkeersinzicht</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              value={[feedback.traffic_awareness]}
                              onValueChange={(value) => setFeedback({...feedback, traffic_awareness: value[0]})}
                              max={5}
                              min={1}
                              step={1}
                              className="flex-1"
                            />
                            <div className={`flex items-center gap-1 ${getRatingColor(feedback.traffic_awareness)}`}>
                              <Star className="h-4 w-4 fill-current" />
                              <span className="font-medium">{feedback.traffic_awareness}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Algemene Vooruitgang</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              value={[feedback.overall_progress]}
                              onValueChange={(value) => setFeedback({...feedback, overall_progress: value[0]})}
                              max={5}
                              min={1}
                              step={1}
                              className="flex-1"
                            />
                            <div className={`flex items-center gap-1 ${getRatingColor(feedback.overall_progress)}`}>
                              <Star className="h-4 w-4 fill-current" />
                              <span className="font-medium">{feedback.overall_progress}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="comments">Opmerkingen</Label>
                        <Textarea
                          id="comments"
                          value={feedback.comments}
                          onChange={(e) => setFeedback({...feedback, comments: e.target.value})}
                          placeholder="Wat ging goed? Wat kan beter?"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="recommendations">Aanbevelingen</Label>
                        <Textarea
                          id="recommendations"
                          value={feedback.recommendations}
                          onChange={(e) => setFeedback({...feedback, recommendations: e.target.value})}
                          placeholder="Wat moet de leerling oefenen voor de volgende les?"
                          className="mt-2"
                        />
                      </div>

                      <Button onClick={handleSubmitFeedback} className="w-full">
                        Feedback Opslaan
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