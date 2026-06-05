window.User = class User {
  constructor(userId, name, email, roleId, password) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.roleId = roleId;
    this.password = password;
  }

  static fromJSON(json) {
    return new User(
      json.userId || null,
      json.name|| null,
      json.email||  null,
      json.roleId|| null,
      json.password|| null,
  );
  }

  toJSON() {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
      roleId: this.roleId,
      password: this.password,
    };
  }

  isValid() {
    return this.email && typeof this.email === 'string' && this.email.includes('@');
  }
}
