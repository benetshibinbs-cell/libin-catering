/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Gallery Masonry & Interactive Lightbox Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryFilterBtns = document.querySelectorAll('#galleryFilters .menu-filter-btn');

  // Lightbox Elements
  let lightbox = document.getElementById('galleryLightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'galleryLightbox';
    lightbox.className = 'lightbox-modal';
    lightbox.innerHTML = `
      <span class="lightbox-close">&times;</span>
      <div class="lightbox-content">
        <img class="lightbox-img" src="" alt="Enlarged view">
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  let currentCategory = 'all';

  async function loadGallery() {
    if (!galleryGrid) return;

    galleryGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Loading gallery items...</span>
        </div>
      </div>
    `;

    try {
      const items = await window.DB.getGallery({ category: currentCategory });

      if (!items || items.length === 0) {
        galleryGrid.innerHTML = `
          <div class="col-12 text-center py-5">
            <h4 class="font-serif">No images found</h4>
            <p class="text-muted">Explore other categories to view our catering moments.</p>
          </div>
        `;
        return;
      }

      let html = '';
      items.forEach(item => {
        html += `
          <div class="gallery-item" data-img="${item.image_url}" data-caption="${item.caption || item.title || ''}">
            <img src="${item.image_url}" alt="${item.title || 'Catering Moment'}" class="gallery-img" loading="lazy">
            <div class="gallery-item-overlay">
              <span class="gallery-item-tag">${item.category}</span>
              <h5 class="gallery-item-title">${item.title || ''}</h5>
            </div>
          </div>
        `;
      });

      galleryGrid.innerHTML = html;

      // Attach Lightbox click handlers
      galleryGrid.querySelectorAll('.gallery-item').forEach(el => {
        el.addEventListener('click', () => {
          const src = el.getAttribute('data-img');
          const caption = el.getAttribute('data-caption');
          lightboxImg.src = src;
          lightboxCaption.textContent = caption;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        });
      });
    } catch (e) {
      console.error('Error loading gallery:', e);
      galleryGrid.innerHTML = `<div class="col-12 text-center py-5 text-danger">Error loading gallery.</div>`;
    }
  }

  // Filter Listeners
  galleryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      loadGallery();
    });
  });

  // Lightbox Close Handlers
  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  await loadGallery();
});
