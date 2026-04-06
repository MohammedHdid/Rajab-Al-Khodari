/* ============================================================
   RAJAB KHODARI — Landing Page Scripts
   - Sticky nav with scroll detection
   - Mobile drawer toggle
   - Scroll-triggered animations (Intersection Observer)
   - Animated stat counters
   ============================================================ */

'use strict';

// ─── Navbar ──────────────────────────────────────────────────
const navbar     = document.getElementById('navbar');
const navToggle  = document.getElementById('navToggle');
const navDrawer  = document.getElementById('navDrawer');
const navOverlay = document.getElementById('navOverlay');

// Sticky class on scroll
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile drawer open/close
navToggle.addEventListener('click', () => {
  const open = navDrawer.classList.toggle('open');
  navOverlay.style.display = open ? 'block' : 'none';
  document.body.style.overflow = open ? 'hidden' : '';
  navToggle.setAttribute('aria-expanded', open);
});

navOverlay.addEventListener('click', closeNav);

function closeNav() {
  navDrawer.classList.remove('open');
  navOverlay.style.display = 'none';
  document.body.style.overflow = '';
  navToggle.setAttribute('aria-expanded', 'false');
}

// Expose globally so onclick="closeNav()" works
window.closeNav = closeNav;

// ─── Scroll Animations ────────────────────────────────────────
const animatedElements = document.querySelectorAll('[data-animate]');

const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
};

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animObserver.unobserve(entry.target); // fire once
    }
  });
}, observerOptions);

animatedElements.forEach(el => animObserver.observe(el));

// ─── Stat Counters ────────────────────────────────────────────
const counters = document.querySelectorAll('[data-count]');
let countersStarted = false;

function easeOutQuad(t) {
  return t * (2 - t);
}

function animateCounter(el, target, duration = 1800) {
  const suffix = el.dataset.suffix || '+';
  let startTime = null;

  function update(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuad(progress);
    const current = Math.round(easedProgress * target);
    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(update);
}

// Trigger counters when hero stats section enters viewport
const statsSection = document.querySelector('.hero-stats');

if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.count, 10);
          animateCounter(counter, target);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  statsObserver.observe(statsSection);
}

// ─── Active nav link highlight ───────────────────────────────
const sections   = document.querySelectorAll('section[id]');
const navLinks   = document.querySelectorAll('.nav-links a');

function updateActiveLink() {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

// Highlight style (inject once)
const linkStyle = document.createElement('style');
linkStyle.textContent = `.nav-links a.active { color: var(--gold-light); background: var(--gold-glow); }`;
document.head.appendChild(linkStyle);

// ─── Smooth scroll for anchor links ──────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  });
});
