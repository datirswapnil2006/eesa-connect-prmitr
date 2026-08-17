-- ==========================================================
-- EESA CONNECT PRMITR - EXECUTIVE MEMBERS & FORUMS MIGRATION
-- Many-to-Many Executive Member <-> Forum Relationship
-- ==========================================================

-- 1. Ensure 'name' column exists on 'forums' table
ALTER TABLE public.forums 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing records so 'name' matches 'category' if 'name' is NULL
UPDATE public.forums
SET name = category
WHERE name IS NULL AND category IS NOT NULL;

-- 2. Seed standard forum records if they do not already exist
INSERT INTO public.forums (name, category, title, content)
SELECT 'Core Electronics Forum', 'Core Electronics', 'Core Electronics Forum', 'Official Core Electronics Forum of EESA'
WHERE NOT EXISTS (SELECT 1 FROM public.forums WHERE name = 'Core Electronics Forum' OR category = 'Core Electronics Forum');

INSERT INTO public.forums (name, category, title, content)
SELECT 'IT Forum', 'IT', 'IT Forum', 'Official IT Forum of EESA'
WHERE NOT EXISTS (SELECT 1 FROM public.forums WHERE name = 'IT Forum' OR category = 'IT Forum');

INSERT INTO public.forums (name, category, title, content)
SELECT 'Career Development Forum', 'Career Development', 'Career Development Forum', 'Official Career Development Forum of EESA'
WHERE NOT EXISTS (SELECT 1 FROM public.forums WHERE name = 'Career Development Forum' OR category = 'Career Development Forum');

INSERT INTO public.forums (name, category, title, content)
SELECT 'Social Media', 'Social Media', 'Social Media Forum', 'Official Social Media Forum of EESA'
WHERE NOT EXISTS (SELECT 1 FROM public.forums WHERE name = 'Social Media' OR category = 'Social Media');

-- Ensure all forums have a name
UPDATE public.forums
SET name = COALESCE(name, category, title, 'Forum')
WHERE name IS NULL;

-- 3. Create executive_members table
CREATE TABLE IF NOT EXISTS public.executive_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    bio TEXT DEFAULT '',
    photo_url TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    academic_year TEXT DEFAULT '2024-25',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.executive_member_forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executive_member_id UUID NOT NULL,
    forum_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT executive_member_forums_member_fk
        FOREIGN KEY (executive_member_id)
        REFERENCES public.executive_members(id)
        ON DELETE CASCADE,

    CONSTRAINT executive_member_forums_forum_fk
        FOREIGN KEY (forum_id)
        REFERENCES public.forums(id)
        ON DELETE CASCADE,

    CONSTRAINT executive_member_forums_unique
        UNIQUE (executive_member_id, forum_id)
);

-- 5. Safe data migration if old 'forum_id' column existed in executive_members
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'executive_members'
          AND column_name = 'forum_id'
    ) THEN
        INSERT INTO public.executive_member_forums (executive_member_id, forum_id)
        SELECT id, forum_id
        FROM public.executive_members
        WHERE forum_id IS NOT NULL
        ON CONFLICT (executive_member_id, forum_id) DO NOTHING;
    END IF;
END $$;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.executive_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_member_forums ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for executive_members
DROP POLICY IF EXISTS "Public read active executive members" ON public.executive_members;
CREATE POLICY "Public read active executive members"
ON public.executive_members
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin manage executive members" ON public.executive_members;
CREATE POLICY "Admin manage executive members"
ON public.executive_members
FOR ALL
USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 8. RLS Policies for executive_member_forums
DROP POLICY IF EXISTS "Public read executive member forums" ON public.executive_member_forums;
CREATE POLICY "Public read executive member forums"
ON public.executive_member_forums
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin manage executive member forums" ON public.executive_member_forums;
CREATE POLICY "Admin manage executive member forums"
ON public.executive_member_forums
FOR ALL
USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 9. Automatic Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_executive_members_updated_at ON public.executive_members;
CREATE TRIGGER update_executive_members_updated_at
    BEFORE UPDATE ON public.executive_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
