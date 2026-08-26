/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Branding, Hero Banners & Contact Admin Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // ---------------------------------------------------------------------------
  // 1. Load All Settings & Pre-fill Forms
  // ---------------------------------------------------------------------------
  let contactData = {};
  let heroSlides = [];

  const heroModalEl = document.getElementById('heroSlideModal');
  let heroModal = null;
  if (heroModalEl && typeof bootstrap !== 'undefined') {
    heroModal = new bootstrap.Modal(heroModalEl);
  }

  async function loadAllData() {
    try {
      contactData = await window.DB.getContactInfo();
    } catch (e) {
      console.warn('Error loading contact info:', e);
      contactData = window.APP_CONFIG.business || {};
    }

    if (contactData) {
      // 1. Logos
      const headerLogo = contactData.logoUrl || contactData.logo_url || '../assets/images/logo.png';
      const footerLogo = contactData.footerLogoUrl || contactData.footer_logo_url || headerLogo;
      
      document.getElementById('logoUrlInput').value = contactData.logoUrl || contactData.logo_url || '';
      document.getElementById('footerLogoUrlInput').value = contactData.footerLogoUrl || contactData.footer_logo_url || '';
      document.getElementById('headerLogoPreview').src = headerLogo;
      document.getElementById('footerLogoPreview').src = footerLogo;

      // 2. Hero Headlines & Copy
      document.getElementById('heroBadgeInput').value = contactData.heroBadge || contactData.hero_badge || 'Premium Catering & Event Management';
      document.getElementById('heroTitleInput').value = contactData.heroTitle || contactData.hero_title || 'Exceptional Food.';
      document.getElementById('heroSubtitleInput').value = contactData.heroSubtitle || contactData.hero_subtitle || 'Unforgettable Celebrations.';
      document.getElementById('heroDescInput').value = contactData.heroDesc || contactData.hero_desc || 'Authentic flavours, thoughtful presentation and seamless catering for weddings, celebrations, corporate events and every occasion worth remembering.';

      // 3. Contact Details
      document.getElementById('businessName').value = contactData.business_name || contactData.name || 'Libin Catering Service & Event Management';
      document.getElementById('primaryPhone').value = contactData.primaryPhone || contactData.primary_phone || '+91 9677476609';
      document.getElementById('secondaryPhone').value = contactData.secondaryPhone || contactData.secondary_phone || '+91 9442779796';
      document.getElementById('whatsappNumber').value = contactData.whatsapp || contactData.whatsapp_number || '+91 9442779796';
      document.getElementById('businessEmail').value = contactData.email || 'libincateringservice@gmail.com';
      document.getElementById('businessAddress').value = contactData.address || 'Libin Catering Services, Tamil Nadu, India';
      document.getElementById('mapEmbedUrl').value = contactData.mapEmbedUrl || contactData.map_embed_url || '';
      document.getElementById('openingHours').value = contactData.openingHours || contactData.opening_hours || 'Monday - Sunday: 7:00 AM - 10:30 PM (24/7 Event Booking)';

      const social = contactData.social || {};
      document.getElementById('facebookUrl').value = social.facebook || contactData.facebook_url || '';
      document.getElementById('instagramUrl').value = social.instagram || contactData.instagram_url || '';
      document.getElementById('youtubeUrl').value = social.youtube || contactData.youtube_url || '';
    }

    await loadHeroSlidesTable();
  }

  // ---------------------------------------------------------------------------
  // 2. Logo Upload & Preview Handlers
  // ---------------------------------------------------------------------------
  const logoFileInput = document.getElementById('logoFileInput');
  const logoUrlInput = document.getElementById('logoUrlInput');
  const headerLogoPreview = document.getElementById('headerLogoPreview');

  const footerLogoFileInput = document.getElementById('footerLogoFileInput');
  const footerLogoUrlInput = document.getElementById('footerLogoUrlInput');
  const footerLogoPreview = document.getElementById('footerLogoPreview');

  if (logoFileInput) {
    logoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => { headerLogoPreview.src = ev.target.result; };
        reader.readAsDataURL(file);
      }
    });
  }

  if (logoUrlInput) {
    logoUrlInput.addEventListener('input', (e) => {
      if (e.target.value.trim()) headerLogoPreview.src = e.target.value.trim();
    });
  }

  if (footerLogoFileInput) {
    footerLogoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => { footerLogoPreview.src = ev.target.result; };
        reader.readAsDataURL(file);
      }
    });
  }

  if (footerLogoUrlInput) {
    footerLogoUrlInput.addEventListener('input', (e) => {
      if (e.target.value.trim()) footerLogoPreview.src = e.target.value.trim();
    });
  }

  // Save Logo Settings
  const logoForm = document.getElementById('logoSettingsForm');
  if (logoForm) {
    logoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btnSaveLogos');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Uploading & Saving...`;

      try {
        let logoUrl = logoUrlInput.value.trim();
        let footerLogoUrl = footerLogoUrlInput.value.trim();

        if (logoFileInput && logoFileInput.files[0]) {
          const uploaded = await window.DB.uploadImageFile(logoFileInput.files[0], 'branding');
          if (uploaded) logoUrl = uploaded;
        }

        if (footerLogoFileInput && footerLogoFileInput.files[0]) {
          const uploaded = await window.DB.uploadImageFile(footerLogoFileInput.files[0], 'branding');
          if (uploaded) footerLogoUrl = uploaded;
        }

        const payload = {
          logo_url: logoUrl || 'assets/images/logo.png',
          footer_logo_url: footerLogoUrl || logoUrl || 'assets/images/logo.png'
        };

        await window.DB.saveContactInfo(payload);
        if (window.showToast) window.showToast('Brand logo settings updated and synced with Supabase!');
        
        // Dynamically update admin sidebar logo
        document.querySelectorAll('[data-bind="brand-logo"], img.logo-img').forEach(img => {
          img.src = payload.logo_url;
        });
      } catch (err) {
        console.error('Error saving logos:', err);
        if (window.showToast) window.showToast('Failed to save logos. Check console.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Hero Carousel Banner Slides Management
  // ---------------------------------------------------------------------------
  const heroTableBody = document.getElementById('heroSlidesTableBody');
  const addHeroBtn = document.getElementById('btnAddHeroSlide');
  const heroSlideForm = document.getElementById('heroSlideForm');
  const slideFileInput = document.getElementById('slideFileInput');
  const slideUrlInput = document.getElementById('slideImageUrl');
  const slidePreviewWrap = document.getElementById('slideImagePreviewWrap');
  const slidePreview = document.getElementById('slideImagePreview');

  function updateSlidePreview(url) {
    if (url && slidePreviewWrap && slidePreview) {
      slidePreview.src = url;
      slidePreviewWrap.style.display = 'block';
    } else if (slidePreviewWrap) {
      slidePreviewWrap.style.display = 'none';
    }
  }

  if (slideFileInput) {
    slideFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => updateSlidePreview(ev.target.result);
        reader.readAsDataURL(file);
      }
    });
  }

  if (slideUrlInput) {
    slideUrlInput.addEventListener('input', (e) => {
      if (e.target.value.trim()) updateSlidePreview(e.target.value.trim());
    });
  }

  async function loadHeroSlidesTable() {
    if (!heroTableBody) return;
    heroTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span> Loading hero slides...</td></tr>`;

    try {
      heroSlides = await window.DB.getHeroSlides({ activeOnly: false });
    } catch (e) {
      console.warn('Hero slides load error:', e);
      heroSlides = [];
    }

    if (heroSlides.length === 0) {
      heroTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No banner slides found. Click "Add Banner Slide" to create one.</td></tr>`;
      return;
    }

    let html = '';
    heroSlides.forEach(slide => {
      const statusBadge = slide.is_active !== false 
        ? '<span class="badge bg-success-subtle text-success">Active</span>' 
        : '<span class="badge bg-secondary-subtle text-secondary">Hidden</span>';

      const imgThumb = slide.image_url 
        ? `<img src="${slide.image_url}" class="rounded" style="width: 56px; height: 38px; object-fit: cover;">` 
        : '<div class="bg-light rounded" style="width: 56px; height: 38px;"></div>';

      html += `
        <tr>
          <td style="width: 70px;">${imgThumb}</td>
          <td><strong>${slide.dish_name || slide.title}</strong></td>
          <td><span class="badge bg-dark">${slide.nav_label || slide.title}</span></td>
          <td><small class="text-muted">${slide.subtitle || ''}</small></td>
          <td>${slide.display_order ?? 0}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit-slide" data-id="${slide.id}" title="Edit"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete-slide" data-id="${slide.id}" title="Delete"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
    });

    heroTableBody.innerHTML = html;

    heroTableBody.querySelectorAll('.btn-edit-slide').forEach(btn => {
      btn.addEventListener('click', () => openEditHeroSlideModal(btn.getAttribute('data-id')));
    });
    heroTableBody.querySelectorAll('.btn-delete-slide').forEach(btn => {
      btn.addEventListener('click', () => deleteHeroSlide(btn.getAttribute('data-id')));
    });
  }

  if (addHeroBtn) {
    addHeroBtn.addEventListener('click', () => {
      if (heroSlideForm) heroSlideForm.reset();
      document.getElementById('heroSlideId').value = '';
      if (slidePreviewWrap) slidePreviewWrap.style.display = 'none';
      document.getElementById('heroSlideModalTitle').textContent = 'Add Hero Banner Slide';
      if (heroModal) heroModal.show();
    });
  }

  function openEditHeroSlideModal(id) {
    const slide = heroSlides.find(s => String(s.id) === String(id));
    if (!slide) return;

    if (heroSlideForm) heroSlideForm.reset();
    document.getElementById('heroSlideId').value = slide.id;
    document.getElementById('slideDishName').value = slide.dish_name || slide.title || '';
    document.getElementById('slideNavLabel').value = slide.nav_label || slide.title || '';
    document.getElementById('slideSubtitle').value = slide.subtitle || '';
    document.getElementById('slideImageUrl').value = slide.image_url || '';
    document.getElementById('slideDisplayOrder').value = slide.display_order ?? 0;
    document.getElementById('slideIsActive').checked = slide.is_active !== false;

    updateSlidePreview(slide.image_url);
    document.getElementById('heroSlideModalTitle').textContent = 'Edit Hero Banner Slide';
    if (heroModal) heroModal.show();
  }

  if (heroSlideForm) {
    heroSlideForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btnSaveHeroSlide');
      const originalText = saveBtn.innerHTML;

      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Saving...`;

      try {
        let imageUrl = slideUrlInput.value.trim();
        const file = slideFileInput ? slideFileInput.files[0] : null;

        if (file) {
          saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Uploading...`;
          const uploadedUrl = await window.DB.uploadImageFile(file, 'hero-banners');
          if (uploadedUrl) imageUrl = uploadedUrl;
        }

        const id = document.getElementById('heroSlideId').value;
        const dishName = document.getElementById('slideDishName').value.trim();
        const navLabel = document.getElementById('slideNavLabel').value.trim();
        const subtitle = document.getElementById('slideSubtitle').value.trim();

        const payload = {
          title: dishName,
          dish_name: dishName,
          nav_label: navLabel,
          subtitle: subtitle,
          image_url: imageUrl || 'assets/images/hero-slide-1.jpg',
          display_order: parseInt(document.getElementById('slideDisplayOrder').value || '0', 10),
          is_active: document.getElementById('slideIsActive').checked
        };

        if (id) payload.id = id;

        await window.DB.saveHeroSlide(payload);
        if (window.showToast) window.showToast('Hero banner slide saved successfully!');
        if (heroModal) heroModal.hide();
        await loadHeroSlidesTable();
      } catch (err) {
        console.error('Error saving slide:', err);
        if (window.showToast) window.showToast('Failed to save slide.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
      }
    });
  }

  async function deleteHeroSlide(id) {
    if (!confirm('Are you sure you want to delete this hero banner slide?')) return;
    try {
      await window.DB.deleteHeroSlide(id);
      if (window.showToast) window.showToast('Hero banner slide deleted.');
      await loadHeroSlidesTable();
    } catch (err) {
      console.error('Error deleting slide:', err);
      if (window.showToast) window.showToast('Failed to delete slide.', 'error');
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Hero Headlines & Copy Form
  // ---------------------------------------------------------------------------
  const heroCopyForm = document.getElementById('heroCopyForm');
  if (heroCopyForm) {
    heroCopyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btnSaveHeroCopy');
      const originalText = saveBtn.innerHTML;

      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Saving...`;

      const payload = {
        hero_badge: document.getElementById('heroBadgeInput').value.trim(),
        hero_title: document.getElementById('heroTitleInput').value.trim(),
        hero_subtitle: document.getElementById('heroSubtitleInput').value.trim(),
        hero_desc: document.getElementById('heroDescInput').value.trim()
      };

      try {
        await window.DB.saveContactInfo(payload);
        if (window.showToast) window.showToast('Hero headlines and copy saved successfully!');
      } catch (err) {
        console.error('Error saving hero copy:', err);
        if (window.showToast) window.showToast('Failed to save hero copy.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Business Profile & Contact Details Form
  // ---------------------------------------------------------------------------
  const contactForm = document.getElementById('contactAdminForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btnSaveContact');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Saving...`;

      const payload = {
        business_name: document.getElementById('businessName').value.trim(),
        primary_phone: document.getElementById('primaryPhone').value.trim(),
        secondary_phone: document.getElementById('secondaryPhone').value.trim(),
        whatsapp_number: document.getElementById('whatsappNumber').value.trim(),
        email: document.getElementById('businessEmail').value.trim(),
        address: document.getElementById('businessAddress').value.trim(),
        map_embed_url: document.getElementById('mapEmbedUrl').value.trim(),
        opening_hours: document.getElementById('openingHours').value.trim(),
        facebook_url: document.getElementById('facebookUrl').value.trim(),
        instagram_url: document.getElementById('instagramUrl').value.trim(),
        youtube_url: document.getElementById('youtubeUrl').value.trim()
      };

      try {
        await window.DB.saveContactInfo(payload);
        if (window.showToast) window.showToast('Business & Contact settings updated successfully!');
      } catch (err) {
        console.error('Error saving contact settings:', err);
        if (window.showToast) window.showToast('Failed to save contact settings.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  await loadAllData();
});
