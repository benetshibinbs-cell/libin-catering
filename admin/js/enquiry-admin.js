/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Enquiries Admin Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.getElementById('adminEnquiryTableBody');
  const modalEl = document.getElementById('enquiryDetailModal');
  const statusFilterSelect = document.getElementById('statusFilter');

  let modal = null;
  if (modalEl && typeof bootstrap !== 'undefined') {
    modal = new bootstrap.Modal(modalEl);
  }

  let enquiries = [];
  let currentFilter = 'all';

  async function loadEnquiries() {
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span> Loading enquiries...</td></tr>`;

    const client = window.DB.getClient();
    if (client) {
      const { data } = await client.from('enquiries').select('*').order('created_at', { ascending: false });
      enquiries = data || [];
    } else {
      enquiries = JSON.parse(localStorage.getItem('libin_offline_enquiries') || '[]');
    }

    renderTable();
  }

  function renderTable() {
    let filtered = enquiries;
    if (currentFilter !== 'all') {
      filtered = enquiries.filter(e => e.status === currentFilter);
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No enquiries matching filter "${currentFilter}".</td></tr>`;
      return;
    }

    let html = '';
    filtered.forEach(enq => {
      const eventDate = enq.event_date ? new Date(enq.event_date).toLocaleDateString() : 'N/A';
      const createdDate = enq.created_at ? new Date(enq.created_at).toLocaleDateString() : 'Recent';
      const statusClass = (enq.status || 'New').toLowerCase().replace(/\s+/g, '');

      html += `
        <tr>
          <td>
            <strong>${enq.name}</strong><br>
            <small class="text-muted"><i class="bi bi-telephone me-1"></i>${enq.phone}</small>
          </td>
          <td>${enq.event_type}</td>
          <td>${eventDate}</td>
          <td>${enq.guest_count || 'N/A'}</td>
          <td><span class="status-badge status-${statusClass}">${enq.status || 'New'}</span></td>
          <td><small class="text-muted">${createdDate}</small></td>
          <td>
            <button class="btn btn-sm btn-gold btn-view-enq" data-id="${enq.id}">
              <i class="bi bi-eye-fill me-1"></i> Review
            </button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

    tableBody.querySelectorAll('.btn-view-enq').forEach(btn => {
      btn.addEventListener('click', () => openDetailModal(btn.getAttribute('data-id')));
    });
  }

  function openDetailModal(id) {
    const enq = enquiries.find(e => e.id === id);
    if (!enq) return;

    document.getElementById('modalEnqId').value = enq.id;
    document.getElementById('modalEnqName').textContent = enq.name;
    document.getElementById('modalEnqPhone').innerHTML = `<a href="tel:${enq.phone}" class="text-dark">${enq.phone}</a> <a href="https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-sm btn-success ms-2 py-0 px-2"><i class="bi bi-whatsapp"></i> WhatsApp</a>`;
    document.getElementById('modalEnqEmail').textContent = enq.email || 'Not provided';
    document.getElementById('modalEnqType').textContent = enq.event_type;
    document.getElementById('modalEnqDate').textContent = enq.event_date ? new Date(enq.event_date).toDateString() : 'N/A';
    document.getElementById('modalEnqVenue').textContent = enq.venue || 'Not specified';
    document.getElementById('modalEnqGuests').textContent = enq.guest_count || 'N/A';
    document.getElementById('modalEnqBudget').textContent = enq.budget_range || 'Flexible';
    
    document.getElementById('modalEnqServices').textContent = (enq.services_required && enq.services_required.length) ? enq.services_required.join(', ') : 'Catering';
    document.getElementById('modalEnqFood').textContent = (enq.food_preferences && enq.food_preferences.length) ? enq.food_preferences.join(', ') : 'Standard Menu';
    document.getElementById('modalEnqMessage').textContent = enq.message || 'None';
    
    document.getElementById('modalEnqStatusSelect').value = enq.status || 'New';
    document.getElementById('modalEnqAdminNotes').value = enq.admin_notes || '';

    if (modal) modal.show();
  }

  // Update Status and Notes Form
  const detailForm = document.getElementById('enquiryDetailForm');
  if (detailForm) {
    detailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('modalEnqId').value;
      const status = document.getElementById('modalEnqStatusSelect').value;
      const admin_notes = document.getElementById('modalEnqAdminNotes').value.trim();

      const client = window.DB.getClient();
      if (client) {
        await client.from('enquiries').update({ status, admin_notes }).eq('id', id);
      } else {
        const idx = enquiries.findIndex(e => e.id === id);
        if (idx !== -1) {
          enquiries[idx].status = status;
          enquiries[idx].admin_notes = admin_notes;
          localStorage.setItem('libin_offline_enquiries', JSON.stringify(enquiries));
        }
      }

      if (window.showToast) window.showToast('Enquiry status updated!');
      if (modal) modal.hide();
      await loadEnquiries();
    });
  }

  // Status Filter Listener
  if (statusFilterSelect) {
    statusFilterSelect.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      renderTable();
    });
  }

  await loadEnquiries();
});
