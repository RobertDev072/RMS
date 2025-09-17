-- First, clean up duplicate test lessons to avoid confusion
DELETE FROM lessons WHERE notes IN ('Test les voor planning', 'Stadsrijden oefening', 'Parkeren geoefend');

-- Create a function to automatically create a lesson when a lesson request is accepted
CREATE OR REPLACE FUNCTION public.create_lesson_from_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only create lesson if status changed to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Insert new lesson based on the accepted request
    INSERT INTO public.lessons (
      student_id,
      instructor_id,
      scheduled_at,
      duration_minutes,
      location,
      notes,
      status
    ) VALUES (
      NEW.student_id,
      NEW.instructor_id,
      NEW.requested_date,
      NEW.duration_minutes,
      NEW.location,
      COALESCE(NEW.instructor_notes, NEW.notes),
      'scheduled'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create lesson when request is accepted
CREATE TRIGGER create_lesson_on_accept
  AFTER UPDATE ON public.lesson_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lesson_from_request();