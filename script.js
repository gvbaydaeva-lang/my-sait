const contactForm = document.querySelector("#contact-form");

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
