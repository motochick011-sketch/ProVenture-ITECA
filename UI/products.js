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
        const productGrid = document.querySelector('.products');
        if (productGrid) {
          productGrid.innerHTML = window.state.getProducts().map(product => `
                        <div class="card" onclick="navigateTo('product_detail?id=${product.id}')">
                            <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
                            <h4>${product.name}</h4>
                            <p class="price">R${parseFloat(product.price).toFixed(2)}</p>
                        </div>
                    `).join('');
        } else {
          console.error('Product grid container not found');
        }

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
