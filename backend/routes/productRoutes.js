const express = require("express");
const r = express.Router();
const { getAllProducts, getProductById } = require("../controllers/productController");
r.get("/",    getAllProducts);
r.get("/:id", getProductById);
module.exports = r;
