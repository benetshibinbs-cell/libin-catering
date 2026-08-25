/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Menu Display & Interactive Filter Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const menuContainer = document.getElementById('menuGrid');
  const categoryFilters = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('menuSearchInput');
  const dietaryRadios = document.querySelectorAll('input[name="dietaryFilter"]');

  let currentCategory = 'all';
  let currentDietary = 'all';
  let searchQuery = '';

  // Render Category Filter Buttons
  async function renderCategories() {
    if (!categoryFilters) return;
    try {
      const categories = await window.DB.getCategories();
      let html = `<button class="menu-filter-btn active" data-category="all">All Items</button>`;
      categories.forEach(cat => {
        html += `<button class="menu-filter-btn" data-category="${cat.slug}">${cat.name}</button>`;
      });
      categoryFilters.innerHTML = html;

      // Add click listeners
      categoryFilters.querySelectorAll('.menu-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          categoryFilters.querySelectorAll('.menu-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCategory = btn.getAttribute('data-category');
          loadMenuItems();
        });
      });
    } catch (e) {
      console.error('Error rendering categories:', e);
    }
  }

  // Load and Render Menu Items
  async function loadMenuItems() {
    if (!menuContainer) return;

    menuContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Loading culinary delicacies...</span>
        </div>
      </div>
    `;

    try {
      const items = await window.DB.getMenuItems({
        categorySlug: currentCategory,
        searchQuery: searchQuery,
        dietary: currentDietary
      });

      if (!items || items.length === 0) {
        menuContainer.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="bi bi-search text-muted fs-1 mb-3 d-block"></i>
            <h4 class="font-serif">No dishes found</h4>
            <p class="text-muted">Try adjusting your category, dietary filter, or search term.</p>
          </div>
        `;
        return;
      }

      let html = '';
      items.forEach(item => {
        const dietClass = item.dietary_type === 'veg' ? 'veg' : 'non-veg';
        const dietTitle = item.dietary_type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';
        const priceDisplay = (item.price && !item.is_price_on_enquiry) ? `₹${item.price}` : 'Enquire for pricing';
        const imgUrl = item.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop';

        html += `
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="menu-card">
              <div class="menu-card-img-wrap">
                <span class="diet-badge ${dietClass} menu-card-badge-diet" title="${dietTitle}"></span>
                <img src="${imgUrl}" alt="${item.name}" class="menu-card-img" loading="lazy">
              </div>
              <div class="menu-card-body">
                <h4 class="menu-item-title font-serif">${item.name}</h4>
                <p class="menu-item-desc">${item.description || 'Authentic gourmet recipe prepared with hand-picked spices and freshest ingredients.'}</p>
                <div class="menu-card-footer">
                  <span class="menu-price">${priceDisplay}</span>
                  <a href="contact.html?dish=${encodeURIComponent(item.name)}#enquiry-form" class="menu-enquire-link">
                    Book for Event <i class="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      menuContainer.innerHTML = html;
    } catch (e) {
      console.error('Error loading menu:', e);
      menuContainer.innerHTML = `<div class="col-12 text-center py-5 text-danger">Error loading menu. Please try again.</div>`;
    }
  }

  // Live Search Listener
  if (searchInput) {
    let debounceTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        searchQuery = e.target.value.trim();
        loadMenuItems();
      }, 250);
    });
  }

  // Dietary Radio Listener
  dietaryRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentDietary = e.target.value;
      loadMenuItems();
    });
  });

  // Initial load
  await renderCategories();
  await loadMenuItems();
});
