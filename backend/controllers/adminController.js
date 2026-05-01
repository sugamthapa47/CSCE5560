const db = require("../config/db");

exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, o.shipping_address,
              u.name AS customer, u.email
       FROM orders o JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ["pending","paid","shipped","delivered","cancelled"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status" });
  try {
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.addProduct = async (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Name and price are required" });
  try {
    const [result] = await db.query(
      "INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, price, stock || 0, category, image_url]
    );
    res.status(201).json({ message: "Product added", productId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body;
  try {
    await db.query(
      "UPDATE products SET name=?, description=?, price=?, stock=?, category=?, image_url=? WHERE id=?",
      [name, description, price, stock, category, image_url, req.params.id]
    );
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};
