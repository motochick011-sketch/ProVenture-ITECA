window.state = {
  user: null,
  products: [],

  init() {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      this.user = window.User.fromJSON(JSON.parse(storedUser));
    }
    const storedProducts = sessionStorage.getItem('products');
    if (storedProducts) {
      this.products = JSON.parse(storedProducts).map(data => window.Product.fromJSON(data));
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
  }
};

window.state.init();
