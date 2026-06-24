window.state = {
  user: null,
  products: [],
  cart: [],

  init() {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      this.user = window.User.fromJSON(JSON.parse(storedUser));
    }
    const storedProducts = sessionStorage.getItem('products');
    if (storedProducts) {
      this.products = JSON.parse(storedProducts).map(data => window.Product.fromJSON(data));
    }
    const storedCart = sessionStorage.getItem('cart');
    if (storedCart) {
      this.cart = JSON.parse(storedCart);
    }
  },

  setUser(user) {
    if (user && typeof user === 'object') {
      this.user = new window.User(
        user.id||null,
        user.userName || null,
        user.email||  null,
        user.role ||null
      );
      sessionStorage.setItem('user', JSON.stringify(this.user.toJSON()));
    } else {
      throw new Error('Invalid user object');
    }
  },

  getUser() {
    return this.user;
  },

  clearUser() {
    this.user = null;
    sessionStorage.removeItem('user');
  },

  setProducts(products) {
    if (Array.isArray(products)) {
      this.products = products;
      sessionStorage.setItem('products', JSON.stringify(products.map(p => p.toJSON ? p.toJSON() : p)));
    } else {
      throw new Error('Invalid products array');
    }
  },

  getProducts() {
    return this.products;
  },

  addToCart(product) {
    this.cart.push(product.toJSON ? product.toJSON() : product);
    sessionStorage.setItem('cart', JSON.stringify(this.cart));
  },

  getCart() {
    return this.cart;
  },

  clearCart() {
    this.cart = [];
    sessionStorage.removeItem('cart');
  }
};

window.state.init();
