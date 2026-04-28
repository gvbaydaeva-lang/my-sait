const contactForm = document.querySelector("#contact-form");
const valueSection = document.querySelector(".value-section");
const valueCards = document.querySelectorAll(".value-card");
const ghostCursor = document.querySelector(".value-section__ghost");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const task = String(formData.get("task") || "").trim();

    const subject = encodeURIComponent("Новая заявка с сайта");
    const body = encodeURIComponent(
      `Имя: ${name}\nКонтакт: ${contact}\n\nЗадача:\n${task}`
    );

    window.location.href = `mailto:you@example.com?subject=${subject}&body=${body}`;
  });
}

if (valueCards.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );

  valueCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 80}ms`;
    observer.observe(card);
  });
}

if (valueSection && ghostCursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let ghostX = 0;
  let ghostY = 0;
  let targetX = 0;
  let targetY = 0;
  let rafId = null;

  const animateGhost = () => {
    ghostX += (targetX - ghostX) * 0.12;
    ghostY += (targetY - ghostY) * 0.12;
    ghostCursor.style.transform = `translate3d(${ghostX - 115}px, ${ghostY - 115}px, 0)`;
    rafId = requestAnimationFrame(animateGhost);
  };

  valueSection.addEventListener("mouseenter", () => {
    ghostCursor.style.opacity = "1";
    if (!rafId) {
      rafId = requestAnimationFrame(animateGhost);
    }
  });

  valueSection.addEventListener("mouseleave", () => {
    ghostCursor.style.opacity = "0";
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  valueSection.addEventListener("mousemove", (event) => {
    const bounds = valueSection.getBoundingClientRect();
    targetX = event.clientX - bounds.left;
    targetY = event.clientY - bounds.top;
  });
}
