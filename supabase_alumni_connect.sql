-- ==========================================================
-- EESA CONNECT PRMITR - ALUMNI CONNECT DATABASE MIGRATION
-- Tables: alumni_profiles, alumni_connection_requests
-- Includes: RLS Policies, updated_at triggers, Storage Bucket
-- ==========================================================

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

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_status_active 
ON public.alumni_profiles (status, is_active);

CREATE INDEX IF NOT EXISTS idx_alumni_profiles_grad_year 
ON public.alumni_profiles (graduation_year);

CREATE INDEX IF NOT EXISTS idx_alumni_profiles_department 
ON public.alumni_profiles (department);

CREATE INDEX IF NOT EXISTS idx_alumni_profiles_industry 
ON public.alumni_profiles (industry);

CREATE INDEX IF NOT EXISTS idx_alumni_requests_alumni_id 
ON public.alumni_connection_requests (alumni_id);

CREATE INDEX IF NOT EXISTS idx_alumni_requests_student_id 
ON public.alumni_connection_requests (student_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_connection_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for alumni_profiles
DROP POLICY IF EXISTS "Public read approved alumni profiles" ON public.alumni_profiles;
DROP POLICY IF EXISTS "Users can read own alumni profile" ON public.alumni_profiles;
DROP POLICY IF EXISTS "Users can insert own alumni profile" ON public.alumni_profiles;
DROP POLICY IF EXISTS "Users can update own alumni profile" ON public.alumni_profiles;
DROP POLICY IF EXISTS "Allow all for alumni_profiles" ON public.alumni_profiles;

-- Public can view approved & active alumni
CREATE POLICY "Public read approved alumni profiles"
ON public.alumni_profiles
FOR SELECT
TO public
USING (status = 'approved' AND is_active = true);

-- Users can view their own profile regardless of approval status
CREATE POLICY "Users can read own alumni profile"
ON public.alumni_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own alumni profile"
ON public.alumni_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own alumni profile"
ON public.alumni_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin / management policy (matching existing EESA pattern)
CREATE POLICY "Allow all for alumni_profiles"
ON public.alumni_profiles
FOR ALL
TO public
USING (true)
WITH CHECK (true);


-- 6. RLS Policies for alumni_connection_requests
DROP POLICY IF EXISTS "Students can view own requests" ON public.alumni_connection_requests;
DROP POLICY IF EXISTS "Students can insert requests" ON public.alumni_connection_requests;
DROP POLICY IF EXISTS "Students can update own pending requests" ON public.alumni_connection_requests;
DROP POLICY IF EXISTS "Alumni can view requests to their profile" ON public.alumni_connection_requests;
DROP POLICY IF EXISTS "Alumni can update requests to their profile" ON public.alumni_connection_requests;
DROP POLICY IF EXISTS "Allow all for alumni_connection_requests" ON public.alumni_connection_requests;

-- Students can read their own sent requests
CREATE POLICY "Students can view own requests"
ON public.alumni_connection_requests
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- Students can insert connection requests
CREATE POLICY "Students can insert requests"
ON public.alumni_connection_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Students can cancel their own requests
CREATE POLICY "Students can update own pending requests"
ON public.alumni_connection_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Alumni can view requests sent to their profile
CREATE POLICY "Alumni can view requests to their profile"
ON public.alumni_connection_requests
FOR SELECT
TO authenticated
USING (
    alumni_id IN (
        SELECT id FROM public.alumni_profiles WHERE user_id = auth.uid()
    )
);

-- Alumni can update (accept / reject) requests sent to their profile
CREATE POLICY "Alumni can update requests to their profile"
ON public.alumni_connection_requests
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

-- Admin / management policy (matching existing EESA pattern)
CREATE POLICY "Allow all for alumni_connection_requests"
ON public.alumni_connection_requests
FOR ALL
TO public
USING (true)
WITH CHECK (true);


-- 7. Automatic Updated At Trigger Function & Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_alumni_profiles_updated_at ON public.alumni_profiles;
CREATE TRIGGER update_alumni_profiles_updated_at
    BEFORE UPDATE ON public.alumni_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alumni_connection_requests_updated_at ON public.alumni_connection_requests;
CREATE TRIGGER update_alumni_connection_requests_updated_at
    BEFORE UPDATE ON public.alumni_connection_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 8. Storage Bucket & Policies for alumni-photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('alumni-photos', 'alumni-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public alumni photos read access" ON storage.objects;
CREATE POLICY "Public alumni photos read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'alumni-photos');

DROP POLICY IF EXISTS "Allow alumni photos upload" ON storage.objects;
CREATE POLICY "Allow alumni photos upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'alumni-photos');

DROP POLICY IF EXISTS "Allow alumni photos update" ON storage.objects;
CREATE POLICY "Allow alumni photos update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'alumni-photos');

DROP POLICY IF EXISTS "Allow alumni photos delete" ON storage.objects;
CREATE POLICY "Allow alumni photos delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'alumni-photos');
