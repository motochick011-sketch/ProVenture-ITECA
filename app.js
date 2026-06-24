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
    } else if (screenId === 'cart_screen') {
      screenPath = "UI/shopping_chart.html";
    } else if (screenId === 'admin_dashboard_screen') {
      screenPath = "UI/admin_dashboard.html";
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
    } else if (screenId === 'cart_screen') {
      displayCart();
    } else if (screenId === 'admin_dashboard_screen') {
      attachAdminDashboardEvents();
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

  const adminForm = document.getElementById('adminLoginForm');
  if (adminForm) {
    adminForm.onsubmit = async function(event) {
      event.preventDefault();
      const username = document.getElementById('adminUsername').value;
      const password = document.getElementById('adminPassword').value;
      const errorEl = document.getElementById('adminLoginError');

      const validUsername = 'admin';
      const validPassword = 'admin123';

      if (username === validUsername && password === validPassword) {
        window.state.setUser({
          id: 99,
          userName: 'Admin',
          email: 'admin@proventure.com',
          role: 'admin'
        });
        errorEl.style.display = 'none';
        alert('Admin Login Successful!');
        await fetchProductsIfNeeded();
        navigateTo('admin_dashboard_screen');
      } else {
        errorEl.textContent = 'Invalid admin credentials.';
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
function displayCart() {
  const cart = window.state.getCart();
  const tbody = document.querySelector('.cart tbody');
  const totalEl = document.querySelector('.total-price');
  const continueBtn = document.querySelector('.btn-secondary');

  if (continueBtn) {
    continueBtn.onclick = () => navigateTo('product_listings_screen');
  }

  if (!tbody) return;

  if (cart.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;">Your cart is empty</td></tr>';
    if (totalEl) totalEl.textContent = 'R0.00';
    return;
  }

  let total = 0;
  tbody.innerHTML = cart.map((item, index) => {
    const price = parseFloat(item.price);
    total += price;
    return `
      <tr>
        <td>
          <div class="product">
            <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}">
            <span><strong>${item.name}</strong></span>
          </div>
        </td>
        <td>R${price.toFixed(2)}</td>
        <td>
          <div class="quantity">
            <span>1</span>
            <span class="delete" onclick="removeFromCart(${index})">🗑️</span>
          </div>
        </td>
        <td>R${price.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  if (totalEl) totalEl.textContent = 'R' + total.toFixed(2);
}

function removeFromCart(index) {
  const cart = window.state.getCart();
  cart.splice(index, 1);
  sessionStorage.setItem('cart', JSON.stringify(cart));
  window.state.cart = cart;
  displayCart();
  updateNavLinks();
}

window.displayCart = displayCart;
window.removeFromCart = removeFromCart;

function attachAdminDashboardEvents() {
  const sidebarItems = document.querySelectorAll('.sidebar ul li');
  sidebarItems.forEach(item => {
    const text = item.textContent.trim();
    item.onclick = function() {
      // Remove active styling from all
      sidebarItems.forEach(i => i.style.background = '');
      item.style.background = 'rgba(255,255,255,0.1)';

      if (text.includes('Dashboard')) {
        showAdminDashboard();
      } else if (text.includes('Products')) {
        showAdminProducts();
      } else if (text.includes('Users')) {
        showAdminUsers();
      } else if (text.includes('Categories')) {
        showAdminCategories();
      } else if (text.includes('Logout')) {
        window.state.clearUser();
        window.state.clearCart();
        alert('Logged out.');
        navigateTo('main_screen');
      }
    };
  });
}

function showAdminDashboard() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <h2>Dashboard</h2>
    <div class="stats">
      <div class="card users">
        <i class="fas fa-users"></i>
        <div>
          <div class="card-number">2</div>
          <div class="card-text">Users</div>
        </div>
      </div>
      <div class="card products">
        <i class="fas fa-box"></i>
        <div>
          <div class="card-number">${window.state.getProducts().length}</div>
          <div class="card-text">Products</div>
        </div>
      </div>
      <div class="card orders">
        <i class="fas fa-clipboard-list"></i>
        <div>
          <div class="card-number">85</div>
          <div class="card-text">Orders</div>
        </div>
      </div>
      <div class="card categories">
        <i class="fas fa-table-cells-large"></i>
        <div>
          <div class="card-number">6</div>
          <div class="card-text">Categories</div>
        </div>
      </div>
    </div>

    <h3 class="section-title">Recent Orders</h3>
    <table>
      <thead>
        <tr><th>Order ID</th><th>User</th><th>Total</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr><td>#1001</td><td>John Doe</td><td>R1,000.00</td><td><span class="status completed">Completed</span></td></tr>
        <tr><td>#1002</td><td>Jane Smith</td><td>R950.00</td><td><span class="status processing">Processing</span></td></tr>
        <tr><td>#1003</td><td>Alex Lee</td><td>R1,250.00</td><td><span class="status pending">Pending</span></td></tr>
        <tr><td>#1004</td><td>Maria Tan</td><td>R650.00</td><td><span class="status completed">Completed</span></td></tr>
      </tbody>
    </table>
  `;
}

function showAdminProducts() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  const products = window.state.getProducts();
  const rows = products.map(p => `
    <tr>
      <td>${p.id}</td>
      <td><img src="${p.image || ''}" style="width:40px;height:40px;object-fit:contain;"> ${p.name}</td>
      <td>R${parseFloat(p.price).toFixed(2)}</td>
      <td>${categoryMap[p.categoryId] || 'Unknown'}</td>
      <td>${p.status || 'N/A'}</td>
    </tr>
  `).join('');

  mainContent.innerHTML = `
    <h2>Products</h2>
    <table>
      <thead>
        <tr><th>ID</th><th>Product</th><th>Price</th><th>Category</th><th>Status</th></tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:20px;">No products loaded. Visit the shop first to load products.</td></tr>'}</tbody>
    </table>
  `;
}

function showAdminUsers() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <h2>Users</h2>
    <table>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>
      </thead>
      <tbody>
        <tr><td>1</td><td>Jade</td><td>jadeclegg11@gmail.com</td><td>User</td></tr>
        <tr><td>99</td><td>Admin</td><td>admin@proventure.com</td><td>Admin</td></tr>
      </tbody>
    </table>
  `;
}

function showAdminCategories() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  const categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Fashion' },
    { id: 3, name: 'Home & Living' },
    { id: 4, name: 'Books' },
    { id: 5, name: 'Sports' },
    { id: 6, name: 'Vehicles' }
  ];

  const rows = categories.map(c => `
    <tr><td>${c.id}</td><td>${c.name}</td></tr>
  `).join('');

  mainContent.innerHTML = `
    <h2>Categories</h2>
    <table>
      <thead>
        <tr><th>ID</th><th>Category Name</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

window.attachAdminDashboardEvents = attachAdminDashboardEvents;
window.showAdminDashboard = showAdminDashboard;
window.showAdminProducts = showAdminProducts;
window.showAdminUsers = showAdminUsers;
window.showAdminCategories = showAdminCategories;

async function fetchProductsIfNeeded() {
  if (window.state.getProducts().length > 0) return;

  // Ensure Product model is loaded
  if (!window.Product) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/models/product.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  try {
    const response = await fetch('UI/get_products.php');
    const rawText = await response.text();
    const cleanText = rawText.replace(/^\uFEFF/, '');
    const result = JSON.parse(cleanText);

    if (result.success && window.Product) {
      const products = result.products.map(p => window.Product.fromJSON(p));
      window.state.setProducts(products);
    }
  } catch (e) {
    console.error('Failed to pre-load products:', e.message);
  }
}

window.fetchProductsIfNeeded = fetchProductsIfNeeded;
