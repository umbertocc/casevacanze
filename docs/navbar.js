(() => {
  const scriptUrl = document.currentScript?.src;
  const placeholder = document.querySelector("[data-site-navbar]");

  if (!scriptUrl || !placeholder) {
    console.error("Shared navbar could not start: script URL or placeholder is missing.");
    return;
  }

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("navbar.css", scriptUrl).href;
  document.head.append(stylesheet);

  async function loadNavbar() {
    const response = await fetch(new URL("navbar.html", scriptUrl));
    if (!response.ok) {
      throw new Error(`Navbar request failed with status ${response.status}.`);
    }

    const source = await response.text();
    const template = new DOMParser().parseFromString(source, "text/html").querySelector(".navbar");
    if (!template) {
      throw new Error("Shared navbar template does not contain a .navbar element.");
    }

    const navbar = template.cloneNode(true);
    const language = placeholder.dataset.language === "en" ? "en" : "it";
    navbar.setAttribute("aria-label", language === "en" ? "Main navigation" : "Navigazione principale");
    navbar.querySelectorAll("[data-locale]").forEach((item) => {
      if (item.dataset.locale !== language) {
        item.remove();
      }
    });

    const languageSwitch = placeholder.dataset.languageSwitch;
    const languageSwitchItem = navbar.querySelector("[data-navbar-language-switch]");
    if (languageSwitch) {
      const link = languageSwitchItem.querySelector("a");
      link.href = languageSwitch;
      link.textContent = language === "en" ? "Italiano" : "English";
      languageSwitchItem.hidden = false;
    } else {
      languageSwitchItem.remove();
    }

    placeholder.replaceWith(navbar);

    const menu = navbar.querySelector("#navbarMenu");
    const toggle = navbar.querySelector(".hamburger");
    toggle.setAttribute("aria-label", language === "en" ? "Open navigation menu" : "Apri menu di navigazione");
    const closeMenu = () => {
      menu.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("active");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });
    document.addEventListener("click", (event) => {
      if (!navbar.contains(event.target)) {
        closeMenu();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  loadNavbar().catch((error) => {
    console.error("Failed to load shared navbar.", error);
  });
})();
