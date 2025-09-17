-- Create policies to allow admins to update students and profiles

-- Students: allow admin updates
CREATE POLICY "Admins can update students"
ON public.students
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Profiles: allow admin updates
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));