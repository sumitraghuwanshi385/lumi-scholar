-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('teacher', 'student');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ STUDENTS ============
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- optional link to student account
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  gpa NUMERIC(3,2) DEFAULT 0,
  attendance_pct NUMERIC(5,2) DEFAULT 0,
  parent_contact TEXT,
  enrolled_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers manage own students" ON public.students
  FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "students view own record" ON public.students
  FOR SELECT USING (auth.uid() = user_id);

-- ============ SCORES ============
CREATE TABLE public.scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  exam_type TEXT DEFAULT 'midterm',
  exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers manage scores of own students" ON public.scores
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = scores.student_id AND s.teacher_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = scores.student_id AND s.teacher_id = auth.uid())
  );

CREATE POLICY "students view own scores" ON public.scores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = scores.student_id AND s.user_id = auth.uid())
  );

-- ============ ATTENDANCE ============
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = attendance.student_id AND s.teacher_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = attendance.student_id AND s.teacher_id = auth.uid())
  );

CREATE POLICY "students view own attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = attendance.student_id AND s.user_id = auth.uid())
  );

-- ============ ASSIGNMENTS ============
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  submitted BOOLEAN NOT NULL DEFAULT false,
  score NUMERIC(5,2),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers manage assignments" ON public.assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = assignments.student_id AND s.teacher_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = assignments.student_id AND s.teacher_id = auth.uid())
  );

CREATE POLICY "students view own assignments" ON public.assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = assignments.student_id AND s.user_id = auth.uid())
  );

-- ============ AI RECOMMENDATIONS ============
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  recommendation TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'study_habits',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers manage recommendations" ON public.ai_recommendations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = ai_recommendations.student_id AND s.teacher_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = ai_recommendations.student_id AND s.teacher_id = auth.uid())
  );

CREATE POLICY "students view own recommendations" ON public.ai_recommendations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = ai_recommendations.student_id AND s.user_id = auth.uid())
  );

CREATE POLICY "students update own recommendation status" ON public.ai_recommendations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = ai_recommendations.student_id AND s.user_id = auth.uid())
  );

-- ============ ALERTS ============
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers manage alerts" ON public.alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = alerts.student_id AND s.teacher_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = alerts.student_id AND s.teacher_id = auth.uid())
  );

CREATE POLICY "students view own alerts" ON public.alerts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = alerts.student_id AND s.user_id = auth.uid())
  );

-- ============ ACHIEVEMENTS ============
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  description TEXT,
  earned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers manage achievements" ON public.achievements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = achievements.student_id AND s.teacher_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = achievements.student_id AND s.teacher_id = auth.uid())
  );

CREATE POLICY "students view own achievements" ON public.achievements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = achievements.student_id AND s.user_id = auth.uid())
  );

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ NEW USER TRIGGER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role public.app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  -- Assign role from metadata (defaults to student)
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ INDEXES ============
CREATE INDEX idx_students_teacher ON public.students(teacher_id);
CREATE INDEX idx_students_user ON public.students(user_id);
CREATE INDEX idx_scores_student ON public.scores(student_id);
CREATE INDEX idx_attendance_student ON public.attendance(student_id);
CREATE INDEX idx_recommendations_student ON public.ai_recommendations(student_id);
CREATE INDEX idx_alerts_student ON public.alerts(student_id);