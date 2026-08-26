-- =============================================================================
-- LIBIN CATERING SERVICE & EVENT MANAGEMENT
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. POLICIES: CATEGORIES
-- =============================================================================
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage all categories" ON public.categories;
DROP POLICY IF EXISTS "Allow reading categories" ON public.categories;
DROP POLICY IF EXISTS "Allow managing categories" ON public.categories;

CREATE POLICY "Allow reading categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow managing categories"
ON public.categories
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 3. POLICIES: MENU ITEMS
-- =============================================================================
DROP POLICY IF EXISTS "Public can view available menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated users can manage all menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow reading menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow managing menu items" ON public.menu_items;

CREATE POLICY "Allow reading menu items"
ON public.menu_items
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow managing menu items"
ON public.menu_items
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 4. POLICIES: EVENTS
-- =============================================================================
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can manage all events" ON public.events;
DROP POLICY IF EXISTS "Allow reading events" ON public.events;
DROP POLICY IF EXISTS "Allow managing events" ON public.events;

CREATE POLICY "Allow reading events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow managing events"
ON public.events
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 5. POLICIES: ENQUIRIES
-- =============================================================================
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Authenticated users can view enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Authenticated users can update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Authenticated users can delete enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow reading enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow inserting enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow updating enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow deleting enquiries" ON public.enquiries;

CREATE POLICY "Allow inserting enquiries"
ON public.enquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow reading enquiries"
ON public.enquiries
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow updating enquiries"
ON public.enquiries
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow deleting enquiries"
ON public.enquiries
FOR DELETE
TO anon, authenticated
USING (true);

-- =============================================================================
-- 6. POLICIES: GALLERY
-- =============================================================================
DROP POLICY IF EXISTS "Public can view published gallery" ON public.gallery;
DROP POLICY IF EXISTS "Authenticated users can manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow reading gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow managing gallery" ON public.gallery;

CREATE POLICY "Allow reading gallery"
ON public.gallery
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow managing gallery"
ON public.gallery
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 7. POLICIES: CONTACT INFORMATION
-- =============================================================================
DROP POLICY IF EXISTS "Public can view contact information" ON public.contact_information;
DROP POLICY IF EXISTS "Authenticated users can manage contact information" ON public.contact_information;
DROP POLICY IF EXISTS "Allow reading contact information" ON public.contact_information;
DROP POLICY IF EXISTS "Allow managing contact information" ON public.contact_information;

CREATE POLICY "Allow reading contact information"
ON public.contact_information
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow managing contact information"
ON public.contact_information
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 8. POLICIES: SITE SETTINGS
-- =============================================================================
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow reading site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow managing site settings" ON public.site_settings;

CREATE POLICY "Allow reading site settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow managing site settings"
ON public.site_settings
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 9. STORAGE BUCKET POLICIES (Supabase Storage: 'media' bucket)
-- =============================================================================
-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any to prevent duplicate policy errors
DROP POLICY IF EXISTS "Public media access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated media upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated media update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated media delete" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket upload access" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket update access" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket delete access" ON storage.objects;

-- 1. Public: Read media objects
CREATE POLICY "Public media access"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'media');

-- 2. Upload media objects (Anon & Authenticated for web admin dashboard)
CREATE POLICY "Media bucket upload access"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'media');

-- 3. Update media objects
CREATE POLICY "Media bucket update access"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- 4. Delete media objects
CREATE POLICY "Media bucket delete access"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'media');
