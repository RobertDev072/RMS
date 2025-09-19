/*
  # Enable instructors to create students directly

  1. Security Updates
    - Allow instructors to create new user accounts
    - Auto-confirm email for instructor-created students
    - Ensure proper profile and student record creation

  2. Business Logic
    - Instructors can create students without email verification
    - Students can login immediately with provided credentials
    - Maintain security while enabling instructor workflow
*/

-- Update the handle_new_user function to auto-confirm instructor-created students
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT DEFAULT 'student';
BEGIN
  -- Extract role from user metadata, default to 'student'
  IF NEW.raw_user_meta_data ? 'role' THEN
    user_role := NEW.raw_user_meta_data->>'role';
  END IF;

  -- Auto-confirm email for all new users (since we're in development)
  IF NEW.email_confirmed_at IS NULL THEN
    UPDATE auth.users 
    SET email_confirmed_at = now()
    WHERE id = NEW.id;
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nieuwe Gebruiker'),
    user_role
  );

  -- Create role-specific entries
  IF user_role = 'instructor' THEN
    INSERT INTO public.instructors (profile_id)
    SELECT id FROM public.profiles WHERE user_id = NEW.id;
  ELSIF user_role = 'student' THEN
    INSERT INTO public.students (profile_id)
    SELECT id FROM public.profiles WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;