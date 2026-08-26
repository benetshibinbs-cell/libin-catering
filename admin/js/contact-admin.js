/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Contact Information & Site Settings Admin Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('contactAdminForm');

  async function loadSettings() {
    const info = await window.DB.getContactInfo();

    if (info) {
      document.getElementById('businessName').value = info.business_name || info.name || 'Libin Catering Service & Event Management';
      document.getElementById('primaryPhone').value = info.primary_phone || info.primaryPhone || '+91 9677476609';
      document.getElementById('secondaryPhone').value = info.secondary_phone || info.secondaryPhone || '+91 9442779796';
      document.getElementById('whatsappNumber').value = info.whatsapp_number || info.whatsapp || '+91 9442779796';
      document.getElementById('businessEmail').value = info.email || 'libincateringservice@gmail.com';
      document.getElementById('businessAddress').value = info.address || 'Libin Catering Services, Tamil Nadu, India';
      document.getElementById('mapEmbedUrl').value = info.map_embed_url || info.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.3304938096355!2d77.1285269!3d8.3078817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05ab04435abe27%3A0x12a4c587ff77f9e!2sLibin%20Catering%20Services!5e0!3m2!1sen!2sin!4v1708850000000!5m2!1sen!2sin';
      document.getElementById('openingHours').value = info.opening_hours || info.openingHours || 'Mon - Sun: 7:00 AM - 10:30 PM (24/7 Event Booking)';
      
      if (info.social) {
        document.getElementById('facebookUrl').value = info.social.facebook || '';
        document.getElementById('instagramUrl').value = info.social.instagram || '';
        document.getElementById('youtubeUrl').value = info.social.youtube || '';
      }
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
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

      const client = window.DB.getClient();
      if (client) {
        // Upsert first record in contact_information
        const { data: existing } = await client.from('contact_information').select('id').limit(1).single();
        if (existing && existing.id) {
          await client.from('contact_information').update(payload).eq('id', existing.id);
        } else {
          await client.from('contact_information').insert([payload]);
        }
      } else {
        // Update local app config
        window.APP_CONFIG.business.name = payload.business_name;
        window.APP_CONFIG.business.primaryPhone = payload.primary_phone;
        window.APP_CONFIG.business.secondaryPhone = payload.secondary_phone;
        window.APP_CONFIG.business.whatsapp = payload.whatsapp_number;
        window.APP_CONFIG.business.email = payload.email;
        window.APP_CONFIG.business.address = payload.address;
        window.APP_CONFIG.business.openingHours = payload.opening_hours;
      }

      if (window.showToast) window.showToast('Contact and business settings updated successfully!');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
  }

  await loadSettings();
});
