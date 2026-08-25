/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Gallery Admin CRUD Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.getElementById('adminGalleryTableBody');
  const modalEl = document.getElementById('galleryModal');
  const form = document.getElementById('galleryForm');
  const addBtn = document.getElementById('btnAddGalleryItem');

  let modal = null;
  if (modalEl && typeof bootstrap !== 'undefined') {
    modal = new bootstrap.Modal(modalEl);
  }

  let galleryItems = [];

  async function loadTable() {
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span> Loading gallery items...</td></tr>`;

    galleryItems = await window.DB.getGallery({ category: 'all' });

    if (galleryItems.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No gallery photos found. Click "Add Photo" to upload.</td></tr>`;
      return;
    }

    let html = '';
    galleryItems.forEach(item => {
      const statusBadge = item.is_published ? '<span class="badge bg-success-subtle text-success">Published</span>' : '<span class="badge bg-secondary-subtle text-secondary">Hidden</span>';
      const imgThumb = item.image_url ? `<img src="${item.image_url}" class="rounded" style="width: 48px; height: 48px; object-fit: cover;">` : '<div class="bg-light rounded" style="width: 48px; height: 48px;"></div>';

      html += `
        <tr>
          <td style="width: 60px;">${imgThumb}</td>
          <td><strong>${item.title || 'Untitled'}</strong><br><small class="text-muted">${item.caption || ''}</small></td>
          <td><span class="badge bg-dark">${item.category}</span></td>
          <td>${item.display_order || 0}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit-gal" data-id="${item.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete-gal" data-id="${item.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

    tableBody.querySelectorAll('.btn-edit-gal').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });
    tableBody.querySelectorAll('.btn-delete-gal').forEach(btn => {
      btn.addEventListener('click', () => deleteGalleryItem(btn.getAttribute('data-id')));
    });
  }

  const fileInput = document.getElementById('galleryFileInput');
  const urlInput = document.getElementById('galleryImageUrl');
  const previewWrap = document.getElementById('galleryImagePreviewWrap');
  const previewImg = document.getElementById('galleryImagePreview');

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
      document.getElementById('galleryId').value = '';
      if (previewWrap) previewWrap.style.display = 'none';
      document.getElementById('modalTitle').textContent = 'Add Photo to Gallery';
      if (modal) modal.show();
    });
  }

  function openEditModal(id) {
    const item = galleryItems.find(g => g.id === id);
    if (!item) return;

    document.getElementById('galleryId').value = item.id;
    document.getElementById('galleryTitle').value = item.title || '';
    document.getElementById('galleryCategory').value = item.category || 'Food';
    document.getElementById('galleryImageUrl').value = item.image_url || '';
    if (fileInput) fileInput.value = '';
    updatePreview(item.image_url);

    document.getElementById('galleryCaption').value = item.caption || '';
    document.getElementById('galleryDisplayOrder').value = item.display_order || 0;
    document.getElementById('galleryIsPublished').checked = !!item.is_published;

    document.getElementById('modalTitle').textContent = 'Edit Gallery Item';
    if (modal) modal.show();
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Uploading & Saving...`;

      const id = document.getElementById('galleryId').value;
      let imageUrl = document.getElementById('galleryImageUrl').value.trim();

      if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
          imageUrl = await window.DB.uploadImageFile(fileInput.files[0], 'gallery');
        } catch (err) {
          console.warn('Gallery image upload notice:', err);
        }
      }

      const payload = {
        title: document.getElementById('galleryTitle').value.trim(),
        category: document.getElementById('galleryCategory').value,
        image_url: imageUrl,
        caption: document.getElementById('galleryCaption').value.trim(),
        display_order: parseInt(document.getElementById('galleryDisplayOrder').value || '0', 10),
        is_published: document.getElementById('galleryIsPublished').checked
      };

      const client = window.DB.getClient();
      if (client) {
        if (id) {
          await client.from('gallery').update(payload).eq('id', id);
        } else {
          await client.from('gallery').insert([payload]);
        }
      } else {
        if (id) {
          const idx = galleryItems.findIndex(g => g.id === id);
          if (idx !== -1) galleryItems[idx] = { ...galleryItems[idx], ...payload };
        } else {
          payload.id = 'local_g_' + Date.now();
          galleryItems.push(payload);
        }
      }

      if (window.showToast) window.showToast('Gallery item saved!');
      if (modal) modal.hide();
      await loadTable();
    });
  }

  async function deleteGalleryItem(id) {
    if (!confirm('Are you sure you want to delete this photo from the gallery?')) return;
    const client = window.DB.getClient();
    if (client) {
      await client.from('gallery').delete().eq('id', id);
    } else {
      galleryItems = galleryItems.filter(g => g.id !== id);
    }
    if (window.showToast) window.showToast('Photo removed.');
    await loadTable();
  }

  await loadTable();
});
