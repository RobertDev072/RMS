-- Update payment_proofs table to support new status flow
ALTER TABLE payment_proofs 
ADD COLUMN IF NOT EXISTS invoice_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS payment_received_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS invoice_email text;

-- Update the status check constraint to include new statuses
-- First drop existing constraint if it exists
ALTER TABLE payment_proofs DROP CONSTRAINT IF EXISTS payment_proofs_status_check;

-- Add new constraint with all statuses
ALTER TABLE payment_proofs 
ADD CONSTRAINT payment_proofs_status_check 
CHECK (status IN ('pending', 'accepted', 'invoice_sent', 'payment_received', 'approved', 'rejected'));

-- Create function to accept payment proof and set invoice email
CREATE OR REPLACE FUNCTION public.accept_payment_proof(payment_proof_id uuid, admin_user_id uuid, invoice_email text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  student_email text;
BEGIN
  -- Get student email if invoice_email not provided
  IF invoice_email IS NULL THEN
    SELECT p.email INTO student_email
    FROM payment_proofs pp
    JOIN students s ON pp.student_id = s.id
    JOIN profiles p ON s.profile_id = p.id
    WHERE pp.id = payment_proof_id;
    
    invoice_email := student_email;
  END IF;

  -- Update payment proof to accepted status
  UPDATE payment_proofs 
  SET 
    status = 'accepted',
    processed_by = admin_user_id,
    processed_at = now(),
    invoice_email = accept_payment_proof.invoice_email
  WHERE id = payment_proof_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment proof not found or not in pending status';
  END IF;
END;
$function$;

-- Create function to mark invoice as sent
CREATE OR REPLACE FUNCTION public.mark_invoice_sent(payment_proof_id uuid, admin_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE payment_proofs 
  SET 
    status = 'invoice_sent',
    invoice_sent_at = now(),
    processed_by = admin_user_id,
    processed_at = now()
  WHERE id = payment_proof_id AND status = 'accepted';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment proof not found or not in accepted status';
  END IF;
END;
$function$;

-- Create function to mark payment as received
CREATE OR REPLACE FUNCTION public.mark_payment_received(payment_proof_id uuid, admin_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE payment_proofs 
  SET 
    status = 'payment_received',
    payment_received_at = now(),
    processed_by = admin_user_id,
    processed_at = now()
  WHERE id = payment_proof_id AND status = 'invoice_sent';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment proof not found or not in invoice_sent status';
  END IF;
END;
$function$;

-- Update existing functions to work with new status flow
CREATE OR REPLACE FUNCTION public.update_payment_status(payment_proof_id uuid, new_status text, admin_user_id uuid, notes text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update based on new status
  UPDATE payment_proofs 
  SET 
    status = new_status,
    processed_by = admin_user_id,
    processed_at = now(),
    admin_notes = COALESCE(notes, admin_notes),
    invoice_sent_at = CASE WHEN new_status = 'invoice_sent' THEN now() ELSE invoice_sent_at END,
    payment_received_at = CASE WHEN new_status = 'payment_received' THEN now() ELSE payment_received_at END,
    approved_at = CASE WHEN new_status = 'approved' THEN now() ELSE approved_at END
  WHERE id = payment_proof_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment proof not found';
  END IF;
END;
$function$;