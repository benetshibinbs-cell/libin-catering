-- =============================================================================
-- LIBIN CATERING SERVICE & EVENT MANAGEMENT
-- SUPABASE DATABASE SCHEMA (PostgreSQL DDL)
-- =============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Automated Updated_At Trigger Function
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 3. Table: Categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories (is_active);

-- -----------------------------------------------------------------------------
-- 4. Table: Menu Items
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL,
    description TEXT,
    dietary_type VARCHAR(30) NOT NULL DEFAULT 'non-veg' CHECK (dietary_type IN ('veg', 'non-veg', 'egg', 'halal')),
    price NUMERIC(10, 2) DEFAULT NULL,
    is_price_on_enquiry BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items (category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON public.menu_items (is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items (is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_dietary ON public.menu_items (dietary_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON public.menu_items (display_order ASC);

-- -----------------------------------------------------------------------------
-- 5. Table: Events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL,
    event_type VARCHAR(100) NOT NULL DEFAULT 'Wedding',
    event_date DATE,
    guest_count INTEGER,
    location VARCHAR(200),
    description TEXT,
    cover_image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_events_published ON public.events (is_published);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events (event_type);

-- -----------------------------------------------------------------------------
-- 6. Table: Enquiries
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    venue VARCHAR(250),
    guest_count INTEGER,
    budget_range VARCHAR(100),
    services_required TEXT[] DEFAULT '{}',
    food_preferences TEXT[] DEFAULT '{}',
    message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Discussion', 'Confirmed', 'Completed', 'Cancelled')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_enquiries_updated_at
BEFORE UPDATE ON public.enquiries
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_event_date ON public.enquiries (event_date);

-- -----------------------------------------------------------------------------
-- 7. Table: Gallery
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150),
    category VARCHAR(80) NOT NULL DEFAULT 'Food' CHECK (category IN ('Food', 'Events', 'Weddings', 'Decoration', 'Buffets', 'Celebrations')),
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_gallery_updated_at
BEFORE UPDATE ON public.gallery
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery (category);
CREATE INDEX IF NOT EXISTS idx_gallery_published ON public.gallery (is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON public.gallery (display_order ASC);

-- -----------------------------------------------------------------------------
-- 8. Table: Contact Information & Branding
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(200) NOT NULL DEFAULT 'Libin Catering Service & Event Management',
    logo_url TEXT DEFAULT 'assets/images/logo.png',
    footer_logo_url TEXT DEFAULT 'assets/images/logo.png',
    hero_badge VARCHAR(150) DEFAULT 'Premium Catering & Event Management',
    hero_title VARCHAR(200) DEFAULT 'Exceptional Food.',
    hero_subtitle VARCHAR(200) DEFAULT 'Unforgettable Celebrations.',
    hero_desc TEXT DEFAULT 'Authentic flavours, thoughtful presentation and seamless catering for weddings, celebrations, corporate events and every occasion worth remembering.',
    primary_phone VARCHAR(30) NOT NULL DEFAULT '+91 9677476609',
    secondary_phone VARCHAR(30) DEFAULT '+91 9442779796',
    whatsapp_number VARCHAR(30) NOT NULL DEFAULT '+91 9442779796',
    email VARCHAR(150) NOT NULL DEFAULT 'libincateringservice@gmail.com',
    address TEXT NOT NULL DEFAULT 'Libin Catering Service, Main Road, Tamil Nadu, India',
    map_embed_url TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.3304938096355!2d77.1285269!3d8.3078817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05ab04435abe27%3A0x12a4c587ff77f9e!2sLibin%20Catering%20Services!5e0!3m2!1sen!2sin!4v1708850000000!5m2!1sen!2sin',
    opening_hours TEXT DEFAULT 'Mon - Sun: 7:00 AM - 10:30 PM (24/7 Event Support)',
    facebook_url TEXT DEFAULT 'https://facebook.com',
    instagram_url TEXT DEFAULT 'https://instagram.com',
    youtube_url TEXT DEFAULT 'https://youtube.com',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_contact_info_updated_at
BEFORE UPDATE ON public.contact_information
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- -----------------------------------------------------------------------------
-- 9. Table: Signature Services
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    icon VARCHAR(100) NOT NULL DEFAULT 'bi-heart-fill',
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    button_text VARCHAR(100) NOT NULL DEFAULT 'Enquire Service',
    link_url VARCHAR(250) NOT NULL DEFAULT 'contact.html#enquiry-form',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_services_order ON public.services (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services (is_active);

-- -----------------------------------------------------------------------------
-- 10. Table: Hero Banner Slides
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    dish_name VARCHAR(200) NOT NULL,
    nav_label VARCHAR(100) NOT NULL,
    subtitle VARCHAR(200),
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON public.hero_slides (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON public.hero_slides (is_active);

-- -----------------------------------------------------------------------------
-- 11. Table: Site Settings (Key-Value Store)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- =============================================================================
-- SEED INITIAL PRODUCTION DATA
-- =============================================================================

-- Seed Contact Information & Branding
INSERT INTO public.contact_information (
    business_name,
    logo_url,
    footer_logo_url,
    hero_badge,
    hero_title,
    hero_subtitle,
    hero_desc,
    primary_phone,
    secondary_phone,
    whatsapp_number,
    email,
    address,
    opening_hours
) VALUES (
    'Libin Catering Service & Event Management',
    'assets/images/logo.png',
    'assets/images/logo.png',
    'Premium Catering & Event Management',
    'Exceptional Food.',
    'Unforgettable Celebrations.',
    'Authentic flavours, thoughtful presentation and seamless catering for weddings, celebrations, corporate events and every occasion worth remembering.',
    '+91 9677476609',
    '+91 9442779796',
    '+91 9442779796',
    'libincateringservice@gmail.com',
    'Libin Catering Service & Event Management, Main Road, Tamil Nadu, India',
    'Monday - Sunday: 7:00 AM - 10:30 PM (24/7 Event Booking Available)'
) ON CONFLICT DO NOTHING;

-- Seed Categories
INSERT INTO public.categories (id, name, slug, description, image_url, display_order, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', 'Biryani', 'biryani', 'Authentic seeraga samba & basmati dum biryanis slow-cooked with aromatic spices and tender meats.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop', 1, true),
('c0000000-0000-0000-0000-000000000002', 'Parotta', 'parotta', 'Flaky, layered Malabar and Tamil parottas paired with rich salnas, gravies, and roasts.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1000&auto=format&fit=crop', 2, true),
('c0000000-0000-0000-0000-000000000003', 'Meals', 'meals', 'Royal South Indian banana leaf feast featuring traditional curries, payasams, and accompaniments.', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1000&auto=format&fit=crop', 3, true),
('c0000000-0000-0000-0000-000000000004', 'Breakfast', 'breakfast', 'Classic South Indian morning breakfast with fluffy idlis, crispy vadas, dosas, and chutneys.', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1000&auto=format&fit=crop', 4, true),
('c0000000-0000-0000-0000-000000000005', 'Lunch', 'lunch', 'Sumptuous afternoon banquet spreads with multi-course curries, aromatic rice varieties, and sides.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop', 5, true),
('c0000000-0000-0000-0000-000000000006', 'Dinner', 'dinner', 'Evening dining specials including tandoor delicacies, live roti counters, and rich entrees.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop', 6, true),
('c0000000-0000-0000-0000-000000000007', 'Desserts', 'desserts', 'Traditional Indian sweets, creamy payasams, royal puddings, and ice creams.', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=1000&auto=format&fit=crop', 7, true),
('c0000000-0000-0000-0000-000000000008', 'Beverages', 'beverages', 'Refreshing welcome drinks, tender coconut blends, fresh fruit punches, and South Indian filter coffee.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000&auto=format&fit=crop', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- Seed Menu Items
INSERT INTO public.menu_items (category_id, name, slug, description, dietary_type, is_price_on_enquiry, image_url, is_featured, is_available, display_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'Signature Mutton Dum Biryani', 'signature-mutton-dum-biryani', 'Tender young mutton slow-cooked with aged Seeraga Samba rice, saffron, mint, and secret royal spice blend.', 'non-veg', true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop', true, true, 1),
('c0000000-0000-0000-0000-000000000001', 'Thalassery Chicken Biryani', 'thalassery-chicken-biryani', 'Aromatic short grain kaima rice, succulent chicken, fried cashews, sultanas, and authentic Malabar spices.', 'non-veg', true, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1000&auto=format&fit=crop', true, true, 2),
('c0000000-0000-0000-0000-000000000001', 'Hyderabadi Shahi Veg Biryani', 'hyderabadi-shahi-veg-biryani', 'Exotic garden fresh vegetables, paneer cubes, saffron, fried onions, and long grain basmati cooked in dum.', 'veg', true, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000&auto=format&fit=crop', false, true, 3),
('c0000000-0000-0000-0000-000000000002', 'Crisp Malabar Coin Parotta with Chicken Roast', 'malabar-coin-parotta-chicken-roast', 'Golden buttery mini parottas served with slow-roasted spicy country chicken and caramelized shallots.', 'non-veg', true, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1000&auto=format&fit=crop', true, true, 4),
('c0000000-0000-0000-0000-000000000002', 'Nool Parotta with Veg Kurma', 'nool-parotta-veg-kurma', 'Delicate string-layered parotta paired with aromatic coconut milk vegetable kurma.', 'veg', true, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1000&auto=format&fit=crop', false, true, 5),
('c0000000-0000-0000-0000-000000000003', 'Grand Banana Leaf Sadhya (24 Items)', 'grand-banana-leaf-sadhya', 'Traditional South Indian wedding feast with Avial, Sambar, Rasam, Kaalan, Olan, Thoran, Payasam, and crispy papadums.', 'veg', true, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1000&auto=format&fit=crop', true, true, 6),
('c0000000-0000-0000-0000-000000000003', 'Royal Non-Veg Banquet Meals', 'royal-non-veg-banquet-meals', 'Hot steamed rice served with Chettinad Mutton Curry, Pepper Chicken Gravy, Fish Curry, boiled egg, and appalam.', 'non-veg', true, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop', true, true, 7),
('c0000000-0000-0000-0000-000000000004', 'Live Dosa & Idli Station', 'live-dosa-idli-station', 'Assorted hot dosas (Ghee Roast, Masala, Podi, Egg) with 4 signature chutneys and drumstick sambar.', 'veg', true, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1000&auto=format&fit=crop', true, true, 8),
('c0000000-0000-0000-0000-000000000007', 'Tender Coconut (Elaneer) Payasam', 'tender-coconut-payasam', 'Rich, silky dessert crafted from fresh tender coconut pulp, condensed milk, cardamom, and toasted nuts.', 'veg', true, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=1000&auto=format&fit=crop', true, true, 9),
('c0000000-0000-0000-0000-000000000008', 'Royal Saffron Tender Coconut Welcome Drink', 'royal-saffron-tender-coconut-drink', 'Chilled pure tender coconut water infused with Kashmiri saffron strands and mint essence.', 'veg', true, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000&auto=format&fit=crop', true, true, 10)
ON CONFLICT DO NOTHING;

-- Seed Events
INSERT INTO public.events (title, slug, event_type, event_date, guest_count, location, description, cover_image_url, is_featured, is_published, display_order) VALUES
('Royal Heritage Wedding Banquet', 'royal-heritage-wedding-banquet', 'Wedding', '2026-06-15', 1200, 'Grand Palace Convention Centre, Nagercoil', 'A majestic 1200-guest traditional wedding celebration with multi-cuisine live buffet, welcome mocktail lounge, and curated stage decoration.', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop', true, true, 1),
('Coastal Beach Wedding & Reception', 'coastal-beach-wedding-reception', 'Wedding', '2026-07-20', 800, 'Sunset Coastal Resort, Kanyakumari', 'Seaside evening reception featuring live seafood grill counters, tandoor stations, floral canopy, and luxury hospitality staff.', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop', true, true, 2),
('Corporate Annual Leadership Gala', 'corporate-annual-leadership-gala', 'Corporate Catering', '2026-08-10', 450, 'Apex Technology Park Auditorium', 'Sophisticated corporate dinner with silver-service dining, dessert banquet, and executive hospitality staff.', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000&auto=format&fit=crop', true, true, 3),
('Traditional Family Housewarming Feast', 'traditional-family-housewarming-feast', 'Custom Events', '2026-09-05', 350, 'Private Villa, Tirunelveli', 'Authentic 24-dish traditional banana leaf feast prepared on-site with utmost devotion and hygiene.', 'https://images.unsplash.com/photo-1528605248659-1440064c761d?q=80&w=1000&auto=format&fit=crop', false, true, 4)
ON CONFLICT DO NOTHING;

-- Seed Gallery
INSERT INTO public.gallery (title, category, image_url, caption, display_order, is_published) VALUES
('Grand Wedding Buffet Setup', 'Weddings', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop', 'Elegant 80-foot illuminated wedding buffet counter with live heating stations', 1, true),
('Authentic Dum Biryani Handi', 'Food', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop', 'Slow-cooked mutton dum biryani served straight from the copper deg', 2, true),
('Stage Floral Decor & Lighting', 'Decoration', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop', 'Bespoke floral mandap and stage backdrop crafted by our event decor team', 3, true),
('Traditional Sadhya Banana Leaf', 'Food', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1000&auto=format&fit=crop', 'Authentic festive sadhya spread with 24 traditional South Indian delicacies', 4, true),
('Professional Catering Staff in Uniform', 'Events', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop', 'Our courteous, well-trained service staff ensuring seamless hospitality', 5, true),
('Dessert & Fruit Carving Station', 'Buffets', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=1000&auto=format&fit=crop', 'Artisanal dessert bar with live payasam fountains and tropical fruit carvings', 6, true),
('Flaky Malabar Parotta Live Counter', 'Food', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1000&auto=format&fit=crop', 'Live griddle preparing steaming hot layered parottas', 7, true),
('Evening Reception Illumination', 'Celebrations', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000&auto=format&fit=crop', 'Cinematic outdoor dining ambiance for luxury evening weddings', 8, true)
ON CONFLICT DO NOTHING;

-- Seed Signature Services
INSERT INTO public.services (id, title, slug, icon, description, image_url, button_text, link_url, display_order, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'Wedding Catering', 'wedding-catering', 'bi-heart-fill', 'Grand multi-cuisine buffets, wood-fired dum biryanis, and traditional banana leaf wedding feasts tailored for your special day.', 'assets/images/hero-slide-1.jpg', 'Plan Wedding Feast', 'contact.html?service=Wedding%20Catering#enquiry-form', 1, true),
('a0000000-0000-0000-0000-000000000002', 'Event Catering', 'event-catering', 'bi-calendar-heart', 'Complete catering for engagements, housewarmings, birthday celebrations, and family anniversaries.', 'assets/images/hero-slide-2.jpg', 'Enquire Service', 'contact.html?service=Event%20Catering#enquiry-form', 2, true),
('a0000000-0000-0000-0000-000000000003', 'Decoration & Stage Setup', 'decoration-stage-setup', 'bi-flower1', 'Bespoke floral mandaps, thematic entrance arches, mood lighting, and luxury table scape styling.', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop', 'Explore Decor', 'contact.html?service=Decoration#enquiry-form', 3, true),
('a0000000-0000-0000-0000-000000000004', 'Professional Catering Staff', 'professional-catering-staff', 'bi-people-fill', 'Courteous, neatly uniformed, and seasoned captains and service staff ensuring silver-standard guest hospitality.', 'assets/images/hero-slide-4.jpg', 'Hire Staff', 'contact.html?service=Catering%20Staff#enquiry-form', 4, true),
('a0000000-0000-0000-0000-000000000005', 'Corporate Catering', 'corporate-catering', 'bi-briefcase-fill', 'Sophisticated executive dining, annual galas, breakfast boxes, and conference spreads tailored for enterprises.', 'https://images.unsplash.com/photo-1528605248659-1440064c761d?q=80&w=800&auto=format&fit=crop', 'Corporate Booking', 'contact.html?service=Corporate%20Catering#enquiry-form', 5, true),
('a0000000-0000-0000-0000-000000000006', 'Custom Events & Live Counters', 'custom-events-live-counters', 'bi-stars', 'Live dosa stations, sizzling grills, chaat counters, and custom dessert fountains customized to your preference.', 'assets/images/hero-slide-3.jpg', 'Customize Event', 'contact.html?service=Custom%20Events#enquiry-form', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Seed Hero Banner Slides
INSERT INTO public.hero_slides (id, title, dish_name, nav_label, subtitle, image_url, display_order, is_active) VALUES
('b0000000-0000-0000-0000-000000000001', 'Wood-Fired Mutton Dum Biryani', 'Kerala Malabar Dum Biryani', 'Wood-Fired Dum Biryani', 'Authentic slow-cooked copper cauldron biryani', 'assets/images/hero-slide-1.jpg', 1, true),
('b0000000-0000-0000-0000-000000000002', 'Authentic Kerala Nool Parotta', 'Authentic Kerala Nool Parotta', 'Live Parotta & Salna', 'Flaky layered live tawa parottas with rich salna', 'assets/images/hero-slide-2.jpg', 2, true),
('b0000000-0000-0000-0000-000000000003', 'Traditional Banana Leaf Sadhya', 'Traditional Kerala Sadhya Feast', 'Banana Leaf Sadhya', '24-item traditional royal wedding feast', 'assets/images/hero-slide-4.jpg', 3, true),
('b0000000-0000-0000-0000-000000000004', 'Grand Wedding Buffet & Counters', 'Grand South Indian Banquet & Live Counters', 'Grand Buffet & Live Counters', 'Illuminated lawn buffets and live catering stations', 'assets/images/hero-slide-3.jpg', 4, true)
ON CONFLICT DO NOTHING;
