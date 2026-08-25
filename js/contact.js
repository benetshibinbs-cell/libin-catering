/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Contact Page & Custom Event Enquiry Form Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const enquiryForm = document.getElementById('mainEnquiryForm');
  const formSuccessBox = document.getElementById('formSuccessState');
  const formContainer = document.getElementById('formInputState');

  // Pre-fill fields based on URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const dishParam = urlParams.get('dish');
  const eventParam = urlParams.get('event');

  if (dishParam && enquiryForm && enquiryForm.message) {
    enquiryForm.message.value = `Hello Libin Catering, I would like to book "${dishParam}" as part of our upcoming event menu.`;
  } else if (eventParam && enquiryForm && enquiryForm.message) {
    enquiryForm.message.value = `Hello Libin Catering, I would like to enquire about planning an event similar to "${eventParam}".`;
  }

  // Set min date for Event Date input to today
  const dateInput = document.getElementById('event_date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Handle Enquiry Form Submission
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = enquiryForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      // Basic client-side validation
      const name = enquiryForm.name.value.trim();
      const phone = enquiryForm.phone.value.trim();
      const email = enquiryForm.email ? enquiryForm.email.value.trim() : '';
      const eventType = enquiryForm.event_type.value;
      const eventDate = enquiryForm.event_date.value;
      const venue = enquiryForm.venue ? enquiryForm.venue.value.trim() : '';
      const guestCount = parseInt(enquiryForm.guest_count.value || '0', 10);
      const budgetRange = enquiryForm.budget_range ? enquiryForm.budget_range.value : '';
      const message = enquiryForm.message ? enquiryForm.message.value.trim() : '';

      // Collect checked services
      const servicesRequired = [];
      enquiryForm.querySelectorAll('input[name="services"]:checked').forEach(cb => {
        servicesRequired.push(cb.value);
      });

      // Collect checked food preferences
      const foodPreferences = [];
      enquiryForm.querySelectorAll('input[name="food_pref"]:checked').forEach(cb => {
        foodPreferences.push(cb.value);
      });

      if (!name || !phone || !eventDate || !eventType) {
        window.showToast('Please fill out all required fields marked with *', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Transmitting Enquiry...`;

      const payload = {
        name,
        phone,
        email,
        event_type: eventType,
        event_date: eventDate,
        venue,
        guest_count: guestCount,
        budget_range: budgetRange,
        services_required: servicesRequired,
        food_preferences: foodPreferences,
        message,
        status: 'New'
      };

      try {
        await window.DB.submitEnquiry(payload);

        // Show Success Animation & Box
        if (formContainer && formSuccessBox) {
          formContainer.style.display = 'none';
          formSuccessBox.style.display = 'block';
          formSuccessBox.classList.add('animate-fade-in-up');
        }

        // WhatsApp followup button link
        const waFollowupBtn = document.getElementById('btnWhatsAppFollowup');
        if (waFollowupBtn) {
          const waMsg = encodeURIComponent(
            `Hi Libin Catering! I just submitted an event enquiry for a ${eventType} on ${eventDate} (${guestCount} guests). Name: ${name}, Phone: ${phone}.`
          );
          waFollowupBtn.href = `https://wa.me/919442779796?text=${waMsg}`;
        }

        window.showToast('Event enquiry submitted successfully! We will connect shortly.', 'success');
        enquiryForm.reset();
      } catch (err) {
        console.error('Submission error:', err);
        window.showToast('Error submitting enquiry. Please call us at +91 9677476609.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});
