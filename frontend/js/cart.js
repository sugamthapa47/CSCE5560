// Cart stored in localStorage as [{id, name, price, image_url, quantity}]

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}
function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}
function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);
}
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  saveCart(cart);
  showToast(`${product.name} added to cart!`);
}
function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
}
function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) { item.quantity = Math.max(1, parseInt(quantity)); saveCart(cart); }
}
function clearCart() {
  localStorage.removeItem("cart");
  updateCartBadge();
}
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText = "position:fixed;bottom:24px;right:24px;background:#1a1a2e;color:white;padding:14px 24px;border-radius:8px;font-size:.9rem;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);transition:opacity .3s;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = "0"; }, 2500);
}
