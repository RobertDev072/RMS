-- Update payment_proofs table to simplify the process
ALTER TABLE public.payment_proofs 
ADD COLUMN IF NOT EXISTS lessons_added boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update the status to have clearer options
-- Current statuses: 'pending', 'approved', 'rejected'
-- Let's add more specific statuses
COMMENT ON COLUMN public.payment_proofs.status IS 'Status options: pending, invoice_sent, payment_received, approved, rejected';

-- Create a function to automatically add lessons when payment is approved
CREATE OR REPLACE FUNCTION public.approve_payment_and_add_lessons(
  payment_proof_id UUID,
  admin_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payment_rec payment_proofs%ROWTYPE;
  package_rec lesson_packages%ROWTYPE;
BEGIN
  -- Get the payment proof record
  SELECT * INTO payment_rec 
  FROM payment_proofs 
  WHERE id = payment_proof_id AND status = 'payment_received';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment proof not found or not in correct status';
  END IF;
  
  -- Get the lesson package details
  SELECT * INTO package_rec 
  FROM lesson_packages 
  WHERE id = payment_rec.lesson_package_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lesson package not found';
  END IF;
  
  -- Update the payment proof status
  UPDATE payment_proofs 
  SET 
    status = 'approved',
    processed_by = admin_user_id,
    processed_at = now(),
    approved_at = now(),
    lessons_added = true
  WHERE id = payment_proof_id;
  
  -- Add lessons to the student's account
  UPDATE students 
  SET lessons_remaining = COALESCE(lessons_remaining, 0) + package_rec.lessons_count,
      updated_at = now()
  WHERE id = payment_rec.student_id;
  
END;
$$;

-- Create a function to reject payment
CREATE OR REPLACE FUNCTION public.reject_payment(
  payment_proof_id UUID,
  admin_user_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE payment_proofs 
  SET 
    status = 'rejected',
    processed_by = admin_user_id,
    processed_at = now(),
    rejection_reason = reason
  WHERE id = payment_proof_id AND status IN ('pending', 'invoice_sent', 'payment_received');
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment proof not found or cannot be rejected';
  END IF;
END;
$$;

-- Create a function to update payment status
CREATE OR REPLACE FUNCTION public.update_payment_status(
  payment_proof_id UUID,
  new_status TEXT,
  admin_user_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE payment_proofs 
  SET 
    status = new_status,
    processed_by = admin_user_id,
    processed_at = CASE 
      WHEN new_status IN ('approved', 'rejected') THEN now() 
      ELSE processed_at 
    END,
    admin_notes = COALESCE(notes, admin_notes)
  WHERE id = payment_proof_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment proof not found';
  END IF;
END;
$$;