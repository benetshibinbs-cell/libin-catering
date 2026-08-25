/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Category Admin CRUD Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.getElementById('adminCategoryTableBody');
  const modalEl = document.getElementById('categoryModal');
  const form = document.getElementById('categoryForm');
  const addBtn = document.getElementById('btnAddCategory');

  let modal = null;
  if (modalEl && typeof bootstrap !== 'undefined') {
    modal = new bootstrap.Modal(modalEl);
  }

  let categories = [];

  async function loadTable() {
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span> Loading categories...</td></tr>`;

    categories = await window.DB.getCategories();

    if (categories.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No categories found. Click "Add Category" to create one.</td></tr>`;
      return;
    }

    let html = '';
    categories.forEach(cat => {
      const statusBadge = cat.is_active ? '<span class="badge bg-success-subtle text-success">Active</span>' : '<span class="badge bg-secondary-subtle text-secondary">Inactive</span>';
      const imgThumb = cat.image_url ? `<img src="${cat.image_url}" class="rounded" style="width: 44px; height: 44px; object-fit: cover;">` : '<div class="bg-light rounded" style="width: 44px; height: 44px;"></div>';

      html += `
        <tr>
          <td style="width: 60px;">${imgThumb}</td>
          <td><strong>${cat.name}</strong><br><small class="text-muted">${cat.slug}</small></td>
          <td><small class="text-muted">${cat.description || 'No description'}</small></td>
          <td>${cat.display_order || 0}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit-cat" data-id="${cat.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete-cat" data-id="${cat.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

    tableBody.querySelectorAll('.btn-edit-cat').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });
    tableBody.querySelectorAll('.btn-delete-cat').forEach(btn => {
      btn.addEventListener('click', () => deleteCategory(btn.getAttribute('data-id')));
    });
  }

  const fileInput = document.getElementById('categoryFileInput');
  const urlInput = document.getElementById('categoryImageUrl');
  const previewWrap = document.getElementById('categoryImagePreviewWrap');
  const previewImg = document.getElementById('categoryImagePreview');

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
      document.getElementById('categoryId').value = '';
      if (previewWrap) previewWrap.style.display = 'none';
      document.getElementById('modalTitle').textContent = 'Add Category';
      if (modal) modal.show();
    });
  }

  function openEditModal(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    document.getElementById('categoryId').value = cat.id;
    document.getElementById('categoryName').value = cat.name;
    document.getElementById('categorySlug').value = cat.slug;
    document.getElementById('categoryDescription').value = cat.description || '';
    document.getElementById('categoryImageUrl').value = cat.image_url || '';
    if (fileInput) fileInput.value = '';
    updatePreview(cat.image_url);

    document.getElementById('categoryDisplayOrder').value = cat.display_order || 0;
    document.getElementById('categoryIsActive').checked = !!cat.is_active;

    document.getElementById('modalTitle').textContent = 'Edit Category';
    if (modal) modal.show();
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Uploading & Saving...`;

      const id = document.getElementById('categoryId').value;
      let imageUrl = document.getElementById('categoryImageUrl').value.trim();

      if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
          imageUrl = await window.DB.uploadImageFile(fileInput.files[0], 'categories');
        } catch (err) {
          console.warn('Category image upload notice:', err);
        }
      }

      const payload = {
        name: document.getElementById('categoryName').value.trim(),
        slug: document.getElementById('categorySlug').value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: document.getElementById('categoryDescription').value.trim(),
        image_url: imageUrl,
        display_order: parseInt(document.getElementById('categoryDisplayOrder').value || '0', 10),
        is_active: document.getElementById('categoryIsActive').checked
      };

      const client = window.DB.getClient();
      if (client) {
        if (id) {
          await client.from('categories').update(payload).eq('id', id);
        } else {
          await client.from('categories').insert([payload]);
        }
      } else {
        if (id) {
          const idx = categories.findIndex(c => c.id === id);
          if (idx !== -1) categories[idx] = { ...categories[idx], ...payload };
        } else {
          payload.id = 'local_c_' + Date.now();
          categories.push(payload);
        }
      }

      if (window.showToast) window.showToast('Category saved successfully!');
      if (modal) modal.hide();
      await loadTable();
    });
  }

  async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const client = window.DB.getClient();
    if (client) {
      await client.from('categories').delete().eq('id', id);
    } else {
      categories = categories.filter(c => c.id !== id);
    }
    if (window.showToast) window.showToast('Category removed.');
    await loadTable();
  }

  await loadTable();
});
