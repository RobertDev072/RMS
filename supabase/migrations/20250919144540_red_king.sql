/*
  # Enhanced Package Management Policies

  1. Security Updates
    - Allow admins to fully manage lesson packages (CRUD operations)
    - Add delete functionality for packages
    - Ensure proper RLS for package management

  2. Business Logic
    - Add function to check if student has available lessons before allowing requests
    - Validate lesson requests against purchased packages
*/

-- Allow admins to insert, update, and delete lesson packages
CREATE POLICY "Admins can insert packages" 
ON public.lesson_packages 
FOR INSERT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can update packages" 
ON public.lesson_packages 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can delete packages" 
ON public.lesson_packages 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

-- Function to check if student has available lessons
CREATE OR REPLACE FUNCTION public.student_has_available_lessons(student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(lessons_remaining, 0) > 0
  FROM students
  WHERE id = student_id;
$$;

-- Function to get student's remaining lessons count
CREATE OR REPLACE FUNCTION public.get_student_remaining_lessons(student_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(lessons_remaining, 0)
  FROM students
  WHERE id = student_id;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.student_has_available_lessons(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_remaining_lessons(uuid) TO authenticated;