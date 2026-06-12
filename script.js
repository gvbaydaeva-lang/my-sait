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
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  const start  = performance.now();
  const dur    = 1500;
  const tick   = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
    el.textContent = `${prefix}${v.toLocaleString('ru-RU')}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}, { threshold: 0.5 });

/* ── Hero dashboard text cycle ── */
(function initHeroDashboard() {
  const messageWrap = document.querySelector('.dashboard-message');
  const phraseEl = document.querySelector('.dashboard-phrase');
  const statusEl = document.querySelector('.dashboard-status');
  if (!messageWrap || !phraseEl || !statusEl) return;

  const slides = [
    { text: 'Создаю продающие сайты и веб-приложения', status: '🌐 Запущено' },
    { text: 'Внедряю CRM-системы и AI-агентов', status: '🤖 Активно' },
    { text: 'Интегрирую сервисы и автоматизирую рутину', status: '⚙️ В потоке' },
    { text: 'Чтобы ваш бизнес работал и приносил клиентов 24/7', status: '☕️ Автономно' },
  ];

  let activeIndex = 0;
  const animateSlide = (index) => {
    messageWrap.classList.remove('is-visible');
    window.setTimeout(() => {
      phraseEl.textContent = slides[index].text;
      statusEl.textContent = slides[index].status;
      messageWrap.classList.add('is-visible');
    }, 320);
  };

  window.requestAnimationFrame(() => animateSlide(activeIndex));
  window.setInterval(() => {
    activeIndex = (activeIndex + 1) % slides.length;
    animateSlide(activeIndex);
  }, 3600);
})();

/* ── Hero WebGL background ── */
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  #define MAX_COLORS 4
  uniform vec2 uCanvas;
  uniform float uTime;
  uniform float uSpeed;
  uniform vec2 uRot;
  uniform vec3 uColors[MAX_COLORS];
  uniform float uScale;
  uniform float uFrequency;
  uniform float uWarpStrength;
  uniform vec2 uPointer;
  uniform float uMouseInfluence;
  uniform float uParallax;
  uniform float uNoise;
  uniform int uIterations;
  uniform float uIntensity;
  uniform float uBandWidth;
  varying vec2 vUv;

  void main() {
    float t = uTime * uSpeed;
    vec2 p = vUv * 2.0 - 1.0;
    p += uPointer * uParallax * 0.1;
    vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
    vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
    q /= max(uScale, 0.0001);
    q /= 0.5 + 0.2 * dot(q, q);
    q += 0.2 * cos(t) - 7.56;
    vec2 toward = (uPointer - rp);
    q += toward * uMouseInfluence * 0.2;

    for (int j = 0; j < 5; j++) {
      if (j >= uIterations - 1) break;
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
      q += (rr - q) * 0.15;
    }

    vec3 sumCol = vec3(0.0);
    float cover = 0.0;
    vec2 s = q;

    for (int i = 0; i < MAX_COLORS; ++i) {
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      vec2 warped = s + (r - s) * clamp(uWarpStrength, 0.0, 1.0);
      float m = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }

    vec3 col = clamp(sumCol, 0.0, 1.0) * uIntensity;

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    gl_FragColor = vec4(col * cover, cover);
  }
`;

function initColorBendsHero() {
  const container = document.getElementById('hero-bg-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const SAND_COLORS = [
    new THREE.Vector3(240/255, 237/255, 230/255),
    new THREE.Vector3(230/255, 225/255, 216/255),
    new THREE.Vector3(223/255, 217/255, 206/255),
    new THREE.Vector3(234/255, 229/255, 220/255)
  ];

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);

  const pointerTarget = new THREE.Vector2(0, 0);
  const pointerCurrent = new THREE.Vector2(0, 0);

  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uCanvas: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uSpeed: { value: 0.07 },
      uRot: { value: new THREE.Vector2(Math.cos(Math.PI / 2), Math.sin(Math.PI / 2)) },
      uColors: { value: SAND_COLORS },
      uScale: { value: 1.0 },
      uFrequency: { value: 1.0 },
      uWarpStrength: { value: 1.0 },
      uPointer: { value: pointerCurrent },
      uMouseInfluence: { value: 1.0 },
      uParallax: { value: 0.5 },
      uNoise: { value: 0.08 },
      uIterations: { value: 2 },
      uIntensity: { value: 1.2 },
      uBandWidth: { value: 7.0 }
    },
    transparent: false
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xF0EDE6, 1);
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  container.appendChild(renderer.domElement);

  const clock = new THREE.Clock();

  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    material.uniforms.uCanvas.value.set(w, h);
  }

  window.addEventListener('resize', resize);
  resize();

  container.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerTarget.set(x, y);
  });

  function animate() {
    const dt = clock.getDelta();
    material.uniforms.uTime.value = clock.getElapsedTime();
    pointerCurrent.lerp(pointerTarget, Math.min(1, dt * 8));
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

const initHeroBackground = () => {
  if (typeof THREE !== 'undefined') {
    initColorBendsHero();
  } else {
    window.addEventListener('load', initColorBendsHero, { once: true });
  }
};

if (document.readyState === 'complete') {
  initHeroBackground();
} else {
  window.addEventListener('load', initHeroBackground, { once: true });
}


/* ── Testimonials carousel (vanilla JS with Framer Motion-like animations) ── */
(function initTestimonials() {
  const carousel = document.getElementById('testimonials-carousel');
  const modal = document.getElementById('testimonial-modal');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.querySelector('.modal-close');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const cards = Array.from(document.querySelectorAll('.testimonial-card'));

  if (!carousel || !cards.length) return;

  const testimonialsData = [
    {
      name: 'Sarah Chen', title: 'Senior Frontend Developer',
      text: 'The component library has revolutionized our development workflow. The pre-built components are not only beautiful but also highly customizable. It\'s saved us countless hours of development time.',
      img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    },
    {
      name: 'Michael Rodriguez', title: 'Founder, TechStart',
      text: 'As a startup founder, I needed a quick way to build a professional-looking product. This component library was exactly what I needed. The documentation is clear, and the components are production-ready.',
      img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    },
    {
      name: 'David Kim', title: 'UI/UX Lead',
      text: 'The attention to detail in these components is impressive. From accessibility features to responsive design, everything is well thought out. It\'s become an essential part of our tech stack.',
      img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    },
    {
      name: 'Emily Thompson', title: 'Product Designer',
      text: 'What sets this component library apart is its flexibility. We\'ve been able to maintain consistency across our applications while still customizing components to match our brand identity perfectly.',
      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    },
    {
      name: 'James Wilson', title: 'Performance Engineer',
      text: 'The performance optimization in these components is outstanding. We\'ve seen significant improvements in our application\'s load times and overall user experience since implementing them.',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    },
    {
      name: 'Sophia Martinez', title: 'Full Stack Developer',
      text: 'The community support and regular updates make this component library a reliable choice for our projects. It\'s clear that the team behind it is committed to maintaining high quality and adding new features.',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    },
  ];

  const revealCards = () => {
    cards.forEach((card, idx) => {
      setTimeout(() => {
        card.classList.add('fade-in');
      }, idx * 100);
    });
  };

  const openModal = (idx) => {
    const data = testimonialsData[idx];
    if (!data) return;
    modalContent.innerHTML = \`<img src="\${data.img}" alt="\${data.name}" class="modal-avatar" /><h3 class="modal-name">\${data.name}</h3><p class="modal-title">\${data.title}</p><p class="modal-text">\${data.text}</p>\`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => openModal(idx));
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
  modal.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);

  const scrollCarousel = (direction) => {
    const cardWidth = cards[0]?.offsetWidth || 330;
    const gap = 18;
    const distance = cardWidth + gap;
    carousel.scrollBy({ left: direction === 'next' ? distance : -distance, behavior: 'smooth' });
  };

  if (prevBtn) prevBtn.addEventListener('click', () => scrollCarousel('prev'));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollCarousel('next'));

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) {
      if (e.key === 'ArrowLeft') scrollCarousel('prev');
      if (e.key === 'ArrowRight') scrollCarousel('next');
    }
  });

  const updateButtonStates = () => {
    const atStart = carousel.scrollLeft <= 5;
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 5;
    if (prevBtn) prevBtn.disabled = atStart;
    if (nextBtn) nextBtn.disabled = atEnd;
  };

  carousel.addEventListener('scroll', updateButtonStates);
  window.addEventListener('resize', updateButtonStates);

  if (document.readyState === 'complete') {
    revealCards();
    setTimeout(updateButtonStates, 100);
  } else {
    window.addEventListener('load', () => {
      revealCards();
      setTimeout(updateButtonStates, 100);
    }, { once: true });
  }
})();


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
