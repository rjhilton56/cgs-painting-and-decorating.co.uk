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
