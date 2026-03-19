/* ============================================
   CGS Painting & Decorating — main.js
   ============================================ */

// === NAVBAR: scroll shadow + active link ===
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}, { passive: true });

// === MOBILE MENU ===
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  }
});

// === SWIPER CAROUSEL ===
new Swiper('.gallery-swiper', {
  loop: true,
  speed: 700,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },
  slidesPerView: 1,
  spaceBetween: 0,
  navigation: {
    prevEl: '.swiper-button-prev',
    nextEl: '.swiper-button-next',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  keyboard: { enabled: true },
  a11y: {
    prevSlideMessage: 'Previous photo',
    nextSlideMessage: 'Next photo',
  },
});

// === SCROLL ANIMATIONS ===
const animateEls = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-animate]'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
animateEls.forEach(el => observer.observe(el));

// === FOOTER YEAR ===
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// === WEB3FORMS CONTACT FORM ===
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const formResult = document.getElementById('formResult');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    submitBtn.disabled  = true;
    formResult.className = 'form-result';
    formResult.textContent = '';

    try {
      const data     = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
      });
      const json = await response.json();

      if (json.success) {
        formResult.classList.add('success');
        formResult.textContent = '✓ Message sent! Chris will be in touch shortly.';
        form.reset();
      } else {
        throw new Error(json.message || 'Submission failed');
      }
    } catch (err) {
      formResult.classList.add('error');
      formResult.textContent = 'Something went wrong — please call or email Chris directly.';
    } finally {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled  = false;
    }
  });
}

// === REVIEWS TICKER — auto-scroll + touch/mouse drag ===
(function () {
  const wrap  = document.querySelector('.reviews-ticker-wrap');
  const track = document.getElementById('reviewsTrack');
  if (!wrap || !track) return;

  // Cancel CSS animation; JS drives the scroll from here
  track.style.animation = 'none';

  const AUTO_SPEED = 0.55; // px per frame at 60 fps (~33 px/s)

  let x            = 0;
  let halfWidth    = 0;
  let pointerDown  = false;
  let startPtrX    = 0;
  let startX       = 0;
  let prevPtrX     = 0;
  let velocity     = 0;
  let coasting     = false;
  let hovered      = false;

  function measure() { halfWidth = track.scrollWidth / 2; }

  function clamp(val) {
    if (val <= -halfWidth) return val + halfWidth;
    if (val > 0)           return val - halfWidth;
    return val;
  }

  function tick() {
    if (pointerDown) {
      // position updated by pointer events — nothing to do here
    } else if (coasting) {
      x = clamp(x + velocity);
      velocity *= 0.90;
      if (Math.abs(velocity) < 0.1) { coasting = false; velocity = 0; }
    } else if (!hovered) {
      x = clamp(x - AUTO_SPEED);
    }
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(tick);
  }

  // ---- Touch ----
  wrap.addEventListener('touchstart', e => {
    const t = e.touches[0];
    pointerDown = true; coasting = false; velocity = 0;
    startPtrX = prevPtrX = t.clientX; startX = x;
  }, { passive: true });

  wrap.addEventListener('touchmove', e => {
    if (!pointerDown) return;
    const t   = e.touches[0];
    velocity  = t.clientX - prevPtrX;
    prevPtrX  = t.clientX;
    x = clamp(startX + (t.clientX - startPtrX));
  }, { passive: true });

  wrap.addEventListener('touchend', () => {
    pointerDown = false;
    // finger swiping right → velocity positive → content should move right → add to x
    // finger swiping left  → velocity negative → content moves left faster → add to x
    coasting = Math.abs(velocity) > 0.5;
    // velocity from touchmove is finger delta, same direction as x, so use directly
  });

  // ---- Mouse drag ----
  wrap.addEventListener('mousedown', e => {
    pointerDown = true; coasting = false; velocity = 0;
    startPtrX = prevPtrX = e.clientX; startX = x;
    wrap.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!pointerDown) return;
    velocity = e.clientX - prevPtrX;
    prevPtrX = e.clientX;
    x = clamp(startX + (e.clientX - startPtrX));
  });

  document.addEventListener('mouseup', () => {
    if (!pointerDown) return;
    pointerDown = false;
    wrap.style.cursor = '';
    coasting = Math.abs(velocity) > 0.5;
  });

  // ---- Hover pause (desktop idle only) ----
  wrap.addEventListener('mouseenter', () => { hovered = true; });
  wrap.addEventListener('mouseleave', () => { hovered = false; });

  measure();
  requestAnimationFrame(tick);
})();

// === SMOOTH SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
