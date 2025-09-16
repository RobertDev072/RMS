-- Add RLS policy to allow students to view instructors
CREATE POLICY "Students can view instructors" 
ON public.instructors 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'student'
  )
);