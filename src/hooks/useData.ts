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

interface Car {
  id: string;
  license_plate: string;
  brand: string;
  model: string;
  year?: number;
  is_available: boolean;
}

interface PaymentProof {
  id: string;
  student_id: string;
  lesson_package_id: string;
  proof_email: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  submitted_at: string;
  processed_at?: string;
  processed_by?: string;
  student?: {
    profile: {
      full_name: string;
      email: string;
    };
  };
  lesson_package?: LessonPackage;
}

interface LessonRequest {
  id: string;
  student_id: string;
  instructor_id: string;
  requested_date: string;
  duration_minutes: number;
  location?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'rescheduled';
  instructor_notes?: string;
  created_at: string;
  updated_at: string;
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
  const [cars, setCars] = useState<Car[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [lessonRequests, setLessonRequests] = useState<LessonRequest[]>([]);
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

  // Fetch cars
  const fetchCars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('license_plate', { ascending: true });

      if (error) {
        console.error('Error fetching cars:', error);
        return;
      }

      setCars(data || []);
    } catch (error) {
      console.error('Error in fetchCars:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment proofs
  const fetchPaymentProofs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_proofs')
        .select(`
          *,
          student:students!inner(
            profile:profiles!inner(full_name, email)
          ),
          lesson_package:lesson_packages(*)
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment proofs:', error);
        return;
      }

      setPaymentProofs(data as PaymentProof[] || []);
    } catch (error) {
      console.error('Error in fetchPaymentProofs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lesson requests
  const fetchLessonRequests = async (userRole?: string, userId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('lesson_requests')
        .select(`
          *,
          student:students(
            profile:profiles(full_name, email)
          ),
          instructor:instructors(
            profile:profiles(full_name, email)
          )
        `)
        .order('created_at', { ascending: false });

      // Explicit filters to avoid join-path issues
      if (userRole === 'instructor' && userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
        if (profile) {
          const { data: instructor } = await supabase
            .from('instructors')
            .select('id')
            .eq('profile_id', profile.id)
            .single();
          if (instructor) {
            query = query.eq('instructor_id', instructor.id);
          }
        }
      } else if (userRole === 'student' && userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
        if (profile) {
          const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('profile_id', profile.id)
            .single();
          if (student) {
            query = query.eq('student_id', student.id);
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lesson requests:', error);
        return;
      }

      setLessonRequests(data as LessonRequest[] || []);
    } catch (error) {
      console.error('Error in fetchLessonRequests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add car
  const addCar = async (carData: {
    license_plate: string;
    brand: string;
    model: string;
    year?: number;
  }) => {
    try {
      const { error } = await supabase
        .from('cars')
        .insert([carData]);

      if (error) {
        toast({
          title: "Fout bij toevoegen auto",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Auto toegevoegd",
        description: "De auto is succesvol toegevoegd.",
      });

      await fetchCars();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Fout bij toevoegen auto",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Create student
  const createStudent = async (studentData: {
    email: string;
    full_name: string;
    phone?: string;
    license_type?: string;
  }) => {
    try {
      // First create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentData.email,
        password: 'TempPass123!', // Temporary password
        options: {
          data: {
            full_name: studentData.full_name,
            role: 'student'
          }
        }
      });

      if (authError) {
        toast({
          title: "Fout bij aanmaken leerling",
          description: authError.message,
          variant: "destructive",
        });
        return { error: authError, credentials: null };
      }

      toast({
        title: "Leerling aangemaakt",
        description: `Leerling ${studentData.full_name} is aangemaakt met tijdelijk wachtwoord: TempPass123!`,
      });

      await fetchStudents();
      return { 
        error: null, 
        credentials: {
          email: studentData.email,
          password: 'TempPass123!'
        }
      };
    } catch (error: any) {
      toast({
        title: "Fout bij aanmaken leerling",
        description: error.message,
        variant: "destructive",
      });
      return { error, credentials: null };
    }
  };

  // Create instructor
  const createInstructor = async (instructorData: {
    email: string;
    full_name: string;
    phone?: string;
    specializations?: string[];
  }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: instructorData.email,
        password: 'InstructorPass123!',
        options: {
          data: {
            full_name: instructorData.full_name,
            role: 'instructor'
          }
        }
      });

      if (authError) {
        toast({
          title: "Fout bij aanmaken instructeur",
          description: authError.message,
          variant: "destructive",
        });
        return { error: authError };
      }

      toast({
        title: "Instructeur aangemaakt",
        description: `Instructeur ${instructorData.full_name} is aangemaakt.`,
      });

      await fetchInstructors();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Fout bij aanmaken instructeur",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Update lesson request status
  const updateLessonRequestStatus = async (
    requestId: string, 
    status: 'accepted' | 'rejected' | 'rescheduled',
    instructorNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .update({ status, instructor_notes: instructorNotes })
        .eq('id', requestId);

      if (error) {
        toast({
          title: "Fout bij bijwerken verzoek",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Verzoek bijgewerkt",
        description: `Lesverzoek is ${status}.`,
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Fout bij bijwerken verzoek",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Create lesson request
  const createLessonRequest = async (requestData: {
    instructor_id: string;
    requested_date: string;
    duration_minutes: number;
    location?: string;
    notes?: string;
  }) => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Niet ingelogd');
      }

      // Get profile first
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (!profileData) {
        throw new Error('Profiel niet gevonden');
      }

      // Get student record
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', profileData.id)
        .single();

      if (!studentData) {
        throw new Error('Student niet gevonden');
      }

      const { error } = await supabase
        .from('lesson_requests')
        .insert([{
          student_id: studentData.id,
          ...requestData,
        }]);

      if (error) {
        toast({
          title: "Fout bij aanvragen les",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Lesverzoek verstuurd",
        description: "Je lesverzoek is succesvol verstuurd naar de instructeur.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Fout bij aanvragen les",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Create payment proof
  const createPaymentProof = async (proofData: {
    lesson_package_id: string;
    amount: number;
    proof_email: string;
  }) => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Niet ingelogd');
      }

      // Get profile first
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (!profileData) {
        throw new Error('Profiel niet gevonden');
      }

      // Get student record
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', profileData.id)
        .single();

      if (!studentData) {
        throw new Error('Student niet gevonden');
      }

      const { error } = await supabase
        .from('payment_proofs')
        .insert([{
          student_id: studentData.id,
          ...proofData,
        }]);

      if (error) {
        toast({
          title: "Fout bij indienen betaalbewijs",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Betaalbewijs ingediend",
        description: "Je betaalbewijs is ingediend en wordt binnenkort verwerkt.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Fout bij indienen betaalbewijs",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Process payment proof
  const processPaymentProof = async (
    proofId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ) => {
    try {
      // First get the payment proof details
      const { data: proofData, error: proofError } = await supabase
        .from('payment_proofs')
        .select(`
          *,
          lesson_package:lesson_packages(*),
          student:students(
            *,
            profile:profiles(full_name, email)
          )
        `)
        .eq('id', proofId)
        .single();

      if (proofError) {
        toast({
          title: "Fout bij ophalen betaalbewijs",
          description: proofError.message,
          variant: "destructive",
        });
        return { error: proofError };
      }

      // Update payment proof status
      const { error: updateError } = await supabase
        .from('payment_proofs')
        .update({ 
          status, 
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        })
        .eq('id', proofId);

      if (updateError) {
        toast({
          title: "Fout bij verwerken betaalbewijs",
          description: updateError.message,
          variant: "destructive",
        });
        return { error: updateError };
      }

      // If approved, add lessons to student
      if (status === 'approved' && proofData.lesson_package && proofData.student) {
        const { error: studentUpdateError } = await supabase
          .from('students')
          .update({
            lessons_remaining: (proofData.student.lessons_remaining || 0) + proofData.lesson_package.lessons_count
          })
          .eq('id', proofData.student_id);

        if (studentUpdateError) {
          toast({
            title: "Fout bij toewijzen lessen",
            description: studentUpdateError.message,
            variant: "destructive",
          });
          return { error: studentUpdateError };
        }

        toast({
          title: "Lespakket toegewezen",
          description: `${proofData.lesson_package.lessons_count} lessen toegevoegd aan ${proofData.student.profile?.full_name || 'leerling'}.`,
        });
      } else {
        toast({
          title: "Betaalbewijs verwerkt",
          description: `Betaalbewijs is ${status}.`,
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Fout bij verwerken betaalbewijs",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Update payment status
  const updatePaymentStatus = async (paymentId: string, status: string, notes?: string) => {
    try {
      const { data: adminUser } = await supabase.auth.getUser();
      if (!adminUser.user) throw new Error('Not authenticated');

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', adminUser.user.id)
        .single();

      const { error } = await supabase.rpc('update_payment_status', {
        payment_proof_id: paymentId,
        new_status: status,
        admin_user_id: adminProfile?.id,
        notes: notes
      });

      if (error) throw error;
      
      toast({
        title: "Status bijgewerkt",
        description: `Betaalstatus is gewijzigd naar ${status}.`,
      });
      
      await fetchPaymentProofs();
    } catch (error: any) {
      toast({
        title: "Fout bij bijwerken status",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Approve payment and add lessons
  const approvePaymentAndAddLessons = async (paymentId: string) => {
    try {
      const { data: adminUser } = await supabase.auth.getUser();
      if (!adminUser.user) throw new Error('Not authenticated');

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', adminUser.user.id)
        .single();

      const { error } = await supabase.rpc('approve_payment_and_add_lessons', {
        payment_proof_id: paymentId,
        admin_user_id: adminProfile?.id
      });

      if (error) throw error;
      
      toast({
        title: "Betaling goedgekeurd",
        description: "Lessen zijn automatisch toegevoegd aan de leerling.",
      });
      
      await fetchPaymentProofs();
    } catch (error: any) {
      toast({
        title: "Fout bij goedkeuren betaling",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Reject payment
  const rejectPayment = async (paymentId: string, reason?: string) => {
    try {
      const { data: adminUser } = await supabase.auth.getUser();
      if (!adminUser.user) throw new Error('Not authenticated');

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', adminUser.user.id)
        .single();

      const { error } = await supabase.rpc('reject_payment', {
        payment_proof_id: paymentId,
        admin_user_id: adminProfile?.id,
        reason: reason
      });

      if (error) throw error;
      
      toast({
        title: "Betaling afgewezen",
        description: reason || "Betaling is afgewezen.",
      });
      
      await fetchPaymentProofs();
    } catch (error: any) {
      toast({
        title: "Fout bij afwijzen betaling",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    lessons,
    students,
    instructors,
    lessonPackages,
    cars,
    paymentProofs,
    lessonRequests,
    loading,
    fetchLessons,
    fetchStudents,
    fetchInstructors,
    fetchLessonPackages,
    fetchCars,
    fetchPaymentProofs,
    fetchLessonRequests,
    scheduleLesson,
    updateLessonStatus,
    addCar,
    createStudent,
    createInstructor,
    createLessonRequest,
    createPaymentProof,
    updateLessonRequestStatus,
    processPaymentProof,
    updatePaymentStatus,
    approvePaymentAndAddLessons,
    rejectPayment,
  };
};