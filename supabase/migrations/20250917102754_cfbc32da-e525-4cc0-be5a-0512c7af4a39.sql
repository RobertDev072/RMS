-- Add some test lessons for today's planning
INSERT INTO lessons (student_id, instructor_id, scheduled_at, duration_minutes, status, location, notes)
SELECT 
  s.id as student_id,
  i.id as instructor_id,
  (CURRENT_DATE + INTERVAL '10 hours')::timestamptz as scheduled_at,
  60 as duration_minutes,
  'scheduled' as status,
  'Rijschool Locatie' as location,
  'Test les voor planning' as notes
FROM students s
CROSS JOIN instructors i
WHERE s.profile_id IN (
  SELECT id FROM profiles WHERE role = 'student' LIMIT 1
)
AND i.profile_id IN (
  SELECT id FROM profiles WHERE role = 'instructor' LIMIT 1
)
LIMIT 1;

-- Add another lesson for this afternoon
INSERT INTO lessons (student_id, instructor_id, scheduled_at, duration_minutes, status, location, notes)
SELECT 
  s.id as student_id,
  i.id as instructor_id,
  (CURRENT_DATE + INTERVAL '14 hours')::timestamptz as scheduled_at,
  60 as duration_minutes,
  'scheduled' as status,
  'Centrum Rotterdam' as location,
  'Stadsrijden oefening' as notes
FROM students s
CROSS JOIN instructors i
WHERE s.profile_id IN (
  SELECT id FROM profiles WHERE role = 'student' LIMIT 1
)
AND i.profile_id IN (
  SELECT id FROM profiles WHERE role = 'instructor' LIMIT 1
)
LIMIT 1;

-- Add a completed lesson for today
INSERT INTO lessons (student_id, instructor_id, scheduled_at, duration_minutes, status, location, notes)
SELECT 
  s.id as student_id,
  i.id as instructor_id,
  (CURRENT_DATE + INTERVAL '8 hours')::timestamptz as scheduled_at,
  60 as duration_minutes,
  'completed' as status,
  'Parkeergarage Centrum' as location,
  'Parkeren geoefend' as notes
FROM students s
CROSS JOIN instructors i
WHERE s.profile_id IN (
  SELECT id FROM profiles WHERE role = 'student' LIMIT 1
)
AND i.profile_id IN (
  SELECT id FROM profiles WHERE role = 'instructor' LIMIT 1
)
LIMIT 1;