import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LessonPackage {
  id: string;
  name: string;
  lessons_count: number;
  price: number;
  description?: string;
  is_active: boolean;
}

interface Lesson {
  id: string;
  student_id: string;
  instructor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  location?: string;
  notes?: string;
  student?: {
    profile: {
      full_name: string;
      email: string;
    };
  };
  instructor?: {
    profile: {
      full_name: string;
      email: string;
    };
  };
}

interface Student {
  id: string;
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  license_type: string;
  theory_exam_passed: boolean;
  lessons_remaining: number;
}

interface Instructor {
  id: string;
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  specializations: string[];
  max_lessons_per_day: number;
}

export const useData = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [lessonPackages, setLessonPackages] = useState<LessonPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch lessons
  const fetchLessons = async (userRole?: string, userId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('lessons')
        .select(`
          *,
          student:students!inner(
            profile:profiles!inner(full_name, email)
          ),
          instructor:instructors!inner(
            profile:profiles!inner(full_name, email)
          )
        `)
        .order('scheduled_at', { ascending: true });

      // Filter based on user role
      if (userRole === 'instructor' && userId) {
        query = query.eq('instructor.profile.user_id', userId);
      } else if (userRole === 'student' && userId) {
        query = query.eq('student.profile.user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lessons:', error);
        return;
      }

      setLessons(data as Lesson[] || []);
    } catch (error) {
      console.error('Error in fetchLessons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles!inner(id, full_name, email, phone)
        `);

      if (error) {
        console.error('Error fetching students:', error);
        return;
      }

      setStudents(data || []);
    } catch (error) {
      console.error('Error in fetchStudents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch instructors
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('instructors')
        .select(`
          *,
          profile:profiles!inner(id, full_name, email, phone)
        `);

      if (error) {
        console.error('Error fetching instructors:', error);
        return;
      }

      setInstructors(data || []);
    } catch (error) {
      console.error('Error in fetchInstructors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lesson packages
  const fetchLessonPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching lesson packages:', error);
        return;
      }

      setLessonPackages(data || []);
    } catch (error) {
      console.error('Error in fetchLessonPackages:', error);
    }
  };

  // Schedule a new lesson
  const scheduleLesson = async (lessonData: {
    student_id: string;
    instructor_id: string;
    scheduled_at: string;
    duration_minutes?: number;
    location?: string;
    notes?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .insert([{
          ...lessonData,
          duration_minutes: lessonData.duration_minutes || 60,
          status: 'scheduled'
        }]);

      if (error) {
        toast({
          title: "Fout bij plannen les",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Les gepland",
        description: "De rijles is succesvol ingepland.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Fout bij plannen les",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Update lesson status
  const updateLessonStatus = async (lessonId: string, status: Lesson['status']) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status })
        .eq('id', lessonId);

      if (error) {
        toast({
          title: "Fout bij bijwerken les",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Les bijgewerkt",
        description: `Lesstatus is gewijzigd naar ${status}.`,
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Fout bij bijwerken les",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    lessons,
    students,
    instructors,
    lessonPackages,
    loading,
    fetchLessons,
    fetchStudents,
    fetchInstructors,
    fetchLessonPackages,
    scheduleLesson,
    updateLessonStatus,
  };
};