/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Main Application Core & Global UI Enhancements
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Sticky Glass Navbar Scroll Effect
  const navbar = document.querySelector('.navbar-main');
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
  }

  // 2. Synchronous & Asynchronous Contact & Branding Hydration
  function applyBusinessData(business) {
    if (!business) return;

    // Update Brand Logos
    if (business.logoUrl || business.logo_url) {
      const logo = business.logoUrl || business.logo_url;
      document.querySelectorAll('[data-bind="brand-logo"], img.logo-img, .navbar-brand img').forEach(el => {
        el.src = logo;
      });
    }

    if (business.footerLogoUrl || business.footer_logo_url || business.logoUrl || business.logo_url) {
      const footerLogo = business.footerLogoUrl || business.footer_logo_url || business.logoUrl || business.logo_url;
      document.querySelectorAll('[data-bind="footer-brand-logo"], img.footer-brand-logo').forEach(el => {
        el.src = footerLogo;
      });
    }

    // Update Hero Headlines & Description if on Homepage
    if (business.heroBadge || business.hero_badge) {
      document.querySelectorAll('[data-bind="hero-badge"]').forEach(el => {
        el.innerHTML = `<i class="bi bi-stars"></i> ${business.heroBadge || business.hero_badge}`;
      });
    }
    if (business.heroTitle || business.hero_title) {
      document.querySelectorAll('[data-bind="hero-title"]').forEach(el => {
        el.innerHTML = `${business.heroTitle || business.hero_title} <br><span class="gold-text">${business.heroSubtitle || business.hero_subtitle || ''}</span>`;
      });
    }
    if (business.heroDesc || business.hero_desc) {
      document.querySelectorAll('[data-bind="hero-desc"]').forEach(el => {
        el.textContent = business.heroDesc || business.hero_desc;
      });
    }

    // Update Phone Link Elements
    document.querySelectorAll('[data-bind="primary-phone"]').forEach(el => {
      el.textContent = business.primaryPhone || business.primary_phone || '+91 9677476609';
    });
    document.querySelectorAll('[data-bind="primary-phone-href"]').forEach(el => {
      el.href = `tel:${(business.primaryPhone || business.primary_phone || '+919677476609').replace(/[^0-9+]/g, '')}`;
    });

    // Update Secondary Phone
    document.querySelectorAll('[data-bind="secondary-phone"]').forEach(el => {
      el.textContent = business.secondaryPhone || business.secondary_phone || '+91 9442779796';
    });
    document.querySelectorAll('[data-bind="secondary-phone-href"]').forEach(el => {
      el.href = `tel:${(business.secondaryPhone || business.secondary_phone || '+919442779796').replace(/[^0-9+]/g, '')}`;
    });

    // Update WhatsApp Elements
    const waNumber = business.whatsapp || business.whatsapp_number || '+91 9442779796';
    const waDigits = waNumber.replace(/[^0-9]/g, '');
    document.querySelectorAll('[data-bind="whatsapp-phone"]').forEach(el => {
      el.textContent = waNumber;
    });
    document.querySelectorAll('[data-bind="whatsapp-href"]').forEach(el => {
      const message = encodeURIComponent('Hello Libin Catering, I would like to enquire about your catering services.');
      el.href = `https://wa.me/${waDigits || '919442779796'}?text=${message}`;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    });

    // Update Email Elements
    document.querySelectorAll('[data-bind="business-email"]').forEach(el => {
      el.textContent = business.email || 'libincateringservice@gmail.com';
    });
    document.querySelectorAll('[data-bind="business-email-href"]').forEach(el => {
      el.href = `mailto:${business.email || 'libincateringservice@gmail.com'}`;
    });

    // Update Address & Hours
    document.querySelectorAll('[data-bind="business-address"]').forEach(el => {
      el.textContent = business.address || 'Libin Catering Services, Tamil Nadu, India';
    });
    document.querySelectorAll('[data-bind="business-hours"]').forEach(el => {
      el.textContent = business.openingHours || business.opening_hours || 'Mon - Sun: 7:00 AM - 10:30 PM (24/7 Event Booking)';
    });

    // Update Google Maps & Reviews Elements
    document.querySelectorAll('[data-bind="map-embed-src"]').forEach(el => {
      if (business.mapEmbedUrl || business.map_embed_url) el.src = business.mapEmbedUrl || business.map_embed_url;
    });
    document.querySelectorAll('[data-bind="google-maps-href"]').forEach(el => {
      if (business.googleMapsUrl) {
        el.href = business.googleMapsUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      }
    });
    document.querySelectorAll('[data-bind="google-reviews-href"]').forEach(el => {
      if (business.googleReviewsUrl) {
        el.href = business.googleReviewsUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      }
    });
    document.querySelectorAll('[data-bind="google-rating"]').forEach(el => {
      el.textContent = business.googleRating || '4.9';
    });
    document.querySelectorAll('[data-bind="google-review-count"]').forEach(el => {
      el.textContent = business.googleReviewCount || '150+';
    });
  }

  // Initial synchronous population from APP_CONFIG
  applyBusinessData(window.APP_CONFIG && window.APP_CONFIG.business);

  // Async refresh from Supabase
  if (window.DB && window.DB.getContactInfo) {
    window.DB.getContactInfo().then(data => {
      if (data) applyBusinessData(data);
    }).catch(err => console.warn('Contact info load notice:', err));
  }

  // 3. Global Toast Notification System
  window.showToast = function (message, type = 'success') {
    let toast = document.querySelector('.custom-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'custom-toast';
      document.body.appendChild(toast);
    }

    const icon = type === 'success' ? 'bi-check-circle-fill text-gold' : 'bi-exclamation-triangle-fill text-danger';
    toast.innerHTML = `<i class="bi ${icon} fs-5"></i> <span>${message}</span>`;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  };

  // 4. Quick Event Enquiry Modal Event Listener
  document.querySelectorAll('[data-action="open-enquiry-modal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalEl = document.getElementById('globalEnquiryModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      } else {
        window.location.href = 'contact.html#enquiry-form';
      }
    });
  });

  // 5. Global Enquiry Form Handler (inside modal if present)
  const globalModalForm = document.getElementById('modalEnquiryForm');
  if (globalModalForm) {
    globalModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = globalModalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Submitting...`;

      const formData = {
        name: globalModalForm.name.value.trim(),
        phone: globalModalForm.phone.value.trim(),
        event_type: globalModalForm.event_type.value,
        event_date: globalModalForm.event_date.value,
        guest_count: parseInt(globalModalForm.guest_count.value || '0', 10),
        message: globalModalForm.message ? globalModalForm.message.value.trim() : ''
      };

      try {
        await window.DB.submitEnquiry(formData);
        window.showToast('Enquiry received! Our team will contact you shortly.', 'success');
        globalModalForm.reset();
        const modalEl = document.getElementById('globalEnquiryModal');
        if (modalEl) {
          bootstrap.Modal.getInstance(modalEl).hide();
        }
      } catch (err) {
        console.error(err);
        window.showToast('Failed to submit enquiry. Please call us directly.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // 6. Dynamic Hero Culinary Slider Controller
  const heroSliderContainer = document.getElementById('heroSlider');
  const heroNavContainer = document.getElementById('heroSliderNav');

  async function initHeroSlider() {
    if (!heroSliderContainer) return;

    let slides = [];
    if (window.DB && window.DB.getHeroSlides) {
      try {
        slides = await window.DB.getHeroSlides({ activeOnly: true });
      } catch (e) {
        console.warn('Hero slides load error:', e);
      }
    }

    if (slides && slides.length > 0) {
      // Re-render hero slider dynamically
      let slidesHtml = '';
      let navHtml = '<span class="small text-white-50 me-1"><i class="bi bi-fire text-gold me-1"></i> Border Specialties:</span>';

      slides.forEach((slide, idx) => {
        const activeClass = idx === 0 ? 'active' : '';
        slidesHtml += `<div class="hero-slide ${activeClass}" style="background-image: url('${slide.image_url}');" data-index="${idx}" data-dish="${slide.dish_name || slide.title}"></div>`;
        navHtml += `
          <button type="button" class="hero-slider-dot ${activeClass}" data-slide="${idx}">
            <span class="dot-indicator"></span> ${slide.nav_label || slide.title}
          </button>
        `;
      });
      slidesHtml += `<div class="hero-slider-overlay"></div>`;

      heroSliderContainer.innerHTML = slidesHtml;
      if (heroNavContainer) heroNavContainer.innerHTML = navHtml;
    }

    // Attach slider controllers
    const heroSlides = heroSliderContainer.querySelectorAll('.hero-slide');
    const heroDots = heroNavContainer ? heroNavContainer.querySelectorAll('.hero-slider-dot') : [];
    if (heroSlides.length === 0) return;

    let currentSlide = 0;
    let sliderTimer = null;

    function goToSlide(index) {
      heroSlides.forEach((slide, i) => {
        if (i === index) slide.classList.add('active');
        else slide.classList.remove('active');
      });

      heroDots.forEach((dot, i) => {
        if (i === index) dot.classList.add('active');
        else dot.classList.remove('active');
      });

      currentSlide = index;
    }

    function startSlider() {
      if (sliderTimer) clearInterval(sliderTimer);
      sliderTimer = setInterval(() => {
        const nextIndex = (currentSlide + 1) % heroSlides.length;
        goToSlide(nextIndex);
      }, 5500);
    }

    heroDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(idx)) {
          goToSlide(idx);
          startSlider();
        }
      });
    });

    startSlider();
  }

  initHeroSlider();

  // 7. Dynamic Signature Services Hydration
  const signatureServicesGrid = document.getElementById('signatureServicesGrid');
  async function initSignatureServices() {
    if (!signatureServicesGrid || !window.DB || !window.DB.getServices) return;

    try {
      const services = await window.DB.getServices({ activeOnly: true });
      if (services && services.length > 0) {
        let html = '';
        services.forEach(svc => {
          const icon = svc.icon || 'bi-heart-fill';
          const link = svc.link_url || `contact.html?service=${encodeURIComponent(svc.title)}#enquiry-form`;
          const btnText = svc.button_text || 'Enquire Service';
          const img = svc.image_url || 'assets/images/hero-slide-1.jpg';

          html += `
            <div class="col-md-6 col-lg-4">
              <div class="service-card">
                <img src="${img}" alt="${svc.title}" class="service-card-img" loading="lazy">
                <div class="service-card-overlay">
                  <div class="service-icon-wrap"><i class="bi ${icon}"></i></div>
                  <h3 class="service-title font-serif">${svc.title}</h3>
                  <p class="service-desc">${svc.description}</p>
                  <a href="${link}" class="service-link">${btnText} <i class="bi bi-arrow-right"></i></a>
                </div>
              </div>
            </div>
          `;
        });
        signatureServicesGrid.innerHTML = html;
        if (window.refreshScrollAnimations) window.refreshScrollAnimations();
      }
    } catch (err) {
      console.warn('Services load warning:', err);
    }
  }

  await initSignatureServices();
  if (window.refreshScrollAnimations) window.refreshScrollAnimations();
});

