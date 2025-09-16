-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'instructor', 'student')),
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create instructors table
CREATE TABLE public.instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specializations TEXT[] DEFAULT ARRAY['auto'],
  available_hours JSONB DEFAULT '{}',
  max_lessons_per_day INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table  
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_type TEXT DEFAULT 'B',
  theory_exam_passed BOOLEAN DEFAULT false,
  lessons_remaining INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson packages table
CREATE TABLE public.lesson_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lessons_count INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson feedback table
CREATE TABLE public.lesson_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  driving_skills INTEGER CHECK (driving_skills >= 1 AND driving_skills <= 10),
  parking_skills INTEGER CHECK (parking_skills >= 1 AND parking_skills <= 10),
  traffic_awareness INTEGER CHECK (traffic_awareness >= 1 AND traffic_awareness <= 10),
  overall_progress INTEGER CHECK (overall_progress >= 1 AND overall_progress <= 10),
  comments TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for instructors
CREATE POLICY "Instructors can view their own data" ON public.instructors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all instructors" ON public.instructors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for students
CREATE POLICY "Students can view their own data" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view their students" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('instructor', 'admin')
    )
  );

-- RLS Policies for lesson_packages (public read)
CREATE POLICY "Everyone can view active packages" ON public.lesson_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON public.lesson_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for lessons
CREATE POLICY "Students can view their own lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE s.id = student_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view their lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.instructors i
      JOIN public.profiles p ON i.profile_id = p.id
      WHERE i.id = instructor_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for lesson_feedback
CREATE POLICY "Students can view their feedback" ON public.lesson_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.students s ON l.student_id = s.id
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE l.id = lesson_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can manage their feedback" ON public.lesson_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.instructors i
      JOIN public.profiles p ON i.profile_id = p.id
      WHERE i.id = instructor_id AND p.user_id = auth.uid()
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT DEFAULT 'student';
BEGIN
  -- Extract role from user metadata, default to 'student'
  IF NEW.raw_user_meta_data ? 'role' THEN
    user_role := NEW.raw_user_meta_data->>'role';
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nieuwe Gebruiker'),
    user_role
  );

  -- Create role-specific entries
  IF user_role = 'instructor' THEN
    INSERT INTO public.instructors (profile_id)
    SELECT id FROM public.profiles WHERE user_id = NEW.id;
  ELSIF user_role = 'student' THEN
    INSERT INTO public.students (profile_id)
    SELECT id FROM public.profiles WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON public.instructors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default lesson packages
INSERT INTO public.lesson_packages (name, lessons_count, price, description) VALUES
('Basis Pakket', 10, 599.99, '10 rijlessen van 60 minuten'),
('Standaard Pakket', 20, 1149.99, '20 rijlessen van 60 minuten + theorie ondersteuning'),
('Premium Pakket', 30, 1649.99, '30 rijlessen van 60 minuten + theorie + examentraining'),
('Bijles Pakket', 5, 324.99, '5 extra rijlessen voor extra oefening');