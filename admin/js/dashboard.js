/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Admin Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const countMenuEl = document.getElementById('countMenuItems');
  const countCategoryEl = document.getElementById('countCategories');
  const countServicesEl = document.getElementById('countServices');
  const countEventEl = document.getElementById('countEvents');
  const countEnquiryEl = document.getElementById('countEnquiries');
  const recentEnquiriesBody = document.getElementById('recentEnquiriesTableBody');

  async function loadDashboardMetrics() {
    try {
      const categories = await window.DB.getCategories();
      const menuItems = await window.DB.getMenuItems({ categorySlug: 'all', dietary: 'all' });
      const services = await window.DB.getServices({ activeOnly: false });
      const events = await window.DB.getEvents({ publishedOnly: false });

      let enquiries = [];
      let dbEnquiries = [];
      let localEnquiries = [];

      try {
        localEnquiries = JSON.parse(localStorage.getItem('libin_offline_enquiries') || '[]');
      } catch (e) {}

      const client = window.DB.getClient();
      if (client) {
        try {
          const { data, error } = await client.from('enquiries').select('*').order('created_at', { ascending: false });
          if (error) console.warn('Dashboard enquiries query notice:', error.message);
          if (data && data.length > 0) dbEnquiries = data;
        } catch (err) {
          console.warn('Dashboard fetch exception:', err);
        }
      }

      const mergedMap = new Map();
      dbEnquiries.forEach(i => mergedMap.set(i.id, i));
      localEnquiries.forEach(i => {
        if (!mergedMap.has(i.id)) mergedMap.set(i.id, i);
      });
      enquiries = Array.from(mergedMap.values());

      if (countMenuEl) countMenuEl.textContent = menuItems.length;
      if (countCategoryEl) countCategoryEl.textContent = categories.length;
      if (countServicesEl) countServicesEl.textContent = services.length;
      if (countEventEl) countEventEl.textContent = events.length;
      
      const newEnquiries = enquiries.filter(e => e.status === 'New');
      if (countEnquiryEl) countEnquiryEl.textContent = newEnquiries.length;

      // Render Recent Enquiries
      if (recentEnquiriesBody) {
        if (enquiries.length === 0) {
          recentEnquiriesBody.innerHTML = `
            <tr>
              <td colspan="6" class="text-center py-4 text-muted">No enquiries recorded yet.</td>
            </tr>
          `;
          return;
        }

        let html = '';
        enquiries.slice(0, 6).forEach(enq => {
          const dateFormatted = enq.event_date ? new Date(enq.event_date).toLocaleDateString() : 'N/A';
          const statusClass = (enq.status || 'New').toLowerCase().replace(/\s+/g, '');

          html += `
            <tr>
              <td><strong>${enq.name}</strong><br><small class="text-muted">${enq.phone}</small></td>
              <td>${enq.event_type}</td>
              <td>${dateFormatted}</td>
              <td>${enq.guest_count || 'N/A'}</td>
              <td><span class="status-badge status-${statusClass}">${enq.status || 'New'}</span></td>
              <td>
                <a href="enquiries.html" class="btn btn-sm btn-outline-dark">View Details</a>
              </td>
            </tr>
          `;
        });
        recentEnquiriesBody.innerHTML = html;
      }
    } catch (e) {
      console.error('Dashboard loading error:', e);
    }
  }

  await loadDashboardMetrics();
});
