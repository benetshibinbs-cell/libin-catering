/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Signature Services Admin CRUD Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.getElementById('adminServiceTableBody');
  const modalEl = document.getElementById('serviceModal');
  const form = document.getElementById('serviceForm');
  const addBtn = document.getElementById('btnAddService');
  const iconSelect = document.getElementById('serviceIcon');
  const iconPreview = document.getElementById('iconPreview');
  const fileInput = document.getElementById('serviceFileInput');
  const urlInput = document.getElementById('serviceImageUrl');
  const previewWrap = document.getElementById('serviceImagePreviewWrap');
  const previewImg = document.getElementById('serviceImagePreview');

  let modal = null;
  if (modalEl && typeof bootstrap !== 'undefined') {
    modal = new bootstrap.Modal(modalEl);
  }

  let services = [];

  // Update Icon Preview on change
  if (iconSelect && iconPreview) {
    iconSelect.addEventListener('change', () => {
      iconPreview.innerHTML = `<i class="bi ${iconSelect.value}"></i>`;
    });
  }

  // Image Preview Handler
  function updateImagePreview(url) {
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
        reader.onload = (ev) => updateImagePreview(ev.target.result);
        reader.readAsDataURL(file);
      }
    });
  }

  if (urlInput) {
    urlInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) updateImagePreview(val);
    });
  }

  // Load Table
  async function loadTable() {
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span> Loading signature services...</td></tr>`;

    try {
      services = await window.DB.getServices({ activeOnly: false });
    } catch (e) {
      console.warn('Error loading services:', e);
      services = [];
    }

    if (services.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No services found. Click "Add Service" to create one.</td></tr>`;
      return;
    }

    let html = '';
    services.forEach(svc => {
      const statusBadge = svc.is_active !== false 
        ? '<span class="badge bg-success-subtle text-success">Active</span>' 
        : '<span class="badge bg-secondary-subtle text-secondary">Hidden</span>';
      
      const imgThumb = svc.image_url 
        ? `<img src="${svc.image_url}" class="rounded" style="width: 46px; height: 46px; object-fit: cover;">` 
        : '<div class="bg-light rounded" style="width: 46px; height: 46px;"></div>';

      const icon = svc.icon || 'bi-heart-fill';

      html += `
        <tr>
          <td style="width: 60px;">${imgThumb}</td>
          <td style="width: 50px;"><span class="fs-5 text-gold"><i class="bi ${icon}"></i></span></td>
          <td><strong>${svc.title}</strong></td>
          <td><small class="text-muted text-truncate d-inline-block" style="max-width: 260px;">${svc.description || ''}</small></td>
          <td><span class="badge bg-dark">${svc.button_text || 'Enquire'}</span></td>
          <td>${svc.display_order ?? 0}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit-service" data-id="${svc.id}" title="Edit"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete-service" data-id="${svc.id}" title="Delete"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

    tableBody.querySelectorAll('.btn-edit-service').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });
    tableBody.querySelectorAll('.btn-delete-service').forEach(btn => {
      btn.addEventListener('click', () => deleteService(btn.getAttribute('data-id')));
    });
  }

  // Open Add Modal
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (form) form.reset();
      document.getElementById('serviceId').value = '';
      document.getElementById('serviceIcon').value = 'bi-heart-fill';
      if (iconPreview) iconPreview.innerHTML = `<i class="bi bi-heart-fill"></i>`;
      if (previewWrap) previewWrap.style.display = 'none';
      document.getElementById('modalTitle').textContent = 'Add Signature Service';
      if (modal) modal.show();
    });
  }

  // Open Edit Modal
  function openEditModal(id) {
    const svc = services.find(s => String(s.id) === String(id));
    if (!svc) return;

    if (form) form.reset();
    document.getElementById('serviceId').value = svc.id;
    document.getElementById('serviceTitle').value = svc.title || '';
    document.getElementById('serviceIcon').value = svc.icon || 'bi-heart-fill';
    if (iconPreview) iconPreview.innerHTML = `<i class="bi ${svc.icon || 'bi-heart-fill'}"></i>`;
    document.getElementById('serviceImageUrl').value = svc.image_url || '';
    document.getElementById('serviceDescription').value = svc.description || '';
    document.getElementById('serviceButtonText').value = svc.button_text || 'Enquire Service';
    document.getElementById('serviceLinkUrl').value = svc.link_url || 'contact.html#enquiry-form';
    document.getElementById('serviceDisplayOrder').value = svc.display_order ?? 0;
    document.getElementById('serviceIsActive').checked = svc.is_active !== false;

    updateImagePreview(svc.image_url);
    document.getElementById('modalTitle').textContent = 'Edit Signature Service';
    if (modal) modal.show();
  }

  // Form Submit (Save / Update)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btnSaveService');
      const originalText = saveBtn.innerHTML;

      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Saving...`;

      try {
        let imageUrl = document.getElementById('serviceImageUrl').value.trim();
        const file = fileInput ? fileInput.files[0] : null;

        if (file) {
          saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Uploading Image...`;
          const uploadedUrl = await window.DB.uploadImageFile(file, 'services');
          if (uploadedUrl) imageUrl = uploadedUrl;
        }

        const id = document.getElementById('serviceId').value;
        const title = document.getElementById('serviceTitle').value.trim();
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const payload = {
          title,
          slug,
          icon: document.getElementById('serviceIcon').value,
          image_url: imageUrl || 'assets/images/hero-slide-1.jpg',
          description: document.getElementById('serviceDescription').value.trim(),
          button_text: document.getElementById('serviceButtonText').value.trim() || 'Enquire Service',
          link_url: document.getElementById('serviceLinkUrl').value.trim() || 'contact.html#enquiry-form',
          display_order: parseInt(document.getElementById('serviceDisplayOrder').value || '0', 10),
          is_active: document.getElementById('serviceIsActive').checked
        };

        if (id) payload.id = id;

        await window.DB.saveService(payload);
        if (window.showToast) window.showToast('Signature Service saved successfully!');
        if (modal) modal.hide();
        await loadTable();
      } catch (err) {
        console.error('Error saving service:', err);
        if (window.showToast) window.showToast('Failed to save service. Check console.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
      }
    });
  }

  // Delete Service
  async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this signature service?')) return;
    try {
      await window.DB.deleteService(id);
      if (window.showToast) window.showToast('Signature service deleted successfully.');
      await loadTable();
    } catch (err) {
      console.error('Delete error:', err);
      if (window.showToast) window.showToast('Failed to delete service.', 'error');
    }
  }

  await loadTable();
});
