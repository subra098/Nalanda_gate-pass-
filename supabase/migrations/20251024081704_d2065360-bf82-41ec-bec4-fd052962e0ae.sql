-- Create enums for type safety
CREATE TYPE public.app_role AS ENUM ('student', 'hostel_attendant', 'superintendent', 'security_guard');
CREATE TYPE public.pass_status AS ENUM ('pending', 'attendant_approved', 'superintendent_approved', 'rejected', 'exited', 'entered', 'overdue');
CREATE TYPE public.destination_type AS ENUM ('chandaka', 'bhubaneswar', 'home_other');

-- Profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  roll_no TEXT,
  hostel TEXT,
  parent_contact TEXT,
  college_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Gatepasses table
CREATE TABLE public.gatepasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_type destination_type NOT NULL,
  destination_details TEXT NOT NULL,
  reason TEXT NOT NULL,
  expected_return_at TIMESTAMPTZ NOT NULL,
  status pass_status NOT NULL DEFAULT 'pending',
  qr_code_data TEXT,
  attendant_id UUID REFERENCES auth.users(id),
  superintendent_id UUID REFERENCES auth.users(id),
  attendant_notes TEXT,
  superintendent_notes TEXT,
  parent_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extension requests table
CREATE TABLE public.extension_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gatepass_id UUID NOT NULL REFERENCES public.gatepasses(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  new_expected_return_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  superintendent_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gate logs table for entry/exit tracking
CREATE TABLE public.gate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gatepass_id UUID NOT NULL REFERENCES public.gatepasses(id) ON DELETE CASCADE,
  security_guard_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'exit' or 'entry'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gatepasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extension_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user's hostel
CREATE OR REPLACE FUNCTION public.get_user_hostel(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hostel FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Attendants and superintendents can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'hostel_attendant') OR 
    public.has_role(auth.uid(), 'superintendent')
  );

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only superintendents can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'superintendent'));

-- RLS Policies for gatepasses
CREATE POLICY "Students can view their own passes"
  ON public.gatepasses FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create passes"
  ON public.gatepasses FOR INSERT
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));

CREATE POLICY "Attendants can view passes from their hostel"
  ON public.gatepasses FOR SELECT
  USING (
    public.has_role(auth.uid(), 'hostel_attendant') AND
    public.get_user_hostel(student_id) = public.get_user_hostel(auth.uid())
  );

CREATE POLICY "Attendants can update passes from their hostel"
  ON public.gatepasses FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'hostel_attendant') AND
    public.get_user_hostel(student_id) = public.get_user_hostel(auth.uid())
  );

CREATE POLICY "Superintendents can view all passes"
  ON public.gatepasses FOR SELECT
  USING (public.has_role(auth.uid(), 'superintendent'));

CREATE POLICY "Superintendents can update all passes"
  ON public.gatepasses FOR UPDATE
  USING (public.has_role(auth.uid(), 'superintendent'));

CREATE POLICY "Security guards can view all passes"
  ON public.gatepasses FOR SELECT
  USING (public.has_role(auth.uid(), 'security_guard'));

CREATE POLICY "Security guards can update pass status"
  ON public.gatepasses FOR UPDATE
  USING (public.has_role(auth.uid(), 'security_guard'));

-- RLS Policies for extension_requests
CREATE POLICY "Students can view their extension requests"
  ON public.extension_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gatepasses 
      WHERE id = extension_requests.gatepass_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Students can create extension requests"
  ON public.extension_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gatepasses 
      WHERE id = gatepass_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Superintendents can view all extension requests"
  ON public.extension_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'superintendent'));

CREATE POLICY "Superintendents can update extension requests"
  ON public.extension_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'superintendent'));

-- RLS Policies for gate_logs
CREATE POLICY "Security guards can create logs"
  ON public.gate_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'security_guard'));

CREATE POLICY "Security guards can view all logs"
  ON public.gate_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'security_guard'));

CREATE POLICY "Students can view logs for their passes"
  ON public.gate_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gatepasses 
      WHERE id = gate_logs.gatepass_id AND student_id = auth.uid()
    )
  );

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gatepasses_updated_at
  BEFORE UPDATE ON public.gatepasses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_extension_requests_updated_at
  BEFORE UPDATE ON public.extension_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, college_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();