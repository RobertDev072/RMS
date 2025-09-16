-- Ensure profile creation works for new and existing users
-- 1) Create trigger on auth.users to call existing public.handle_new_user()
DO $$
BEGIN
  -- Drop existing trigger if present to avoid duplicates
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    EXECUTE 'DROP TRIGGER on_auth_user_created ON auth.users';
  END IF;

  -- Create the trigger to auto-provision profiles and role-specific rows
  EXECUTE 'CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user()';
END $$;

-- 2) Create a SECURITY DEFINER helper to provision missing profiles for existing users
CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  u_email text := NULL;
  full_name text := 'Nieuwe Gebruiker';
  role_text text := 'student';
  prof_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Read from auth.users for email and metadata
  SELECT u.email,
         COALESCE(u.raw_user_meta_data->>'full_name', full_name),
         COALESCE(u.raw_user_meta_data->>'role', role_text)
  INTO u_email, full_name, role_text
  FROM auth.users u
  WHERE u.id = uid;

  -- Create profile if missing
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = uid) THEN
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (uid, COALESCE(u_email, ''), full_name, role_text)
    RETURNING id INTO prof_id;

    -- Create role-specific row
    IF role_text = 'instructor' THEN
      INSERT INTO public.instructors (profile_id) VALUES (prof_id);
    ELSIF role_text = 'student' THEN
      INSERT INTO public.students (profile_id) VALUES (prof_id);
    END IF;
  END IF;
END;
$$;

-- 3) (Optional) Grant execute to authenticated users (usually default, but explicit here)
REVOKE ALL ON FUNCTION public.ensure_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_profile() TO authenticated;