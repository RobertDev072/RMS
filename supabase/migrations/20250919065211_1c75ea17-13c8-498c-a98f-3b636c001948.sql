-- Create instructor account
DO $$
DECLARE
    instructor_user_id uuid;
    instructor_profile_id uuid;
BEGIN
    -- Create instructor user if not exists
    SELECT id INTO instructor_user_id FROM auth.users WHERE email = 'instructor@rijschool.pro';
    
    IF instructor_user_id IS NULL THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'instructor@rijschool.pro',
            crypt('Test1234!', gen_salt('bf')),
            now(),
            jsonb_build_object('full_name', 'Rijinstructeur', 'role', 'instructor'),
            false,
            now(),
            now(),
            'authenticated',
            'authenticated'
        ) RETURNING id INTO instructor_user_id;
        
        -- Create profile for instructor
        INSERT INTO public.profiles (user_id, email, full_name, role)
        VALUES (instructor_user_id, 'instructor@rijschool.pro', 'Rijinstructeur', 'instructor')
        RETURNING id INTO instructor_profile_id;
        
        -- Create instructor record
        INSERT INTO public.instructors (profile_id) VALUES (instructor_profile_id);
    END IF;
END $$;

-- Create student account
DO $$
DECLARE
    student_user_id uuid;
    student_profile_id uuid;
BEGIN
    -- Create student user if not exists
    SELECT id INTO student_user_id FROM auth.users WHERE email = 'student@rijschool.pro';
    
    IF student_user_id IS NULL THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'student@rijschool.pro',
            crypt('Test1234!', gen_salt('bf')),
            now(),
            jsonb_build_object('full_name', 'Leerling', 'role', 'student'),
            false,
            now(),
            now(),
            'authenticated',
            'authenticated'
        ) RETURNING id INTO student_user_id;
        
        -- Create profile for student
        INSERT INTO public.profiles (user_id, email, full_name, role)
        VALUES (student_user_id, 'student@rijschool.pro', 'Leerling', 'student')
        RETURNING id INTO student_profile_id;
        
        -- Create student record
        INSERT INTO public.students (profile_id) VALUES (student_profile_id);
    END IF;
END $$;