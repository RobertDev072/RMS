-- Complete database cleanup and reset

-- 1. Clear all existing data from main tables
DELETE FROM lesson_requests;
DELETE FROM lesson_feedback;
DELETE FROM lessons;
DELETE FROM payment_proofs;
DELETE FROM instructor_availability;
DELETE FROM students;
DELETE FROM instructors;
DELETE FROM profiles;
DELETE FROM cars;

-- 2. Keep lesson packages as they are reasonable
-- (lesson_packages table stays as is)

-- 3. Reset any sequences if needed
-- (UUID primary keys don't need sequence reset)

-- 4. Insert some basic cars for testing
INSERT INTO cars (brand, model, license_plate, year, is_available) VALUES
('Toyota', 'Yaris', 'XX-123-XX', 2022, true),
('Volkswagen', 'Polo', 'YY-456-YY', 2021, true),
('Opel', 'Corsa', 'ZZ-789-ZZ', 2023, true);

-- 5. Database structure review - all tables and columns look necessary, keeping as is