-- Add cars table for vehicle management
CREATE TABLE public.cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_plate TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- Create policies for cars
CREATE POLICY "Admins can manage cars" 
ON public.cars 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Instructors can view cars" 
ON public.cars 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role IN ('instructor', 'admin')
));

-- Add payment proofs table
CREATE TABLE public.payment_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  lesson_package_id UUID NOT NULL,
  proof_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  CONSTRAINT fk_payment_proofs_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_payment_proofs_package FOREIGN KEY (lesson_package_id) REFERENCES lesson_packages(id),
  CONSTRAINT fk_payment_proofs_admin FOREIGN KEY (processed_by) REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

-- Create policies for payment proofs
CREATE POLICY "Students can view their own payment proofs" 
ON public.payment_proofs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM students s 
  JOIN profiles p ON s.profile_id = p.id 
  WHERE s.id = payment_proofs.student_id AND p.user_id = auth.uid()
));

CREATE POLICY "Students can create their own payment proofs" 
ON public.payment_proofs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM students s 
  JOIN profiles p ON s.profile_id = p.id 
  WHERE s.id = payment_proofs.student_id AND p.user_id = auth.uid()
));

CREATE POLICY "Admins can manage payment proofs" 
ON public.payment_proofs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

-- Add lesson requests table
CREATE TABLE public.lesson_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  instructor_id UUID NOT NULL,
  requested_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, rescheduled
  instructor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_lesson_requests_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_lesson_requests_instructor FOREIGN KEY (instructor_id) REFERENCES instructors(id)
);

-- Enable RLS
ALTER TABLE public.lesson_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for lesson requests
CREATE POLICY "Students can manage their own requests" 
ON public.lesson_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM students s 
  JOIN profiles p ON s.profile_id = p.id 
  WHERE s.id = lesson_requests.student_id AND p.user_id = auth.uid()
));

CREATE POLICY "Instructors can manage their requests" 
ON public.lesson_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM instructors i 
  JOIN profiles p ON i.profile_id = p.id 
  WHERE i.id = lesson_requests.instructor_id AND p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all requests" 
ON public.lesson_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

-- Add triggers for updated_at
CREATE TRIGGER update_cars_updated_at
BEFORE UPDATE ON public.cars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_requests_updated_at
BEFORE UPDATE ON public.lesson_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add instructor availability table
CREATE TABLE public.instructor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  reason TEXT, -- e.g., "Exam supervision", "Personal leave"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_availability_instructor FOREIGN KEY (instructor_id) REFERENCES instructors(id),
  UNIQUE(instructor_id, date, start_time, end_time)
);

-- Enable RLS
ALTER TABLE public.instructor_availability ENABLE ROW LEVEL SECURITY;

-- Create policies for instructor availability
CREATE POLICY "Instructors can manage their availability" 
ON public.instructor_availability 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM instructors i 
  JOIN profiles p ON i.profile_id = p.id 
  WHERE i.id = instructor_availability.instructor_id AND p.user_id = auth.uid()
));

CREATE POLICY "Others can view instructor availability" 
ON public.instructor_availability 
FOR SELECT 
USING (is_available = true OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role IN ('admin', 'instructor')
));