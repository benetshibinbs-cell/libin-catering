/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Main Application Core & Global UI Enhancements
 */

document.addEventListener('DOMContentLoaded', () => {
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

  // 2. Populate Contact Elements Dynamically
  const business = (window.APP_CONFIG && window.APP_CONFIG.business) || {};
  
  // Update Phone Link Elements
  document.querySelectorAll('[data-bind="primary-phone"]').forEach(el => {
    el.textContent = business.primaryPhone || '+91 9677476609';
  });
  document.querySelectorAll('[data-bind="primary-phone-href"]').forEach(el => {
    el.href = `tel:${(business.primaryPhone || '+919677476609').replace(/[^0-9+]/g, '')}`;
  });

  // Update Secondary Phone
  document.querySelectorAll('[data-bind="secondary-phone"]').forEach(el => {
    el.textContent = business.secondaryPhone || '+91 9442779796';
  });
  document.querySelectorAll('[data-bind="secondary-phone-href"]').forEach(el => {
    el.href = `tel:${(business.secondaryPhone || '+919442779796').replace(/[^0-9+]/g, '')}`;
  });

  // Update WhatsApp Elements
  document.querySelectorAll('[data-bind="whatsapp-phone"]').forEach(el => {
    el.textContent = business.whatsapp || '+91 9442779796';
  });
  document.querySelectorAll('[data-bind="whatsapp-href"]').forEach(el => {
    const message = encodeURIComponent('Hello Libin Catering, I would like to enquire about your catering services.');
    el.href = `https://wa.me/${business.whatsappFormatted || '919442779796'}?text=${message}`;
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
    el.textContent = business.address || 'Libin Catering Service & Event Management, Tamil Nadu, India';
  });
  document.querySelectorAll('[data-bind="business-hours"]').forEach(el => {
    el.textContent = business.openingHours || 'Mon - Sun: 7:00 AM - 10:30 PM (24/7 Event Booking)';
  });

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
});
