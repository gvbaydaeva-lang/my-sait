/* ============================================================
   GILYANA BAYDAEVA — Business Card Site
   ============================================================ */

const topbar = document.getElementById('topbar');
const burger = document.querySelector('.nav__burger');
const mobileMenu = document.getElementById('mobile-menu');

/* ── Nav scroll tint ── */
if (topbar) {
  window.addEventListener('scroll', () => {
    topbar.style.background = window.scrollY > 24
      ? 'rgba(250, 250, 248, 0.96)'
      : 'rgba(250, 250, 248, 0.88)';
  }, { passive: true });
}

/* ── Mobile menu ── */
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ── Smooth scroll ── */
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
      const offset = (topbar ? topbar.offsetHeight : 0) + 12;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    }
  });
});

/* ── Project modal ── */
const PROJECTS = {
  fitness: {
    tag: 'Fitness · QR · Studio',
    title: 'Система учёта для фитнес / модельной студии',
    task: 'Студии нужен единый инструмент вместо таблиц и переписки: фиксировать посещаемость, принимать оплаты и быстро проверять статус клиента.',
    done: 'Веб-система с QR-кодами для отметки визитов, учётом абонементов и оплат, ролями для администратора и тренера.',
    result: 'Прозрачная посещаемость, меньше ручной рутины, быстрый контроль оплат — команда видит картину в реальном времени.',
    link: null
  },
  beauty: {
    tag: 'Beauty · Dikidi · Analytics',
    title: 'Аналитический дашборд для бьюти-бизнеса',
    task: 'Владельцу салона нужна аналитика по записям и выручке без ручного свода данных из разных источников.',
    done: 'Дашборд с интеграцией Dikidi API: загрузка записей, срезы по услугам, мастерам и периодам, понятные метрики для решений.',
    result: 'Руководитель видит динамику бизнеса в одном окне и быстрее принимает решения по загрузке и маркетингу.',
    link: null
  },
  wms: {
    tag: 'WMS · Warehouse · FIFO',
    title: 'WMS-система для склада',
    task: 'Склад терял прозрачность по остаткам и движению товара, биллинг и FIFO считались вручную.',
    done: 'WMS-приложение: учёт остатков, движение товара, автоматизация биллинга, FIFO-логика и аналитическая панель.',
    result: 'Полная видимость склада, меньше ошибок в отгрузках, ускорение операционных процессов.',
    link: 'https://gvbaydaeva-lang.github.io/ffmsk-launchpad/dashboard'
  }
};

const EXTRA_LINKS = [
  { label: 'Сайт фэшн-мероприятия', url: 'https://elistafashionshow.ru/' },
  { label: 'Сайт куратора платформы', url: 'http://anastasiya-slautina08.ru/' },
  { label: 'Сайт строительной компании', url: 'https://gvbaydaeva-lang.github.io/Velion-House/' },
  { label: 'CRM для парфюмерного магазина', url: 'https://gvbaydaeva-lang.github.io/parfum-mobil/' }
];

(function initProjectModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const tagEl = document.getElementById('modal-tag');
  const titleEl = document.getElementById('modal-title');
  const taskEl = document.getElementById('modal-task');
  const doneEl = document.getElementById('modal-done');
  const resultEl = document.getElementById('modal-result');
  const linkEl = document.getElementById('modal-link');
  let extraBlock = modal.querySelector('.modal__extra');

  if (!extraBlock) {
    extraBlock = document.createElement('div');
    extraBlock.className = 'modal__extra';
    extraBlock.innerHTML = '<p class="label" style="margin-top:1.5rem">Ещё проекты</p><div class="modal__extra-links"></div>';
    modal.querySelector('.modal__panel').appendChild(extraBlock);
  }

  const extraLinksEl = extraBlock.querySelector('.modal__extra-links');

  const renderExtraLinks = () => {
    extraLinksEl.innerHTML = EXTRA_LINKS.map(item =>
      `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn btn--ghost" style="width:100%;margin-top:0.5rem;font-size:0.85rem">${item.label} →</a>`
    ).join('');
  };

  const openModal = (id) => {
    const data = PROJECTS[id];
    if (!data) return;

    tagEl.textContent = data.tag;
    titleEl.textContent = data.title;
    taskEl.textContent = data.task;
    doneEl.textContent = data.done;
    resultEl.textContent = data.result;

    if (data.link) {
      linkEl.href = data.link;
      linkEl.hidden = false;
    } else {
      linkEl.hidden = true;
    }

    renderExtraLinks();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.case[data-project]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.project));
  });

  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();

/* ── Pain counters ── */
const painCounters = document.querySelectorAll('.pain-counter');
if (painCounters.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const dur = 1500;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = Math.round(ease * target);
        el.textContent = prefix + val.toLocaleString('ru-RU') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.3 });
  painCounters.forEach(el => obs.observe(el));
}

/* ── Services carousel ── */
(function initServiceCarousel() {
  const track = document.getElementById('srv-track');
  if (!track) return;

  let isDragging = false;
  let isPaused = false;
  let startX = 0;
  let startScrollLeft = 0;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;
  let dragRAF;

  const AUTOSPEED = 0.4;

  function autoScroll() {
    if (!isPaused && !isDragging) {
      track.scrollLeft += AUTOSPEED;
      if (track.scrollLeft >= track.scrollWidth / 2) {
        track.scrollLeft = 0;
      }
    }
    requestAnimationFrame(autoScroll);
  }

  Array.from(track.children).forEach(el => {
    track.appendChild(el.cloneNode(true));
  });

  track.style.overflowX = 'auto';
  track.style.scrollbarWidth = 'none';
  track.style.msOverflowStyle = 'none';
  track.style.cursor = 'grab';
  track.style.scrollBehavior = 'auto';

  const style = document.createElement('style');
  style.textContent = '#srv-track::-webkit-scrollbar { display: none; }';
  document.head.appendChild(style);

  track.addEventListener('mousedown', e => {
    isDragging = true;
    isPaused = true;
    startX = e.pageX;
    startScrollLeft = track.scrollLeft;
    lastX = e.pageX;
    lastTime = Date.now();
    velocity = 0;
    track.style.cursor = 'grabbing';
    track.classList.add('is-paused');
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.pageX - startX;
    track.scrollLeft = startScrollLeft - dx;
    velocity = (e.pageX - lastX) / (Date.now() - lastTime + 1);
    lastX = e.pageX;
    lastTime = Date.now();
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';

    let inertia = -velocity * 12;
    function applyInertia() {
      if (Math.abs(inertia) < 0.3) {
        isPaused = false;
        track.classList.remove('is-paused');
        return;
      }
      track.scrollLeft += inertia;
      inertia *= 0.92;
      dragRAF = requestAnimationFrame(applyInertia);
    }
    applyInertia();
  });

  track.addEventListener('touchstart', e => {
    isPaused = true;
    isDragging = true;
    startX = e.touches[0].pageX;
    startScrollLeft = track.scrollLeft;
    lastX = e.touches[0].pageX;
    lastTime = Date.now();
    velocity = 0;
    track.classList.add('is-paused');
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].pageX - startX;
    track.scrollLeft = startScrollLeft - dx;
    velocity = (e.touches[0].pageX - lastX) / (Date.now() - lastTime + 1);
    lastX = e.touches[0].pageX;
    lastTime = Date.now();
  }, { passive: true });

  track.addEventListener('touchend', () => {
    isDragging = false;
    let inertia = -velocity * 10;
    function applyInertia() {
      if (Math.abs(inertia) < 0.3) {
        isPaused = false;
        track.classList.remove('is-paused');
        return;
      }
      track.scrollLeft += inertia;
      inertia *= 0.92;
      requestAnimationFrame(applyInertia);
    }
    applyInertia();
  });

  track.addEventListener('click', () => {
    if (Math.abs(velocity) > 0.1) return;
    isPaused = true;
    track.classList.add('is-paused');
    setTimeout(() => {
      isPaused = false;
      track.classList.remove('is-paused');
    }, 2000);
  });

  autoScroll();
})();

/* ── 3D tilt on cards ── */
(function initTilt() {
  const TILT_MAX = 8;
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.service-card, .example-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
    });
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -TILT_MAX * 2;
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * TILT_MAX * 2;
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.4s ease, box-shadow 0.26s ease';
      el.style.transform = '';
    });
  });
})();

/* ── NumberTicker on step numbers ── */
(function initNumberTicker() {
  const els = document.querySelectorAll('.step-num');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      obs.unobserve(el);
      let count = 0;
      const tick = setInterval(() => {
        count++;
        el.textContent = count < 12
          ? String(Math.floor(Math.random() * target) + 1).padStart(2, '0')
          : String(target).padStart(2, '0');
        if (count >= 12) clearInterval(tick);
      }, 50);
    });
  }, { threshold: 0.4 });
  els.forEach((el, i) => {
    el.dataset.target = i + 1;
    obs.observe(el);
  });
})();

/* ── Subsidy bars animate on scroll ── */
(function initSubsidyBars() {
  const bars = document.querySelectorAll('.subsidy-bar-fill');
  if (!bars.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.width = entry.target.classList.contains('subsidy-bar-fill--state') ? '70%' : '30%';
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  bars.forEach(b => { b.style.width = '0'; obs.observe(b); });
})();

/* ── Blur+scale card reveal ── */
(function initCardReveal() {
  const selectors = '.pain-card, .step-card, .case, .srv-pill';
  document.querySelectorAll(selectors).forEach((el, i) => {
    el.classList.add('reveal-card');
    el.style.animationDelay = `${i * 60}ms`;
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  document.querySelectorAll('.reveal-card').forEach(el => obs.observe(el));
})();

/* ── Hero name split reveal ── */
(function initHeroReveal() {
  const nameEl = document.querySelector('.hero__name');
  const leadEl = document.querySelector('.hero__lead');
  if (nameEl) {
    nameEl.style.opacity = '0';
    nameEl.style.transform = 'translateY(24px)';
    nameEl.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    setTimeout(() => {
      nameEl.style.opacity = '1';
      nameEl.style.transform = 'translateY(0)';
    }, 120);
  }
  if (leadEl) {
    leadEl.style.opacity = '0';
    leadEl.style.transform = 'translateY(18px)';
    leadEl.style.transition = 'opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s';
    setTimeout(() => {
      leadEl.style.opacity = '1';
      leadEl.style.transform = 'translateY(0)';
    }, 200);
  }
})();
