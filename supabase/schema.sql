-- bee-jobs database schema

-- Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Company info
  company TEXT NOT NULL,
  company_stage TEXT, -- Seed, Series A, Series B, Series C, Public, etc.
  company_size TEXT, -- e.g., "50-100 employees"
  company_mission TEXT,
  
  -- Role info
  role TEXT NOT NULL,
  job_url TEXT,
  careers_url TEXT,
  website TEXT,
  location TEXT,
  salary_range TEXT,
  
  -- BeeBot analysis
  why_good_fit TEXT,
  
  -- Tracking
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'offer', 'passed')),
  
  -- User fields
  notes TEXT,
  interested BOOLEAN DEFAULT NULL, -- null = not reviewed, true = interested, false = not interested
  applied_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'beebot' -- 'beebot' or 'manual'
);

-- Contacts table (people you know at companies)
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  role TEXT,
  relationship TEXT, -- e.g., "Former colleague", "LinkedIn connection"
  linkedin_url TEXT,
  email TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'status_change', 'note_added', 'contact_added', 'applied', etc.
  description TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies - users can only see their own data
CREATE POLICY "Users can view own jobs" ON jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON jobs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own contacts" ON contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_contacts_job_id ON contacts(job_id);
CREATE INDEX idx_activities_job_id ON activities(job_id);
