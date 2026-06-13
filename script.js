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
