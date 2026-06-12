/* ============================================================
   GILYANA BAYDAEVA — Site Scripts
   ============================================================ */

/* ── Sticky topbar tint on scroll ── */
const topbar = document.getElementById('topbar');
if (topbar) {
  window.addEventListener('scroll', () => {
    topbar.style.background = window.scrollY > 40
      ? 'rgba(240,237,230,0.96)'
      : 'rgba(240,237,230,0.82)';
  }, { passive: true });
}

/* ── Mobile burger menu ── */
const burger     = document.querySelector('.topbar__burger');
const mobileMenu = document.getElementById('mobile-menu');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
  });
  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    })
  );
}

/* ── Smooth scroll with topbar offset ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#' || href === '#top') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = (topbar ? topbar.offsetHeight : 0) + 16;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    }
  });
});

/* ── IntersectionObserver helper ── */
function onEnter(selector, callback, options = {}) {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px', ...options });
  els.forEach(el => obs.observe(el));
}

/* ── Fade-up cards ── */
(function initFadeUp() {
  const selectors = [
    '.service-card', '.step-card', '.example-card',
    '.pain-grid .os-window', '.faq-item', '.pitch-stat'
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition =
        `opacity .55s ease ${i * 55}ms, transform .55s ease ${i * 55}ms`;
    });
  });

  onEnter(selectors.join(','), el => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
})();

/* ── About photo reveal ── */
onEnter('.about-photo img', el => {
  el.classList.add('is-visible');
}, { threshold: 0.2 });

/* ── Counter animation (hero stats) ── */
onEnter('.counter', el => {
  const target = parseInt(el.getAttribute('data-target') || '0', 10);
  const start  = performance.now();
  const dur    = 1600;
  const tick   = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
    el.textContent = v.toLocaleString('ru-RU');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}, { threshold: 0.5 });

/* ── FAQ accordion ── */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  const ans = item.querySelector('.faq-a');
  if (!btn || !ans) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // close all
    document.querySelectorAll('.faq-item').forEach(other => {
      const ob = other.querySelector('.faq-q');
      const oa = other.querySelector('.faq-a');
      if (ob && oa && other !== item) {
        ob.setAttribute('aria-expanded', 'false');
        oa.style.maxHeight = '0';
      }
    });

    if (isOpen) {
      btn.setAttribute('aria-expanded', 'false');
      ans.style.maxHeight = '0';
    } else {
      btn.setAttribute('aria-expanded', 'true');
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
});
