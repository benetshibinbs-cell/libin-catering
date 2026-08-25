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
-- Public: Read active categories
CREATE POLICY "Public can view active categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Authenticated (Admin): Full Access
CREATE POLICY "Authenticated users can manage all categories"
ON public.categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 3. POLICIES: MENU ITEMS
-- =============================================================================
-- Public: Read available menu items
CREATE POLICY "Public can view available menu items"
ON public.menu_items
FOR SELECT
TO anon, authenticated
USING (is_available = true);

-- Authenticated (Admin): Full Access
CREATE POLICY "Authenticated users can manage all menu items"
ON public.menu_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 4. POLICIES: EVENTS
-- =============================================================================
-- Public: Read published events
CREATE POLICY "Public can view published events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Authenticated (Admin): Full Access
CREATE POLICY "Authenticated users can manage all events"
ON public.events
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 5. POLICIES: ENQUIRIES
-- =============================================================================
-- Public: Can submit new enquiries
CREATE POLICY "Public can submit enquiries"
ON public.enquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
    LENGTH(TRIM(name)) > 0 AND 
    LENGTH(TRIM(phone)) >= 8 AND
    event_date IS NOT NULL
);

-- Public: CANNOT view, update, or delete enquiries
-- Authenticated (Admin): Can view, update, and manage all enquiries
CREATE POLICY "Authenticated users can view enquiries"
ON public.enquiries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update enquiries"
ON public.enquiries
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete enquiries"
ON public.enquiries
FOR DELETE
TO authenticated
USING (true);

-- =============================================================================
-- 6. POLICIES: GALLERY
-- =============================================================================
-- Public: Read published gallery items
CREATE POLICY "Public can view published gallery"
ON public.gallery
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Authenticated (Admin): Full Access
CREATE POLICY "Authenticated users can manage gallery"
ON public.gallery
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 7. POLICIES: CONTACT INFORMATION
-- =============================================================================
-- Public: Read contact information
CREATE POLICY "Public can view contact information"
ON public.contact_information
FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated (Admin): Full Access
CREATE POLICY "Authenticated users can manage contact information"
ON public.contact_information
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 8. POLICIES: SITE SETTINGS
-- =============================================================================
-- Public: Read settings
CREATE POLICY "Public can view site settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated (Admin): Full Access
CREATE POLICY "Authenticated users can manage site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 9. STORAGE BUCKET POLICIES (Supabase Storage: 'media' bucket)
-- =============================================================================
-- Create bucket if not exists (Note: Run in Supabase SQL Editor if storage is active)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public: Read media objects
CREATE POLICY "Public media access"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'media');

-- Authenticated: Upload/Manage media objects
CREATE POLICY "Authenticated media upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated media update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated media delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media');
