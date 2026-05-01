const db = require("../config/db");

// GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    let query  = "SELECT * FROM products WHERE stock > 0";
    const params = [];

    if (req.query.category) {
      query += " AND category = ?";
      params.push(req.query.category);
    }
    if (req.query.search) {
      query += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    query += " ORDER BY created_at DESC";
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};
