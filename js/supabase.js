/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Supabase Data Client with Graceful Fallbacks
 */

(function () {
  let supabaseClient = null;

  // Initialize Supabase Client if valid URL & Key are provided
  function initSupabase() {
    const config = window.APP_CONFIG || {};
    const url = config.supabaseUrl;
    const key = config.supabaseAnonKey;

    if (url && key && url.indexOf('your-project') === -1 && key.indexOf('your_publishable_key') === -1 && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(url, key);
        console.log('✅ Supabase client initialized successfully.');
      } catch (err) {
        console.warn('⚠️ Supabase init warning, fallback active:', err);
      }
    }
  }

  // Fallback Mock Data
  const MOCK_CATEGORIES = [
    { id: 'c1', name: 'Biryani', slug: 'biryani', description: 'Authentic seeraga samba & basmati dum biryanis slow-cooked with aromatic spices and tender meats.', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop', display_order: 1, is_active: true },
    { id: 'c2', name: 'Parotta', slug: 'parotta', description: 'Flaky, layered Malabar and Tamil parottas paired with rich salnas, gravies, and roasts.', image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1000&auto=format&fit=crop', display_order: 2, is_active: true },
    { id: 'c3', name: 'Meals', slug: 'meals', description: 'Royal South Indian banana leaf feast featuring traditional curries, payasams, and accompaniments.', image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1000&auto=format&fit=crop', display_order: 3, is_active: true },
    { id: 'c4', name: 'Breakfast', slug: 'breakfast', description: 'Classic South Indian morning breakfast with fluffy idlis, crispy vadas, dosas, and chutneys.', image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1000&auto=format&fit=crop', display_order: 4, is_active: true },
    { id: 'c5', name: 'Lunch', slug: 'lunch', description: 'Sumptuous afternoon banquet spreads with multi-course curries, aromatic rice varieties, and sides.', image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop', display_order: 5, is_active: true },
    { id: 'c6', name: 'Dinner', slug: 'dinner', description: 'Evening dining specials including tandoor delicacies, live roti counters, and rich entrees.', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop', display_order: 6, is_active: true },
    { id: 'c7', name: 'Desserts', slug: 'desserts', description: 'Traditional Indian sweets, creamy payasams, royal puddings, and ice creams.', image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=1000&auto=format&fit=crop', display_order: 7, is_active: true },
    { id: 'c8', name: 'Beverages', slug: 'beverages', description: 'Refreshing welcome drinks, tender coconut blends, fresh fruit punches, and South Indian filter coffee.', image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000&auto=format&fit=crop', display_order: 8, is_active: true }
  ];

  const MOCK_MENU = [
    { id: 'm1', category_id: 'c1', name: 'Signature Mutton Dum Biryani', slug: 'signature-mutton-dum-biryani', description: 'Tender young mutton slow-cooked with aged Seeraga Samba rice, saffron, mint, and secret royal spice blend.', dietary_type: 'non-veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_available: true, display_order: 1 },
    { id: 'm2', category_id: 'c1', name: 'Thalassery Chicken Biryani', slug: 'thalassery-chicken-biryani', description: 'Aromatic short grain kaima rice, succulent chicken, fried cashews, sultanas, and authentic Malabar spices.', dietary_type: 'non-veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_available: true, display_order: 2 },
    { id: 'm3', category_id: 'c1', name: 'Hyderabadi Shahi Veg Biryani', slug: 'hyderabadi-shahi-veg-biryani', description: 'Exotic garden fresh vegetables, paneer cubes, saffron, fried onions, and long grain basmati cooked in dum.', dietary_type: 'veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000&auto=format&fit=crop', is_featured: false, is_available: true, display_order: 3 },
    { id: 'm4', category_id: 'c2', name: 'Crisp Malabar Coin Parotta with Chicken Roast', slug: 'malabar-coin-parotta-chicken-roast', description: 'Golden buttery mini parottas served with slow-roasted spicy country chicken and caramelized shallots.', dietary_type: 'non-veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_available: true, display_order: 4 },
    { id: 'm5', category_id: 'c2', name: 'Nool Parotta with Veg Kurma', slug: 'nool-parotta-veg-kurma', description: 'Delicate string-layered parotta paired with aromatic coconut milk vegetable kurma.', dietary_type: 'veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1000&auto=format&fit=crop', is_featured: false, is_available: true, display_order: 5 },
    { id: 'm6', category_id: 'c3', name: 'Grand Banana Leaf Sadhya (24 Items)', slug: 'grand-banana-leaf-sadhya', description: 'Traditional South Indian wedding feast with Avial, Sambar, Rasam, Kaalan, Olan, Thoran, Payasam, and crispy papadums.', dietary_type: 'veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_available: true, display_order: 6 },
    { id: 'm7', category_id: 'c3', name: 'Royal Non-Veg Banquet Meals', slug: 'royal-non-veg-banquet-meals', description: 'Hot steamed rice served with Chettinad Mutton Curry, Pepper Chicken Gravy, Fish Curry, boiled egg, and appalam.', dietary_type: 'non-veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_available: true, display_order: 7 },
    { id: 'm8', category_id: 'c4', name: 'Live Dosa & Idli Station', slug: 'live-dosa-idli-station', description: 'Assorted hot dosas (Ghee Roast, Masala, Podi, Egg) with 4 signature chutneys and drumstick sambar.', dietary_type: 'veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_available: true, display_order: 8 },
    { id: 'm9', category_id: 'c7', name: 'Tender Coconut (Elaneer) Payasam', slug: 'tender-coconut-payasam', description: 'Rich, silky dessert crafted from fresh tender coconut pulp, condensed milk, cardamom, and toasted nuts.', dietary_type: 'veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_available: true, display_order: 9 },
    { id: 'm10', category_id: 'c8', name: 'Royal Saffron Tender Coconut Welcome Drink', slug: 'royal-saffron-tender-coconut-drink', description: 'Chilled pure tender coconut water infused with Kashmiri saffron strands and mint essence.', dietary_type: 'veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_available: true, display_order: 10 }
  ];

  const MOCK_EVENTS = [
    { id: 'e1', title: 'Royal Heritage Wedding Banquet', slug: 'royal-heritage-wedding-banquet', event_type: 'Wedding', event_date: '2026-06-15', guest_count: 1200, location: 'Grand Palace Convention Centre, Nagercoil', description: 'A majestic 1200-guest traditional wedding celebration with multi-cuisine live buffet, welcome mocktail lounge, and curated stage decoration.', cover_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_published: true, display_order: 1 },
    { id: 'e2', title: 'Coastal Beach Wedding & Reception', slug: 'coastal-beach-wedding-reception', event_type: 'Wedding', event_date: '2026-07-20', guest_count: 800, location: 'Sunset Coastal Resort, Kanyakumari', description: 'Seaside evening reception featuring live seafood grill counters, tandoor stations, floral canopy, and luxury hospitality staff.', cover_image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_published: true, display_order: 2 },
    { id: 'e3', title: 'Corporate Annual Leadership Gala', slug: 'corporate-annual-leadership-gala', event_type: 'Corporate Catering', event_date: '2026-08-10', guest_count: 450, location: 'Apex Technology Park Auditorium', description: 'Sophisticated corporate dinner with silver-service dining, dessert banquet, and executive hospitality staff.', cover_image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_published: true, display_order: 3 },
    { id: 'e4', title: 'Traditional Family Housewarming Feast', slug: 'traditional-family-housewarming-feast', event_type: 'Custom Events', event_date: '2026-09-05', guest_count: 350, location: 'Private Villa, Tirunelveli', description: 'Authentic 24-dish traditional banana leaf feast prepared on-site with utmost devotion and hygiene.', cover_image_url: 'https://images.unsplash.com/photo-1528605248659-1440064c761d?q=80&w=1000&auto=format&fit=crop', is_featured: false, is_published: true, display_order: 4 }
  ];

  const MOCK_GALLERY = [
    { id: 'g1', title: 'Grand Wedding Buffet Setup', category: 'Weddings', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop', caption: 'Elegant 80-foot illuminated wedding buffet counter with live heating stations', is_published: true, display_order: 1 },
    { id: 'g2', title: 'Authentic Dum Biryani Handi', category: 'Food', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop', caption: 'Slow-cooked mutton dum biryani served straight from the copper deg', is_published: true, display_order: 2 },
    { id: 'g3', title: 'Stage Floral Decor & Lighting', category: 'Decoration', image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop', caption: 'Bespoke floral mandap and stage backdrop crafted by our event decor team', is_published: true, display_order: 3 },
    { id: 'g4', title: 'Traditional Sadhya Banana Leaf', category: 'Food', image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1000&auto=format&fit=crop', caption: 'Authentic festive sadhya spread with 24 traditional South Indian delicacies', is_published: true, display_order: 4 },
    { id: 'g5', title: 'Professional Catering Staff in Uniform', category: 'Events', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop', caption: 'Our courteous, well-trained service staff ensuring seamless hospitality', is_published: true, display_order: 5 },
    { id: 'g6', title: 'Dessert & Fruit Carving Station', category: 'Buffets', image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=1000&auto=format&fit=crop', caption: 'Artisanal dessert bar with live payasam fountains and tropical fruit carvings', is_published: true, display_order: 6 },
    { id: 'g7', title: 'Flaky Malabar Parotta Live Counter', category: 'Food', image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1000&auto=format&fit=crop', caption: 'Live griddle preparing steaming hot layered parottas', is_published: true, display_order: 7 },
    { id: 'g8', title: 'Evening Reception Illumination', category: 'Celebrations', image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000&auto=format&fit=crop', caption: 'Cinematic outdoor dining ambiance for luxury evening weddings', is_published: true, display_order: 8 }
  ];

  // Public Data API
  window.DB = {
    getClient: () => {
      if (!supabaseClient) initSupabase();
      return supabaseClient;
    },

    isConfigured: () => {
      const config = window.APP_CONFIG || {};
      return !!(config.supabaseUrl && config.supabaseAnonKey && config.supabaseUrl.indexOf('your-project') === -1);
    },

    // Categories
    async getCategories() {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('categories').select('*').eq('is_active', true).order('display_order', { ascending: true });
        if (!error && data && data.length) return data;
      }
      return MOCK_CATEGORIES;
    },

    // Menu Items
    async getMenuItems({ categorySlug = 'all', searchQuery = '', dietary = 'all' } = {}) {
      const client = this.getClient();
      let items = MOCK_MENU;

      if (client) {
        let query = client.from('menu_items').select('*, categories(slug, name)').eq('is_available', true);
        if (dietary && dietary !== 'all') query = query.eq('dietary_type', dietary);
        const { data, error } = await query.order('display_order', { ascending: true });
        if (!error && data && data.length) {
          items = data;
        }
      }

      // Filter locally for fast search and smooth UX
      return items.filter(item => {
        const matchCategory = categorySlug === 'all' || 
          (item.categories && item.categories.slug === categorySlug) || 
          (item.category_id && MOCK_CATEGORIES.find(c => c.id === item.category_id)?.slug === categorySlug);
        
        const matchDietary = dietary === 'all' || item.dietary_type === dietary;
        
        const matchSearch = !searchQuery || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchCategory && matchDietary && matchSearch;
      });
    },

    // Events
    async getEvents({ publishedOnly = true } = {}) {
      const client = this.getClient();
      if (client) {
        let query = client.from('events').select('*');
        if (publishedOnly) query = query.eq('is_published', true);
        const { data, error } = await query.order('display_order', { ascending: true });
        if (!error && data && data.length) return data;
      }
      return MOCK_EVENTS;
    },

    // Gallery
    async getGallery({ category = 'all' } = {}) {
      const client = this.getClient();
      let items = MOCK_GALLERY;
      if (client) {
        let query = client.from('gallery').select('*').eq('is_published', true);
        if (category !== 'all') query = query.eq('category', category);
        const { data, error } = await query.order('display_order', { ascending: true });
        if (!error && data && data.length) return data;
      }
      if (category !== 'all') {
        items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
      }
      return items;
    },

    // Contact Information
    async getContactInfo() {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('contact_information').select('*').limit(1).single();
        if (!error && data) return data;
      }
      return window.APP_CONFIG.business;
    },

    // Submit Enquiry
    async submitEnquiry(payload) {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('enquiries').insert([payload]);
        if (error) throw error;
        return { success: true, data };
      }

      // Pre-Supabase fallback: store in localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('libin_offline_enquiries') || '[]');
        payload.id = 'local_' + Date.now();
        payload.created_at = new Date().toISOString();
        payload.status = 'New';
        saved.unshift(payload);
        localStorage.setItem('libin_offline_enquiries', JSON.stringify(saved));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      return { success: true, local: true };
    },

    // Upload Image File to Supabase Storage Bucket ('media')
    async uploadImageFile(file, folder = 'uploads') {
      if (!file) return null;
      const client = this.getClient();
      
      if (client && client.storage) {
        try {
          const fileExt = file.name.split('.').pop() || 'jpg';
          const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          
          const { data, error } = await client.storage.from('media').upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

          if (!error && data) {
            const { data: publicUrlData } = client.storage.from('media').getPublicUrl(fileName);
            if (publicUrlData && publicUrlData.publicUrl) {
              return publicUrlData.publicUrl;
            }
          } else if (error) {
            console.warn('Supabase storage upload error:', error.message);
          }
        } catch (e) {
          console.warn('Storage upload exception:', e);
        }
      }

      // Fallback: Read as base64 Data URL so the uploaded image displays and saves immediately
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }
  };

  // Run initial setup on load
  document.addEventListener('DOMContentLoaded', initSupabase);
})();
