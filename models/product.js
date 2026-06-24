window.Product = class Product {
  constructor(id, sellerId,categoryId,name,description,price,status,createAt,image) {
    this.id = id;
    this.sellerId = sellerId;
    this.categoryId = categoryId;
    this.name = name;
    this.description = description;
    this.price = price;
    this.status = status;
    this.createAt = createAt;
    this.image = image;
  }

  static fromJSON(json) {
    return new Product(
      json.id || null,
      json.sellerId || null,
      json.categoryId || null,
      json.name || null,
      json.description || null,
      json.price || null,
      json.status || null,
      json.createAt || null,
      json.image || null,
    );
  }

  toJSON() {
    return {
      id: this.id,
      sellerId: this.sellerId,
      categoryId: this.categoryId,
      name: this.name,
      description: this.description,
      price: this.price,
      status: this.status,
      createAt: this.createAt,
      image: this.image,
    };
  }
}
