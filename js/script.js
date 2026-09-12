/* ==========================================================================
   VILLAGEGO — script.js
   Semua interaksi ditulis modular dan dijaga dengan pengecekan elemen,
   supaya file ini aman dipakai di semua halaman meskipun elemennya
   tidak selalu ada di setiap halaman.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initMobileMenu();
  initRevealOnScroll();
  initFilterBar();
  initVideoPlayer();
  initLightboxGallery();
  initFaqAccordion();
});

/* --------------------------------------------------------------------------
   1. NAVBAR — berubah solid saat halaman discroll
   -------------------------------------------------------------------------- */
function initNavbar() {
  var navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function handleScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/* --------------------------------------------------------------------------
   2. MOBILE MENU (hamburger)
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  var toggle = document.querySelector('.navbar-toggle');
  var panel = document.querySelector('.navbar-mobile-panel');
  var scrim = document.querySelector('.navbar-scrim');
  if (!toggle || !panel) return;

  function openMenu() {
    panel.classList.add('is-open');
    if (scrim) scrim.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    panel.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    panel.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  if (scrim) scrim.addEventListener('click', closeMenu);
  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
}

/* --------------------------------------------------------------------------
   3. REVEAL ON SCROLL — fade + slide up ringan memakai IntersectionObserver
   -------------------------------------------------------------------------- */
function initRevealOnScroll() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(function (el) { observer.observe(el); });
}

/* --------------------------------------------------------------------------
   4. FILTER BAR — dipakai di halaman Wisata, UMKM, dan Galeri
   Struktur HTML yang diharapkan:
   <div class="filter-bar">
     <button class="filter-btn is-active" data-filter="semua">Semua</button>
     <button class="filter-btn" data-filter="alam">Alam</button>
   </div>
   <div class="grid-3" data-filter-target>
     <div class="card" data-category="alam">...</div>
   </div>
   -------------------------------------------------------------------------- */
function initFilterBar() {
  var bars = document.querySelectorAll('.filter-bar');
  bars.forEach(function (bar) {
    var buttons = bar.querySelectorAll('.filter-btn');
    var targetSelector = bar.getAttribute('data-target');
    var target = targetSelector ? document.querySelector(targetSelector) : bar.nextElementSibling;
    if (!target) return;
    var items = target.querySelectorAll('[data-category]');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var filter = btn.getAttribute('data-filter');

        items.forEach(function (item) {
          var match = filter === 'semua' || item.getAttribute('data-category') === filter;
          item.style.display = match ? '' : 'none';
        });
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. VIDEO PLAYER — thumbnail dengan tombol play, mengganti dengan
   iframe YouTube saat diklik (hemat performa awal load).
   -------------------------------------------------------------------------- */
function initVideoPlayer() {
  var wrap = document.querySelector('.video-wrap');
  if (!wrap) return;
  var playBtn = wrap.querySelector('.video-play');
  var embedUrl = wrap.getAttribute('data-embed');
  if (!playBtn || !embedUrl) return;

  playBtn.addEventListener('click', function () {
    var iframe = document.createElement('iframe');
    iframe.src = embedUrl + (embedUrl.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1&rel=0';
    iframe.title = 'Video Desa Puguk';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    wrap.classList.add('is-playing');
    wrap.appendChild(iframe);
  });
}

/* --------------------------------------------------------------------------
   6. LIGHTBOX GALLERY — dipakai di halaman Galeri (masonry)
   -------------------------------------------------------------------------- */
function initLightboxGallery() {
  var items = document.querySelectorAll('.masonry-item img');
  var lightbox = document.querySelector('.lightbox');
  if (!items.length || !lightbox) return;

  var lightboxImg = lightbox.querySelector('img');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var prevBtn = lightbox.querySelector('.lightbox-prev');
  var nextBtn = lightbox.querySelector('.lightbox-next');
  var imageList = Array.prototype.slice.call(items);
  var currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = imageList[currentIndex].src;
    lightboxImg.alt = imageList[currentIndex].alt || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function showRelative(offset) {
    currentIndex = (currentIndex + offset + imageList.length) % imageList.length;
    lightboxImg.src = imageList[currentIndex].src;
    lightboxImg.alt = imageList[currentIndex].alt || '';
  }

  imageList.forEach(function (img, index) {
    img.addEventListener('click', function () { openLightbox(index); });
  });
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', function () { showRelative(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { showRelative(1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showRelative(-1);
    if (e.key === 'ArrowRight') showRelative(1);
  });
}

/* --------------------------------------------------------------------------
   7. FAQ / ACCORDION SEDERHANA (dipersiapkan untuk halaman kunjungan/detail
   jika suatu saat dibutuhkan penjelasan yang bisa dibuka-tutup)
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  var accordions = document.querySelectorAll('.accordion-item');
  accordions.forEach(function (item) {
    var trigger = item.querySelector('.accordion-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      accordions.forEach(function (i) { i.classList.remove('is-open'); });
      if (!isOpen) item.classList.add('is-open');
    });
  });
}
