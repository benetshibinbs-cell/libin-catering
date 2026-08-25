/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Event Admin CRUD Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.getElementById('adminEventTableBody');
  const modalEl = document.getElementById('eventModal');
  const form = document.getElementById('eventForm');
  const addBtn = document.getElementById('btnAddEvent');

  let modal = null;
  if (modalEl && typeof bootstrap !== 'undefined') {
    modal = new bootstrap.Modal(modalEl);
  }

  let events = [];

  async function loadTable() {
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span> Loading events...</td></tr>`;

    events = await window.DB.getEvents({ publishedOnly: false });

    if (events.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No events found. Click "Add Event" to create one.</td></tr>`;
      return;
    }

    let html = '';
    events.forEach(evt => {
      const dateFormatted = evt.event_date ? new Date(evt.event_date).toLocaleDateString() : 'N/A';
      const statusBadge = evt.is_published ? '<span class="badge bg-success-subtle text-success">Published</span>' : '<span class="badge bg-secondary-subtle text-secondary">Draft</span>';
      const featuredBadge = evt.is_featured ? '<span class="badge bg-warning-subtle text-warning"><i class="bi bi-star-fill me-1"></i>Featured</span>' : '';
      const imgThumb = evt.cover_image_url ? `<img src="${evt.cover_image_url}" class="rounded" style="width: 44px; height: 44px; object-fit: cover;">` : '<div class="bg-light rounded" style="width: 44px; height: 44px;"></div>';

      html += `
        <tr>
          <td style="width: 60px;">${imgThumb}</td>
          <td><strong>${evt.title}</strong> ${featuredBadge}<br><small class="text-muted">${evt.location || ''}</small></td>
          <td><span class="badge bg-dark">${evt.event_type}</span></td>
          <td>${dateFormatted}</td>
          <td>${evt.guest_count ? evt.guest_count + ' guests' : 'N/A'}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit-event" data-id="${evt.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete-event" data-id="${evt.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

    tableBody.querySelectorAll('.btn-edit-event').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });
    tableBody.querySelectorAll('.btn-delete-event').forEach(btn => {
      btn.addEventListener('click', () => deleteEvent(btn.getAttribute('data-id')));
    });
  }

  const fileInput = document.getElementById('eventFileInput');
  const urlInput = document.getElementById('eventCoverImageUrl');
  const previewWrap = document.getElementById('eventImagePreviewWrap');
  const previewImg = document.getElementById('eventImagePreview');

  function updatePreview(url) {
    if (url && previewWrap && previewImg) {
      previewImg.src = url;
      previewWrap.style.display = 'block';
    } else if (previewWrap) {
      previewWrap.style.display = 'none';
    }
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => updatePreview(ev.target.result);
        reader.readAsDataURL(file);
      }
    });
  }

  if (urlInput) {
    urlInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) updatePreview(val);
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (form) form.reset();
      document.getElementById('eventId').value = '';
      if (previewWrap) previewWrap.style.display = 'none';
      document.getElementById('modalTitle').textContent = 'Add Event Showcase';
      if (modal) modal.show();
    });
  }

  function openEditModal(id) {
    const evt = events.find(e => e.id === id);
    if (!evt) return;

    document.getElementById('eventId').value = evt.id;
    document.getElementById('eventTitle').value = evt.title;
    document.getElementById('eventType').value = evt.event_type || 'Wedding';
    document.getElementById('eventDate').value = evt.event_date || '';
    document.getElementById('eventLocation').value = evt.location || '';
    document.getElementById('eventGuestCount').value = evt.guest_count || '';
    document.getElementById('eventCoverImageUrl').value = evt.cover_image_url || '';
    if (fileInput) fileInput.value = '';
    updatePreview(evt.cover_image_url);

    document.getElementById('eventDescription').value = evt.description || '';
    document.getElementById('eventIsFeatured').checked = !!evt.is_featured;
    document.getElementById('eventIsPublished').checked = !!evt.is_published;
    document.getElementById('eventDisplayOrder').value = evt.display_order || 0;

    document.getElementById('modalTitle').textContent = 'Edit Event';
    if (modal) modal.show();
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Uploading & Saving...`;

      const id = document.getElementById('eventId').value;
      let imageUrl = document.getElementById('eventCoverImageUrl').value.trim();

      if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
          imageUrl = await window.DB.uploadImageFile(fileInput.files[0], 'events');
        } catch (err) {
          console.warn('Event image upload notice:', err);
        }
      }

      const payload = {
        title: document.getElementById('eventTitle').value.trim(),
        event_type: document.getElementById('eventType').value,
        event_date: document.getElementById('eventDate').value || null,
        location: document.getElementById('eventLocation').value.trim(),
        guest_count: document.getElementById('eventGuestCount').value ? parseInt(document.getElementById('eventGuestCount').value, 10) : null,
        cover_image_url: imageUrl,
        description: document.getElementById('eventDescription').value.trim(),
        is_featured: document.getElementById('eventIsFeatured').checked,
        is_published: document.getElementById('eventIsPublished').checked,
        display_order: parseInt(document.getElementById('eventDisplayOrder').value || '0', 10),
        slug: document.getElementById('eventTitle').value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };

      const client = window.DB.getClient();
      if (client) {
        if (id) {
          await client.from('events').update(payload).eq('id', id);
        } else {
          await client.from('events').insert([payload]);
        }
      } else {
        if (id) {
          const idx = events.findIndex(e => e.id === id);
          if (idx !== -1) events[idx] = { ...events[idx], ...payload };
        } else {
          payload.id = 'local_e_' + Date.now();
          events.push(payload);
        }
      }

      if (window.showToast) window.showToast('Event saved successfully!');
      if (modal) modal.hide();
      await loadTable();
    });
  }

  async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const client = window.DB.getClient();
    if (client) {
      await client.from('events').delete().eq('id', id);
    } else {
      events = events.filter(e => e.id !== id);
    }
    if (window.showToast) window.showToast('Event deleted.');
    await loadTable();
  }

  await loadTable();
});
