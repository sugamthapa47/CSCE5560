const express = require("express");
const r = express.Router();
const { placeOrder, getMyOrders } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
r.post("/",   protect, placeOrder);
r.get("/my",  protect, getMyOrders);
module.exports = r;
