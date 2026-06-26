-- Seed data for almsafpa_eduvosprojd
-- Run this after initialMigration.sql to populate tables with data

-- Roles
INSERT INTO almsafpa_eduvosprojd.role (id, roleName, roleDescription) VALUES
(1, 'user', 'default user'),
(2, 'admin', 'admin user');

-- Users
INSERT INTO almsafpa_eduvosprojd.user (userId, name, email, password, roleId, isDisabled) VALUES
(1, 'Jade', 'jadeclegg11@gmail.com', '12345', 2, 0),
(2, 'ivan', 'ivanzaltsman@gmail.com', '54321', 1, 0);

-- Categories
INSERT INTO almsafpa_eduvosprojd.category (id, categoryName, description) VALUES
(1, 'Electronics', 'this is electronics'),
(2, 'Fashion', 'this is fashion'),
(3, 'Home & Living', 'this is home & living'),
(4, 'Books', 'this is books'),
(5, 'Sports', 'this is sports'),
(6, 'Vehicles', 'this is vehicles');

-- Products
INSERT INTO almsafpa_eduvosprojd.products (id, sellerId, categoryId, name, description, price, status, image) VALUES
(1, 1, 1, 'iPhone 12 64GB', 'this is an iPhone', 1699, 'available', 'https://cdn.shopify.com/s/files/1/0820/3439/3364/files/rn-image_picker_lib_temp_57094ed6-ea26-4439-9fd0-fa4aecab880d.jpg?v=1780351959&height=294&width=294'),
(2, 2, 2, 'Nike Air Jordan 1', 'this is nike air', 590, 'available', 'https://cdn-images.farfetch-contents.com/13/15/76/97/13157697_21516295_1000.jpg'),
(3, 1, 1, 'Canon EOS 200D', 'this is Canon EOS 200D', 1250, 'available', 'https://cdn.media.amplience.net/i/canon/eos_200d-ef-s18-55iii-frt_7536c415688b4e13bbde7e8dc33fdaff'),
(4, 2, 5, 'Nike Air Jordan 1', 'this is nike air', 590, 'available', 'https://cdn-images.farfetch-contents.com/13/15/76/97/13157697_21516295_1000.jpg'),
(5, 1, 3, 'Gaming Chair', 'this is a gaming chair', 450, 'available', 'https://karo.co.za/wp-content/uploads/2022/05/Thunder-red-1.jpg'),
(6, 2, 5, 'Gaming Chair', 'this is a gaming chair', 450, 'available', 'https://karo.co.za/wp-content/uploads/2022/05/Thunder-red-1.jpg'),
(7, 2, 1, 'MacBook Air 2017', 'this is a macbook', 1099, 'available', 'https://cdn.mos.cms.futurecdn.net/racnBKdzNx285vAxzd3kzb.jpg'),
(8, 2, 1, 'Fossil Watch', 'this is a fossil watch', 350, 'available', 'https://www.geewiz.co.za/133186-large_default/fossil-men-s-coachman-quartz-stainless-steel-and-leather-watch-brown.jpg'),
(9, 1, 2, 'Fossil Watch', 'this is a fossil watch', 350, 'available', 'https://www.geewiz.co.za/133186-large_default/fossil-men-s-coachman-quartz-stainless-steel-and-leather-watch-brown.jpg'),
(10, 1, 1, 'PlayStation 4', 'this is a playstation 4', 800, 'available', 'https://wefix.co.za/cdn/shop/files/playstation_4_pro_1tb_console_jet_black_ps4-2.png?v=1764532874'),
(11, 1, 3, 'Dining Table Set', 'This is a dining table set', 650, 'available', 'https://www.cielo.co.za/131592-large_default/montreal-atom-6-seater-dining-set-16m-black.jpg');

-- Orders (dummy data)
INSERT INTO almsafpa_eduvosprojd.orders (id, userId, status) VALUES
(1, 1, 'completed'),
(2, 1, 'completed'),
(3, 2, 'completed'),
(4, 2, 'completed');

-- Cart items (dummy data - products in orders)
INSERT INTO almsafpa_eduvosprojd.cart (id, orderId, productId) VALUES
(1, 1, 1),
(2, 1, 3),
(3, 2, 5),
(4, 3, 2),
(5, 3, 7),
(6, 4, 4);
