async function loadProducts() {
  try {
    console.log('loadProducts called');
    console.log('window.Product:', window.Product);

    const response = await fetch('UI/get_products.php', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const rawText = await response.text();
    const cleanText = rawText.replace(/^\uFEFF/, '');
    console.log('Raw response from get_products.php:', cleanText);

    try {
      const result = JSON.parse(cleanText);

      if (result.success) {
        if (!window.Product || typeof window.Product.fromJSON !== 'function') {
          throw new Error('window.Product.fromJSON is not defined');
        }
        const products = result.products.map(productData => window.Product.fromJSON(productData));
        window.state.setProducts(products);
        console.log('Products Loaded', window.state.getProducts());

        // Render products
        renderProducts(window.state.getProducts());

        return products;
      } else {
        throw new Error('Failed to load products: ' + result.message);
      }
    } catch (jsonError) {
      console.error('Raw response:', rawText);
      throw new Error('Invalid JSON response: ' + jsonError.message);
    }
  } catch (error) {
    console.error('Error in loadProducts:', error.message);
    throw error;
  }
}

window.loadProducts = loadProducts;

async function loadSidebarCategories() {
  const sidebar = document.getElementById('categorySidebar');
  if (!sidebar) return;

  try {
    const response = await fetch('UI/get_categories.php');
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      sidebar.innerHTML = '<li data-category-id="0" onclick="filterByCategory(0)">All Categories</li>' +
        result.categories.map(c => `<li data-category-id="${c.id}" onclick="filterByCategory(${c.id})">${c.categoryName}</li>`).join('');
    }
  } catch (e) {
    console.error('Error loading categories:', e);
  }
}

window.loadSidebarCategories = loadSidebarCategories;

function renderProducts(products) {
  const productGrid = document.querySelector('.products');
  if (productGrid) {
    productGrid.innerHTML = products.map(product => `
                <div class="card" onclick="navigateTo('product_detail?id=${product.id}')">
                    <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <p class="price">R${parseFloat(product.price).toFixed(2)}</p>
                </div>
            `).join('');
  }
}

function filterByCategory(categoryId) {
  const allProducts = window.state.getProducts();
  let filtered;

  if (categoryId === 0) {
    filtered = allProducts;
  } else {
    filtered = allProducts.filter(product => product.categoryId == categoryId);
  }

  renderProducts(filtered);

  // Update active state in sidebar
  const items = document.querySelectorAll('.sidebar li');
  items.forEach(item => {
    item.classList.remove('active');
    if (parseInt(item.getAttribute('data-category-id')) === categoryId) {
      item.classList.add('active');
    }
  });
}

window.filterByCategory = filterByCategory;

function searchProducts(query) {
  const allProducts = window.state.getProducts();
  if (!query || query.trim() === '') {
    renderProducts(allProducts);
    return;
  }

  const filtered = allProducts.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );
  renderProducts(filtered);
}

window.searchProducts = searchProducts;
