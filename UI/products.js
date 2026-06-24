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
    console.log('Raw response from get_products.php:', rawText);

    try {
      const result = JSON.parse(rawText);
      console.log('Parsed response:', result);

      if (result.success) {
        if (!window.Product || typeof window.Product.fromJSON !== 'function') {
          throw new Error('window.Product.fromJSON is not defined');
        }
        const products = result.products.map(productData => window.Product.fromJSON(productData));
        window.state.setProducts(products);
        console.log('Products Loaded', window.state.getProducts());

        // Render products
        const productList = document.querySelector('.product-list');
        if (productList) {
          productList.innerHTML = window.state.getProducts().map(product => `
                        <div class="product" onclick="navigateTo('product_detail?id=${product.id}')">
                            <img src="${product.imageUrl || 'https://via.placeholder.com/500'}" alt="${product.name}">
                            <h3>${product.name}</h3>
                            <p>R${parseFloat(product.price).toFixed(2)}</p>
                        </div>
                    `).join('');
        } else {
          console.error('Product list container not found');
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
