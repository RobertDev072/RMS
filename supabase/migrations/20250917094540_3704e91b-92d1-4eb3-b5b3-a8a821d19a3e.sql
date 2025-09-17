-- Function: check if instructor is available for a requested interval
CREATE OR REPLACE FUNCTION public.is_instructor_available(
  _instructor_id uuid,
  _date date,
  _start time,
  _end time
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Returns true if there is NO overlapping unavailability block
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.instructor_availability ia
    WHERE ia.instructor_id = _instructor_id
      AND ia.date = _date
      AND ia.is_available = false
      AND ia.start_time < _end
      AND ia.end_time > _start
  );
$$;

-- Ensure callers can execute this function
GRANT EXECUTE ON FUNCTION public.is_instructor_available(uuid, date, time, time) TO anon, authenticated;