-- ==========================================================
-- EESA CONNECT PRMITR - ALUMNI ECOSYSTEM DATABASE MIGRATION
-- Tables: 
--   1. alumni_mentorship_requests
--   2. alumni_jobs
--   3. alumni_internships
--   4. alumni_guest_lectures
--   5. alumni_events
-- Includes: Foreign Keys to alumni_profiles, Indexes, Triggers & RLS Policies
-- ==========================================================

-- 1. Create alumni_mentorship_requests table
CREATE TABLE IF NOT EXISTS public.alumni_mentorship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    alumni_id UUID NOT NULL
        REFERENCES public.alumni_profiles(id)
        ON DELETE CASCADE,

    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    preferred_mode TEXT DEFAULT 'Video Call',
    student_name TEXT,
    student_email TEXT,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'accepted',
            'rejected',
            'completed',
            'cancelled'
        )),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create alumni_jobs table
CREATE TABLE IF NOT EXISTS public.alumni_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    work_mode TEXT NOT NULL DEFAULT 'Hybrid'
        CHECK (work_mode IN ('Onsite', 'Hybrid', 'Remote')),

    experience TEXT NOT NULL DEFAULT '0-2 years',
    skills TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    eligibility TEXT,
    application_url TEXT NOT NULL,
    application_deadline DATE,

    posted_by_alumni_id UUID
        REFERENCES public.alumni_profiles(id)
        ON DELETE SET NULL,

    posted_by_user_id UUID
        REFERENCES auth.users(id)
        ON DELETE SET NULL,

    poster_name TEXT,

    status TEXT NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'published', 'closed', 'hidden')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create alumni_internships table
CREATE TABLE IF NOT EXISTS public.alumni_internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    work_mode TEXT NOT NULL DEFAULT 'Hybrid'
        CHECK (work_mode IN ('Onsite', 'Hybrid', 'Remote')),

    duration TEXT NOT NULL DEFAULT '3 Months',
    stipend TEXT,
    skills TEXT[] DEFAULT '{}',
    eligibility TEXT,
    description TEXT NOT NULL,
    application_url TEXT NOT NULL,
    application_deadline DATE,

    posted_by_alumni_id UUID
        REFERENCES public.alumni_profiles(id)
        ON DELETE SET NULL,

    posted_by_user_id UUID
        REFERENCES auth.users(id)
        ON DELETE SET NULL,

    poster_name TEXT,

    status TEXT NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'published', 'closed', 'hidden')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create alumni_guest_lectures table
CREATE TABLE IF NOT EXISTS public.alumni_guest_lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    description TEXT NOT NULL,

    speaker_alumni_id UUID
        REFERENCES public.alumni_profiles(id)
        ON DELETE SET NULL,

    speaker_name TEXT,
    speaker_designation TEXT,
    speaker_company TEXT,
    topic_category TEXT DEFAULT 'Technical Talk',

    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue TEXT NOT NULL DEFAULT 'Seminar Hall',
    meeting_url TEXT,
    registration_url TEXT,
    poster_url TEXT,

    status TEXT NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'completed', 'cancelled', 'hidden')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create alumni_events table
CREATE TABLE IF NOT EXISTS public.alumni_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue TEXT NOT NULL,
    location TEXT,
    registration_url TEXT,
    poster_url TEXT,
    organizer TEXT DEFAULT 'EESA Alumni Cell & Electronics Dept',

    status TEXT NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'completed', 'cancelled', 'hidden')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_mentorship_alumni_id ON public.alumni_mentorship_requests (alumni_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_student_id ON public.alumni_mentorship_requests (student_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_status ON public.alumni_mentorship_requests (status);

CREATE INDEX IF NOT EXISTS idx_alumni_jobs_status ON public.alumni_jobs (status);
CREATE INDEX IF NOT EXISTS idx_alumni_jobs_alumni_id ON public.alumni_jobs (posted_by_alumni_id);

CREATE INDEX IF NOT EXISTS idx_alumni_internships_status ON public.alumni_internships (status);
CREATE INDEX IF NOT EXISTS idx_alumni_internships_alumni_id ON public.alumni_internships (posted_by_alumni_id);

CREATE INDEX IF NOT EXISTS idx_guest_lectures_status_date ON public.alumni_guest_lectures (status, date);
CREATE INDEX IF NOT EXISTS idx_guest_lectures_speaker ON public.alumni_guest_lectures (speaker_alumni_id);

CREATE INDEX IF NOT EXISTS idx_alumni_events_status_date ON public.alumni_events (status, event_date);

-- ==========================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================================
ALTER TABLE public.alumni_mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_guest_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_events ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- RLS POLICIES: alumni_mentorship_requests
-- ==========================================================
DROP POLICY IF EXISTS "Students can view own mentorship requests" ON public.alumni_mentorship_requests;
DROP POLICY IF EXISTS "Students can insert mentorship requests" ON public.alumni_mentorship_requests;
DROP POLICY IF EXISTS "Students can cancel own mentorship requests" ON public.alumni_mentorship_requests;
DROP POLICY IF EXISTS "Alumni can view mentorship requests to them" ON public.alumni_mentorship_requests;
DROP POLICY IF EXISTS "Alumni can update mentorship requests to them" ON public.alumni_mentorship_requests;
DROP POLICY IF EXISTS "Allow all for alumni_mentorship_requests" ON public.alumni_mentorship_requests;

CREATE POLICY "Students can view own mentorship requests"
ON public.alumni_mentorship_requests
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert mentorship requests"
ON public.alumni_mentorship_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can cancel own mentorship requests"
ON public.alumni_mentorship_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Alumni can view mentorship requests to them"
ON public.alumni_mentorship_requests
FOR SELECT
TO authenticated
USING (
    alumni_id IN (
        SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Alumni can update mentorship requests to them"
ON public.alumni_mentorship_requests
FOR UPDATE
TO authenticated
USING (
    alumni_id IN (
        SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    alumni_id IN (
        SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Allow all for alumni_mentorship_requests"
ON public.alumni_mentorship_requests
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ==========================================================
-- RLS POLICIES: alumni_jobs
-- ==========================================================
DROP POLICY IF EXISTS "Public read published jobs" ON public.alumni_jobs;
DROP POLICY IF EXISTS "Allow all for alumni_jobs" ON public.alumni_jobs;

CREATE POLICY "Public read published jobs"
ON public.alumni_jobs
FOR SELECT
TO public
USING (status = 'published');

CREATE POLICY "Allow all for alumni_jobs"
ON public.alumni_jobs
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ==========================================================
-- RLS POLICIES: alumni_internships
-- ==========================================================
DROP POLICY IF EXISTS "Public read published internships" ON public.alumni_internships;
DROP POLICY IF EXISTS "Allow all for alumni_internships" ON public.alumni_internships;

CREATE POLICY "Public read published internships"
ON public.alumni_internships
FOR SELECT
TO public
USING (status = 'published');

CREATE POLICY "Allow all for alumni_internships"
ON public.alumni_internships
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ==========================================================
-- RLS POLICIES: alumni_guest_lectures
-- ==========================================================
DROP POLICY IF EXISTS "Public read visible guest lectures" ON public.alumni_guest_lectures;
DROP POLICY IF EXISTS "Allow all for alumni_guest_lectures" ON public.alumni_guest_lectures;

CREATE POLICY "Public read visible guest lectures"
ON public.alumni_guest_lectures
FOR SELECT
TO public
USING (status IN ('upcoming', 'completed'));

CREATE POLICY "Allow all for alumni_guest_lectures"
ON public.alumni_guest_lectures
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ==========================================================
-- RLS POLICIES: alumni_events
-- ==========================================================
DROP POLICY IF EXISTS "Public read visible alumni events" ON public.alumni_events;
DROP POLICY IF EXISTS "Allow all for alumni_events" ON public.alumni_events;

CREATE POLICY "Public read visible alumni events"
ON public.alumni_events
FOR SELECT
TO public
USING (status IN ('upcoming', 'completed'));

CREATE POLICY "Allow all for alumni_events"
ON public.alumni_events
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ==========================================================
-- AUTOMATIC UPDATED_AT TRIGGERS
-- ==========================================================
DROP TRIGGER IF EXISTS update_alumni_mentorship_requests_updated_at ON public.alumni_mentorship_requests;
CREATE TRIGGER update_alumni_mentorship_requests_updated_at
    BEFORE UPDATE ON public.alumni_mentorship_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alumni_jobs_updated_at ON public.alumni_jobs;
CREATE TRIGGER update_alumni_jobs_updated_at
    BEFORE UPDATE ON public.alumni_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alumni_internships_updated_at ON public.alumni_internships;
CREATE TRIGGER update_alumni_internships_updated_at
    BEFORE UPDATE ON public.alumni_internships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alumni_guest_lectures_updated_at ON public.alumni_guest_lectures;
CREATE TRIGGER update_alumni_guest_lectures_updated_at
    BEFORE UPDATE ON public.alumni_guest_lectures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alumni_events_updated_at ON public.alumni_events;
CREATE TRIGGER update_alumni_events_updated_at
    BEFORE UPDATE ON public.alumni_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
