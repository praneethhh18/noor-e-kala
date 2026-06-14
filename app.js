// on-page error reporter so problems are visible without opening the console
window.addEventListener('error', function(ev){
  var b = document.getElementById('jserr');
  if(!b){ b = document.createElement('div'); b.id='jserr';
    b.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#b00020;color:#fff;font:13px/1.45 monospace;padding:10px 14px;white-space:pre-wrap';
    document.body.appendChild(b); }
  b.textContent = '⚠ JS error: ' + (ev.message||'') + '  (line ' + (ev.lineno||'?') + ')';
});
document.getElementById('yr').textContent = new Date().getFullYear();

// ⬇⬇⬇ HER WHATSAPP NUMBER GOES HERE — country code + number, digits only, no + or spaces.
//      India example: '919876543210'. Used by BOTH the cart and the custom-order form.
const WHATSAPP = '919238888808';

// ---------- announcement / offer bar (editable in data/site.json) ----------
(async function(){
  const bar = document.getElementById('annbar'); if(!bar) return;
  let cfg;
  try { cfg = (await (await fetch('data/site.json', {cache:'no-store'})).json()).banner; } catch(e){ return; }
  if(!cfg || !cfg.on || !cfg.text) return;
  if(localStorage.getItem('nek_ann_dismissed') === cfg.text) return;  // already dismissed THIS message
  document.getElementById('annText').textContent = cfg.text;
  if(cfg.link){ bar.style.cursor = 'pointer'; bar.addEventListener('click', e => { if(e.target.id !== 'annClose') window.open(cfg.link, '_blank'); }); }
  bar.hidden = false; document.body.classList.add('has-annbar');
  document.getElementById('annClose').addEventListener('click', e => {
    e.stopPropagation(); bar.hidden = true; document.body.classList.remove('has-annbar');
    try { localStorage.setItem('nek_ann_dismissed', cfg.text); } catch(_){}
  });
})();

// preloader: hide as soon as the page is interactive, with a hard fallback
// so slow/blocked images can never trap the splash screen.
const pre = document.getElementById('pre');
const hidePre = () => { if (pre) pre.classList.add('done'); };
if (document.readyState === 'complete') hidePre();
else addEventListener('DOMContentLoaded', () => setTimeout(hidePre, 600));
addEventListener('load', hidePre);
setTimeout(hidePre, 2500); // safety net

// progress bar + nav state (runs on scroll, on load, and immediately)
const hdr = document.getElementById('hdr'), bar = document.getElementById('progress');
function navState(){
  hdr.classList.toggle('scrolled', scrollY > 30);
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
}
addEventListener('scroll', navState, {passive:true});
addEventListener('load', navState);
navState();

// mobile menu
const burger = document.getElementById('burger'), nav = document.getElementById('navlinks');
burger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// cursor glow
const glow = document.getElementById('glow');
addEventListener('mousemove', e => { glow.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`; });

// scroll reveal: simple, bulletproof rect check (no observer that can silently fail)
const reveals = [...document.querySelectorAll('.reveal')];
function checkReveals(){
  const vh = innerHeight || document.documentElement.clientHeight;
  for(const el of reveals){
    if(el.getBoundingClientRect().top < vh * 0.92) el.classList.add('in');
  }
}
addEventListener('scroll', checkReveals, {passive:true});
addEventListener('resize', checkReveals);
addEventListener('load', checkReveals);
checkReveals();
// absolute safety net: nothing stays invisible past 3s, ever
setTimeout(()=>reveals.forEach(el=>el.classList.add('in')), 3000);

// lightbox (only present on pages with a gallery)
const lb = document.getElementById('lightbox');
if (lb) {
  const lbImg = lb.querySelector('img');
  document.querySelectorAll('.gal-grid img').forEach(img=>img.addEventListener('click',()=>{lbImg.src=img.src;lb.classList.add('open');}));
  lb.addEventListener('click',()=>lb.classList.remove('open'));
}

// scroll-to-top heart
const toTopBtn = document.getElementById('totop');
addEventListener('scroll', () => toTopBtn.classList.toggle('show', scrollY > 600));
toTopBtn.addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));

// ---------- render products from data/products.json ----------
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escA = s => esc(s).replace(/"/g,'&quot;');
let PRODUCTS = [];
const imagesOf = p => [p.img, ...(p.images || [])].filter(Boolean);
const offOf = p => (p.mrp && p.mrp > p.price) ? Math.round((1 - p.price/p.mrp) * 100) : 0;
const priceHtml = p => p.enquiry
  ? `<span class="p-price">from ₹${p.price}</span>`
  : offOf(p)
    ? `<span class="p-prices"><span class="p-price">₹${p.price}</span><span class="p-mrp">₹${p.mrp}</span></span>`
    : `<span class="p-price">₹${p.price}</span>`;
function enquiryWaLink(p){
  const msg = "Hi Noor e Kala! I'd like to enquire about: " + p.name + " (from ₹" + p.price + ").\nCould you share the details and how to begin?";
  return 'https://wa.me/919238888808?text=' + encodeURIComponent(msg);
}
function productCard(p){
  const sold = p.sold_out, off = offOf(p);
  const btn = sold
    ? '<button class="p-add" disabled>Sold out</button>'
    : p.enquiry
      ? '<span class="p-enqbtn">Enquire →</span>'
      : `<button class="p-add" data-name="${escA(p.name)}" data-price="${p.price}">Add +</button>`;
  const corner = sold ? '<span class="sold-badge">Sold out</span>' : (off ? `<span class="p-off">-${off}%</span>` : '');
  const more = imagesOf(p).length > 1 ? '<span class="p-more">⊕ more</span>' : '';
  return `<article class="product${sold?' sold':''}" data-cat="${esc(p.cat)}" data-name="${escA(p.name)}">
    <div class="p-img">${corner}${more}<img loading="lazy" src="${esc(p.img)}" alt="${escA(p.name)}"></div>
    <div class="p-body"><h3 class="p-name">${esc(p.name)}</h3>
      <div class="p-bottom">${priceHtml(p)}${btn}</div></div>
  </article>`;
}
async function renderProducts(){
  const shop = document.getElementById('shopGrid'), feat = document.getElementById('featuredGrid');
  if(!shop && !feat) return;
  try { const d = await (await fetch('data/products.json', {cache:'no-store'})).json(); PRODUCTS = Array.isArray(d) ? d : (d.products || []); }
  catch(e){ if(shop) shop.innerHTML = '<p style="text-align:center;color:var(--ink-soft)">Couldn\'t load products. Please refresh.</p>'; return; }
  if(shop) shop.innerHTML = PRODUCTS.map(productCard).join('');
  if(feat) feat.innerHTML = PRODUCTS.filter(p=>p.featured && !p.sold_out).slice(0,6).map(productCard).join('');
  applyHashFilter();
}

// ---------- product detail view (carousel + reviews) ----------
let pmodal, galImgs = [], galIdx = 0;
function buildModal(){
  pmodal = document.createElement('div');
  pmodal.className = 'pmodal'; pmodal.id = 'pmodal'; pmodal.hidden = true;
  pmodal.innerHTML =
    '<div class="pmodal-overlay"></div>' +
    '<div class="pmodal-box" role="dialog" aria-modal="true">' +
      '<button class="pmodal-close" aria-label="Close">✕</button>' +
      '<div class="pmodal-gallery">' +
        '<div class="pmodal-stage">' +
          '<button class="pmodal-nav prev" aria-label="Previous image">‹</button>' +
          '<img class="pmodal-main" src="" alt="">' +
          '<button class="pmodal-nav next" aria-label="Next image">›</button>' +
          '<span class="pmodal-count"></span>' +
        '</div>' +
        '<div class="pmodal-thumbs"></div>' +
      '</div>' +
      '<div class="pmodal-info"><span class="pmodal-cat"></span><h3 class="pmodal-name"></h3>' +
        '<div class="pmodal-price"></div><p class="pmodal-desc"></p>' +
        '<button class="p-add pmodal-add">Add to cart</button>' +
        '<p class="pmodal-note">Want it personalised? Add it, then tell me the details on WhatsApp. 💛</p>' +
      '</div>' +
      '<div class="pmodal-reviews"></div>' +
    '</div>';
  document.body.appendChild(pmodal);
  const close = () => { pmodal.hidden = true; document.body.style.overflow = ''; };
  pmodal.querySelector('.pmodal-overlay').addEventListener('click', close);
  pmodal.querySelector('.pmodal-close').addEventListener('click', close);
  pmodal.querySelector('.pmodal-add').addEventListener('click', close); // cart adds via delegation; we just close
  pmodal.querySelector('.prev').addEventListener('click', () => showImg(galIdx - 1));
  pmodal.querySelector('.next').addEventListener('click', () => showImg(galIdx + 1));
  addEventListener('keydown', e => {
    if(pmodal.hidden) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') showImg(galIdx - 1);
    if(e.key === 'ArrowRight') showImg(galIdx + 1);
  });
}
function showImg(i){
  if(!galImgs.length) return;
  galIdx = (i + galImgs.length) % galImgs.length;          // wraps around
  pmodal.querySelector('.pmodal-main').src = galImgs[galIdx];
  pmodal.querySelector('.pmodal-count').textContent = galImgs.length > 1 ? (galIdx+1) + ' / ' + galImgs.length : '';
  pmodal.querySelectorAll('.pmodal-thumb').forEach((t,j) => t.classList.toggle('active', j === galIdx));
}
let CAT_LABELS = {resin:'Resin Art', jewel:'Jewellery', gift:'Gifts', crochet:'Crochet', bouquet:'Bouquets'};
const clampR = r => Math.max(1, Math.min(5, parseInt(r,10) || 5));
function getStoredReviews(name){
  try { return (JSON.parse(localStorage.getItem('nek_reviews')) || {})[name] || []; } catch(e){ return []; }
}
function addStoredReview(name, r){
  try { const all = JSON.parse(localStorage.getItem('nek_reviews')) || {};
    (all[name] = all[name] || []).push(r); localStorage.setItem('nek_reviews', JSON.stringify(all)); } catch(e){}
}
function starRow(n){ n = clampR(n); return '★'.repeat(n) + '<span class="dim">' + '★'.repeat(5-n) + '</span>'; }
function renderReviews(p){
  const box = pmodal.querySelector('.pmodal-reviews');
  const all = [...(p.reviews || []), ...getStoredReviews(p.name)];
  const list = all.length
    ? all.map(r => `<div class="rev-item"><div class="stars">${starRow(r.rating)}</div><p>${esc(r.text)}</p><small>— ${esc(r.name||'Customer')}</small></div>`).join('')
    : '<p class="rev-empty">No reviews yet — be the first to share yours! 💛</p>';
  box.innerHTML =
    `<h4>Reviews${all.length ? ' ('+all.length+')' : ''}</h4>` + list +
    '<button class="rev-add" id="revAddBtn">✍ Write a review</button>' +
    '<form class="rev-form" id="revForm" hidden>' +
      '<div class="rev-stars" id="revStars">' + [1,2,3,4,5].map(n => `<button type="button" data-n="${n}" aria-label="${n} stars">★</button>`).join('') + '</div>' +
      '<input id="revName" type="text" placeholder="Your name">' +
      '<textarea id="revText" placeholder="How did you like it?"></textarea>' +
      '<button type="button" class="rev-submit" id="revSubmit">Post review</button>' +
    '</form>';
  let rating = 5;
  const starsEl = box.querySelector('#revStars');
  const paint = () => starsEl.querySelectorAll('button').forEach((b,i) => b.classList.toggle('on', i < rating));
  starsEl.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { rating = +b.dataset.n; paint(); }));
  paint();
  box.querySelector('#revAddBtn').addEventListener('click', () => {
    box.querySelector('#revForm').hidden = false; box.querySelector('#revAddBtn').style.display = 'none';
    box.querySelector('#revText').focus();
  });
  box.querySelector('#revSubmit').addEventListener('click', () => {
    const t = box.querySelector('#revText'); const text = t.value.trim();
    if(!text){ t.style.borderColor = '#b00020'; t.focus(); return; }
    addStoredReview(p.name, { name: box.querySelector('#revName').value.trim() || 'Customer', rating, text });
    renderReviews(p);   // re-render so the new review shows instantly
  });
}
function openProduct(p){
  if(!pmodal) buildModal();
  galImgs = imagesOf(p); galIdx = 0;
  const multi = galImgs.length > 1;
  const thumbs = pmodal.querySelector('.pmodal-thumbs');
  thumbs.innerHTML = multi ? galImgs.map(src => `<img class="pmodal-thumb" src="${esc(src)}" alt="">`).join('') : '';
  thumbs.querySelectorAll('.pmodal-thumb').forEach((t,i) => t.addEventListener('click', () => showImg(i)));
  pmodal.querySelectorAll('.pmodal-nav').forEach(b => b.style.display = multi ? '' : 'none');
  showImg(0);
  pmodal.querySelector('.pmodal-cat').textContent = CAT_LABELS[p.cat] || '';
  pmodal.querySelector('.pmodal-name').textContent = p.name;
  const off = offOf(p);
  pmodal.querySelector('.pmodal-price').innerHTML = p.enquiry
    ? 'from ₹' + p.price
    : off
      ? `₹${p.price} <span class="pmodal-mrp">₹${p.mrp}</span> <span class="pmodal-off">${off}% off</span>`
      : '₹' + p.price;
  pmodal.querySelector('.pmodal-desc').textContent = p.desc || '';
  const addBtn = pmodal.querySelector('.pmodal-add');
  const noteEl = pmodal.querySelector('.pmodal-note');
  addBtn.onclick = null;
  if(p.sold_out){
    addBtn.classList.add('p-add'); addBtn.disabled = true; addBtn.textContent = 'Sold out';
    addBtn.removeAttribute('data-name'); addBtn.removeAttribute('data-price');
    noteEl.textContent = "Currently sold out — message me to ask when it's back. 💛";
  } else if(p.enquiry){
    addBtn.classList.remove('p-add'); addBtn.disabled = false; addBtn.textContent = '💬 Enquire on WhatsApp';
    addBtn.removeAttribute('data-name'); addBtn.removeAttribute('data-price');
    addBtn.onclick = () => window.open(enquiryWaLink(p), '_blank');
    noteEl.textContent = p.note || 'Made to order — message me to begin. 💌';
  } else {
    addBtn.classList.add('p-add'); addBtn.disabled = false; addBtn.textContent = 'Add to cart';
    addBtn.dataset.name = p.name; addBtn.dataset.price = p.price;
    noteEl.textContent = 'Want it personalised? Add it, then tell me the details on WhatsApp. 💛';
  }
  renderReviews(p);
  pmodal.hidden = false; document.body.style.overflow = 'hidden';
}
// open the detail view when a product card (but not its Add button) is clicked
document.addEventListener('click', e => {
  if(e.target.closest('.p-add')) return;          // add-to-cart handles itself
  const art = e.target.closest('.product');
  if(art && art.dataset.name){ const p = PRODUCTS.find(x => x.name === art.dataset.name); if(p) openProduct(p); }
});

// ---------- categories + shop filter (data-driven) ----------
const shopTabsEl = document.getElementById('shopTabs');
function filterShop(cat){
  document.querySelectorAll('.shop-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
  document.querySelectorAll('.product').forEach(p => { p.style.display = (cat === 'all' || p.dataset.cat === cat) ? '' : 'none'; });
}
function applyHashFilter(){
  if (document.getElementById('shopGrid')) {
    const cat = decodeURIComponent(location.hash.slice(1));
    if (cat && [...document.querySelectorAll('.shop-tab')].some(t => t.dataset.cat === cat)) filterShop(cat);
  }
}
async function renderCategories(){
  let cats;
  try { cats = (await (await fetch('data/site.json', {cache:'no-store'})).json()).categories; } catch(e){}
  if (cats && cats.length){
    CAT_LABELS = {}; cats.forEach(c => CAT_LABELS[c.key] = c.label);   // labels for the product view
    if (shopTabsEl)
      shopTabsEl.innerHTML = '<button class="shop-tab active" data-cat="all">All</button>' +
        cats.map(c => `<button class="shop-tab" data-cat="${esc(c.key)}">${esc(c.label)}</button>`).join('');
  }
}
// tab clicks (delegated, since tabs are rendered from data)
if (shopTabsEl) shopTabsEl.addEventListener('click', e => { const t = e.target.closest('.shop-tab'); if(t) filterShop(t.dataset.cat); });
// load categories, then products
(async () => { await renderCategories(); await renderProducts(); })();
// category cards on the landing page open the full shop, pre-filtered
document.querySelectorAll('[data-jump]').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => { location.href = 'shop.html#' + card.dataset.jump; });
});
// the "Custom & Personalised" card jumps to the custom-order form
document.querySelectorAll('[data-goto]').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const t = card.dataset.goto;
    const el = t.startsWith('#') && document.querySelector(t);
    if (el) el.scrollIntoView({behavior:'smooth'}); else location.href = t;
  });
});

// ---------- cart ----------
(function(){
  const KEY = 'nek_cart';
  let items = {};
  try { items = JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e) { items = {}; }

  const $ = s => document.querySelector(s);
  const countEl = $('#cartCount'), itemsEl = $('#cartItems'), totalEl = $('#cartTotal'),
        drawer = $('#cartDrawer'), overlay = $('#cartOverlay'), sendBtn = $('#cartSend'),
        foot = drawer && drawer.querySelector('.cart-foot');

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch(e){} };
  const totalQty = () => Object.values(items).reduce((s,i)=>s+i.qty,0);
  const totalAmt = () => Object.values(items).reduce((s,i)=>s+i.qty*i.price,0);

  // customer details
  const DKEY = 'nek_details';
  const fv = id => (document.getElementById(id)?.value || '').trim();
  function saveDetails(){
    try { localStorage.setItem(DKEY, JSON.stringify({name:fv('ci-name'),phone:fv('ci-phone'),email:fv('ci-email'),addr:fv('ci-addr')})); } catch(e){}
  }
  function loadDetails(){
    try {
      const d = JSON.parse(localStorage.getItem(DKEY)) || {};
      const set = (id,v) => { const el = document.getElementById(id); if(el && v) el.value = v; };
      set('ci-name',d.name); set('ci-phone',d.phone); set('ci-email',d.email); set('ci-addr',d.addr);
    } catch(e){}
  }

  function waLink(){
    if(!totalQty()) return '#';
    let msg = "Hi Noor e Kala! I'd love to order:\n\n";
    Object.entries(items).forEach(([n,i]) => { msg += "- " + i.qty + " x " + n + " (₹" + i.price + ") = ₹" + (i.qty*i.price) + "\n"; });
    msg += "\nTotal: ₹" + totalAmt() + "\n\n";
    msg += "Name: " + fv('ci-name') + "\n";
    msg += "Phone: " + fv('ci-phone') + "\n";
    const email = fv('ci-email'); if(email) msg += "Email: " + email + "\n";
    const addr = fv('ci-addr'); if(addr) msg += "Address: " + addr + "\n";
    msg += "\n(Please confirm availability & payment)";
    return (WHATSAPP ? 'https://wa.me/' + WHATSAPP : 'https://wa.me/') + '?text=' + encodeURIComponent(msg);
  }

  function render(){
    const c = totalQty();
    countEl.textContent = c;
    countEl.classList.toggle('has', c > 0);
    if(foot) foot.style.display = c ? '' : 'none';   // checkout form only shows with items in cart
    if(!c){
      itemsEl.innerHTML = '<div class="cart-empty">Your cart is empty.<br>Add something pretty 🌸</div>';
    } else {
      itemsEl.innerHTML = Object.entries(items).map(([n,i]) =>
        '<div class="ci"><div class="ci-info"><b>' + n + '</b><span>₹' + i.price + ' each</span></div>' +
        '<div class="ci-qty"><button data-act="dec" data-n="' + n.replace(/"/g,'&quot;') + '">−</button>' +
        '<span>' + i.qty + '</span>' +
        '<button data-act="inc" data-n="' + n.replace(/"/g,'&quot;') + '">+</button></div>' +
        '<div class="ci-sum">₹' + (i.qty*i.price) + '</div></div>'
      ).join('');
    }
    totalEl.textContent = '₹' + totalAmt();
    sendBtn.href = waLink();
  }

  let toastEl;
  function toast(t){
    if(!toastEl){ toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = t;
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toast._t); toast._t = setTimeout(() => toastEl.classList.remove('show'), 1700);
  }

  const openCart  = () => { drawer.classList.add('open'); overlay.classList.add('open'); };
  const closeCart = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); };

  function add(name, price){
    if(items[name]) items[name].qty++; else items[name] = { price: +price, qty: 1 };
    save(); render(); toast(name + ' added to cart 🌸');
  }
  function setQty(name, q){
    if(!items[name]) return;
    items[name].qty = q;
    if(items[name].qty <= 0) delete items[name];
    save(); render();
  }

  // event-delegation so products rendered later (or added via the admin) also work
  document.addEventListener('click', e => {
    const b = e.target.closest('.p-add');
    if (b && !b.disabled && b.dataset.name) add(b.dataset.name, b.dataset.price);
  });
  itemsEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]'); if(!btn) return;
    const n = btn.dataset.n;
    setQty(n, items[n].qty + (btn.dataset.act === 'inc' ? 1 : -1));
  });
  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  sendBtn.addEventListener('click', e => {
    e.preventDefault();
    if(!totalQty()){ toast('Add something first 🌸'); return; }
    const nameEl = document.getElementById('ci-name'), phoneEl = document.getElementById('ci-phone');
    const name = fv('ci-name'), phone = fv('ci-phone');
    if(nameEl) nameEl.classList.toggle('miss', !name);
    if(phoneEl) phoneEl.classList.toggle('miss', !phone);
    if(!name || !phone){ toast('Please add your name & phone 🌸'); (name ? phoneEl : nameEl)?.focus(); return; }
    saveDetails();
    window.open(waLink(), '_blank');
  });
  // remember details as they type + clear the red highlight
  ['ci-name','ci-phone','ci-email','ci-addr'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', () => { el.classList.remove('miss'); saveDetails(); });
  });
  // ⓘ "how ordering works" toggle inside the cart
  const infoBtn = document.getElementById('cartInfoBtn'), infoBox = document.getElementById('cartInfo');
  if(infoBtn && infoBox) infoBtn.addEventListener('click', () => {
    const willOpen = infoBox.hidden;
    infoBox.hidden = !willOpen;
    infoBtn.setAttribute('aria-expanded', String(willOpen));
  });
  addEventListener('keydown', e => { if(e.key === 'Escape') closeCart(); });

  loadDetails();
  render();
})();

// ---------- custom order form ----------
(function(){
  const form = document.getElementById('customForm');
  if (!form) return;
  const val = id => (document.getElementById(id)?.value || '').trim();
  document.getElementById('cfSend').addEventListener('click', () => {
    const want = val('cf-want');
    if (!want) {                       // the only required field
      form.classList.add('show-err');
      document.getElementById('cf-want').focus();
      return;
    }
    form.classList.remove('show-err');
    let msg = "Hi Noor e Kala! I'd like a custom order:\n\n";
    msg += "What I'd like: " + want + "\n";
    const size = val('cf-size');     if (size)   msg += "Size: " + size + "\n";
    const when = val('cf-when');     if (when)   msg += "Occasion / needed by: " + when + "\n";
    const budget = val('cf-budget'); if (budget) msg += "Budget: " + budget + "\n";
    const name = val('cf-name');     if (name)   msg += "Name: " + name + "\n";
    msg += "\n(Sent from the website)";
    const url = (WHATSAPP ? 'https://wa.me/' + WHATSAPP : 'https://wa.me/') + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  });
  // clear the error styling as soon as they start typing
  document.getElementById('cf-want').addEventListener('input', () => form.classList.remove('show-err'));
})();
