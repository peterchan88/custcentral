-- 1. Create profiles table for RBAC support
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff', -- 'staff' or 'admin'
  first_name TEXT,
  last_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Add user_id to feedback table to track ownership/assignment
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. Reset and harden Feedback RLS Policies
DROP POLICY IF EXISTS "Allow authenticated select" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated insert" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated update" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated delete" ON feedback;

-- SELECT: All staff can view all feedback (shared dashboard)
CREATE POLICY "feedback_select_policy" ON public.feedback
FOR SELECT TO authenticated USING (true);

-- INSERT: Any authenticated staff can ingest feedback
CREATE POLICY "feedback_insert_policy" ON public.feedback
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- UPDATE: Only the user who handled/owns the record or an admin can update
-- For now, we'll allow the owner to update. 
-- In a real RBAC system, we'd check the profiles table role.
CREATE POLICY "feedback_update_policy" ON public.feedback
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- DELETE: Only admins can delete records
CREATE POLICY "feedback_delete_policy" ON public.feedback
FOR DELETE TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- 4. Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    'staff' -- Default role
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();