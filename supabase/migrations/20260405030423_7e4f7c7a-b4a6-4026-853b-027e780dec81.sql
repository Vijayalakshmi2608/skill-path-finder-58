
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  date_applied date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'interview', 'offer', 'rejected')),
  match_score integer DEFAULT 0,
  salary_offered numeric DEFAULT NULL,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own applications" ON public.applications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  platform text NOT NULL,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percent integer NOT NULL DEFAULT 0,
  cost text DEFAULT '',
  duration text DEFAULT '',
  salary_impact numeric DEFAULT 0,
  gaps_closed text[] DEFAULT '{}',
  url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own certifications" ON public.certifications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
