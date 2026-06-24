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
    updateNavLinks();

    window.currentQueryParams = queryParams;

    if (screenId === 'main_screen') {
      attachMainScreenEvents();
    }
    else if (screenId === 'product_listings_screen') {
      await loadProductsScript();
    } else if (screenId === 'product_details_screen') {
      displayProductDetails(productId);
    } else if (screenId === 'login_screen') {
      attachLoginScreenEvents();
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

function updateNavLinks() {
  const navContainers = document.querySelectorAll('.nav-links, nav, .nav');
  navContainers.forEach(nav => {
    const user = window.state.getUser();
    if (user) {
      nav.innerHTML = `
        <a href="#">Sell</a>
        <a href="#" onclick="navigateTo('cart_screen')">Cart (${window.state.getCart().length})</a>
        <a href="#" onclick="handleLogout()">Logout</a>
      `;
    } else {
      nav.innerHTML = `
        <a href="#">Sell</a>
        <a href="#" onclick="navigateTo('login_screen')">Login</a>
        <a href="#" onclick="navigateTo('register_screen')">Register</a>
      `;
    }
  });
}

function handleLogout() {
  window.state.clearUser();
  window.state.clearCart();
  alert('Logged out.');
  navigateTo('main_screen');
}

window.handleLogout = handleLogout;
window.updateNavLinks = updateNavLinks;

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
    breadcrumb.innerHTML = `<button class="btn back-btn" onclick="navigateTo('product_listings_screen')">← Back</button> Home / ${category} / <strong>${product.name}</strong>`;
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

function attachLoginScreenEvents() {
  const userForm = document.getElementById('loginForm');
  if (userForm) {
    userForm.onsubmit = function(event) {
      event.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');

      const validEmail = 'jadeclegg11@gmail.com';
      const validPassword = '12345';

      if (email === validEmail && password === validPassword) {
        window.state.setUser({
          id: 1,
          userName: 'Jade',
          email: 'jadeclegg11@gmail.com',
          role: 1
        });
        errorEl.style.display = 'none';
        alert('Login Successful!');
        navigateTo('main_screen');
      } else {
        errorEl.textContent = 'Invalid email or password.';
        errorEl.style.display = 'block';
      }
    };
  }
}

window.showForm = function(type) {
  const userForm = document.getElementById("userForm");
  const adminForm = document.getElementById("adminForm");
  const userBtn = document.getElementById("userBtn");
  const adminBtn = document.getElementById("adminBtn");

  if (type === "user") {
    userForm.classList.remove("hidden");
    adminForm.classList.add("hidden");
    userBtn.classList.add("active");
    adminBtn.classList.remove("active");
  } else {
    adminForm.classList.remove("hidden");
    userForm.classList.add("hidden");
    adminBtn.classList.add("active");
    userBtn.classList.remove("active");
  }
};
