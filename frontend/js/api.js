const API = "/api";

// ── Token helpers ──────────────────────────────────────────
function getToken()   { return localStorage.getItem("token"); }
function getUser()    { return JSON.parse(localStorage.getItem("user") || "null"); }
function isLoggedIn() { return !!getToken(); }
function isAdmin()    { const u = getUser(); return u && u.role === "admin"; }

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/pages/login.html";
}

// ── Auth fetch ─────────────────────────────────────────────
async function authFetch(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res;
}

async function apiRegister(name, email, password) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

async function apiLogin(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function apiVerifyOTP(otp) {
  const res = await fetch(`${API}/auth/verify-otp`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp }),
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

// ══════════════════════════════════════════════════════════
//  PAGE TRANSITION — THE CORRECT WAY
//
//  THE BUG EXPLAINED:
//  body.transform breaks position:fixed for ALL descendants.
//  So we NEVER animate the body or any ancestor of fixed elements.
//  Instead, each HTML page has a <div id="page-content"> that
//  wraps the scrollable content. We animate THAT div only.
//  The nav, chatbot etc. are appended directly to <body>
//  and body has ZERO transform/filter/will-change ever.
// ══════════════════════════════════════════════════════════
function navigateTo(href) {
  const pc = document.getElementById("page-content");
  if (pc) {
    pc.style.transition = "opacity 0.22s ease, transform 0.22s ease";
    pc.style.opacity    = "0";
    pc.style.transform  = "translateY(-8px)";
  }
  setTimeout(() => { window.location.href = href; }, 230);
}

function initPageTransitions() {
  const pc = document.getElementById("page-content");
  if (pc) {
    // Start invisible
    pc.style.opacity   = "0";
    pc.style.transform = "translateY(14px)";
    // Animate in
    requestAnimationFrame(() => requestAnimationFrame(() => {
      pc.style.transition = "opacity 0.32s ease, transform 0.32s ease";
      pc.style.opacity    = "1";
      pc.style.transform  = "translateY(0)";
    }));
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (
      href &&
      !href.startsWith("http") &&
      !href.startsWith("#") &&
      !href.startsWith("mailto") &&
      !href.startsWith("javascript") &&
      !link.hasAttribute("data-no-transition") &&
      !link.hasAttribute("target")
    ) {
      e.preventDefault();
      navigateTo(href);
    }
  });
}

// ── SVG Icons ──────────────────────────────────────────────
const IC = {
  home:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  homeF:     `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  shop:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/><rect x="15" y="14" width="7" height="7"/><rect x="2" y="14" width="7" height="7"/></svg>`,
  shopF:     `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="7" height="7" rx="1"/><rect x="15" y="3" width="7" height="7" rx="1"/><rect x="15" y="14" width="7" height="7" rx="1"/><rect x="2" y="14" width="7" height="7" rx="1"/></svg>`,
  cart:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  cartF:     `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.82 6H21l-1.5 9H8L5.82 6zM5.01 2H2v2h2l3.6 7.59L6.25 14c-.09.17-.16.36-.16.55C6.09 15.37 6.99 16 8 16h12v-2H8.42l.83-1.59H19.5c.75 0 1.41-.41 1.75-1.03L23.98 5H5.21L4.2 2H2v2h2.01z"/></svg>`,
  orders:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  ordersF:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  user:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  userF:     `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  chat:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`,
  close:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  send:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
};

// ── Render Nav ─────────────────────────────────────────────
function renderNavbar() {
  const user  = getUser();
  const count = getCartCount();
  const path  = window.location.pathname;

  const isHome     = path === "/" || path.endsWith("index.html");
  const isProducts = path.includes("products");
  const isCart     = path.includes("cart");
  const isOrders   = path.includes("orders");
  const isAuth     = path.includes("login") || path.includes("register") || path.includes("otp") || path.includes("forgot");
  const isAdminP   = path.includes("admin");

  // Top bar (mobile only, hidden on desktop since sidebar has logo)
  const nav = document.getElementById("navbar");
  if (nav) {
    nav.innerHTML = `
      <div class="top-bar">
        <a href="/" class="top-bar-logo" data-no-transition>Secure<span>Shop</span></a>
        <div class="top-bar-right">
          ${user ? `<span class="top-bar-greeting">Hi, ${user.name.split(" ")[0]} 👋</span>` : ""}
          ${isAdmin() ? `<a href="/pages/admin.html" class="top-bar-admin">⚙️ Admin</a>` : ""}
        </div>
      </div>`;
  }

  // Remove previous nav instances
  document.getElementById("ss-sidebar")?.remove();
  document.getElementById("ss-bottomnav")?.remove();

  if (isAuth || isAdminP) return;

  const items = [
    { href:"/",                    iOff:IC.home,   iOn:IC.homeF,   lbl:"Home",   active:isHome },
    { href:"/pages/products.html", iOff:IC.shop,   iOn:IC.shopF,   lbl:"Shop",   active:isProducts },
    { href:"/pages/cart.html",     iOff:IC.cart,   iOn:IC.cartF,   lbl:"Cart",   active:isCart, badge:count },
    { href:"/pages/orders.html",   iOff:IC.orders, iOn:IC.ordersF, lbl:"Orders", active:isOrders, needLogin:true },
    { href:user?"#":"/pages/login.html", iOff:IC.user, iOn:IC.userF, lbl:user?user.name.split(" ")[0]:"Login", active:false, onclick:user?"showAccountMenu(event)":null },
  ].filter(i => !i.needLogin || user);

  // ── DESKTOP SIDEBAR — appended directly to <body> ──────
  const sb = document.createElement("nav");
  sb.id = "ss-sidebar";
  sb.className = "ss-sidebar";
  sb.innerHTML = `
    <a href="/" class="ss-sidebar-logo" data-no-transition>Secure<span>Shop</span></a>
    <div class="ss-sidebar-links">
      ${items.map(i=>`
        <a href="${i.href}" class="ss-sidebar-item ${i.active?"active":""}" ${i.onclick?`onclick="${i.onclick}"`:""}> 
          <span class="ss-nav-icon">${i.active?i.iOn:i.iOff}</span>
          <span class="ss-nav-label">${i.lbl}</span>
          ${i.badge>0?`<span class="ss-sidebar-badge">${i.badge}</span>`:""}
        </a>`).join("")}
    </div>
    ${user?`
    <div class="ss-sidebar-footer">
      <div class="ss-sidebar-user" onclick="showAccountMenu(event)">
        <div class="ss-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div><div class="ss-user-name">${user.name}</div><div class="ss-user-sub">View account</div></div>
      </div>
    </div>`:""}`;
  document.body.appendChild(sb);  // ← DIRECT child of body

  // ── MOBILE BOTTOM NAV — appended directly to <body> ────
  // position:fixed works correctly because:
  // 1. It's a direct child of <body>
  // 2. <body> has NO transform/filter/will-change
  // 3. We NEVER animate body — we animate #page-content instead
  const bn = document.createElement("nav");
  bn.id = "ss-bottomnav";
  bn.className = "ss-bottomnav";
  bn.innerHTML = items.map(i=>`
    <a href="${i.href}" class="ss-bn-item ${i.active?"active":""}" ${i.onclick?`onclick="${i.onclick}"`:""}>
      <span class="ss-bn-icon">${i.active?i.iOn:i.iOff}</span>
      ${i.badge>0?`<span class="ss-bn-badge">${i.badge}</span>`:""}
      <span class="ss-bn-label">${i.lbl}</span>
    </a>`).join("");
  document.body.appendChild(bn);  // ← DIRECT child of body

  document.body.classList.add("has-sidebar");
}

// ── Account Popup ──────────────────────────────────────────
function showAccountMenu(e) {
  e.preventDefault(); e.stopPropagation();
  const ex = document.getElementById("ss-acct");
  if (ex) { ex.remove(); return; }
  const user = getUser();
  const el = document.createElement("div");
  el.id = "ss-acct";
  el.className = "ss-acct";
  el.innerHTML = `
    <div class="ss-acct-head">
      <div class="ss-acct-av">${user.name.charAt(0).toUpperCase()}</div>
      <div><div class="ss-acct-name">${user.name}</div><div class="ss-acct-role">${isAdmin()?"Admin":"Customer"}</div></div>
    </div>
    <div class="ss-acct-sep"></div>
    <a href="/pages/orders.html" class="ss-acct-item">📦 My Orders</a>
    ${isAdmin()?`<a href="/pages/admin.html" class="ss-acct-item">⚙️ Admin Panel</a>`:""}
    <div class="ss-acct-sep"></div>
    <button class="ss-acct-item ss-acct-out" onclick="logout()">🚪 Sign Out</button>`;
  document.body.appendChild(el);
  setTimeout(()=>{
    document.addEventListener("click",function h(ev){
      if(!el.contains(ev.target)){el.remove();document.removeEventListener("click",h);}
    });
  },10);
}

// ── Toast ──────────────────────────────────────────────────
function showToast(msg, type="") {
  let c = document.getElementById("ss-toasts");
  if (!c) { c=document.createElement("div"); c.id="ss-toasts"; c.className="toast-container"; document.body.appendChild(c); }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(()=>{ t.classList.add("hiding"); setTimeout(()=>t.remove(),300); },2800);
}

// ── Alerts ─────────────────────────────────────────────────
function showAlert(id, msg, type="error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = "block";
}
function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

// ══════════════════════════════════════════════════════════
//  CHATBOT
// ══════════════════════════════════════════════════════════
const BOT_KB = [
  // Greetings
  { q:["hello","hi","hey","greetings","good morning","good afternoon","good evening","howdy","yo","sup","what's up"],
    a:"Hey there! 👋 I'm **ShopBot** — your SecureShop assistant!\n\nI can help you with:\n🏷️ Discounts & deals\n⚠️ Low stock alerts\n📦 Order tracking\n🔐 Account & login\n🚚 Shipping info\n💳 Payment questions\n🔒 Security info\n📞 Customer support\n\nWhat can I help you with? 😊" },
  { q:["how are you","you good","doing well","are you working"],
    a:"I'm always on and ready to help! 😄 What can I do for you today?" },

  // Discounts
  { q:["discount","discounts","sale","deal","deals","offer","offers","promo","coupon","code","on sale","save money","any discount","what discount","current offers","latest deals","price drop","best deal"],
    a:"🏷️ Current Deals at SecureShop!\n\n✅ FREE Shipping on orders over $500\n✅ Headphones bundle discounts available\n✅ Seasonal smartphone sales — check Shop page\n✅ Student discounts available (contact us!)\n✅ First-time buyer specials\n\n💡 Pro Tip: Sort by 'Price: Low to High' on Shop page to find best values!\n\n📧 For exclusive deals: sugamthapa@my.unt.edu" },
  { q:["flash sale","limited time","today only","hurry","time limited","24 hours","hours left","time deal"],
    a:"⚡ Flash Sales & Limited Offers!\n\nTo catch flash deals:\n• Check the Shop page often\n• Items with 🟡 'Only X left' are almost gone!\n• Email sugamthapa@my.unt.edu to join our deals list\n• Follow the site for announcements\n\nSome items sell out within hours — act fast! 🏃" },
  { q:["cheapest","budget","affordable","low price","best price","under 100","under 200","under 500","cheap","price range","cost effective"],
    a:"💰 Budget-Friendly Picks!\n\nGo to Shop → Sort by 'Price: Low to High'\n\nOur most affordable:\n🎧 AirPods Pro 2 — $249.99\n🎧 Sony WH-1000XM5 — $349.99\n⌚ Apple Watch Series 9 — $399.99\n\nAll premium quality at great prices! 🔥" },
  { q:["free shipping","shipping free","no shipping cost","free delivery","waived shipping"],
    a:"🚚 FREE Shipping!\n\nGet FREE shipping when your order total exceeds $500!\n\nOrders under $500 = flat $9.99 shipping fee.\n\nTip: Add multiple items to cross $500 and save! 🎉" },

  // Stock
  { q:["low stock","ending soon","almost out","running out","limited stock","few left","going fast","last few","sold out soon","which item end","finish soon","what's running low","limited availability","almost gone"],
    a:"⚠️ Items Running Low on Stock!\n\nOn the Shop page, watch for badges:\n🟡 'Only X left' = Less than 5 units — grab fast!\n🔴 'Out of Stock' = Currently unavailable\n🟢 'In Stock' = Plenty available\n\nFastest selling right now:\n📱 iPhone 15 Pro (very low!)\n💻 MacBook Air M3 (limited)\n🎧 Sony WH-1000XM5 (popular!)\n⌚ Apple Watch Series 9\n\nWant restock alerts? Email: sugamthapa@my.unt.edu 📧" },
  { q:["popular","best seller","top","trending","most bought","recommended","hot","in demand","which is best","what should i buy","suggest","suggestion","most popular","top rated","top products"],
    a:"🔥 Most Popular Products!\n\n1. 📱 iPhone 15 Pro — $999.99 ⭐ Best seller\n2. 🎧 Sony WH-1000XM5 — $349.99 ⭐ #1 headphones\n3. 💻 MacBook Air M3 — $1,299.99 ⭐ Best laptop\n4. ⌚ Apple Watch Series 9 — $399.99 ⭐ Hot pick\n5. 📱 Samsung Galaxy S24 — $899.99 ⭐ Android fav\n6. 📟 iPad Pro M4 — $1,099.99 ⭐ Premium tablet\n\nAll available on Shop page — stock is limited! 🚀" },
  { q:["new","latest","new arrival","just added","new product","recent","newly added","what's new","newest"],
    a:"✨ New Arrivals!\n\nCheck the 'New Arrivals' section on our Home page for latest additions!\n\nWe regularly update inventory with newest electronics from top brands.\n\nEmail sugamthapa@my.unt.edu to be added to our new arrival alerts list! 🔔" },
  { q:["restock","back in stock","when available","when will it be back","out of stock when"],
    a:"🔄 Restock Information!\n\nOut-of-stock items typically restock within 2–4 weeks depending on brand supply.\n\nTo get notified when a specific item restocks:\n📧 Email: sugamthapa@my.unt.edu\nMention the product name and we'll notify you!\n\nAlternatively, check the Shop page regularly — badges update in real-time 🟢" },

  // Contact
  { q:["contact","support","help","email","customer service","human","agent","talk to someone","speak to","complaint","reach","get in touch","contact email","how to reach","support team"],
    a:"📞 Contact Our Support Team!\n\n📧 Email: sugamthapa@my.unt.edu\n\n📝 Please include in your email:\n• Your registered email address\n• Order number (if applicable)\n• Clear description of your issue\n• Screenshots if helpful\n\n⏰ Response time: 1–2 business days\n💬 Or chat with me — I answer instantly! 🤖\n\nFor URGENT issues, write 'URGENT' in the subject line." },
  { q:["refund","money back","return","chargeback","not delivered","wrong item","damaged","broken","defective","return policy"],
    a:"😔 Sorry to hear that! Here's what to do:\n\n📧 Email: sugamthapa@my.unt.edu\nInclude: order number + photos of the issue\n\n📋 Our Return Policy:\n✅ Returns accepted within 30 days\n✅ Item must be in original condition\n✅ Refunds processed in 5–7 business days\n✅ Wrong/damaged items — we cover return shipping\n\nWe want to make it right for you! 💙" },
  { q:["cancel order","cancel my order","how to cancel","cancellation","stop order"],
    a:"❌ Need to Cancel?\n\nSteps:\n1. Go to 'Orders' in the navigation\n2. Find your order\n3. If status is 'Pending' — email us immediately!\n\n⚠️ Cannot cancel once 'Shipped' — but you can return after delivery.\n\n📧 Fast cancellation: sugamthapa@my.unt.edu\nAlways include your order number! ⚡" },

  // OTP & Auth
  { q:["otp","one time password","verification code","not receiving","didn't receive","no email","resend","code not coming","not getting code","otp expired","code expired"],
    a:"📬 OTP Not Arriving? Try these steps:\n\n1. ✅ Check spam/junk folder first!\n2. ✅ Wait 60 seconds then check again\n3. ✅ Make sure you used the correct email address\n4. ✅ Click 'Resend code' on the OTP page\n5. ✅ OTPs expire in 5 minutes — enter quickly!\n6. ✅ Try refreshing your email\n\nStill stuck? Email: sugamthapa@my.unt.edu\nMention your registered email in the message 🙏" },
  { q:["forgot password","reset password","can't login","cant login","locked out","lost password","change password","password help","account locked","reset"],
    a:"🔑 Forgot Password? Here's how to reset:\n\n1. Go to the Login page\n2. Click 'Forgot password?' link\n3. Enter your email address\n4. We'll send you a 6-digit reset code\n5. Enter the code + your new password\n6. Done! ✅\n\nNew password requirements:\n• 8+ characters minimum\n• At least 1 uppercase letter\n• At least 1 number (0-9)\n• At least 1 symbol (!@#$%^&*)\n\n📧 Still can't access? sugamthapa@my.unt.edu" },
  { q:["register","sign up","create account","new account","join","how to register","make account","account create"],
    a:"🎉 Create Your Free Account!\n\n1. Click 'Login' then 'Create one' link\n2. Enter your full name and email\n3. Create a strong password\n4. Click Register — done!\n\n🔒 Password must have:\n✅ 8+ characters\n✅ 1 uppercase letter\n✅ 1 number\n✅ 1 symbol (!@#$%^&*)\n\nAfter registering, every login uses a secure OTP for extra safety! 🛡️" },
  { q:["login","log in","sign in","how to login","login problem","can't sign in","account access","logging in"],
    a:"🔐 How to Log In:\n\n1. Go to the Login page\n2. Enter your email address\n3. Enter your password\n4. We'll send a 6-digit OTP to your email\n5. Enter the OTP within 5 minutes\n6. You're in! ✅\n\nThis 2-step login (MFA) keeps your account ultra-secure.\n\nProblems logging in? Email: sugamthapa@my.unt.edu" },
  { q:["email change","change email","update email","new email","switch email"],
    a:"📧 Want to Change Your Email?\n\nCurrently, email changes must be done by our support team.\n\n📧 Email: sugamthapa@my.unt.edu\nInclude:\n• Current registered email\n• New email address\n• Reason for change\n\nWe'll verify your identity and update it within 1–2 business days." },

  // Security
  { q:["mfa","2fa","two factor","secure","safe","security","hack","account safety","why otp","encryption","ssl","is my data safe","data privacy","privacy"],
    a:"🛡️ Security at SecureShop!\n\nYour protection is our #1 priority:\n\n✅ Multi-Factor Authentication (MFA) — OTP required every login\n✅ 256-bit SSL encryption — all data in transit\n✅ bcrypt password hashing — never stored plain\n✅ Rate limiting — blocks brute-force attacks\n✅ JWT authentication — secure API access\n✅ ZERO card storage — we never keep your card\n✅ Helmet.js security headers — XSS/clickjacking protection\n\nEven if someone steals your password, they can't login without the OTP sent to YOUR email! 🔒" },
  { q:["password strength","strong password","password tips","good password","what makes a good password"],
    a:"💪 Creating a Strong Password!\n\nA good SecureShop password must have:\n✅ 8+ characters (longer = stronger!)\n✅ At least 1 uppercase letter (A-Z)\n✅ At least 1 number (0-9)\n✅ At least 1 symbol (!@#$%^&*)\n\nExamples of strong passwords:\n• MySecure@2024!\n• Shop#Secure99\n• TechBuyer$2025\n\n❌ Avoid: birthdays, names, '12345', 'password'" },

  // Products
  { q:["product","products","electronics","items","catalog","browse","what do you sell","what's available","collection","inventory","catalogue"],
    a:"🛍️ What We Sell at SecureShop!\n\n📱 Smartphones — iPhone 15 Pro, Samsung Galaxy S24, and more\n💻 Laptops — MacBook Air M3, Dell XPS 15\n🎧 Headphones — Sony WH-1000XM5, AirPods Pro 2\n⌚ Smartwatches — Apple Watch Series 9\n📟 Tablets — iPad Pro M4\n\nAll premium electronics from verified top brands!\n\nGo to Shop page and use filters to find exactly what you need 🔍" },
  { q:["iphone","apple","macbook","ipad","airpods","apple watch","mac","apple product"],
    a:"🍎 Apple Products at SecureShop!\n\nCurrent lineup:\n📱 iPhone 15 Pro — $999.99 (Titanium, A17 chip)\n💻 MacBook Air M3 — $1,299.99 (18hr battery)\n📟 iPad Pro M4 — $1,099.99 (Ultra Retina XDR)\n🎧 AirPods Pro 2 — $249.99 (Active Noise Cancellation)\n⌚ Apple Watch Series 9 — $399.99 (Health tracking)\n\n⚠️ Apple products sell fast — check stock badges!" },
  { q:["samsung","galaxy","android","dell","xps","sony","headphone","headphones","smartwatch","wearable"],
    a:"🔥 Other Premium Electronics!\n\n📱 Samsung Galaxy S24 — $899.99\n   (200MP camera, Snapdragon 8 Gen 3)\n💻 Dell XPS 15 — $1,199.99\n   (OLED display, RTX 4060)\n🎧 Sony WH-1000XM5 — $349.99\n   (🏆 Our #1 seller! Best noise cancellation)\n\nAll available on Shop page with real-time stock! 🟢" },
  { q:["laptop","laptops","notebook","computer","pc","macbook","dell"],
    a:"💻 Laptops at SecureShop!\n\n1. MacBook Air M3 — $1,299.99\n   Apple M3 chip, 18-hour battery, Liquid Retina display\n   \n2. Dell XPS 15 — $1,199.99\n   OLED display, RTX 4060, Intel Core i9\n\nBoth are premium picks for different needs!\n• MacBook → Best for battery, macOS, creative work\n• Dell XPS → Best for Windows, gaming, power users\n\nGo to Shop → Laptops to see both!" },
  { q:["smartphone","phone","mobile","iphone","samsung","android","ios"],
    a:"📱 Smartphones at SecureShop!\n\n1. iPhone 15 Pro — $999.99\n   A17 Bionic, 48MP camera, Titanium build\n   \n2. Samsung Galaxy S24 — $899.99\n   Snapdragon 8 Gen 3, 200MP camera, AI features\n\nBoth are flagship phones of 2024!\n• iPhone → Best for iOS, privacy, camera\n• Samsung → Best for Android, customization, display\n\nShop page → Smartphones to see both!" },

  // Cart & Checkout
  { q:["cart","add to cart","basket","bag","how to add","shopping cart","cart not working"],
    a:"🛒 Shopping Cart Help!\n\n✅ Browse Shop page\n✅ Click any product to view details\n✅ Click 'Add to Cart' button\n✅ Cart count updates in the navigation bar\n\n💡 Tips:\n• No login needed to browse\n• Login required at checkout\n• Cart saves automatically in your browser\n• FREE shipping on carts over $500! 🎉\n\nCart total showing wrong? Try refreshing the page." },
  { q:["checkout","payment","pay","purchase","buy now","order now","complete order","place order","finalize"],
    a:"💳 How to Checkout!\n\n1. Add items to your cart\n2. Click Cart → 'Proceed to Checkout'\n3. Enter your shipping address\n4. Enter payment details (demo mode)\n5. Review your order\n6. Click 'Place Order'!\n\n🔒 Security during checkout:\n• SSL encrypted form\n• Card details NEVER stored\n• Demo mode — no real charges\n\nHaving checkout issues? Email: sugamthapa@my.unt.edu" },
  { q:["payment method","accepted payment","visa","mastercard","credit card","debit card","which cards","payment options","how to pay"],
    a:"💳 Payment Methods!\n\n✅ All major credit/debit cards accepted\n✅ Visa, Mastercard, American Express\n✅ 256-bit SSL encryption\n✅ Zero card data stored on our servers\n✅ PCI-DSS compliant checkout\n\n⚠️ Note: This is a demo/educational project — no real charges are processed.\n\nQuestions about payment? sugamthapa@my.unt.edu" },

  // Shipping & Orders
  { q:["shipping","delivery","how long","arrive","days","shipping cost","delivery time","when delivered","delivery estimate","estimated delivery"],
    a:"🚚 Shipping & Delivery!\n\n💸 FREE — orders over $500\n💰 $9.99 flat rate — orders under $500\n⏱️ Standard: 3–5 business days\n\n📍 Tracking:\n1. Log in to your account\n2. Go to 'Orders' in the menu\n3. View real-time status updates\n\nOrders ship Monday–Friday.\nHoliday periods may add 1–2 extra days.\n\nQuestions? sugamthapa@my.unt.edu 📧" },
  { q:["order","orders","my orders","track","tracking","order status","where is my order","order history","purchase history","track order"],
    a:"📦 Track Your Orders!\n\n1. Make sure you're logged in\n2. Click 'Orders' in the navigation\n3. View all orders + live status\n\n🔄 Order Status Flow:\n⏳ Pending → order received\n💳 Paid → payment confirmed\n📦 Shipped → it's on the way!\n✅ Delivered → arrived at your door\n❌ Cancelled → order was cancelled\n\nOrder missing or very late?\nEmail: sugamthapa@my.unt.edu with your order number!" },
  { q:["order confirmation","confirmation email","no confirmation","didn't get confirmation"],
    a:"📧 Order Confirmation!\n\nAfter placing your order:\n1. ✅ Your order appears in the 'Orders' page immediately\n2. ✅ Status shows 'Pending' — that confirms it was received\n\nDon't see your order?\n• Make sure you were logged in when ordering\n• Check you're logged into the right account\n\n📧 Still can't find it? sugamthapa@my.unt.edu\nInclude your registered email and order date!" },

  // Account
  { q:["my account","account settings","profile","account details","account info","view account","manage account"],
    a:"👤 Your Account!\n\nClick the Account icon in the navigation to:\n• View your name and email\n• Access your order history\n• Sign out\n\nAccount settings like name/email changes:\n📧 Email: sugamthapa@my.unt.edu\nWe'll update it within 1–2 business days." },
  { q:["delete account","remove account","close account","deactivate"],
    a:"🗑️ Account Deletion!\n\nTo delete your account:\n📧 Email: sugamthapa@my.unt.edu\nSubject: 'Account Deletion Request'\n\nInclude:\n• Your registered email\n• Reason for deletion\n\n⚠️ This will permanently delete all your data and order history. This action cannot be undone." },

  // About
  { q:["about","who made","what is secureshop","final year","student project","university","built with","tech stack","how was this made"],
    a:"🎓 About SecureShop!\n\nSecureShop is a Final Year Computer Science project — a fully production-grade, secure e-commerce platform.\n\n🔧 Tech Stack:\n• Node.js + Express.js (backend)\n• MySQL (database)\n• HTML5/CSS3/JS (frontend)\n• JWT + OTP = MFA security\n• Resend (email delivery)\n• Railway (cloud hosting)\n\n🌐 Live: www.secure-shop.store\n📁 GitHub: github.com/Darkness200000/secure-ecommerce\n\nBuilt to showcase full-stack + cybersecurity! 💪" },
  { q:["admin","admin panel","dashboard","manage store","store management"],
    a:"⚙️ Admin Panel!\n\nThe Admin Panel lets store managers:\n• View dashboard stats\n• Add/delete products\n• Manage product images & videos\n• Update order statuses\n• View all registered users\n\nAccess: Log in with admin account → Admin link appears in navigation.\n\nNot an admin? You don't need it to shop! 😊\nNeed admin access? sugamthapa@my.unt.edu" },

  // Fun
  { q:["joke","funny","make me laugh","bored","entertain","humor","comedy"],
    a:"😄 Here's a tech joke!\n\nWhy do programmers prefer dark mode?\n\n...Because light attracts bugs! 🐛\n\n---\n\nBonus:\nWhy was the JavaScript developer sad?\n\n...Because he didn't know how to 'null' his feelings! 😂\n\nOkay, back to shopping! How can I help?" },
  { q:["thank","thanks","thank you","thx","ty","helpful","great","awesome","perfect","appreciate"],
    a:"You're very welcome! 😊 Happy I could help!\n\nAnything else I can assist with? I'm here 24/7! 🤖" },
  { q:["bye","goodbye","see you","later","cya","done","that's all","no more questions","exit"],
    a:"Goodbye! 👋 Happy shopping at SecureShop!\n\nRemember, for human support:\n📧 sugamthapa@my.unt.edu\n\nCome back anytime — I'm always here! 😊" },
  { q:["what can you do","capabilities","what do you know","your features","help me with","what topics"],
    a:"🤖 What I Can Help With!\n\n🏷️ Discounts & current deals\n⚠️ Low stock & ending-soon alerts\n📦 Order tracking & management\n🔐 Login, OTP & account issues\n🚚 Shipping rates & delivery times\n💳 Payment info & checkout help\n🔒 Security & privacy questions\n📱 Product info & comparisons\n🔄 Returns & refund policy\n📞 Contact support info\n🎓 About the project\n\nJust type your question in plain English! 😊" },
];

function getBotResponse(input) {
  const lower = input.toLowerCase().trim();
  for (const rule of BOT_KB) {
    if (rule.q.some(p => lower.includes(p))) return rule.a;
  }
  return "Hmm, I'm not sure about that one! 🤔\n\nHere's what I can help with:\n🏷️ Discounts & deals\n⚠️ Low stock items\n📦 Orders & tracking\n🔐 Login & account\n🚚 Shipping info\n💳 Payment help\n📞 Contact support\n\nOr type 'what can you do' to see all my topics!\n\n📧 For anything else: sugamthapa@my.unt.edu";
}

// ══════════════════════════════════════════════════════════
//  CHATBOT — appended directly to <body> (never in wrapper)
// ══════════════════════════════════════════════════════════
function initChatbot() {
  if (window.location.pathname.includes("admin")) return;

  const bot = document.createElement("div");
  bot.id = "ss-bot";
  bot.innerHTML = `
    <!-- Greeting bubble — shows after 2s if chat hasn't been opened -->
    <div class="ss-bot-bubble-outer" id="ss-bot-bubble">
      <div class="ss-bot-bubble-inner">
        <button class="ss-bot-bubble-x" onclick="document.getElementById('ss-bot-bubble').classList.remove('show')">×</button>
        💬 Hi! How can I help you today?
      </div>
      <div class="ss-bot-bubble-tail"></div>
    </div>

    <!-- Toggle -->
    <button class="ss-bot-toggle" id="ss-bot-toggle" onclick="toggleBot()">
      <span id="ss-bot-ico">${IC.chat}</span>
    </button>

    <!-- Window -->
    <div class="ss-bot-win" id="ss-bot-win">
      <div class="ss-bot-hd">
        <div class="ss-bot-hd-info">
          <div class="ss-bot-av">🤖</div>
          <div>
            <div class="ss-bot-hd-name">ShopBot</div>
            <div class="ss-bot-hd-status"><span class="ss-bot-dot"></span>Online — Always here</div>
          </div>
        </div>
        <button class="ss-bot-hd-close" onclick="toggleBot()">${IC.close}</button>
      </div>

      <div class="ss-bot-msgs" id="ss-bot-msgs">
        <div class="ss-bot-msg bot">
          <div class="ss-bot-bbl">
            Hi! I'm <strong>ShopBot</strong> 🤖<br/>Ask me about <strong>deals, low stock, orders, login</strong> or anything else!
          </div>
        </div>
        <div class="ss-bot-qr" id="ss-bot-qr">
          <button onclick="sq('What discounts are available')">🏷️ Discounts</button>
          <button onclick="sq('Which items are ending soon')">⚠️ Low Stock</button>
          <button onclick="sq('Track my order')">📦 Orders</button>
          <button onclick="sq('Contact support')">📞 Support</button>
          <button onclick="sq('Forgot password')">🔑 Password</button>
          <button onclick="sq('What can you do')">🤖 All Topics</button>
        </div>
      </div>

      <div class="ss-bot-foot">
        <input type="text" id="ss-bot-inp" class="ss-bot-inp"
          placeholder="Type your question…" maxlength="200"
          onkeydown="if(event.key==='Enter') sendBot()"/>
        <button class="ss-bot-send" onclick="sendBot()">${IC.send}</button>
      </div>
    </div>
  `;

  document.body.appendChild(bot); // ← DIRECT child of body

  // Show greeting bubble after 2 seconds
  setTimeout(() => {
    if (!localStorage.getItem("ss-bot-seen") && !botOpen) {
      document.getElementById("ss-bot-bubble")?.classList.add("show");
    }
  }, 2000);
}

let botOpen = false;

function toggleBot() {
  botOpen = !botOpen;
  const win     = document.getElementById("ss-bot-win");
  const ico     = document.getElementById("ss-bot-ico");
  const bubble  = document.getElementById("ss-bot-bubble");
  win.classList.toggle("open", botOpen);
  bubble?.classList.remove("show");
  ico.innerHTML = botOpen ? IC.close : IC.chat;
  if (botOpen) {
    localStorage.setItem("ss-bot-seen","1");
    setTimeout(()=> document.getElementById("ss-bot-inp")?.focus(), 300);
  }
}

function sq(msg) {  // send quick reply
  document.getElementById("ss-bot-qr")?.remove();
  addUser(msg);
  const t = addTyping();
  setTimeout(()=>{ t.remove(); addBot(getBotResponse(msg)); }, 650);
}

function sendBot() {
  const inp = document.getElementById("ss-bot-inp");
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = "";
  document.getElementById("ss-bot-qr")?.remove();
  addUser(msg);
  const t = addTyping();
  setTimeout(()=>{ t.remove(); addBot(getBotResponse(msg)); }, 600+Math.random()*400);
}

function addUser(text) {
  const el = document.createElement("div");
  el.className = "ss-bot-msg user";
  el.innerHTML = `<div class="ss-bot-bbl">${esc(text)}</div>`;
  append(el);
}

function addBot(text) {
  const el = document.createElement("div");
  el.className = "ss-bot-msg bot";
  el.innerHTML = `<div class="ss-bot-bbl">${esc(text).replace(/\n/g,"<br/>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")}</div>`;
  append(el);
}

function addTyping() {
  const el = document.createElement("div");
  el.className = "ss-bot-msg bot";
  el.innerHTML = `<div class="ss-bot-bbl ss-bot-typing"><span></span><span></span><span></span></div>`;
  append(el);
  return el;
}

function append(el) {
  const msgs = document.getElementById("ss-bot-msgs");
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
}

function esc(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── Auto-init ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initPageTransitions(); // animates #page-content, NOT body
  initChatbot();         // appended to body directly
  window.addEventListener("scroll", () => {
    document.querySelector(".top-bar")?.classList.toggle("scrolled", window.scrollY > 10);
  });
});
