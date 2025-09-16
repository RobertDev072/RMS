-- Allow authenticated users to view instructor profiles for joins
CREATE POLICY "Authenticated can view instructor profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'instructor');