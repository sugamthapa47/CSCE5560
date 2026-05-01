CREATE DATABASE IF NOT EXISTS secure_ecommerce;
USE secure_ecommerce;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)             NOT NULL,
  email       VARCHAR(150)             NOT NULL UNIQUE,
  password    VARCHAR(255)             NOT NULL,
  role        ENUM('customer','admin') DEFAULT 'customer',
  created_at  DATETIME                 DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT        NOT NULL,
  otp_code   VARCHAR(6) NOT NULL,
  expires_at DATETIME   NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200)    NOT NULL,
  description TEXT,
  price       DECIMAL(10,2)   NOT NULL,
  stock       INT             DEFAULT 0,
  category    VARCHAR(100),
  image_url   VARCHAR(500),
  created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT             NOT NULL,
  total_amount     DECIMAL(10,2)   NOT NULL,
  status           ENUM('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
  shipping_address TEXT,
  created_at       DATETIME        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT           NOT NULL,
  product_id INT           NOT NULL,
  quantity   INT           NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Admin account: password is Admin@1234
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@secureshop.com',
 '$2b$12$KIXCqCziRsGFuDgpFC8W4.XVCUiQXa1wFHm6qPc0yCFr0LYVL3yxm', 'admin');

INSERT IGNORE INTO products (name, description, price, stock, category, image_url) VALUES
('iPhone 15 Pro',      'Apple flagship with A17 Bionic chip, titanium design, 48MP camera.',        999.99,  50, 'Smartphones',  'https://images.unsplash.com/photo-1696446702183-cbd272f3bec0?w=400'),
('Samsung Galaxy S24', 'AI-powered Android flagship with 200MP camera and Snapdragon 8 Gen 3.',     899.99,  40, 'Smartphones',  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'),
('MacBook Air M3',     'Ultra-thin laptop with Apple M3 chip, 18-hour battery, Liquid Retina.',    1299.99,  25, 'Laptops',      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'),
('Dell XPS 15',        'High-performance Windows laptop with OLED display and RTX 4060.',          1199.99,  30, 'Laptops',      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400'),
('Sony WH-1000XM5',    'Industry-leading noise cancelling headphones, 30-hour battery.',            349.99, 100, 'Headphones',   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
('Apple Watch Series 9','Advanced health tracking, crash detection, always-on Retina display.',     399.99,  60, 'Smartwatches', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'),
('AirPods Pro 2',      'Active noise cancellation, Adaptive Audio, H2 chip, USB-C charging.',      249.99,  80, 'Headphones',   'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400'),
('iPad Pro M4',        '13-inch Ultra Retina XDR display, M4 chip, thinnest Apple product ever.',  1099.99,  35, 'Tablets',      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400');
