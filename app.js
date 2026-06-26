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
    } else if (screenId === 'seller_dashboard_screen') {
      screenPath = "UI/seller_dashboard.html";
    } else if (screenId === 'terms_screen') {
      screenPath = "UI/terms.html";
    } else if (screenId === 'privacy_screen') {
      screenPath = "UI/privacy.html";
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
      // Apply category filter if navigated from homepage category
      if (window.pendingCategoryFilter) {
        filterByCategory(window.pendingCategoryFilter);
        window.pendingCategoryFilter = null;
      }
    } else if (screenId === 'product_details_screen') {
      displayProductDetails(productId);
    } else if (screenId === 'login_screen') {
      attachLoginScreenEvents();
    } else if (screenId === 'cart_screen') {
      displayCart();
    } else if (screenId === 'admin_dashboard_screen') {
      attachAdminDashboardEvents();
      showAdminDashboard();
    } else if (screenId === 'seller_dashboard_screen') {
      loadSellerProducts();
    } else if (screenId === 'register_screen') {
      attachRegisterScreenEvents();
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
      const isSeller = user.roleId == 2 || user.roleId == 3 || user.role == 2 || user.role == 3;
      nav.innerHTML = `
        ${isSeller ? '<a href="#" onclick="navigateTo(\'seller_dashboard_screen\')">Sell</a>' : ''}
        <a href="#" onclick="navigateTo('cart_screen')">Cart</a>
        <a href="#" onclick="handleLogout()">Logout</a>
      `;
    } else {
      nav.innerHTML = `
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

  // Load categories from DB
  loadHomeCategories();
}

async function loadHomeCategories() {
  const box = document.getElementById('homeCategoryBox');
  if (!box) return;

  try {
    const response = await fetch('UI/get_categories.php');
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      box.innerHTML = result.categories.map(c => `
        <div class="card" style="cursor:pointer;" onclick="navigateToCategory(${c.id})">
          <i class="fas fa-${c.icon || 'tag'}" style="font-size:40px;color:#5a50c8;margin-bottom:10px;"></i>
          <p>${c.categoryName}</p>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Error loading categories:', e);
  }
}

function navigateToCategory(categoryId) {
  window.pendingCategoryFilter = categoryId;
  navigateTo('product_listings_screen');
}

window.loadHomeCategories = loadHomeCategories;
window.navigateToCategory = navigateToCategory;
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

async function addToCart() {
  const user = window.state.getUser();
  if (!user) {
    alert('Please log in to add items to your cart.');
    return;
  }

  const productId = window.currentProductId;

  try {
    const response = await fetch('UI/cart_add_item.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId, productId: parseInt(productId) })
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      alert('Item added to cart!');
    } else {
      alert('Error: ' + result.message);
    }
  } catch (e) {
    alert('Error connecting to server.');
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
    userForm.onsubmit = async function(event) {
      event.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');

      try {
        const response = await fetch('UI/login_api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const rawText = await response.text();
        const cleanText = rawText.replace(/^\uFEFF/, '');
        const result = JSON.parse(cleanText);

        if (result.success) {
          window.state.setUser({
            id: result.user.userId,
            userName: result.user.name,
            email: result.user.email,
            role: result.user.roleId
          });
          errorEl.style.display = 'none';
          alert('Login Successful!');
          navigateTo('main_screen');
        } else {
          errorEl.textContent = result.message;
          errorEl.style.display = 'block';
        }
      } catch (e) {
        errorEl.textContent = 'Error connecting to server.';
        errorEl.style.display = 'block';
      }
    };
  }

  const adminForm = document.getElementById('adminLoginForm');
  if (adminForm) {
    adminForm.onsubmit = async function(event) {
      event.preventDefault();
      const email = document.getElementById('adminUsername').value;
      const password = document.getElementById('adminPassword').value;
      const errorEl = document.getElementById('adminLoginError');

      try {
        const response = await fetch('UI/login_api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const rawText = await response.text();
        const cleanText = rawText.replace(/^\uFEFF/, '');
        const result = JSON.parse(cleanText);

        if (result.success) {
          // Check if user has admin role (roleId 2)
          if (result.user.roleId == 2) {
            window.state.setUser({
              id: result.user.userId,
              userName: result.user.name,
              email: result.user.email,
              role: result.user.roleId
            });
            errorEl.style.display = 'none';
            alert('Admin Login Successful!');
            await fetchProductsIfNeeded();
            navigateTo('admin_dashboard_screen');
          } else {
            errorEl.textContent = 'This account does not have admin privileges.';
            errorEl.style.display = 'block';
          }
        } else {
          errorEl.textContent = result.message;
          errorEl.style.display = 'block';
        }
      } catch (e) {
        errorEl.textContent = 'Error connecting to server.';
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
async function displayCart() {
  const user = window.state.getUser();
  if (!user) return;

  const tbody = document.getElementById('cartBody');
  const totalEl = document.getElementById('cartTotal');
  if (!tbody) return;

  try {
    const response = await fetch('UI/cart_get.php?userId=' + user.userId);
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      window.currentOrderId = result.orderId;

      if (!result.items || result.items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;">Your cart is empty</td></tr>';
        if (totalEl) totalEl.textContent = 'R0.00';
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
      }

      let total = 0;
      tbody.innerHTML = result.items.map(item => {
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
            <td><span class="delete" onclick="removeCartItem(${item.cartItemId})">🗑 Remove</span></td>
            <td>R${price.toFixed(2)}</td>
          </tr>
        `;
      }).join('');

      if (totalEl) totalEl.textContent = 'R' + total.toFixed(2);
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;">Error loading cart.</td></tr>';
  }
}

async function removeCartItem(cartItemId) {
  try {
    const response = await fetch('UI/cart_remove_item.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItemId })
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      displayCart();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (e) {
    alert('Error connecting to server.');
  }
}

async function proceedToCheckout() {
  if (!window.currentOrderId) {
    alert('No items in cart.');
    return;
  }

  try {
    const response = await fetch('UI/cart_checkout.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: window.currentOrderId, action: 'pending' })
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      document.getElementById('cartSection').style.display = 'none';
      const paymentSection = document.getElementById('paymentSection');
      paymentSection.style.display = 'block';
      document.getElementById('paymentTotal').textContent = document.getElementById('cartTotal').textContent;
    } else {
      alert('Error: ' + result.message);
    }
  } catch (e) {
    alert('Error connecting to server.');
  }
}

async function confirmPayment() {
  try {
    const response = await fetch('UI/cart_checkout.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: window.currentOrderId, action: 'completed' })
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      alert('Payment confirmed! Your order is complete.');
      window.currentOrderId = null;
      navigateTo('main_screen');
    } else {
      alert('Error: ' + result.message);
    }
  } catch (e) {
    alert('Error connecting to server.');
  }
}

window.displayCart = displayCart;
window.removeCartItem = removeCartItem;
window.proceedToCheckout = proceedToCheckout;
window.confirmPayment = confirmPayment;

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
      } else if (text.includes('Orders')) {
        showAdminOrders();
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

async function showAdminDashboard() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = '<h2>Dashboard</h2><p>Loading...</p>';

  // Fetch stats
  let stats = { users: '—', orders: '—', products: '—', categories: '—', revenue: 0 };
  try {
    const statsResp = await fetch('UI/admin_stats.php');
    const statsRaw = await statsResp.text();
    const statsResult = JSON.parse(statsRaw.replace(/^\uFEFF/, ''));
    if (statsResult.success) stats = statsResult;
  } catch (e) {}

  let ordersHtml = '';
  try {
    const response = await fetch('UI/orders_get_all.php');
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success && result.orders.length > 0) {
      const statusStyle = (status) => {
        if (status === 'completed') return 'background:#e8f7ee;color:#27ae60;';
        if (status === 'pending') return 'background:#ffeaea;color:#e74c3c;';
        if (status === 'active') return 'background:#fff4e6;color:#f39c12;';
        return '';
      };

      const recentOrders = result.orders.slice(0, 5);
      const rows = recentOrders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${o.userName}</td>
          <td><span style="padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold;${statusStyle(o.status)}">${o.status}</span></td>
          <td>${o.date}</td>
        </tr>
      `).join('');

      ordersHtml = `
        <h3 class="section-title">Recent Orders</h3>
        <table>
          <thead><tr><th>Order ID</th><th>User</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } else {
      ordersHtml = '<h3 class="section-title">Recent Orders</h3><p>No orders yet.</p>';
    }
  } catch (e) {
    ordersHtml = '<h3 class="section-title">Recent Orders</h3><p>Error loading orders.</p>';
  }

  mainContent.innerHTML = `
    <h2>Dashboard</h2>
    <div class="stats">
      <div class="card users">
        <i class="fas fa-users"></i>
        <div>
          <div class="card-number">${stats.users}</div>
          <div class="card-text">Users</div>
        </div>
      </div>
      <div class="card products">
        <i class="fas fa-box"></i>
        <div>
          <div class="card-number">${stats.products}</div>
          <div class="card-text">Products</div>
        </div>
      </div>
      <div class="card orders">
        <i class="fas fa-clipboard-list"></i>
        <div>
          <div class="card-number">${stats.orders}</div>
          <div class="card-text">Orders</div>
        </div>
      </div>
      <div class="card categories">
        <i class="fas fa-table-cells-large"></i>
        <div>
          <div class="card-number">${stats.categories}</div>
          <div class="card-text">Categories</div>
        </div>
      </div>
      <div class="card" style="flex:1;border:1px solid #eee;border-radius:8px;padding:18px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <i class="fas fa-money-bill-wave" style="font-size:20px;padding:10px;border-radius:6px;color:#27ae60;background:#e9f8ef;"></i>
        <div>
          <div class="card-number">R${parseFloat(stats.revenue).toFixed(2)}</div>
          <div class="card-text">Revenue</div>
        </div>
      </div>
    </div>
    ${ordersHtml}
  `;
}

async function showAdminProducts() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = '<h2>Products</h2><p>Loading...</p>';

  try {
    const response = await fetch('UI/get_all_products_admin.php');
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      const rows = result.products.map(p => `
        <tr style="${p.isDeleted == 1 ? 'opacity:0.5;' : ''}">
          <td>${p.id}</td>
          <td><img src="${p.image || ''}" style="width:40px;height:40px;object-fit:contain;"> ${p.name}</td>
          <td>R${parseFloat(p.price).toFixed(2)}</td>
          <td>${categoryMap[p.categoryId] || 'Unknown'}</td>
          <td>${p.sellerName}</td>
          <td>${p.isDeleted == 1 ? '<span style="color:red;">Deleted</span>' : p.status}</td>
          <td>${p.isDeleted == 0 ? `<button onclick="adminDeleteProduct(${p.id})" style="background:#e74c3c;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">Delete</button>` : '—'}</td>
        </tr>
      `).join('');

      mainContent.innerHTML = `
        <h2>Products</h2>
        <table>
          <thead>
            <tr><th>ID</th><th>Product</th><th>Price</th><th>Category</th><th>Seller</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:20px;">No products found.</td></tr>'}</tbody>
        </table>
      `;
    }
  } catch (e) {
    mainContent.innerHTML = '<h2>Products</h2><p>Error connecting to server.</p>';
  }
}

async function adminDeleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const response = await fetch('UI/admin_delete_product.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      // Remove from local state
      const products = window.state.getProducts().filter(p => p.id != productId);
      window.state.setProducts(products);
      alert('Product deleted.');
      showAdminProducts();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (e) {
    alert('Error connecting to server.');
  }
}

window.adminDeleteProduct = adminDeleteProduct;

async function showAdminUsers() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = '<h2>Users</h2><p>Loading...</p>';

  try {
    const response = await fetch('UI/get_users.php');
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      const roleLabel = (rid) => {
        if (rid == 1) return 'User';
        if (rid == 2) return 'Admin';
        if (rid == 3) return 'Seller';
        return 'Unknown';
      };

      const rows = result.users.map(u => `
        <tr>
          <td>${u.userId}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>
            ${u.roleId == 2 ? 'Admin' : `<select onchange="adminChangeRole(${u.userId}, this.value)" style="padding:4px;border-radius:3px;border:1px solid #ddd;">
              <option value="1" ${u.roleId == 1 ? 'selected' : ''}>User</option>
              <option value="3" ${u.roleId == 3 ? 'selected' : ''}>Seller</option>
            </select>`}
          </td>
          <td>${u.isDisabled == 1 ? '<span style="color:red;">Disabled</span>' : '<span style="color:green;">Active</span>'}</td>
          <td>
            ${u.roleId != 2 ? `<button onclick="adminToggleUser(${u.userId}, ${u.isDisabled == 1 ? 0 : 1})" style="background:${u.isDisabled == 1 ? '#27ae60' : '#e67e22'};color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">${u.isDisabled == 1 ? 'Enable' : 'Disable'}</button>` : '—'}
          </td>
        </tr>
      `).join('');

      mainContent.innerHTML = `
        <h2>Users</h2>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } else {
      mainContent.innerHTML = '<h2>Users</h2><p>Failed to load users.</p>';
    }
  } catch (e) {
    mainContent.innerHTML = '<h2>Users</h2><p>Error connecting to server.</p>';
  }
}

async function adminToggleUser(userId, isDisabled) {
  try {
    const response = await fetch('UI/admin_disable_user.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isDisabled })
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      alert(result.message);
      showAdminUsers();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (e) {
    alert('Error connecting to server.');
  }
}

window.adminToggleUser = adminToggleUser;

async function showAdminCategories() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = '<h2>Categories</h2><p>Loading...</p>';

  try {
    const response = await fetch('UI/get_categories.php?includeDeleted=1');
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      const rows = result.categories.map(c => `
        <tr style="${c.isDeleted == 1 ? 'opacity:0.5;' : ''}">
          <td>${c.id}</td>
          <td><i class="fas fa-${c.icon || 'tag'}" style="font-size:24px;color:#6c63ff;"></i></td>
          <td>${c.categoryName}</td>
          <td>${c.description}</td>
          <td>${c.isDeleted == 1 ? '<span style="color:red;">Deleted</span>' : '<span style="color:green;">Active</span>'}</td>
          <td>${c.isDeleted == 0 ? `<button onclick="adminDeleteCategory(${c.id})" style="background:#e74c3c;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">Delete</button>` : '—'}</td>
        </tr>
      `).join('');

      mainContent.innerHTML = `
        <h2>Categories</h2>
        <button onclick="showAddCategoryForm()" style="background:#6c63ff;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-weight:bold;margin-bottom:15px;">+ Add Category</button>
        <div id="addCategoryForm" style="display:none;background:#f9f9f9;padding:15px;border:1px solid #ddd;border-radius:4px;margin-bottom:15px;">
          <h3 style="margin-bottom:10px;">Add Category</h3>
          <div style="margin-bottom:8px;"><label style="font-size:13px;">Name</label><input type="text" id="newCatName" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:3px;"></div>
          <div style="margin-bottom:8px;"><label style="font-size:13px;">Description</label><input type="text" id="newCatDesc" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:3px;"></div>
          <div style="margin-bottom:8px;"><label style="font-size:13px;">Icon URL</label><input type="text" id="newCatIcon" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:3px;" placeholder="https://cdn-icons-png.flaticon.com/..."></div>
          <button onclick="submitNewCategory()" style="background:#27ae60;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">Save</button>
          <button onclick="document.getElementById('addCategoryForm').style.display='none'" style="background:#999;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;margin-left:5px;">Cancel</button>
        </div>
        <table>
          <thead>
            <tr><th>ID</th><th>Icon</th><th>Name</th><th>Description</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }
  } catch (e) {
    mainContent.innerHTML = '<h2>Categories</h2><p>Error connecting to server.</p>';
  }
}

function showAddCategoryForm() {
  document.getElementById('addCategoryForm').style.display = 'block';
}

async function submitNewCategory() {
  const name = document.getElementById('newCatName').value;
  const description = document.getElementById('newCatDesc').value;
  const icon = document.getElementById('newCatIcon').value;

  if (!name || !description) {
    alert('Name and description are required.');
    return;
  }

  try {
    const response = await fetch('UI/admin_add_category.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryName: name, description, icon })
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      alert('Category added!');
      showAdminCategories();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (e) {
    alert('Error connecting to server.');
  }
}

async function adminDeleteCategory(categoryId) {
  if (!confirm('Are you sure you want to delete this category?')) return;

  try {
    const response = await fetch('UI/admin_delete_category.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId })
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      alert('Category deleted.');
      showAdminCategories();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (e) {
    alert('Error connecting to server.');
  }
}

window.showAddCategoryForm = showAddCategoryForm;
window.submitNewCategory = submitNewCategory;
window.adminDeleteCategory = adminDeleteCategory;

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

function attachRegisterScreenEvents() {
  const form = document.getElementById('registerForm');
  if (form) {
    form.onsubmit = async function(event) {
      event.preventDefault();
      const name = document.getElementById('fullname').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      const errorEl = document.getElementById('registerError');
      const agreeCheckbox = document.getElementById('agreeTerms');
      const roleId = document.getElementById('regRole').value;

      if (!agreeCheckbox.checked) {
        errorEl.textContent = 'You must agree to the Terms & Conditions and Privacy Policy.';
        errorEl.style.display = 'block';
        return;
      }

      try {
        const response = await fetch('UI/register_api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, roleId: parseInt(roleId) })
        });
        const rawText = await response.text();
        const cleanText = rawText.replace(/^\uFEFF/, '');
        const result = JSON.parse(cleanText);

        if (result.success) {
          window.state.setUser({
            id: result.user.userId,
            userName: result.user.name,
            email: result.user.email,
            role: result.user.roleId
          });
          errorEl.style.display = 'none';
          alert('Registration Successful!');
          navigateTo('main_screen');
        } else {
          errorEl.textContent = result.message;
          errorEl.style.display = 'block';
        }
      } catch (e) {
        errorEl.textContent = 'Error connecting to server.';
        errorEl.style.display = 'block';
      }
    };
  }
}

// Seller Dashboard Functions
async function loadSellerProducts() {
  const user = window.state.getUser();
  if (!user) {
    alert('Please log in first.');
    navigateTo('login_screen');
    return;
  }

  const tbody = document.getElementById('sellerProductsBody');
  if (!tbody) return;

  try {
    const response = await fetch('UI/get_seller_products.php?sellerId=' + user.userId);
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      if (result.products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">You have no products yet. Click "+ Add New Product" to get started.</td></tr>';
        return;
      }

      tbody.innerHTML = result.products.map(p => `
        <tr>
          <td><img src="${p.image || ''}">${p.name}</td>
          <td>R${parseFloat(p.price).toFixed(2)}</td>
          <td>${categoryMap[p.categoryId] || 'Unknown'}</td>
          <td>${p.status}</td>
          <td class="actions">
            <button class="btn btn-warning" onclick="sellerEditProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}', '${(p.description || '').replace(/'/g, "\\'")}', ${p.price}, ${p.categoryId}, '${(p.image || '').replace(/'/g, "\\'")}')">Edit</button>
            <button class="btn btn-danger" onclick="sellerDeleteProduct(${p.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">Error loading products.</td></tr>';
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">Error connecting to server.</td></tr>';
  }
}

function showSellerAddForm() {
  document.getElementById('formTitle').textContent = 'Add Product';
  document.getElementById('editProductId').value = '';
  document.getElementById('spName').value = '';
  document.getElementById('spDescription').value = '';
  document.getElementById('spPrice').value = '';
  document.getElementById('spCategory').value = '1';
  document.getElementById('spImage').value = '';
  document.getElementById('sellerProductForm').classList.add('visible');
}

function sellerEditProduct(id, name, description, price, categoryId, image) {
  document.getElementById('formTitle').textContent = 'Edit Product';
  document.getElementById('editProductId').value = id;
  document.getElementById('spName').value = name;
  document.getElementById('spDescription').value = description;
  document.getElementById('spPrice').value = price;
  document.getElementById('spCategory').value = categoryId;
  document.getElementById('spImage').value = image;
  document.getElementById('sellerProductForm').classList.add('visible');
}

function hideSellerForm() {
  document.getElementById('sellerProductForm').classList.remove('visible');
}

async function submitSellerProduct() {
  const user = window.state.getUser();
  const editId = document.getElementById('editProductId').value;
  const name = document.getElementById('spName').value;
  const description = document.getElementById('spDescription').value;
  const price = document.getElementById('spPrice').value;
  const categoryId = document.getElementById('spCategory').value;
  const image = document.getElementById('spImage').value;

  if (!name || !description || !price) {
    alert('Please fill in name, description, and price.');
    return;
  }

  const payload = {
    sellerId: user.userId,
    categoryId: parseInt(categoryId),
    name,
    description,
    price: parseFloat(price),
    status: 'available',
    image
  };

  try {
    let url;
    if (editId) {
      payload.id = parseInt(editId);
      url = 'UI/seller_update_product.php';
    } else {
      url = 'UI/seller_add_product.php';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      alert(editId ? 'Product updated!' : 'Product added!');
      hideSellerForm();
      loadSellerProducts();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (e) {
    alert('Error connecting to server.');
  }
}

async function sellerDeleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const response = await fetch('UI/seller_delete_product.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      alert('Product deleted.');
      loadSellerProducts();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (e) {
    alert('Error connecting to server.');
  }
}

window.loadSellerProducts = loadSellerProducts;
window.showSellerAddForm = showSellerAddForm;
window.sellerEditProduct = sellerEditProduct;
window.hideSellerForm = hideSellerForm;
window.submitSellerProduct = submitSellerProduct;
window.sellerDeleteProduct = sellerDeleteProduct;

// Admin Orders
async function showAdminOrders() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  mainContent.innerHTML = '<h2>Orders</h2><p>Loading...</p>';

  try {
    const response = await fetch('UI/orders_get_all.php');
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      if (result.orders.length === 0) {
        mainContent.innerHTML = '<h2>Orders</h2><p>No orders found.</p>';
        return;
      }

      const statusClass = (status) => {
        if (status === 'completed') return 'background:#e8f7ee;color:#27ae60;';
        if (status === 'pending') return 'background:#ffeaea;color:#e74c3c;';
        if (status === 'active') return 'background:#fff4e6;color:#f39c12;';
        return '';
      };

      const rows = result.orders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${o.userName}</td>
          <td>${o.userEmail}</td>
          <td><span style="padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold;${statusClass(o.status)}">${o.status}</span></td>
          <td>${o.date}</td>
          <td><button onclick="viewOrderDetails(${o.id})" style="background:#6c63ff;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">View Details</button></td>
        </tr>
      `).join('');

      mainContent.innerHTML = `
        <h2>Orders</h2>
        <table>
          <thead>
            <tr><th>Order ID</th><th>User</th><th>Email</th><th>Status</th><th>Date</th><th>Action</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div id="orderDetailsSection"></div>
      `;
    } else {
      mainContent.innerHTML = '<h2>Orders</h2><p>Failed to load orders.</p>';
    }
  } catch (e) {
    mainContent.innerHTML = '<h2>Orders</h2><p>Error connecting to server.</p>';
  }
}

async function viewOrderDetails(orderId) {
  const detailsSection = document.getElementById('orderDetailsSection');
  if (!detailsSection) return;

  detailsSection.innerHTML = '<p style="padding:20px;">Loading order items...</p>';

  try {
    const response = await fetch('UI/orders_get_items.php?orderId=' + orderId);
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      if (result.items.length === 0) {
        detailsSection.innerHTML = '<p style="padding:20px;">No items in this order.</p>';
        return;
      }

      let total = 0;
      const rows = result.items.map(item => {
        const price = parseFloat(item.price);
        total += price;
        const deletedTag = item.isDeleted == 1 ? ' <span style="color:red;font-size:11px;">(deleted)</span>' : '';
        return `
          <tr style="${item.isDeleted == 1 ? 'opacity:0.6;' : ''}">
            <td><img src="${item.image || ''}" style="width:30px;height:30px;object-fit:contain;"> ${item.name}${deletedTag}</td>
            <td>R${price.toFixed(2)}</td>
          </tr>
        `;
      }).join('');

      detailsSection.innerHTML = `
        <div style="margin-top:20px;padding:15px;border:1px solid #ddd;border-radius:4px;background:#fafafa;">
          <h3 style="margin-bottom:10px;">Order #${orderId} - Items</h3>
          <table>
            <thead><tr><th>Product</th><th>Price</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="text-align:right;margin-top:10px;font-weight:bold;font-size:16px;">Total: R${total.toFixed(2)}</p>
        </div>
      `;
    } else {
      detailsSection.innerHTML = '<p style="padding:20px;">Error loading order details.</p>';
    }
  } catch (e) {
    detailsSection.innerHTML = '<p style="padding:20px;">Error connecting to server.</p>';
  }
}

window.showAdminOrders = showAdminOrders;
window.viewOrderDetails = viewOrderDetails;

async function adminChangeRole(userId, roleId) {
  try {
    const response = await fetch('UI/admin_update_role.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roleId: parseInt(roleId) })
    });
    const rawText = await response.text();
    const result = JSON.parse(rawText.replace(/^\uFEFF/, ''));

    if (result.success) {
      alert('Role updated.');
    } else {
      alert('Error: ' + result.message);
      showAdminUsers();
    }
  } catch (e) {
    alert('Error connecting to server.');
  }
}

window.adminChangeRole = adminChangeRole;
