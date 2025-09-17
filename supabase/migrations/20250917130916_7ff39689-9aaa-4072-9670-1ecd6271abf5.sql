-- Allow admins to update students and profiles so edits in StudentManager can be saved

-- Students: allow admin updates
CREATE POLICY IF NOT EXISTS "Admins can update students"
ON public.students
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Profiles: allow admin updates
CREATE POLICY IF NOT EXISTS "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));