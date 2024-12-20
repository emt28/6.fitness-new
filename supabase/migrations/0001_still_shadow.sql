/*
  # Initial Schema Setup

  1. New Tables
    - users
      - Custom fields for user management
      - Extends Supabase auth users
    - athletes
      - Core athlete information
      - Linked to users for management
    - protocols
      - Test protocol definitions
      - Includes normative data
    - assessments
      - Assessment records
      - Links athletes and protocols
    - goals
      - Development goals for athletes
    - goal_notes
      - Notes and updates on goals
    - coach_notes
      - General notes from coaches
    - audit_logs
      - System activity tracking

  2. Security
    - Enable RLS on all tables
    - Set up policies for proper access control
*/

-- Users extension table
CREATE TABLE IF NOT EXISTS users_extension (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  role text CHECK (role IN ('admin', 'lead_coach', 'academy_coach', 'fitness_trainer', 'parent')),
  is_active boolean DEFAULT true,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users_extension ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users_extension
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users_extension
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users_extension WHERE id = auth.uid() AND role = 'admin'
  ));

-- Athletes table
CREATE TABLE IF NOT EXISTS athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date_of_birth date NOT NULL,
  dominant_hand text CHECK (dominant_hand IN ('left', 'right', 'ambidextrous')),
  wtn numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage athletes" ON athletes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_extension 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lead_coach', 'academy_coach')
    )
  );

-- Protocols table
CREATE TABLE IF NOT EXISTS protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  unit text NOT NULL,
  criteria text CHECK (criteria IN ('lower', 'higher')),
  categories text[] NOT NULL,
  normative_data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read protocols" ON protocols
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Coaches can manage protocols" ON protocols
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_extension 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lead_coach', 'fitness_trainer')
    )
  );

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes NOT NULL,
  protocol_id uuid REFERENCES protocols NOT NULL,
  value numeric NOT NULL,
  performance_level text CHECK (performance_level IN ('needs_improvement', 'median', 'excellent')),
  notes text,
  assessed_by uuid REFERENCES auth.users NOT NULL,
  assessed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage assessments" ON assessments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_extension 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lead_coach', 'academy_coach', 'fitness_trainer')
    )
  );

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes NOT NULL,
  title text NOT NULL,
  description text,
  category text CHECK (category IN ('physical', 'tactical', 'technical', 'mental', 'other')),
  target_metric jsonb,
  deadline date,
  progress numeric DEFAULT 0,
  status text DEFAULT 'onTrack' CHECK (status IN ('onTrack', 'atRisk', 'offTrack', 'completed')),
  protocol_id uuid REFERENCES protocols,
  assigned_to uuid REFERENCES auth.users,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage goals" ON goals
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_extension 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lead_coach', 'academy_coach', 'fitness_trainer')
    )
  );

-- Goal Notes table
CREATE TABLE IF NOT EXISTS goal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals NOT NULL,
  text text NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage goal notes" ON goal_notes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_extension 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lead_coach', 'academy_coach', 'fitness_trainer')
    )
  );

-- Coach Notes table
CREATE TABLE IF NOT EXISTS coach_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes NOT NULL,
  content text NOT NULL,
  type text CHECK (type IN ('general', 'technical', 'tactical', 'physical', 'mental')),
  visibility text CHECK (visibility IN ('coaches', 'all')),
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage notes" ON coach_notes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_extension 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lead_coach', 'academy_coach', 'fitness_trainer')
    )
  );

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  details text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_extension 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users_extension (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();