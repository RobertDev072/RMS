/*
  # Force create test data for debugging

  1. Create test students directly in database
  2. Ensure proper relationships exist
  3. Add debug information
*/

-- First, let's see what we have
DO $$
DECLARE
    student_count INTEGER;
    profile_count INTEGER;
    instructor_count INTEGER;
    auth_user_count INTEGER;
BEGIN
    -- Count everything
    SELECT COUNT(*) INTO student_count FROM students;
    SELECT COUNT(*) INTO profile_count FROM profiles WHERE role = 'student';
    SELECT COUNT(*) INTO instructor_count FROM instructors;
    
    RAISE NOTICE 'Current counts - Students: %, Student Profiles: %, Instructors: %', 
        student_count, profile_count, instructor_count;
    
    -- Create test students if none exist
    IF student_count = 0 THEN
        RAISE NOTICE 'Creating test students...';
        
        -- Create first test student
        INSERT INTO profiles (user_id, email, full_name, role, phone)
        VALUES (
            gen_random_uuid(),
            'emma.vandenberg@test.nl',
            'Emma van den Berg',
            'student',
            '06-11111111'
        );
        
        INSERT INTO students (profile_id, license_type, theory_exam_passed, lessons_remaining)
        SELECT id, 'B', false, 8
        FROM profiles 
        WHERE email = 'emma.vandenberg@test.nl';
        
        -- Create second test student
        INSERT INTO profiles (user_id, email, full_name, role, phone)
        VALUES (
            gen_random_uuid(),
            'tom.devries@test.nl',
            'Tom de Vries',
            'student',
            '06-22222222'
        );
        
        INSERT INTO students (profile_id, license_type, theory_exam_passed, lessons_remaining)
        SELECT id, 'B', true, 12
        FROM profiles 
        WHERE email = 'tom.devries@test.nl';
        
        -- Create third test student
        INSERT INTO profiles (user_id, email, full_name, role, phone)
        VALUES (
            gen_random_uuid(),
            'lisa.bakker@test.nl',
            'Lisa Bakker',
            'student',
            '06-33333333'
        );
        
        INSERT INTO students (profile_id, license_type, theory_exam_passed, lessons_remaining)
        SELECT id, 'B', false, 5
        FROM profiles 
        WHERE email = 'lisa.bakker@test.nl';
        
        RAISE NOTICE 'Test students created successfully';
    ELSE
        RAISE NOTICE 'Students already exist, skipping creation';
    END IF;
    
    -- Final count
    SELECT COUNT(*) INTO student_count FROM students;
    RAISE NOTICE 'Final student count: %', student_count;
END $$;

-- Test RLS policies by checking what an instructor should see
DO $$
DECLARE
    instructor_user_id UUID;
    visible_students INTEGER;
BEGIN
    -- Get instructor user ID
    SELECT user_id INTO instructor_user_id 
    FROM profiles 
    WHERE email = 'instructor@rijschool.pro' 
    LIMIT 1;
    
    IF instructor_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found instructor user ID: %', instructor_user_id;
        
        -- Test what students this instructor can see
        -- Note: This won't work in migration context due to RLS, but helps with debugging
        RAISE NOTICE 'Instructor should be able to see all students due to RLS policies';
    ELSE
        RAISE NOTICE 'No instructor found with email instructor@rijschool.pro';
    END IF;
END $$;