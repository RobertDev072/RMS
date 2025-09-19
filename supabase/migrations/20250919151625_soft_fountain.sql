/*
  # Fix Instructor Student Access

  1. Security Updates
    - Allow instructors to view all students (needed for lesson planning)
    - Ensure instructors can see student profiles for lessons
    - Add proper RLS policies for instructor access

  2. Business Logic
    - Instructors need to see all students to plan lessons
    - Students should remain private to other students
*/

-- Allow instructors to view all students (needed for lesson planning and management)
CREATE POLICY "Instructors can view all students" 
ON public.students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'instructor'
  )
);

-- Allow instructors to view all student profiles (needed for joins)
CREATE POLICY "Instructors can view all student profiles"
ON public.profiles
FOR SELECT
USING (
  role = 'student' AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'instructor'
  )
);