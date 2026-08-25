# Libin Catering Service & Event Management

A modern, production-ready website and administrative dashboard for **Libin Catering Service & Event Management**. Built with modern HTML5, CSS3, Vanilla JavaScript, Bootstrap 5.3, GSAP animations, and integrated with **Supabase (Auth, Database, Storage, RLS)**.

---

## 🌟 Key Features

### Public Website
- **Cinematic Homepage (`index.html`)**: Hero section with dark overlay and gold accents, brand story, signature services cards with hover zooms, dynamic featured menu, real events showcase, gallery preview, customer testimonials, and contact footer.
- **Brand Story (`about.html`)**: Heritage, 4 pillars of culinary excellence, kitchen hygiene standards, live cooking stations, and interactive FAQ accordion.
- **Interactive Menu (`menu.html`)**: Category filter tabs (Biryani, Parotta, Meals, Breakfast, Lunch, Dinner, Desserts, Beverages), live keyword search, vegetarian/non-vegetarian filter tags, and direct event booking links.
- **Events & Banquets (`events.html`)**: Showcase of weddings, receptions, and corporate galas with dates, locations, and guest capacities.
- **Photo Gallery (`gallery.html`)**: Filterable masonry grid with full-screen responsive Lightbox viewer.
- **Contact & Custom Enquiry Form (`contact.html`)**: Direct click-to-call, WhatsApp click-to-chat, email, interactive Google Maps location, and custom multi-step event enquiry form with validation.
- **Mobile First**: Fixed mobile quick action bar with instant Call, WhatsApp, and Plan Event modal triggers.

### Back-Office Admin Portal (`/admin`)
- **Supabase Authentication (`admin/login.html`)**: Secure email/password login and route protection.
- **Dashboard (`admin/dashboard.html`)**: Metrics for Menu Items, Categories, Upcoming Events, and New Enquiries, with recent enquiry pipeline feed.
- **Menu Management (`admin/menu.html`)**: Full CRUD operations, category selector, dietary indicators, price/enquire flag, featured toggles.
- **Category Management (`admin/categories.html`)**: Create, edit, and organize menu categories with display order.
- **Events Management (`admin/events.html`)**: Manage showcased events, guest counts, event types, and cover images.
- **Enquiry Pipeline (`admin/enquiries.html`)**: Track customer enquiries across statuses (*New, Contacted, In Discussion, Confirmed, Completed, Cancelled*) and manage internal notes.
- **Gallery Management (`admin/gallery.html`)**: Upload and categorize photo moments.
- **Contact & Business Settings (`admin/contact.html`)**: Real-time management of phone numbers, WhatsApp, email, physical address, and hours.

---

## 🚀 Running Locally

You can serve the static site locally with any local web server:

### Option 1: Python Built-in Server
```bash
# Inside D:\LIBIN-CATERING
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Node.js `serve` / `http-server`
```bash
npx serve .
```

### Option 3: VS Code Live Server Extension
Right-click `index.html` and choose **"Open with Live Server"**.

---

## 🗄️ Supabase Backend Setup

### 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Under **Project Settings -> API**, copy your:
   - **Project URL** (`https://xyzcompany.supabase.co`)
   - **anon / public key** (`eyJhbGci...`)

### 2. Run the SQL Schemas
1. In the Supabase dashboard, navigate to the **SQL Editor**.
2. Open and run the contents of [`supabase-schema.sql`](supabase-schema.sql). This will create all required tables (`categories`, `menu_items`, `events`, `enquiries`, `gallery`, `contact_information`, `site_settings`), triggers, and seed data.
3. Open and run the contents of [`supabase-rls.sql`](supabase-rls.sql). This will apply strict Row Level Security policies.

### 3. Create an Admin User
1. In Supabase Dashboard, go to **Authentication -> Users**.
2. Click **Add User -> Create User** and specify the administrator email (e.g. `admin@libincatering.com`) and a strong password.

### 4. Connect the Frontend
Update `js/config.js` with your Supabase credentials:
```javascript
window.APP_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_PUBLISHABLE_KEY',
  // ...
};
```
*(Note: The website includes a built-in mock data provider and local storage fallback, so it runs out-of-the-box even before connecting Supabase!)*

---

## 🌐 Netlify Deployment

1. Initialize Git repository and commit your files:
   ```bash
   git add .
   git commit -m "Initial commit: Libin Catering website and admin portal"
   ```
2. Push to your GitHub / GitLab repository.
3. In [Netlify](https://app.netlify.com):
   - Click **Add new site -> Import an existing project**.
   - Select your repository.
   - Set Build command: *(leave blank for static)*.
   - Set Publish directory: `.`.
4. Deploy! Netlify will automatically read `netlify.toml` for clean redirects and security headers.

---

## 🔒 Security Audit & Best Practices

- Frontend code **NEVER** contains `service_role` keys, secret keys, or database passwords.
- Only the public `anon` publishable key is used in client scripts.
- Unauthenticated visitors can only read published/active data and submit enquiries.
- All modifications (INSERT, UPDATE, DELETE) require an authenticated Supabase session validated by PostgreSQL RLS.
- `.env` files are ignored via `.gitignore`.
