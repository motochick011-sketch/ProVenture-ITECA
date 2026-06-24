let currentScreen = 'main_screen';

async function loadScreen(screenId, queryParams = '') {
  try {
    let screenPath;
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
    } else if (screenId === 'login_screen') {
      // attachLoginScreenEvents();
    } else if (screenId === 'register_screen') {
      // attachRegisterScreenEvents();
    } else if (screenId === 'product_detail') {
      // attachProductDetailsEvents();
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
