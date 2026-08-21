-- ==========================================================
-- EESA CONNECT PRMITR - BATCHES & BATCH MEMBERS MIGRATION
-- Manage Specific Persons per Batch via Admin Dashboard
-- ==========================================================

-- 1. Create batches table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                  -- e.g. "Batch 2024-25", "Batch 2023-24"
    academic_year TEXT NOT NULL,         -- e.g. "2024-25"
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create batch_members table
CREATE TABLE IF NOT EXISTS public.batch_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    designation TEXT NOT NULL,            -- e.g. "Batch Representative", "President", "Coordinator"
    photo_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    email TEXT DEFAULT '',
    linkedin_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_batches_order ON public.batches(display_order);
CREATE INDEX IF NOT EXISTS idx_batch_members_batch_id ON public.batch_members(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_members_order ON public.batch_members(display_order);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_members ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for batches
DROP POLICY IF EXISTS "Allow public read batches" ON public.batches;
CREATE POLICY "Allow public read batches"
ON public.batches
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow all for batches" ON public.batches;
CREATE POLICY "Allow all for batches"
ON public.batches
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 6. RLS Policies for batch_members
DROP POLICY IF EXISTS "Allow public read batch_members" ON public.batch_members;
CREATE POLICY "Allow public read batch_members"
ON public.batch_members
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow all for batch_members" ON public.batch_members;
CREATE POLICY "Allow all for batch_members"
ON public.batch_members
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 7. Automatic Updated At Triggers
CREATE OR REPLACE FUNCTION update_batch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_batches_updated_at_trg ON public.batches;
CREATE TRIGGER update_batches_updated_at_trg
    BEFORE UPDATE ON public.batches
    FOR EACH ROW
    EXECUTE FUNCTION update_batch_updated_at();

DROP TRIGGER IF EXISTS update_batch_members_updated_at_trg ON public.batch_members;
CREATE TRIGGER update_batch_members_updated_at_trg
    BEFORE UPDATE ON public.batch_members
    FOR EACH ROW
    EXECUTE FUNCTION update_batch_updated_at();

-- 8. Seed initial sample batches & members if none exist
INSERT INTO public.batches (name, academic_year, display_order, is_active)
SELECT 'Batch 2024-25', '2024-25', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.batches WHERE name = 'Batch 2024-25');

INSERT INTO public.batches (name, academic_year, display_order, is_active)
SELECT 'Batch 2023-24', '2023-24', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.batches WHERE name = 'Batch 2023-24');

INSERT INTO public.batches (name, academic_year, display_order, is_active)
SELECT 'Batch 2022-23', '2022-23', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.batches WHERE name = 'Batch 2022-23');

-- 9. Storage Bucket & Policies for team-images (Profile photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-images', 'team-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public team images read access" ON storage.objects;
CREATE POLICY "Public team images read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team-images');

DROP POLICY IF EXISTS "Allow team images upload" ON storage.objects;
CREATE POLICY "Allow team images upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'team-images');

DROP POLICY IF EXISTS "Allow team images update" ON storage.objects;
CREATE POLICY "Allow team images update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'team-images');

DROP POLICY IF EXISTS "Allow team images delete" ON storage.objects;
CREATE POLICY "Allow team images delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'team-images');

