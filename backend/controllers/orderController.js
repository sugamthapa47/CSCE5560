const db = require("../config/db");

// POST /api/orders
exports.placeOrder = async (req, res) => {
  const { items, shippingAddress } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0)
    return res.status(400).json({ error: "Order must contain at least one item" });
  if (!shippingAddress)
    return res.status(400).json({ error: "Shipping address is required" });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const [rows] = await conn.query("SELECT * FROM products WHERE id = ?", [item.productId]);
      if (rows.length === 0) throw new Error(`Product not found: ${item.productId}`);
      const product = rows[0];
      if (product.stock < item.quantity) throw new Error(`Not enough stock for: ${product.name}`);

      total += product.price * item.quantity;
      orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });

      await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, product.id]);
    }

    const [orderResult] = await conn.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)",
      [userId, total.toFixed(2), shippingAddress]
    );
    const orderId = orderResult.insertId;

    for (const oi of orderItems) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderId, oi.productId, oi.quantity, oi.unitPrice]
      );
    }

    await conn.commit();
    res.status(201).json({ message: "Order placed successfully", orderId, total: total.toFixed(2) });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message || "Failed to place order" });
  } finally {
    conn.release();
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at,
              JSON_ARRAYAGG(JSON_OBJECT(
                'product', p.name, 'qty', oi.quantity, 'price', oi.unit_price
              )) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p     ON p.id = oi.product_id
       WHERE o.user_id = ?
       GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
