-- ==============================================================================
-- EESA CONNECT PRMITR - COMPLETE ALUMNI SYSTEM DATABASE SETUP
-- 
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/ljmaburyqfwqcxqzwkch
-- 2. Go to the "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Copy and paste this entire script and click "RUN"
-- ==============================================================================

-- 1. Create alumni_profiles table
CREATE TABLE IF NOT EXISTS public.alumni_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name TEXT NOT NULL,
    graduation_year INTEGER,
    academic_year TEXT,
    department TEXT,

    company TEXT,
    designation TEXT,
    industry TEXT,
    location TEXT,

    bio TEXT,
    skills TEXT[] DEFAULT '{}',

    profile_photo_url TEXT,
    linkedin_url TEXT,

    mentorship_available BOOLEAN NOT NULL DEFAULT false,
    career_guidance_available BOOLEAN NOT NULL DEFAULT false,
    internship_support BOOLEAN NOT NULL DEFAULT false,
    job_referral_support BOOLEAN NOT NULL DEFAULT false,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),

    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT alumni_profiles_user_id_unique UNIQUE (user_id)
);

-- 2. Create alumni_connection_requests table
CREATE TABLE IF NOT EXISTS public.alumni_connection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    alumni_id UUID NOT NULL
        REFERENCES public.alumni_profiles(id)
        ON DELETE CASCADE,

    message TEXT,
    student_name TEXT,
    student_email TEXT,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'accepted',
            'rejected',
            'cancelled'
        )),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT alumni_connection_requests_unique UNIQUE (student_id, alumni_id)
);

-- 3. Create alumni_mentorship_requests table
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

-- 4. Create alumni_jobs table
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

-- 5. Create alumni_internships table
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

-- 6. Create alumni_guest_lectures table
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

    topic_category TEXT NOT NULL DEFAULT 'Technical Talk',
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    venue TEXT NOT NULL DEFAULT 'Seminar Hall',

    meeting_url TEXT,
    registration_url TEXT,
    poster_url TEXT,

    status TEXT NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'completed', 'cancelled', 'hidden')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create alumni_events table
CREATE TABLE IF NOT EXISTS public.alumni_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    venue TEXT NOT NULL,
    location TEXT,

    registration_url TEXT,
    poster_url TEXT,
    organizer TEXT NOT NULL DEFAULT 'EESA Alumni Committee',

    status TEXT NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'completed', 'cancelled', 'hidden')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_status_active ON public.alumni_profiles (status, is_active);
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_grad_year ON public.alumni_profiles (graduation_year);
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_department ON public.alumni_profiles (department);
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_industry ON public.alumni_profiles (industry);
CREATE INDEX IF NOT EXISTS idx_alumni_requests_alumni_id ON public.alumni_connection_requests (alumni_id);
CREATE INDEX IF NOT EXISTS idx_alumni_requests_student_id ON public.alumni_connection_requests (student_id);
CREATE INDEX IF NOT EXISTS idx_alumni_mentorship_alumni_id ON public.alumni_mentorship_requests (alumni_id);
CREATE INDEX IF NOT EXISTS idx_alumni_mentorship_student_id ON public.alumni_mentorship_requests (student_id);
CREATE INDEX IF NOT EXISTS idx_alumni_jobs_status ON public.alumni_jobs (status);
CREATE INDEX IF NOT EXISTS idx_alumni_internships_status ON public.alumni_internships (status);
CREATE INDEX IF NOT EXISTS idx_alumni_lectures_date ON public.alumni_guest_lectures (date);
CREATE INDEX IF NOT EXISTS idx_alumni_events_date ON public.alumni_events (event_date);

-- 9. Enable Row Level Security (RLS)
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_guest_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_events ENABLE ROW LEVEL SECURITY;

-- 10. Open RLS Policies (Allowing app operations cleanly)
DROP POLICY IF EXISTS "Allow all for alumni_profiles" ON public.alumni_profiles;
CREATE POLICY "Allow all for alumni_profiles" ON public.alumni_profiles FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for alumni_connection_requests" ON public.alumni_connection_requests;
CREATE POLICY "Allow all for alumni_connection_requests" ON public.alumni_connection_requests FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for alumni_mentorship_requests" ON public.alumni_mentorship_requests;
CREATE POLICY "Allow all for alumni_mentorship_requests" ON public.alumni_mentorship_requests FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for alumni_jobs" ON public.alumni_jobs;
CREATE POLICY "Allow all for alumni_jobs" ON public.alumni_jobs FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for alumni_internships" ON public.alumni_internships;
CREATE POLICY "Allow all for alumni_internships" ON public.alumni_internships FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for alumni_guest_lectures" ON public.alumni_guest_lectures;
CREATE POLICY "Allow all for alumni_guest_lectures" ON public.alumni_guest_lectures FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for alumni_events" ON public.alumni_events;
CREATE POLICY "Allow all for alumni_events" ON public.alumni_events FOR ALL TO public USING (true) WITH CHECK (true);

-- 11. Storage Bucket & Policies for alumni-photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('alumni-photos', 'alumni-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public alumni photos read access" ON storage.objects;
CREATE POLICY "Public alumni photos read access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'alumni-photos');

DROP POLICY IF EXISTS "Allow alumni photos upload" ON storage.objects;
CREATE POLICY "Allow alumni photos upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'alumni-photos');

DROP POLICY IF EXISTS "Allow alumni photos update" ON storage.objects;
CREATE POLICY "Allow alumni photos update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'alumni-photos');

DROP POLICY IF EXISTS "Allow alumni photos delete" ON storage.objects;
CREATE POLICY "Allow alumni photos delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'alumni-photos');
