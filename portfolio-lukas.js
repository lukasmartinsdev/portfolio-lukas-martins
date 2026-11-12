(() => {
  // A navegação usa âncoras reais e destaca o destino selecionado.
  const navigation = document.querySelectorAll(".main-nav a");
  const cotonSummary = document.getElementById("fluxo-coton");
  const cotonFlow = cotonSummary.parentElement;

  document
    .querySelector('a[href="#fluxo-coton"]')
    .addEventListener("click", () => {
      cotonFlow.open = true;
    });

  function syncNavigation() {
    const hash = window.location.hash;
    const target = document.getElementById(hash.slice(1));
    if (target === cotonSummary) cotonFlow.open = true;
    const section = target?.closest("section[id]");
    const destination = section ? "#" + section.id : hash || "#inicio";
    for (const link of navigation) {
      if (link.hash === destination) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  syncNavigation();
  window.addEventListener("hashchange", syncNavigation);

  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");

  // Os elementos continuam visíveis antes da animação e sem JavaScript.
  if (!motionPreference.matches && "IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < 0.15) continue;
          entry.target.classList.add("entering");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    for (const element of document.querySelectorAll(
      ".section-heading, .published-card, .project-card",
    )) {
      reveal.observe(element);
    }
  }

  for (const card of document.querySelectorAll(
    ".published-card, .project-card",
  )) {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || motionPreference.matches) return;
      const { left, top } = card.getBoundingClientRect();
      card.style.setProperty("--glow-x", `${event.clientX - left}px`);
      card.style.setProperty("--glow-y", `${event.clientY - top}px`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--glow-x");
      card.style.removeProperty("--glow-y");
    });
  }
})();
