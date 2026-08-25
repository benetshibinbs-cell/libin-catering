/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Application Configuration & Contact Constants
 */

window.APP_CONFIG = {
  // Supabase Configuration
  // Provide your project URL & Publishable Anon Key below or through window.ENV in production.
  // Note: NEVER place service_role keys or secret keys in this file.
  supabaseUrl: (window.ENV && window.ENV.SUPABASE_URL) || 'https://robzbfskdmwhltfmvfsu.supabase.co',
  supabaseAnonKey: (window.ENV && window.ENV.SUPABASE_PUBLISHABLE_KEY) || 'sb_publishable_sD3Q6-t7ftBQTIhUTHaE_w_jChKouOe',

  // Business Information
  business: {
    name: 'Libin Catering Service & Event Management',
    primaryPhone: '+91 9677476609',
    secondaryPhone: '+91 9442779796',
    whatsapp: '+91 9442779796',
    whatsappFormatted: '919442779796',
    email: 'libincateringservice@gmail.com',
    address: 'Libin Catering Service & Event Management, Tamil Nadu, India',
    openingHours: 'Monday - Sunday: 7:00 AM - 10:30 PM (24/7 Event Inquiries)',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126353.47352378964!2d77.3486121404179!3d8.18873994326127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f128c7c98863%3A0xc078107c1fa77ea6!2sNagercoil%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    social: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com'
    }
  }
};
