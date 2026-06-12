/* ============================================================
   GILYANA BAYDAEVA — Portfolio Site Scripts
   ============================================================ */

/* ---- Sticky topbar scroll effect ---- */
const topbar = document.querySelector('.topbar');
if (topbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      topbar.style.background = 'rgba(7, 9, 20, 0.88)';
    } else {
      topbar.style.background = 'rgba(7, 9, 20, 0.7)';
    }
  }, { passive: true });
}

/* ---- Mobile menu ---- */
const burger = document.querySelector('.topbar__burger');
const mobileMenu = document.querySelector('.mobile-menu');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ---- About section reveal ---- */
const aboutSectionContent = document.querySelector('.about-modern__content');

if (aboutSectionContent) {
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          aboutSectionContent.classList.add('is-visible');
          aboutObserver.unobserve(aboutSectionContent);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
  );
  aboutObserver.observe(aboutSectionContent);
}

/* ---- Service cards reveal ---- */
const serviceCards = document.querySelectorAll('.service-card, .step-card, .pain-card');

if (serviceCards.length > 0) {
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  serviceCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(18px)';
    card.style.transition = `opacity 0.55s ease ${index * 60}ms, transform 0.55s ease ${index * 60}ms`;
    cardObserver.observe(card);
  });
}

/* ---- FAQ accordion ---- */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  if (!question || !answer) return;

  question.addEventListener('click', () => {
    const isExpanded = question.getAttribute('aria-expanded') === 'true';

    // Close all others
    faqItems.forEach((otherItem) => {
      const otherQuestion = otherItem.querySelector('.faq-question');
      const otherAnswer = otherItem.querySelector('.faq-answer');
      if (otherQuestion && otherAnswer && otherItem !== item) {
        otherQuestion.setAttribute('aria-expanded', 'false');
        otherAnswer.style.maxHeight = '0';
      }
    });

    // Toggle current
    if (isExpanded) {
      question.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = '0';
    } else {
      question.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

/* ---- Counter animation (hero stats) ---- */
const counters = document.querySelectorAll('.counter');

if (counters.length > 0) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target') || '0', 10);
          const duration = 1600;
          const start = performance.now();

          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            entry.target.textContent = Math.round(eased * target).toLocaleString('ru-RU');
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

/* ---- Smooth scroll for anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#' || href === '#top') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const topbarHeight = topbar ? topbar.offsetHeight : 0;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - topbarHeight - 16;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  });
});

/* ---- Ghost cursor (value section, if present) ---- */
const valueSection = document.querySelector('.value-section');
const ghostCursor = document.querySelector('.value-section__ghost');

if (valueSection && ghostCursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let ghostX = 0, ghostY = 0, targetX = 0, targetY = 0, rafId = null;

  const animateGhost = () => {
    ghostX += (targetX - ghostX) * 0.12;
    ghostY += (targetY - ghostY) * 0.12;
    ghostCursor.style.transform = `translate3d(${ghostX - 110}px, ${ghostY - 110}px, 0)`;
    rafId = requestAnimationFrame(animateGhost);
  };

  valueSection.addEventListener('mouseenter', () => {
    ghostCursor.style.opacity = '1';
    if (!rafId) rafId = requestAnimationFrame(animateGhost);
  });

  valueSection.addEventListener('mouseleave', () => {
    ghostCursor.style.opacity = '0';
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  });

  valueSection.addEventListener('mousemove', (event) => {
    const bounds = valueSection.getBoundingClientRect();
    targetX = event.clientX - bounds.left;
    targetY = event.clientY - bounds.top;
  });
}
