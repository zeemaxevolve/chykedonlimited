import { chemicalProducts, homeFeaturedLimit } from './products-data.js';

/* ---------- Helpers ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const WHATSAPP_NUMBER = '2348035800091';
function whatsappQuoteUrl(name) {
  const msg = `Hello Chyke Don, I would like a quote for ${name}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function productCardHTML(p) {
  const img = p.image ? `./assets/products/${encodeURIComponent(p.image)}` : '';
  return `
    <article class="product-card" data-name="${escapeHtml(p.name)}">
      <div class="product-img-wrap">
        ${img ? `<img src="${img}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='./assets/placeholder.svg'">` : '<span style="color:#94a3b8;font-size:0.85rem;">No image</span>'}
      </div>
      <div class="product-body">
        <div class="product-category">${escapeHtml(p.category || '')}</div>
        <h3 class="product-name">${escapeHtml(p.name)}</h3>
        <div class="product-formula">${escapeHtml(p.formula || '')}</div>
        <div class="product-meta">
          ${p.grade ? `<span class="meta-tag">${escapeHtml(p.grade)}</span>` : ''}
          ${p.packaging ? `<span class="meta-tag">${escapeHtml(p.packaging)}</span>` : ''}
        </div>
        <div class="product-actions">
          <a href="${whatsappQuoteUrl(p.name)}" target="_blank" rel="noopener" class="btn-card btn-card-primary">Request Quote</a>
          <a href="./products.html" class="btn-card btn-card-outline">Details</a>
        </div>
      </div>
    </article>`;
}

/* ---------- Home featured products ---------- */
function renderHomeProducts() {
  const grid = $('#home-products-grid');
  const pills = $('#home-category-pills');
  if (!grid) return;

  const limit = homeFeaturedLimit || 12;
  const featured = chemicalProducts.slice(0, Math.min(limit, 12));

  // categories
  if (pills) {
    const cats = [...new Set(chemicalProducts.map(p => p.category).filter(Boolean))];
    pills.innerHTML = `<button class="pill active" data-cat="all">All</button>` +
      cats.slice(0, 6).map(c => `<button class="pill" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('');
    
    pills.addEventListener('click', e => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      $$('.pill', pills).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      const list = cat === 'all' ? featured : chemicalProducts.filter(p => p.category === cat).slice(0, 12);
      grid.innerHTML = list.map(productCardHTML).join('');
    });
  }

  grid.innerHTML = featured.map(productCardHTML).join('');
}

/* ---------- Search suggestions ---------- */
function setupSearch() {
  const input = $('#search-input');
  const box = $('#suggestions-box');
  if (!input || !box) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      box.classList.remove('show');
      box.innerHTML = '';
      return;
    }
    const matches = chemicalProducts
      .filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.formula || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
      .slice(0, 8);

    if (!matches.length) {
      box.classList.remove('show');
      return;
    }
    box.innerHTML = matches.map(p => `
      <div class="suggestion-item" style="padding:0.7rem 1rem; cursor:pointer; border-bottom:1px solid #f1f5f9; font-size:0.9rem;" data-name="${escapeHtml(p.name)}">
        <strong>${escapeHtml(p.name)}</strong>
        <span style="color:#64748b; margin-left:0.4rem; font-size:0.8rem;">${escapeHtml(p.formula || '')}</span>
      </div>`).join('');
    box.classList.add('show');
  });

  box.addEventListener('click', e => {
    const item = e.target.closest('[data-name]');
    if (!item) return;
    input.value = item.dataset.name;
    box.classList.remove('show');
    window.open(whatsappQuoteUrl(item.dataset.name), '_blank', 'noopener');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.hero-search')) box.classList.remove('show');
  });

  $('#product-search-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (q) window.location.href = `./products.html?q=${encodeURIComponent(q)}`;
  });
}

/* ---------- RFQ Modal ---------- */
function openRFQ(productName = '') {
  const overlay = $('#rfq-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (productName) {
    const field = overlay.querySelector('[name="product"]');
    if (field) field.value = productName;
  }
}

function closeRFQ() {
  const overlay = $('#rfq-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function setupRFQ() {
  $$('[data-rfq-trigger]').forEach(btn => btn.addEventListener('click', () => openRFQ()));
  $('#rfq-close')?.addEventListener('click', closeRFQ);
  $('#rfq-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeRFQ();
  });

  // product card quote buttons (delegated)
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-rfq-product]');
    if (btn) openRFQ(btn.dataset.rfqProduct);
  });

  $('#rfq-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    // Simple success feedback
    alert(`Thank you ${data.name || ''}!\n\nYour quote request for "${data.product}" has been received.\nWe will contact you on ${data.phone} shortly.`);
    e.target.reset();
    closeRFQ();
  });
}

/* ---------- Mobile nav ---------- */
function setupNav() {
  const ham = $('#hamburger');
  const links = $('#nav-links');
  ham?.addEventListener('click', () => links?.classList.toggle('open'));

  // sticky shadow
  const nav = $('#navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) nav?.classList.add('scrolled');
    else nav?.classList.remove('scrolled');
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderHomeProducts();
  setupSearch();
  setupRFQ();
  setupNav();
});
