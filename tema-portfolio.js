(() => {
  const preferenceKey = "portfolio-lukas-tema";
  const root = document.documentElement;
  const pageUrl = new URL(window.location.href);
  const linkedTheme = pageUrl.searchParams.get("tema");
  let savedTheme;

  try {
    savedTheme = localStorage.getItem(preferenceKey);
  } catch {
    // Os links também carregam o tema quando o armazenamento é indisponível.
  }

  const themeFromLink = linkedTheme === "light" || linkedTheme === "dark";
  const initialTheme = themeFromLink ? linkedTheme : savedTheme;
  root.dataset.theme = initialTheme === "light" ? "light" : "dark";

  document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    const buttons = document.querySelectorAll("[data-theme-choice]");
    const links = document.querySelectorAll("a[data-theme-link]");
    const browserTheme = document.querySelector('meta[name="theme-color"]');

    function syncHeader() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    function measureHeader() {
      root.style.setProperty("--header-height", `${header.offsetHeight}px`);
    }

    syncHeader();
    measureHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("pageshow", syncHeader);
    if ("ResizeObserver" in window) {
      new ResizeObserver(measureHeader).observe(header);
    } else {
      window.addEventListener("resize", measureHeader, { passive: true });
    }

    function applyTheme(theme) {
      root.dataset.theme = theme;
      browserTheme.content = getComputedStyle(root)
        .getPropertyValue("--page")
        .trim();

      for (const button of buttons) {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.themeChoice === theme),
        );
      }
      for (const link of links) {
        const url = new URL(link.href);
        url.searchParams.set("tema", theme);
        link.href = url.href;
      }
    }

    applyTheme(root.dataset.theme);
    for (const button of buttons) {
      button.addEventListener("click", () => {
        const theme = button.dataset.themeChoice;
        applyTheme(theme);

        try {
          localStorage.setItem(preferenceKey, theme);
        } catch {
          // A seleção continua valendo nos links desta página.
        }

        if (themeFromLink) {
          const url = new URL(window.location.href);
          url.searchParams.set("tema", theme);
          try {
            history.replaceState(history.state, "", url);
          } catch {
            // Alguns navegadores limitam alterações no endereço de arquivos locais.
          }
        }
      });
    }
  });
})();
