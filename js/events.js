/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Events Showcase Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const eventsContainer = document.getElementById('eventsGrid');
  const eventTypeFilters = document.getElementById('eventTypeFilters');

  let currentType = 'all';

  async function loadEvents() {
    if (!eventsContainer) return;

    eventsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Loading events...</span>
        </div>
      </div>
    `;

    try {
      let events = await window.DB.getEvents({ publishedOnly: true });

      if (currentType !== 'all') {
        events = events.filter(e => e.event_type.toLowerCase() === currentType.toLowerCase());
      }

      if (!events || events.length === 0) {
        eventsContainer.innerHTML = `
          <div class="col-12 text-center py-5">
            <h4 class="font-serif">No events to display</h4>
            <p class="text-muted">Stay tuned as we update our showcase with our latest celebrations.</p>
          </div>
        `;
        return;
      }

      let html = '';
      events.forEach(evt => {
        const formattedDate = evt.event_date ? new Date(evt.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Celebration';
        const coverImg = evt.cover_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop';
        const guestText = evt.guest_count ? `${evt.guest_count}+ Guests` : 'Full Service';

        html += `
          <div class="col-lg-6 mb-4">
            <div class="event-card">
              <div class="event-img-wrap">
                <span class="event-type-badge">${evt.event_type || 'Event'}</span>
                <img src="${coverImg}" alt="${evt.title}" class="event-img" loading="lazy">
              </div>
              <div class="event-body">
                <div class="event-meta">
                  <span><i class="bi bi-calendar-event"></i> ${formattedDate}</span>
                  <span><i class="bi bi-geo-alt"></i> ${evt.location || 'Tamil Nadu'}</span>
                  <span><i class="bi bi-people"></i> ${guestText}</span>
                </div>
                <h3 class="event-title font-serif">${evt.title}</h3>
                <p class="event-desc">${evt.description || 'Turnkey catering and bespoke event management with grand multi-cuisine dining.'}</p>
                <div class="mt-auto pt-3 border-top">
                  <a href="contact.html?event=${encodeURIComponent(evt.title)}#enquiry-form" class="btn btn-sm btn-outline-gold">
                    Plan a Similar Event <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      eventsContainer.innerHTML = html;
    } catch (e) {
      console.error('Error loading events:', e);
      eventsContainer.innerHTML = `<div class="col-12 text-center py-5 text-danger">Error loading events. Please try again later.</div>`;
    }
  }

  // Filter Buttons Listener
  if (eventTypeFilters) {
    eventTypeFilters.querySelectorAll('.menu-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        eventTypeFilters.querySelectorAll('.menu-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.getAttribute('data-type');
        loadEvents();
      });
    });
  }

  await loadEvents();
});
