/* ============================================
   SCENVE LUXE PERFUMES — Main JavaScript
   ============================================ */

/* ── Cart State ── */
const cart = {
  items: JSON.parse(localStorage.getItem('sl_cart') || '[]'),

  save() {
    localStorage.setItem('sl_cart', JSON.stringify(this.items));
    this.updateCount();
  },

  add(product) {
    const existing = this.items.find(i => i.id === product.id && i.size === product.size);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      this.items.push({ ...product, qty: product.qty || 1 });
    }
    this.save();
    showToast(`"${product.name}" added to cart`);
    updateCartDrawer();
  },

  remove(id, size) {
    this.items = this.items.filter(i => !(i.id === id && i.size === size));
    this.save();
    updateCartDrawer();
  },

  updateQty(id, size, qty) {
    const item = this.items.find(i => i.id === id && i.size === size);
    if (item) {
      item.qty = Math.max(1, qty);
      this.save();
    }
    updateCartDrawer();
  },

  total() {
    return this.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  updateCount() {
    const count = this.count();
    document.querySelectorAll('.cart-count, .lx-cart-count, .sl-cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
      el.classList.toggle('show', count > 0);
    });
  }
};

/* ── Wishlist State ── */
const wishlist = {
  items: JSON.parse(localStorage.getItem('sl_wishlist') || '[]'),

  toggle(id) {
    const idx = this.items.indexOf(id);
    if (idx === -1) {
      this.items.push(id);
      localStorage.setItem('sl_wishlist', JSON.stringify(this.items));
      return true;
    } else {
      this.items.splice(idx, 1);
      localStorage.setItem('sl_wishlist', JSON.stringify(this.items));
      return false;
    }
  },

  has(id) {
    return this.items.includes(id);
  }
};

/* ── DOM Ready ── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCart();
  initAnimations();
  initBackToTop();
  initSizeSelector();
  initQtyControls();
  initWishlist();
  initFilters();
  cart.updateCount();
});

/* ── Navigation ── */
function initNav() {
  // ── lx- nav (new luxury navbar) ──
  const lxHeader = document.getElementById('lx-header');
  const lxBurger = document.getElementById('lx-burger');
  const lxMobileMenu = document.getElementById('lx-mobile-menu');
  const lxOverlay = document.getElementById('lx-overlay');

  function lxOpen() {
    lxBurger?.classList.add('open');
    lxMobileMenu?.classList.add('open');
    lxOverlay?.classList.add('show');
    lxBurger?.setAttribute('aria-expanded', 'true');
    lxMobileMenu?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function lxClose() {
    lxBurger?.classList.remove('open');
    lxMobileMenu?.classList.remove('open');
    lxOverlay?.classList.remove('show');
    lxBurger?.setAttribute('aria-expanded', 'false');
    lxMobileMenu?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (lxBurger) {
    lxBurger.addEventListener('click', () => lxBurger.classList.contains('open') ? lxClose() : lxOpen());
    lxOverlay?.addEventListener('click', lxClose);
    lxMobileMenu?.querySelectorAll('.lx-mobile-link, .lx-shop-btn').forEach(l => l.addEventListener('click', lxClose));
  }

  if (lxHeader) {
    window.addEventListener('scroll', () => {
      lxHeader.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // Mark active lx-nav-link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.lx-nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath) link.classList.add('active');
  });
}

/* ── Cart Drawer ── */
function initCart() {
  const cartBtns = document.querySelectorAll('.open-cart');
  const overlay = document.querySelector('.cart-overlay');
  const drawer = document.querySelector('.cart-drawer');
  const closeBtn = document.querySelector('.cart-close');

  function openCart() {
    overlay?.classList.add('open');
    drawer?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    overlay?.classList.remove('open');
    drawer?.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtns.forEach(btn => btn.addEventListener('click', openCart));
  overlay?.addEventListener('click', closeCart);
  closeBtn?.addEventListener('click', closeCart);

  updateCartDrawer();
}

function updateCartDrawer() {
  const cartBody = document.querySelector('.cart-body');
  const cartTotalEl = document.querySelector('.cart-total .price-text');
  const cartSubtotalEl = document.querySelector('.cart-subtotal .price-text');
  if (!cartBody) return;

  if (cart.items.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p>Your cart is empty</p>
        <a href="shop.html" class="btn btn-outline" style="margin-top:8px">Shop Now</a>
      </div>`;
  } else {
    cartBody.innerHTML = cart.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">
          <div class="cart-item-img-placeholder"></div>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-variant">${item.size || '50ml'}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
          <div class="cart-item-qty">
            <button class="cart-qty-btn" onclick="cart.updateQty('${item.id}','${item.size}',${item.qty - 1})">−</button>
            <span class="cart-qty-val">${item.qty}</span>
            <button class="cart-qty-btn" onclick="cart.updateQty('${item.id}','${item.size}',${item.qty + 1})">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="cart.remove('${item.id}','${item.size}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>`).join('');
  }

  const total = cart.total();
  if (cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;
  if (cartSubtotalEl) cartSubtotalEl.textContent = `$${total.toFixed(2)}`;
}

/* ── Toast Notification ── */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ════════════════════════════════════════════════
   SCROLL TRIGGER ENGINE
   ════════════════════════════════════════════════

   Attributes you can add to any element:

   Entrance animations (fire once on enter):
     data-scroll="fade-up"          — fade + rise
     data-scroll="fade-in"          — fade only
     data-scroll="slide-left"       — slide from left
     data-scroll="slide-right"      — slide from right
     data-scroll="scale-in"         — scale up
     data-scroll="clip-up"          — text reveal clip from bottom
     data-scroll="stagger"          — stagger children

   Modifier attributes:
     data-scroll-delay="200"        — delay in ms before animation plays
     data-scroll-duration="800"     — override transition duration (ms)
     data-scroll-offset="-100"      — trigger px before/after viewport edge

   Scrub effects (tied live to scroll position):
     data-scroll-parallax="0.3"     — moves at 30% scroll speed (0–1)
     data-scroll-parallax="-0.2"    — reverse parallax
     data-scroll-rotate="15"        — rotates up to 15deg as element scrolls through
     data-scroll-scale="0.08"       — scales from (1) to (1+value) as scrolls through
     data-scroll-fade-scrub         — opacity 0→1 as element enters viewport

   Counter:
     data-scroll-count="2400"       — animates number from 0 to value on enter
     data-scroll-count-suffix="+"   — appended to counter text
     data-scroll-count-decimals="1" — decimal places (default 0)

   ════════════════════════════════════════════════ */

function initAnimations() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;

  /* ── 1. Entrance animations via IntersectionObserver ── */
  const entranceSelector = [
    '[data-scroll]',
    '.fade-up', '.fade-in', '.stagger',
    '.slide-left', '.slide-right', '.scale-in'
  ].join(',');

  const entranceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.scrollDelay || el.dataset.delay || 0);
      const duration = el.dataset.scrollDuration;

      function trigger() {
        if (duration) el.style.transitionDuration = duration + 'ms';
        el.classList.add('visible', 'scroll-entered');
        // stagger children
        if (el.dataset.scroll === 'stagger' || el.classList.contains('stagger')) {
          [...el.children].forEach((child, i) => {
            child.style.transitionDelay = (i * 80) + 'ms';
            child.classList.add('visible');
          });
        }
      }

      if (reducedMotion) { trigger(); }
      else if (delay > 0) { setTimeout(trigger, delay); }
      else { trigger(); }

      entranceObserver.unobserve(el);
    });
  }, {
    threshold: 0,
    rootMargin: isMobile ? '0px 0px -30px 0px' : '0px 0px -60px 0px'
  });

  document.querySelectorAll(entranceSelector).forEach(el => {
    // Apply data-scroll type as a CSS class if not already an entrance class
    const type = el.dataset.scroll;
    if (type && !['stagger'].includes(type)) {
      el.classList.add(type);
    }
    entranceObserver.observe(el);
  });

  /* ── 2. Counter animation ── */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('[data-scroll-count]').forEach(el => {
    counterObserver.observe(el);
  });
  // legacy support
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    counterObserver.observe(el);
  });

  /* ── 3. Scrub effects — rAF loop ── */
  if (!reducedMotion) {
    initScrub();
  }
}

/* ── Animated counter ── */
function animateCount(el) {
  const target = parseFloat(el.dataset.scrollCount || el.dataset.target || 0);
  const suffix = el.dataset.scrollCountSuffix || el.dataset.suffix || '';
  const decimals = parseInt(el.dataset.scrollCountDecimals || 0);
  const duration = 1800;
  const startVal = 0;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4); // ease-out quart
    const current = startVal + (target - startVal) * ease;
    el.textContent = current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toFixed(decimals) + suffix;
  }
  requestAnimationFrame(step);
}

/* ── Scrub engine — runs on scroll/resize via rAF ── */
function initScrub() {
  const scrubEls = document.querySelectorAll(
    '[data-scroll-parallax], [data-scroll-rotate], [data-scroll-scale], [data-scroll-fade-scrub]'
  );
  if (!scrubEls.length) return;

  let ticking = false;

  function updateScrub() {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    scrubEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      // progress: 0 when bottom enters viewport, 1 when top leaves
      const progress = Math.max(0, Math.min(1,
        (vh - rect.top) / (vh + rect.height)
      ));
      // centered progress: -1 (above) → 0 (center) → 1 (below)
      const centered = (progress - 0.5) * 2;

      const transforms = [];

      // Parallax
      if (el.dataset.scrollParallax !== undefined) {
        const speed = parseFloat(el.dataset.scrollParallax);
        const offset = -centered * speed * 100;
        transforms.push(`translateY(${offset}px)`);
      }

      // Rotate
      if (el.dataset.scrollRotate !== undefined) {
        const maxDeg = parseFloat(el.dataset.scrollRotate);
        transforms.push(`rotate(${centered * maxDeg}deg)`);
      }

      // Scale
      if (el.dataset.scrollScale !== undefined) {
        const maxScale = parseFloat(el.dataset.scrollScale);
        const scale = 1 + (1 - Math.abs(centered)) * maxScale;
        transforms.push(`scale(${scale})`);
      }

      if (transforms.length) {
        el.style.transform = transforms.join(' ');
        el.style.willChange = 'transform';
      }

      // Fade scrub
      if (el.dataset.scrollFadeScrub !== undefined) {
        const opacity = Math.max(0, Math.min(1, progress * 2.5));
        el.style.opacity = opacity;
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrub);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateScrub, { passive: true });
  updateScrub(); // initial paint
}

/* ── Back to Top ── */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Size Selector ── */
function initSizeSelector() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.size-options')
        .querySelectorAll('.size-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* ── Quantity Controls ── */
function initQtyControls() {
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.qty-control').querySelector('.qty-input');
      const val = parseInt(input.value) || 1;
      if (btn.dataset.action === 'plus') input.value = val + 1;
      if (btn.dataset.action === 'minus') input.value = Math.max(1, val - 1);
    });
  });
}

/* ── Wishlist ── */
function initWishlist() {
  document.querySelectorAll('[data-wishlist]').forEach(btn => {
    const id = btn.dataset.wishlist;
    updateWishlistBtn(btn, wishlist.has(id));

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const added = wishlist.toggle(id);
      updateWishlistBtn(btn, added);
      showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
    });
  });
}

function updateWishlistBtn(btn, active) {
  const svg = btn.querySelector('svg');
  if (svg) svg.style.fill = active ? 'currentColor' : 'none';
  btn.style.color = active ? 'var(--pink-dark)' : '';
}

/* ── Add to Cart (product detail page) ── */
function addToCart(productData) {
  const sizeBtn = document.querySelector('.size-btn.active');
  const qtyInput = document.querySelector('.qty-input');
  const size = sizeBtn ? sizeBtn.textContent.trim() : '50ml';
  const qty = parseInt(qtyInput?.value) || 1;

  cart.add({ ...productData, size, qty });

  const drawer = document.querySelector('.cart-drawer');
  const overlay = document.querySelector('.cart-overlay');
  drawer?.classList.add('open');
  overlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── Shop Filters ── */
function initFilters() {
  const filterInputs = document.querySelectorAll('.filter-option input');
  if (!filterInputs.length) return;

  filterInputs.forEach(input => {
    input.addEventListener('change', applyFilters);
  });

  const sortSelect = document.querySelector('.sort-select');
  sortSelect?.addEventListener('change', applyFilters);
}

function applyFilters() {
  const cards = document.querySelectorAll('.product-card[data-category]');
  if (!cards.length) return;

  const activeCategories = [...document.querySelectorAll('.filter-option input:checked')]
    .map(i => i.value);

  cards.forEach(card => {
    const cat = card.dataset.category || '';
    if (activeCategories.length === 0 || activeCategories.includes(cat)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

/* ── Newsletter ── */
document.addEventListener('submit', (e) => {
  if (e.target.classList.contains('newsletter-form') || e.target.id === 'newsletter-form') {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    if (input && input.value) {
      showToast('Thank you for subscribing!');
      input.value = '';
    }
  }
});

/* ── Contact Form ── */
document.addEventListener('submit', (e) => {
  if (e.target.id === 'contact-form') {
    e.preventDefault();
    showToast('Your message has been sent. We\'ll be in touch soon!');
    e.target.reset();
  }
});

/* ── Gallery Thumbnails ── */
document.querySelectorAll('.thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  });
});

/* ── Smooth anchor scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Mobile: swipe right to close menu ── */
(function () {
  const menu = document.querySelector('.mobile-menu');
  if (!menu) return;
  let startX = 0;
  menu.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  menu.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 60) {
      menu.classList.remove('open');
      document.querySelector('.burger-btn')?.classList.remove('open');
      document.body.style.overflow = '';
    }
  }, { passive: true });
}());

/* ── Mobile: prevent body scroll when cart/menu open ── */
(function () {
  let lastY = 0;
  document.addEventListener('touchstart', e => { lastY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchmove', e => {
    const isLocked = document.body.style.overflow === 'hidden';
    if (!isLocked) return;
    const el = e.target.closest('.cart-drawer, .cart-body, .mobile-menu');
    if (!el) e.preventDefault();
  }, { passive: false });
}());

/* ── Viewport height fix for mobile (100vh bug) ── */
function setVh() {
  document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
}
setVh();
window.addEventListener('resize', setVh, { passive: true });

/* ══════════════════════════════════════════
   PRELOADER — Circular ring + slow slide-up
   ══════════════════════════════════════════ */
(function () {
  var preloader = document.querySelector('.preloader');
  if (!preloader) return;

  var ring = preloader.querySelector('.preloader-ring-fill');
  var circumference = 145; /* 2 * π * 23 */
  var pct = 0;
  var done = false;

  function setRing(p) {
    if (!ring) return;
    var offset = circumference - (p / 100) * circumference;
    ring.style.strokeDashoffset = offset;
  }

  function finish() {
    if (done) return;
    done = true;
    setRing(100);
    document.body.style.overflow = '';
    /* Pause 500ms at full ring so user sees completion, then slow slide up */
    setTimeout(function () {
      preloader.classList.add('is-leaving');
      setTimeout(function () { preloader.style.display = 'none'; }, 1700);
    }, 500);
  }

  /* Slow fill over ~2.5s — step every 120ms */
  var interval = setInterval(function () {
    pct += Math.random() * 5 + 2;   /* 2–7% per tick → full in ~2–3s */
    if (pct >= 88) { pct = 88; clearInterval(interval); }
    setRing(pct);
  }, 120);

  /* Complete when page is fully loaded, max wait 2.8s */
  if (document.readyState === 'complete') {
    clearInterval(interval);
    finish();
  } else {
    window.addEventListener('load', function () { clearInterval(interval); finish(); });
    setTimeout(function () { clearInterval(interval); finish(); }, 2800);
  }
}());
