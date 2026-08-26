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

  // Fallback Mock Data with Authentic Local Kanyakumari-Kerala Border Catering Images
  const MOCK_CATEGORIES = [
    { id: 'c1', name: 'Biryani', slug: 'biryani', description: 'Authentic wood-fired seeraga samba & kaima dum biryanis slow-cooked in giant copper chembus.', image_url: 'assets/images/hero-slide-1.jpg', display_order: 1, is_active: true },
    { id: 'c2', name: 'Parotta', slug: 'parotta', description: 'Flaky layered Malabar & Nool parottas made live on sizzling outdoor tawas with rich salna.', image_url: 'assets/images/hero-slide-2.jpg', display_order: 2, is_active: true },
    { id: 'c3', name: 'Sadhya & Meals', slug: 'meals', description: 'Traditional banana leaf pankthi feast featuring 24 authentic items served with pure cow ghee.', image_url: 'assets/images/hero-slide-4.jpg', display_order: 3, is_active: true },
    { id: 'c4', name: 'Live Counters', slug: 'breakfast', description: 'Live ghee roast dosa, idiyappam, tandoori grills, and hot parotta stations.', image_url: 'assets/images/hero-slide-3.jpg', display_order: 4, is_active: true },
    { id: 'c5', name: 'Non-Veg Specialties', slug: 'lunch', description: 'Kerala Kozhi Porichathu (Chicken Fry), Mutton Chukka, and coastal fish roasts.', image_url: 'assets/images/south-indian-feast.jpg', display_order: 5, is_active: true },
    { id: 'c6', name: 'Evening Buffets', slug: 'dinner', description: 'Grand outdoor lawn wedding buffets with curved chafing lines and live stations.', image_url: 'assets/images/hero-slide-3.jpg', display_order: 6, is_active: true },
    { id: 'c7', name: 'Desserts & Payasam', slug: 'desserts', description: 'Traditional Elaneer Payasam, Ada Pradhaman, and hot jalebis.', image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=1000&auto=format&fit=crop', display_order: 7, is_active: true },
    { id: 'c8', name: 'Welcome Beverages', slug: 'beverages', description: 'Chilled tender coconut punches, spiced kulukki sarbath, and South Indian filter coffee.', image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000&auto=format&fit=crop', display_order: 8, is_active: true }
  ];

  const MOCK_MENU = [
    { id: 'm1', category_id: 'c1', name: 'Wood-Fired Mutton Dum Biryani', slug: 'signature-mutton-dum-biryani', description: 'Tender mutton slow-cooked with aged Seeraga Samba rice in giant copper degh over woodfire hearths.', dietary_type: 'non-veg', price: null, is_price_on_enquiry: true, image_url: 'assets/images/hero-slide-1.jpg', is_featured: true, is_available: true, display_order: 1 },
    { id: 'm2', category_id: 'c1', name: 'Malabar Thalassery Chicken Biryani', slug: 'thalassery-chicken-biryani', description: 'Fragrant Kaima rice, succulent chicken, fried cashews, raisins, and authentic border spices.', dietary_type: 'non-veg', price: null, is_price_on_enquiry: true, image_url: 'assets/images/hero-slide-1.jpg', is_featured: true, is_available: true, display_order: 2 },
    { id: 'm3', category_id: 'c2', name: 'Live Malabar & Nool Parotta with Chicken Salna', slug: 'malabar-nool-parotta-salna', description: 'Hot flaky layered string parottas flipped live on commercial tawa with rich spicy salna gravy.', dietary_type: 'non-veg', price: null, is_price_on_enquiry: true, image_url: 'assets/images/hero-slide-2.jpg', is_featured: true, is_available: true, display_order: 3 },
    { id: 'm4', category_id: 'c3', name: 'Traditional Banana Leaf Sadhya (24 Items)', slug: 'grand-banana-leaf-sadhya', description: 'Authentic wedding feast with red matta rice, dal parippu, avial, thoran, olan, pachadi, payasam, and papadums.', dietary_type: 'veg', price: null, is_price_on_enquiry: true, image_url: 'assets/images/hero-slide-4.jpg', is_featured: true, is_available: true, display_order: 4 },
    { id: 'm5', category_id: 'c5', name: 'Kerala Kozhi Porichathu (Crispy Chicken Fry)', slug: 'kerala-kozhi-porichathu', description: 'Crisp spicy chicken fry garnished with fried curry leaves, crushed garlic, and green chillies.', dietary_type: 'non-veg', price: null, is_price_on_enquiry: true, image_url: 'assets/images/south-indian-feast.jpg', is_featured: true, is_available: true, display_order: 5 },
    { id: 'm6', category_id: 'c4', name: 'Live Ghee Roast Dosa & Idli Station', slug: 'live-dosa-idli-station', description: 'Golden crispy paper roast dosas, fluffy idlis, 4 chutneys, and hot drumstick sambar on live griddle.', dietary_type: 'veg', price: null, is_price_on_enquiry: true, image_url: 'assets/images/hero-slide-3.jpg', is_featured: true, is_available: true, display_order: 6 },
    { id: 'm7', category_id: 'c4', name: 'Steamed Idiyappam & Appam with Stew', slug: 'idiyappam-appam-stew', description: 'Delicate string hoppers and lace appams served with rich coconut milk vegetable or chicken stew.', dietary_type: 'veg', price: null, is_price_on_enquiry: true, image_url: 'assets/images/south-indian-feast.jpg', is_featured: true, is_available: true, display_order: 7 },
    { id: 'm8', category_id: 'c7', name: 'Tender Coconut (Elaneer) Payasam', slug: 'tender-coconut-payasam', description: 'Rich silky dessert crafted from fresh tender coconut pulp, condensed milk, cardamom, and roasted nuts.', dietary_type: 'veg', price: null, is_price_on_enquiry: true, image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=1000&auto=format&fit=crop', is_featured: true, is_available: true, display_order: 8 }
  ];

  const MOCK_EVENTS = [
    { id: 'e1', title: 'Grand Wood-Fired Wedding Feast', slug: 'grand-wood-fired-wedding-feast', event_type: 'Wedding Catering', event_date: '2026-06-15', guest_count: 1500, location: 'Wedding Mandapam, Nagercoil', description: 'Authentic 1,500-guest outdoor wood-fired Dum Biryani and live catering counters amidst lush tropical coconut palms.', cover_image_url: 'assets/images/hero-slide-1.jpg', is_featured: true, is_published: true, display_order: 1 },
    { id: 'e2', title: 'Kanyakumari Evening Reception & Live Parotta', slug: 'kanyakumari-evening-reception', event_type: 'Wedding Reception', event_date: '2026-07-20', guest_count: 900, location: 'Coastal Event Lawn, Kanyakumari', description: 'Open-air evening reception featuring live Malabar Nool Parotta tawas, chicken chukka, and grand hospitality.', cover_image_url: 'assets/images/hero-slide-2.jpg', is_featured: true, is_published: true, display_order: 2 },
    { id: 'e3', title: 'Traditional Pankthi Sadhya Wedding Banquet', slug: 'traditional-pankthi-sadhya-banquet', event_type: 'Traditional Sadhya', event_date: '2026-08-10', guest_count: 850, location: 'Convention Hall, Kaliyakkavilai / Marthandam', description: 'Classic 24-dish Banana Leaf Pankthi feast served with silver-standard hospitality by our uniformed catering team.', cover_image_url: 'assets/images/hero-slide-4.jpg', is_featured: true, is_published: true, display_order: 3 },
    { id: 'e4', title: 'Grand Lawn Wedding Buffet & Live Dosa Counters', slug: 'grand-lawn-wedding-buffet', event_type: 'Outdoor Catering', event_date: '2026-09-05', guest_count: 1200, location: 'Resort Lawn, Tamil Nadu - Kerala Border', description: 'Curved illuminated catering buffet line, live ghee roast dosa stations, and charcoal skewers for 1,200 guests.', cover_image_url: 'assets/images/hero-slide-3.jpg', is_featured: true, is_published: true, display_order: 4 }
  ];

  const MOCK_GALLERY = [
    { id: 'g1', title: 'Wood-Fired Dum Biryani in Giant Chembu', category: 'Food', image_url: 'assets/images/hero-slide-1.jpg', caption: 'Master cooks preparing aromatic Dum Biryani in copper cauldrons over firewood hearths', is_published: true, display_order: 1 },
    { id: 'g2', title: 'Live Parotta & Salna Tawa Counter', category: 'Live Counters', image_url: 'assets/images/hero-slide-2.jpg', caption: 'Live outdoor counter flipping hot layered Malabar & Nool Parottas with simmering salna', is_published: true, display_order: 2 },
    { id: 'g3', title: 'Traditional Banana Leaf Pankthi Sadhya', category: 'Sadhya', image_url: 'assets/images/hero-slide-4.jpg', caption: 'Uniformed catering staff serving steaming hot dal parippu, ghee, and rice on fresh banana leaves', is_published: true, display_order: 3 },
    { id: 'g4', title: 'Grand Wedding Lawn Buffet & Dosa Line', category: 'Buffets', image_url: 'assets/images/hero-slide-3.jpg', caption: 'Illuminated evening catering buffet line with live ghee roast dosas and charcoal skewers', is_published: true, display_order: 4 },
    { id: 'g5', title: 'Signature 4-Dish Combination Feast', category: 'Food', image_url: 'assets/images/south-indian-feast.jpg', caption: 'Sadhya, Nool Parotta, crispy Kerala Chicken Fry, and steamed Idiyappam presentation', is_published: true, display_order: 5 },
    { id: 'g6', title: 'Professional Catering Team in Action', category: 'Events', image_url: 'assets/images/hero-slide-4.jpg', caption: 'Our dedicated, well-trained service staff delivering seamless guest hospitality', is_published: true, display_order: 6 },
    { id: 'g7', title: 'Evening Open-Air Reception Service', category: 'Celebrations', image_url: 'assets/images/hero-slide-2.jpg', caption: 'Festive outdoor event ambiance under coconut palms with live culinary stations', is_published: true, display_order: 7 },
    { id: 'g8', title: 'Master Chef Dum Biryani Service', category: 'Weddings', image_url: 'assets/images/hero-slide-1.jpg', caption: 'Chef serving steaming hot Dum Biryani at outdoor wedding pandal', is_published: true, display_order: 8 }
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
