const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// ── GET all media for a product (public) ─────────────────
router.get("/:productId", async (req, res) => {
  try {
    const [media] = await db.query(
      "SELECT * FROM product_media WHERE product_id = ? ORDER BY sort_order ASC",
      [req.params.productId]
    );
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST add media to a product (admin only) ─────────────
router.post("/:productId", protect, restrictTo("admin"), async (req, res) => {
  try {
    const { url, type = "image", sort_order = 0 } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    await db.query(
      "INSERT INTO product_media (product_id, url, type, sort_order) VALUES (?, ?, ?, ?)",
      [req.params.productId, url, type, sort_order]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE media by id (admin only) ──────────────────────
router.delete("/:mediaId", protect, restrictTo("admin"), async (req, res) => {
  try {
    await db.query("DELETE FROM product_media WHERE id = ?", [req.params.mediaId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
