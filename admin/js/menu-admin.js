/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Menu Admin CRUD Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const menuTableBody = document.getElementById('adminMenuTableBody');
  const menuModalEl = document.getElementById('menuItemModal');
  const menuForm = document.getElementById('menuItemForm');
  const categorySelect = document.getElementById('itemCategory');
  const addBtn = document.getElementById('btnAddMenuItem');
  
  let menuModal = null;
  if (menuModalEl && typeof bootstrap !== 'undefined') {
    menuModal = new bootstrap.Modal(menuModalEl);
  }

  let categories = [];
  let menuItems = [];

  // Populate category dropdown
  async function loadCategoryOptions() {
    categories = await window.DB.getCategories();
    if (categorySelect) {
      let html = '<option value="" disabled selected>Select Category...</option>';
      categories.forEach(cat => {
        html += `<option value="${cat.id}">${cat.name}</option>`;
      });
      categorySelect.innerHTML = html;
    }
  }

  // Load and render menu items table
  async function loadTable() {
    if (!menuTableBody) return;
    menuTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span> Loading dishes...</td></tr>`;

    menuItems = await window.DB.getMenuItems({ categorySlug: 'all', dietary: 'all' });

    if (menuItems.length === 0) {
      menuTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No menu items found. Click "Add Menu Item" to create one.</td></tr>`;
      return;
    }

    let html = '';
    menuItems.forEach(item => {
      const cat = categories.find(c => c.id === item.category_id) || (item.categories ? item.categories : { name: 'General' });
      const dietBadge = item.dietary_type === 'veg' ? '<span class="badge bg-success">Veg</span>' : '<span class="badge bg-danger">Non-Veg</span>';
      const statusBadge = item.is_available ? '<span class="badge bg-success-subtle text-success">Available</span>' : '<span class="badge bg-secondary-subtle text-secondary">Hidden</span>';
      const featuredBadge = item.is_featured ? '<span class="badge bg-warning-subtle text-warning"><i class="bi bi-star-fill me-1"></i>Featured</span>' : '';
      const priceText = item.price ? `₹${item.price}` : 'Enquire';
      const imgThumb = item.image_url ? `<img src="${item.image_url}" class="rounded" style="width: 44px; height: 44px; object-fit: cover;">` : '<div class="bg-light rounded" style="width: 44px; height: 44px;"></div>';

      html += `
        <tr>
          <td style="width: 60px;">${imgThumb}</td>
          <td>
            <strong>${item.name}</strong> ${featuredBadge}<br>
            <small class="text-muted">${item.description ? item.description.substring(0, 50) + '...' : ''}</small>
          </td>
          <td>${cat.name || 'General'}</td>
          <td>${dietBadge}</td>
          <td><strong>${priceText}</strong></td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit-item" data-id="${item.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete-item" data-id="${item.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
    });

    menuTableBody.innerHTML = html;

    // Attach Edit & Delete Listeners
    menuTableBody.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });
    menuTableBody.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', () => deleteItem(btn.getAttribute('data-id')));
    });
  }

  const fileInput = document.getElementById('itemFileInput');
  const urlInput = document.getElementById('itemImageUrl');
  const previewWrap = document.getElementById('itemImagePreviewWrap');
  const previewImg = document.getElementById('itemImagePreview');

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

  // Open modal for new item
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (menuForm) menuForm.reset();
      document.getElementById('itemId').value = '';
      if (previewWrap) previewWrap.style.display = 'none';
      document.getElementById('modalTitle').textContent = 'Add Menu Item';
      if (menuModal) menuModal.show();
    });
  }

  // Open modal for editing
  function openEditModal(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category_id || '';
    document.getElementById('itemDietary').value = item.dietary_type || 'non-veg';
    document.getElementById('itemPrice').value = item.price || '';
    document.getElementById('itemEnquirePrice').checked = !!item.is_price_on_enquiry;
    document.getElementById('itemImageUrl').value = item.image_url || '';
    if (fileInput) fileInput.value = '';
    updatePreview(item.image_url);

    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('itemFeatured').checked = !!item.is_featured;
    document.getElementById('itemAvailable').checked = !!item.is_available;
    document.getElementById('itemDisplayOrder').value = item.display_order || 0;

    document.getElementById('modalTitle').textContent = 'Edit Menu Item';
    if (menuModal) menuModal.show();
  }

  // Form Submit Handler
  if (menuForm) {
    menuForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = menuForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Uploading & Saving...`;

      const id = document.getElementById('itemId').value;
      let imageUrl = document.getElementById('itemImageUrl').value.trim();

      // Check if file was uploaded
      if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
          imageUrl = await window.DB.uploadImageFile(fileInput.files[0], 'menu');
        } catch (err) {
          console.warn('File upload failed:', err);
        }
      }

      const payload = {
        name: document.getElementById('itemName').value.trim(),
        category_id: document.getElementById('itemCategory').value,
        dietary_type: document.getElementById('itemDietary').value,
        price: document.getElementById('itemPrice').value ? parseFloat(document.getElementById('itemPrice').value) : null,
        is_price_on_enquiry: document.getElementById('itemEnquirePrice').checked,
        image_url: imageUrl,
        description: document.getElementById('itemDescription').value.trim(),
        is_featured: document.getElementById('itemFeatured').checked,
        is_available: document.getElementById('itemAvailable').checked,
        display_order: parseInt(document.getElementById('itemDisplayOrder').value || '0', 10),
        slug: document.getElementById('itemName').value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };

      const client = window.DB.getClient();
      if (client) {
        if (id) {
          await client.from('menu_items').update(payload).eq('id', id);
        } else {
          await client.from('menu_items').insert([payload]);
        }
      } else {
        // Fallback local update
        if (id) {
          const idx = menuItems.findIndex(i => i.id === id);
          if (idx !== -1) menuItems[idx] = { ...menuItems[idx], ...payload };
        } else {
          payload.id = 'local_m_' + Date.now();
          menuItems.unshift(payload);
        }
      }

      if (window.showToast) window.showToast('Menu item saved successfully!');
      if (menuModal) menuModal.hide();
      await loadTable();
    });
  }

  // Delete Handler
  async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    const client = window.DB.getClient();
    if (client) {
      await client.from('menu_items').delete().eq('id', id);
    } else {
      menuItems = menuItems.filter(i => i.id !== id);
    }
    if (window.showToast) window.showToast('Menu item removed.');
    await loadTable();
  }

  await loadCategoryOptions();
  await loadTable();
});
