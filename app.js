let currentScreen = 'main_screen';

async function loadScreen(screenId, queryParams = '') {
  try {
    let screenPath;
    let productId = null;

    // Handle product_detail?id=X format
    if (screenId.startsWith('product_detail?id=')) {
      productId = screenId.split('id=')[1];
      screenId = 'product_details_screen';
    }

    if (screenId === 'main_screen=') {
      screenPath = "UI/main_screen.html";
    } else if (screenId === 'product_listings_screen') {
      screenPath = "UI/product_listings.html";
    } else if (screenId === 'product_details_screen') {
      screenPath = "UI/product_details.html";
    }  else if (screenId === 'login_screen') {
      screenPath = "UI/login.html";
    }  else if (screenId === 'register_screen') {
      screenPath = "UI/register.html";
    } else {
      screenPath = "UI/main_screen.html";
    }

    const response = await fetch(screenPath);
    if (!response.ok) throw new Error('Screen not found');
    document.getElementById('screen-container').innerHTML = await response.text();
    currentScreen = screenId;

    window.currentQueryParams = queryParams;

    if (screenId === 'main_screen') {
      attachMainScreenEvents();
    }
    else if (screenId === 'product_listings_screen') {
      await loadProductsScript();
    } else if (screenId === 'product_details_screen') {
      displayProductDetails(productId);
    } else if (screenId === 'login_screen') {
      // attachLoginScreenEvents();
    } else if (screenId === 'register_screen') {
      // attachRegisterScreenEvents();
    }
  } catch (error) {
    console.error('Error loading screen:', error);
    document.getElementById('screen-container').innerHTML = '<p>Error loading screen</p>';
  }
}
function navigateTo(screenId) {
  loadScreen(screenId);
}

window.navigateTo = navigateTo;

function attachMainScreenEvents() {
  const loginButton = document.querySelector('button[onclick="navigateTo(\'login_screen\')"]');
  const registerButton = document.querySelector('button[onclick="navigateTo(\'register_screen\')"]');
  if (loginButton) {
    loginButton.onclick = () => navigateTo('login_screen');
  }
  if (registerButton) {
    registerButton.onclick = () => navigateTo('register_screen');
  }

  const products = document.querySelectorAll('.product');
  products.forEach(product => {
    product.addEventListener('click', () => {
      const productId = product.getAttribute('data-product-id');
      navigateTo("product_detail?id=${productId}");
    });
  });
}
loadScreen('main_screen');

const categoryMap = {
  1: 'Electronics',
  2: 'Fashion',
  3: 'Home & Living',
  4: 'Books',
  5: 'Sports',
  6: 'Vehicles'
};

function displayProductDetails(productId) {
  const products = window.state.getProducts();
  const product = products.find(p => p.id == productId);

  if (!product) {
    document.getElementById('screen-container').innerHTML = '<p>Product not found</p>';
    return;
  }

  window.currentProductId = productId;

  const category = categoryMap[product.categoryId] || 'Unknown';

  const breadcrumb = document.querySelector('.breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML = `Home / ${category} / <strong>${product.name}</strong>`;
  }

  const imageBox = document.querySelector('.image-box img');
  if (imageBox) {
    imageBox.src = product.image || 'https://via.placeholder.com/220x300';
    imageBox.alt = product.name;
  }

  const title = document.querySelector('.details h1');
  if (title) {
    title.textContent = product.name;
  }

  const price = document.querySelector('.details .price');
  if (price) {
    price.textContent = 'R' + parseFloat(product.price).toFixed(2);
  }

  const description = document.querySelector('.details .description');
  if (description) {
    description.innerHTML = `<strong>Description:</strong><br><br>${product.description || 'No description available.'}`;
  }

  const info = document.querySelectorAll('.details .info');
  if (info.length > 0) {
    info[0].innerHTML = `<strong>Category:</strong> ${category}`;
  }
  if (info.length > 1) {
    info[1].innerHTML = `<strong>Status:</strong> ${product.status || 'N/A'}`;
  }
  if (info.length > 2) {
    info[2].innerHTML = `<strong>Listed:</strong> ${product.createAt || 'N/A'}`;
  }

  // Disable Add to Cart if not logged in
  const cartBtn = document.querySelector('.btn.cart');
  if (cartBtn && !window.state.getUser()) {
    cartBtn.disabled = true;
    cartBtn.style.opacity = '0.5';
    cartBtn.style.cursor = 'not-allowed';
    cartBtn.title = 'Please log in to add items to cart';
  }
}

window.displayProductDetails = displayProductDetails;

function addToCart() {
  if (!window.state.getUser()) {
    alert('Please log in to add items to your cart.');
    return;
  }

  const productId = window.currentProductId;
  const products = window.state.getProducts();
  const product = products.find(p => p.id == productId);

  if (product) {
    window.state.addToCart(product);
    alert(product.name + ' added to cart!');
    console.log('Cart:', window.state.getCart());
  }
}

window.addToCart = addToCart;

async function loadProductsScript() {
  return new Promise(async (resolve, reject) => {
    if (typeof window.loadProducts === 'function') {
      window.loadProducts().then(resolve).catch(reject);
      return;
    }

    const dependencies = [
      '/state.js',
      '/models/product.js',
      'UI/products.js'
    ];

    for (const src of dependencies) {
      await new Promise((depResolve, depReject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = depResolve;
        script.onerror = () => depReject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    }

    if (typeof window.loadProducts === 'function') {
      window.loadProducts().then(resolve).catch(reject);
    } else {
      reject(new Error('loadProducts function not found in products.js'));
    }
  });
}
