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
    address: 'Libin Catering Services, Tamil Nadu, India',
    openingHours: 'Monday - Sunday: 7:00 AM - 10:30 PM (24/7 Event Inquiries)',
    location: {
      latitude: 8.3078817,
      longitude: 77.1311018
    },
    googleRating: '4.9',
    googleReviewCount: '150+',
    googleMapsUrl: 'https://www.google.com/maps/place/Libin+Catering+Services/@8.3078817,77.1311018,17z/data=!3m1!4b1!4m6!3m5!1s0x3b05ab04435abe27:0x12a4c587ff77f9e!8m2!3d8.3078817!4d77.1311018!16s%2Fg%2F11j7dyx0g3',
    googleReviewsUrl: 'https://www.google.com/maps/place/Libin+Catering+Services/@8.3078817,77.1311018,17z/data=!4m8!3m7!1s0x3b05ab04435abe27:0x12a4c587ff77f9e!8m2!3d8.3078817!4d77.1311018!9m1!1b1!16s%2Fg%2F11j7dyx0g3',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.3304938096355!2d77.1285269!3d8.3078817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05ab04435abe27%3A0x12a4c587ff77f9e!2sLibin%20Catering%20Services!5e0!3m2!1sen!2sin!4v1708850000000!5m2!1sen!2sin',
    social: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com'
    }
  }
};
