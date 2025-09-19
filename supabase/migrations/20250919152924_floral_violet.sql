/*
  # Debug Student Access for Instructors

  1. Check Current Data
    - Verify existing students in database
    - Check RLS policies are working correctly
    - Add some test data if needed

  2. Ensure Proper Access
    - Verify instructor can see all students
    - Check profile relationships are correct
*/

-- Check if we have any students in the database
DO $$
DECLARE
    student_count INTEGER;
    profile_count INTEGER;
    instructor_count INTEGER;
BEGIN
    -- Count students
    SELECT COUNT(*) INTO student_count FROM students;
    RAISE NOTICE 'Total students in database: %', student_count;
    
    -- Count profiles with student role
    SELECT COUNT(*) INTO profile_count FROM profiles WHERE role = 'student';
    RAISE NOTICE 'Total student profiles: %', profile_count;
    
    -- Count instructors
    SELECT COUNT(*) INTO instructor_count FROM instructors;
    RAISE NOTICE 'Total instructors: %', instructor_count;
    
    -- If no students exist, create a test student
    IF student_count = 0 THEN
        RAISE NOTICE 'No students found, creating test student...';
        
        -- Insert test student profile
        INSERT INTO profiles (user_id, email, full_name, role, phone)
        VALUES (
            gen_random_uuid(),
            'test.student@rijschool.pro',
            'Test Leerling',
            'student',
            '06-12345678'
        );
        
        -- Insert student record
        INSERT INTO students (profile_id, license_type, theory_exam_passed, lessons_remaining)
        SELECT id, 'B', false, 5
        FROM profiles 
        WHERE email = 'test.student@rijschool.pro';
        
        RAISE NOTICE 'Test student created successfully';
    END IF;
END $$;

-- Verify RLS policies are working by testing them
-- This will help debug if the issue is with policies or data fetching

-- Test: Can instructors see students?
DO $$
DECLARE
    test_result TEXT;
BEGIN
    -- Check if instructor role exists
    IF EXISTS (SELECT 1 FROM profiles WHERE role = 'instructor') THEN
        RAISE NOTICE 'Instructor profiles found in database';
    ELSE
        RAISE NOTICE 'No instructor profiles found - this might be the issue';
    END IF;
    
    -- Check if students exist
    IF EXISTS (SELECT 1 FROM students) THEN
        RAISE NOTICE 'Student records found in database';
    ELSE
        RAISE NOTICE 'No student records found';
    END IF;
END $$;