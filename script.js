const root = document.documentElement;
const body = document.body;
const SITE_BASE_URL = "https://uep-dev.github.io/UEP/";
const COOKIE_CONSENT_KEY = "uep-cookie-consent";
const ACCESS_PREFERENCES_KEY = "uep-access-preferences";
const LEGACY_DARK_MODE_KEY = "uep-dark-mode";
const fallbackImage = "assets/logo-uep.jpg";

body.classList.add("js-ready");

// Shared helpers
const cleanText = (value) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeSearchText = (value) =>
  cleanText(value)
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const readStoredJson = (key, fallback = {}) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
};

const readStoredValue = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The portal remains usable when storage is unavailable.
  }
};

const safeUrl = (value, fallback = "#") => {
  const candidate = cleanText(value);
  if (!candidate) return fallback;

  try {
    const parsed = new URL(candidate, window.location.href);
    if (!["http:", "https:"].includes(parsed.protocol)) return fallback;
    return candidate;
  } catch {
    return fallback;
  }
};

const imageFor = (item) => safeUrl(item?.imagem || item?.imagens?.[0] || fallbackImage, fallbackImage);

const createElement = (tagName, options = {}) => {
  const element = document.createElement(tagName);
  const { className, text, attributes = {} } = options;
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  Object.entries(attributes).forEach(([name, value]) => {
    if (value !== undefined && value !== null) element.setAttribute(name, String(value));
  });
  return element;
};

const replaceChildren = (element, children) => {
  if (!element) return;
  element.replaceChildren(...children.filter(Boolean));
};

const setMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.append(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
};

const setCanonical = (relativeUrl) => {
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = new URL(relativeUrl, SITE_BASE_URL).href;
};

// Icons use a local, dependency-free subset of Lucide-compatible paths.
const icons = {
  accessibility:
    '<circle cx="12" cy="4" r="2"></circle><path d="m18 8-6 2-6-2"></path><path d="m12 10v10"></path><path d="m8 20 4-8 4 8"></path>',
  arrowRight: '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>',
  bookOpen:
    '<path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4v13a4 4 0 0 0-4-4H3Z"></path><path d="M21 18h-5a4 4 0 0 0-4 4V8a4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1Z"></path>',
  calendar:
    '<path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path>',
  externalLink:
    '<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"></path>',
  facebook:
    '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>',
  fileText:
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>',
  graduationCap:
    '<path d="M22 10 12 5 2 10l10 5 10-5Z"></path><path d="M6 12v5c3 2 9 2 12 0v-5"></path><path d="M22 10v6"></path>',
  history:
    '<path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 3v6h6"></path><path d="M12 7v5l3 2"></path>',
  home:
    '<path d="m3 10 9-7 9 7"></path><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"></path>',
  idCard:
    '<rect width="20" height="14" x="2" y="5" rx="2"></rect><circle cx="8" cy="12" r="2"></circle><path d="M12 10h6"></path><path d="M12 14h6"></path><path d="M6 16a3 3 0 0 1 4 0"></path>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path>',
  instagram:
    '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4Z"></path><path d="M17.5 6.5h.01"></path>',
  link:
    '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.2-1.2"></path>',
  mail:
    '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-10 6L2 7"></path>',
  megaphone:
    '<path d="m3 11 18-5v12L3 13v-2Z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>',
  moon: '<path d="M12 3a6 6 0 0 0 9 7.4A9 9 0 1 1 12 3Z"></path>',
  newspaper:
    '<path d="M4 22h16a2 2 0 0 0 2-2V4H8v16a2 2 0 0 1-4 0V6H2v14a2 2 0 0 0 2 2Z"></path><path d="M10 8h8"></path><path d="M10 12h8"></path><path d="M10 16h5"></path>',
  network:
    '<rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M5 16v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"></path><path d="M12 8v8"></path>',
  search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3Z"></path>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path>',
};

const iconSvg = (name) => {
  const paths = icons[name];
  if (!paths) return "";
  return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
};

const iconForText = (text, href = "") => {
  const label = normalizeSearchText(text);
  const url = normalizeSearchText(href);
  if (label.includes("inicio") || label.includes("portal") || url.endsWith("index.html")) return "home";
  if (label.includes("blog") || label.includes("post") || label.includes("publicacao")) return "bookOpen";
  if (label.includes("historia")) return "history";
  if (label.includes("diretoria")) return "users";
  if (label.includes("entidade")) return "network";
  if (label.includes("multimidia") || label.includes("imagem")) return "image";
  if (label.includes("baixar") || label.includes("download")) return "download";
  if (label.includes("jornal") || label.includes("edicao") || url.includes(".pdf")) return "newspaper";
  if (label.includes("pdf")) return "fileText";
  if (label.includes("carteirinha") || label.includes("carteira") || label.includes("formulario")) return "idCard";
  if (label.includes("educacao") || label.includes("formacao") || label.includes("graduacao")) return "graduationCap";
  if (label.includes("movimento") || label.includes("campanha") || label.includes("mobilizacao") || label.includes("luta")) return "megaphone";
  if (label.includes("estudante") || label.includes("juventude")) return "users";
  if (label.match(/\b(19|20)\d{2}\b/)) return "calendar";
  if (label.includes("contato") || label.includes("email")) return "mail";
  if (label.includes("instagram") || label.includes("rede")) return "instagram";
  if (label.includes("facebook")) return "facebook";
  if (label.includes("privacidade") || label.includes("cookie") || label.includes("politica")) return "shield";
  if (label.includes("escuro")) return "moon";
  if (label.includes("acessibilidade")) return "accessibility";
  if (label.includes("buscar")) return "search";
  if (label.includes("abrir") || label.includes("ler") || label.includes("entrar") || label.includes("ver")) return "arrowRight";
  if (url.startsWith("http")) return "externalLink";
  return "link";
};

const addIcon = (element, iconName) => {
  if (!element || element.querySelector(":scope > .icon")) return;
  const iconMarkup = iconSvg(iconName);
  if (!iconMarkup) return;
  element.classList.add("with-icon");
  element.insertAdjacentHTML("afterbegin", iconMarkup);
};

const decorateIcons = (scope = document) => {
  scope
    .querySelectorAll(
      ".main-nav a, .header-actions a, .button, .mode-button, .quick-access-grid a, .cookie-actions a, .cookie-actions button, .section-heading > a, .news-card-content a, .page-link-list a, .site-footer nav a, .article-source a",
    )
    .forEach((element) => addIcon(element, iconForText(element.textContent, element.getAttribute("href") || "")));

  scope.querySelectorAll(".social-links a, .social-page-card").forEach((element) => {
    const marker = element.querySelector(":scope > span");
    if (!marker || marker.querySelector(".icon")) return;
    marker.replaceChildren();
    marker.insertAdjacentHTML("afterbegin", iconSvg(iconForText(element.textContent, element.getAttribute("href") || "")));
  });
};

// Accessibility preferences and dialogs
const preferences = readStoredJson(ACCESS_PREFERENCES_KEY, {});
if (readStoredValue(LEGACY_DARK_MODE_KEY) === "true") preferences.darkMode = true;

const applyPreferences = () => {
  root.classList.toggle("theme-dark", Boolean(preferences.darkMode));
  root.classList.toggle("high-contrast", Boolean(preferences.highContrast));
  root.classList.toggle("large-font", Boolean(preferences.largeFont));
  root.classList.toggle("calm-mode", Boolean(preferences.calmMode));

  document.querySelectorAll("[data-mode-toggle]").forEach((button) => {
    const isDarkToggle = button.getAttribute("data-mode-toggle") === "dark";
    button.setAttribute("aria-pressed", String(isDarkToggle && Boolean(preferences.darkMode)));
  });

  document.querySelectorAll("[data-access-pref]").forEach((input) => {
    input.checked = Boolean(preferences[input.getAttribute("data-access-pref")]);
  });
};

const savePreferences = () => {
  writeStoredValue(ACCESS_PREFERENCES_KEY, JSON.stringify(preferences));
  writeStoredValue(LEGACY_DARK_MODE_KEY, String(Boolean(preferences.darkMode)));
};

applyPreferences();

document.querySelectorAll("[data-mode-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.getAttribute("data-mode-toggle") !== "dark") return;
    preferences.darkMode = !preferences.darkMode;
    savePreferences();
    applyPreferences();
  });
});

document.querySelectorAll("[data-access-pref]").forEach((input) => {
  input.addEventListener("change", () => {
    preferences[input.getAttribute("data-access-pref")] = input.checked;
    savePreferences();
    applyPreferences();
  });
});

const dialogTriggers = new WeakMap();

const openDialog = (dialog, trigger) => {
  if (!dialog || dialog.open) return;
  if (!dialog.dataset.escapeReady) {
    dialog.dataset.escapeReady = "true";
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !dialog.open) return;
      event.preventDefault();
      dialog.close();
    });
  }
  dialogTriggers.set(dialog, trigger || document.activeElement);
  dialog.showModal();
  window.requestAnimationFrame(() => {
    const firstControl = dialog.querySelector("button, input, a[href], [tabindex]:not([tabindex='-1'])");
    firstControl?.focus();
  });
};

const restoreDialogFocus = (dialog) => {
  const trigger = dialogTriggers.get(dialog);
  if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
};

const accessPanel = document.querySelector("#accessPanel");
document.querySelectorAll("[data-open-access-panel]").forEach((button) => {
  button.addEventListener("click", () => openDialog(accessPanel, button));
});
document.querySelector("[data-close-access-panel]")?.addEventListener("click", () => accessPanel?.close());
accessPanel?.addEventListener("click", (event) => {
  if (event.target === accessPanel) accessPanel.close();
});
accessPanel?.addEventListener("close", () => restoreDialogFocus(accessPanel));

const setupCookieNotice = () => {
  if (readStoredValue(COOKIE_CONSENT_KEY)) return;

  const banner = createElement("section", {
    className: "cookie-banner",
    attributes: { role: "dialog", "aria-label": "Aviso de cookies" },
  });
  const copy = createElement("div");
  copy.append(
    createElement("strong", { text: "Cookies e preferências" }),
    createElement("p", {
      text: "Usamos apenas armazenamento local para lembrar modo escuro, acessibilidade e esta confirmação.",
    }),
  );
  const actions = createElement("div", { className: "cookie-actions" });
  const policyLink = createElement("a", { text: "Ler política", attributes: { href: "politica.html" } });
  const acceptButton = createElement("button", { text: "Entendi", attributes: { type: "button" } });
  acceptButton.addEventListener("click", () => {
    writeStoredValue(COOKIE_CONSENT_KEY, "accepted");
    banner.remove();
  });
  actions.append(policyLink, acceptButton);
  banner.append(copy, actions);
  body.append(banner);
};

// Navigation
const setupActiveNavigation = () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((link) => {
    const linkPage = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
    const isArticle = currentPage === "artigo.html" && linkPage === "blog.html";
    const isActive = isArticle || linkPage === currentPage || (!currentPage && linkPage === "index.html");
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
};

const setupMobileMenu = () => {
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#menu-principal");
  if (!menuButton || !menu) return;

  const closeButton = createElement("button", {
    className: "mobile-menu-close",
    text: "×",
    attributes: { type: "button", "aria-label": "Fechar menu" },
  });
  const backdrop = createElement("button", {
    className: "menu-backdrop",
    attributes: { type: "button", "aria-label": "Fechar menu", tabindex: "-1" },
  });
  menu.prepend(closeButton);
  body.append(backdrop);

  const buttonLabel = menuButton.querySelector(".visually-hidden");
  let lastFocusedElement = null;

  const focusableElements = () =>
    [...menu.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")].filter(
      (element) => !element.hidden,
    );

  const openMenu = () => {
    lastFocusedElement = document.activeElement;
    menu.classList.add("is-open");
    backdrop.classList.add("is-open");
    body.classList.add("nav-open");
    menuButton.setAttribute("aria-expanded", "true");
    if (buttonLabel) buttonLabel.textContent = "Fechar menu";
    window.setTimeout(() => closeButton.focus(), 0);
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    menu.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    body.classList.remove("nav-open");
    menuButton.setAttribute("aria-expanded", "false");
    if (buttonLabel) buttonLabel.textContent = "Abrir menu";
    if (restoreFocus && lastFocusedElement instanceof HTMLElement && lastFocusedElement.isConnected) {
      lastFocusedElement.focus();
    }
  };

  menuButton.addEventListener("click", () => {
    if (menu.classList.contains("is-open")) closeMenu();
    else openMenu();
  });
  closeButton.addEventListener("click", () => closeMenu());
  backdrop.addEventListener("click", () => closeMenu());
  menu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu({ restoreFocus: false });
  });
  document.addEventListener("keydown", (event) => {
    if (!menu.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = focusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 921px)");
  desktopQuery.addEventListener("change", (event) => {
    if (event.matches) closeMenu({ restoreFocus: false });
  });
};

const setupScrollProgress = () => {
  const progress = createElement("div", {
    className: "scroll-progress",
    attributes: { "aria-hidden": "true" },
  });
  body.append(progress);

  let ticking = false;
  const update = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = available > 0 ? window.scrollY / available : 0;
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    ticking = false;
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
};

const setupCondensedHeader = () => {
  const header = document.querySelector(".site-header");
  const masthead = header?.querySelector(".masthead");
  if (!header || !masthead) return;
  const mobileQuery = window.matchMedia("(max-width: 920px)");
  let ticking = false;

  const update = () => {
    const condensed = window.scrollY > 120;
    header.classList.toggle("is-condensed", condensed);
    const hidden = condensed && !mobileQuery.matches;
    masthead.toggleAttribute("inert", hidden);
    masthead.setAttribute("aria-hidden", String(hidden));
    ticking = false;
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  mobileQuery.addEventListener("change", requestUpdate);
};

const setupExternalLinks = () => {
  document.querySelectorAll('a[href^="https://linktr.ee/uepoficial"]').forEach((link) => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const values = new Set((link.rel || "").split(/\s+/).filter(Boolean));
    values.add("noopener");
    values.add("noreferrer");
    link.rel = [...values].join(" ");
  });
};

const normalizeSharedChrome = () => {
  document.querySelectorAll(".brand img").forEach((image) => {
    image.width = 2048;
    image.height = 2047;
    image.decoding = "async";
  });

  const headerActions = document.querySelector(".header-actions");
  if (headerActions) {
    replaceChildren(headerActions, [
      createElement("a", { text: "Jornal", attributes: { href: "jornal.html" } }),
      createElement("a", {
        className: "header-cta",
        text: "Fazer carteirinha",
        attributes: { href: "carteirinha.html" },
      }),
    ]);
  }

  const footerNavigation = document.querySelector(".site-footer nav");
  if (footerNavigation) {
    const links = [
      ["Início", "index.html"],
      ["Blog", "blog.html"],
      ["História", "historia.html"],
      ["Diretoria", "diretoria.html"],
      ["Entidades", "entidades.html"],
      ["Multimídia", "multimidia.html"],
      ["Jornal", "jornal.html"],
      ["Carteirinha", "carteirinha.html"],
      ["Contatos", "contatos.html"],
      ["Privacidade e cookies", "politica.html"],
    ];
    replaceChildren(
      footerNavigation,
      links.map(([label, href]) => createElement("a", { text: label, attributes: { href } })),
    );
  }
};

// Search
const staticSearchPages = [
  {
    title: "Início",
    type: "Portal",
    url: "index.html",
  },
  {
    title: "Blog",
    type: "Acervo",
    url: "blog.html",
  },
  {
    title: "Jornal da UEP - Outubro 2025",
    type: "Jornal",
    url: "jornal.html",
  },
  {
    title: "Fazer carteirinha",
    type: "Serviço",
    url: "carteirinha.html",
  },
  {
    title: "Redes sociais",
    type: "Canais",
    url: "redes.html",
  },
  {
    title: "Privacidade e cookies",
    type: "Legal",
    url: "politica.html",
  },
];

const buildSearchIndex = () => {
  const institutionalPages = (window.paginasUEP || []).map((page) => ({
    title: page.navTitle || page.title,
    type: "Institucional",
    url: `${page.key}.html`,
    description: cleanText((page.corpo || []).slice(0, 2).join(" ")),
    searchable: cleanText((page.corpo || []).join(" ")),
  }));
  const articlePages = (window.artigosUEP || []).map((article) => ({
    title: article.titulo,
    type: article.editoria || "Publicação",
    date: article.data,
    url: `artigo.html?id=${encodeURIComponent(article.id)}`,
    description: article.resumo,
    searchable: cleanText(
      `${article.titulo} ${article.data} ${article.editoria} ${article.resumo} ${(article.corpo || []).join(" ")}`,
    ),
  }));
  return [...staticSearchPages, ...institutionalPages, ...articlePages].map((item) => ({
    ...item,
    haystack: normalizeSearchText(
      `${item.title} ${item.type} ${item.date || ""} ${item.description || ""} ${item.searchable || ""}`,
    ),
  }));
};

const createSearchResult = (item) => {
  const link = createElement("a", {
    className: "search-result",
    attributes: { href: safeUrl(item.url) },
  });
  const icon = createElement("span", { className: "search-result-icon" });
  icon.insertAdjacentHTML("afterbegin", iconSvg(iconForText(`${item.type} ${item.title}`, item.url)));
  const metadata = createElement("span", { text: `${item.type}${item.date ? ` · ${item.date}` : ""}` });
  const title = createElement("strong", { text: item.title });
  link.append(icon, metadata, title);
  if (item.description) {
    link.append(createElement("p", { text: cleanText(item.description).slice(0, 180) }));
  }
  return link;
};

const setupSiteSearch = () => {
  const controls = document.querySelector(".view-controls");
  if (!controls || document.querySelector("[data-open-search]")) return;

  const trigger = createElement("button", {
    className: "mode-button search-trigger",
    text: "Buscar",
    attributes: { type: "button", "data-open-search": "", "aria-haspopup": "dialog" },
  });
  addIcon(trigger, "search");
  controls.prepend(trigger);

  const dialog = createElement("dialog", { className: "search-dialog" });
  const closeButton = createElement("button", {
    className: "dialog-close",
    text: "×",
    attributes: { type: "button", "aria-label": "Fechar busca" },
  });
  const label = createElement("p", { className: "section-label", text: "Busca no site" });
  const heading = createElement("h2", { text: "Encontre conteúdos da UEP" });
  const inputLabel = createElement("label", {
    className: "visually-hidden",
    text: "Buscar no site",
    attributes: { for: "siteSearchInput" },
  });
  const input = createElement("input", {
    className: "site-search-input",
    attributes: {
      id: "siteSearchInput",
      type: "search",
      placeholder: "Busque por tema, data, notícia, jornal ou serviço",
      autocomplete: "off",
    },
  });
  const meta = createElement("div", {
    className: "search-meta",
    text: "Digite para buscar no portal.",
    attributes: { "aria-live": "polite" },
  });
  const results = createElement("div", { className: "search-results" });
  dialog.append(closeButton, label, heading, inputLabel, input, meta, results);
  body.append(dialog);

  const searchIndex = buildSearchIndex();
  const scoreItem = (item, query) => {
    const title = normalizeSearchText(item.title);
    const type = normalizeSearchText(item.type);
    let score = 0;
    if (title === query) score += 18;
    if (title.startsWith(query)) score += 12;
    if (title.includes(query)) score += 9;
    if (type.includes(query)) score += 5;
    if (item.haystack.includes(query)) score += 2;
    return score;
  };

  const renderResults = () => {
    const query = normalizeSearchText(input.value);
    const items = query
      ? searchIndex
          .map((item) => ({ ...item, score: scoreItem(item, query) }))
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "pt-BR"))
          .slice(0, 14)
      : searchIndex.slice(0, 8);

    meta.textContent = query
      ? `${items.length} resultado${items.length === 1 ? "" : "s"} encontrado${items.length === 1 ? "" : "s"}.`
      : "Sugestões rápidas para começar.";

    if (!items.length) {
      const empty = createElement("div", { className: "search-empty" });
      empty.append(
        createElement("strong", { text: "Nenhum resultado encontrado" }),
        createElement("p", {
          text: "Tente buscar por movimento estudantil, carteirinha, jornal, história ou diretoria.",
        }),
      );
      replaceChildren(results, [empty]);
      return;
    }
    replaceChildren(results, items.map(createSearchResult));
  };

  trigger.addEventListener("click", () => {
    renderResults();
    openDialog(dialog, trigger);
    window.setTimeout(() => input.focus(), 0);
  });
  closeButton.addEventListener("click", () => dialog.close());
  input.addEventListener("input", renderResults);
  results.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) dialog.close();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => restoreDialogFocus(dialog));
};

// Editorial rendering
const createArticleImage = (article, { eager = false } = {}) =>
  createElement("img", {
    attributes: {
      src: imageFor(article),
      alt: `Imagem do artigo ${article.titulo}`,
      loading: eager ? "eager" : "lazy",
      decoding: "async",
      ...(eager ? { fetchpriority: "high" } : {}),
    },
  });

const renderArticlePage = () => {
  const articlePage = document.querySelector("#article-page");
  if (!articlePage || !window.artigosUEP?.length) return null;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id") || window.artigosUEP[0].id;
  const article = window.artigosUEP.find((item) => item.id === requestedId) || window.artigosUEP[0];
  const related = window.artigosUEP.filter((item) => item.id !== article.id).slice(0, 3);

  const kicker = createElement("div", { className: "article-kicker" });
  kicker.append(
    createElement("span", { className: "section-label", text: article.editoria }),
    createElement("time", { text: article.data }),
  );
  const heading = createElement("h1", { text: article.titulo });
  const summary = createElement("p", { className: "article-summary", text: article.resumo });
  const image = createArticleImage(article, { eager: true });
  image.className = "article-main-image";
  const articleBody = createElement("div", { className: "article-body" });
  replaceChildren(
    articleBody,
    (article.corpo || []).map((paragraph) => createElement("p", { text: paragraph })),
  );

  const children = [kicker, heading, summary, image, articleBody];
  if (article.credito || article.autor || article.origem) {
    const source = createElement("aside", { className: "article-source" });
    source.append(createElement("span", { text: article.credito || "Fonte do acervo" }));
    if (article.autor) source.append(createElement("strong", { text: article.autor }));
    if (article.origem) {
      source.append(
        createElement("a", {
          text: "Ver publicação original",
          attributes: { href: safeUrl(article.origem) },
        }),
      );
    }
    children.push(source);
  }
  children.push(
    createElement("a", {
      className: "button button-secondary",
      text: "Voltar ao blog",
      attributes: { href: "blog.html" },
    }),
  );
  replaceChildren(articlePage, children);

  const relatedGrid = document.querySelector("#related-grid");
  if (relatedGrid) {
    replaceChildren(
      relatedGrid,
      related.map((item) => {
        const link = createElement("a", {
          className: "related-card",
          attributes: { href: `artigo.html?id=${encodeURIComponent(item.id)}` },
        });
        link.append(
          createArticleImage(item),
          createElement("span", { text: item.data }),
          createElement("strong", { text: item.titulo }),
        );
        return link;
      }),
    );
  }

  document.title = `${article.titulo} | UEP`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", article.resumo);
  setCanonical(`artigo.html?id=${encodeURIComponent(article.id)}`);
  body.dataset.ogImage = new URL(imageFor(article), SITE_BASE_URL).href;
  return article;
};

const renderHomeNews = () => {
  const layout = document.querySelector("#home-news-layout");
  if (!layout || !window.artigosUEP?.length) return;
  layout.classList.add("equal-news-layout");
  replaceChildren(
    layout,
    window.artigosUEP.slice(0, 4).map((item) => {
      const article = createElement("article", { className: "news-card home-news-card" });
      const image = createArticleImage(item);
      const content = createElement("div", { className: "news-card-content" });
      content.append(
        createElement("span", { className: "story-tag", text: item.data }),
        createElement("h3", { text: item.titulo }),
        createElement("p", { text: item.resumo }),
        createElement("a", {
          text: "Ler artigo",
          attributes: { href: `artigo.html?id=${encodeURIComponent(item.id)}` },
        }),
      );
      article.append(image, content);
      return article;
    }),
  );
};

const setupBlog = () => {
  const blogGrid = document.querySelector("#blog-grid");
  if (!blogGrid || !window.artigosUEP?.length) return;
  const filters = document.querySelector("#blogFilters");
  const search = document.querySelector("[data-blog-search]");
  const editorias = ["Todas", ...new Set(window.artigosUEP.map((item) => item.editoria))];
  let activeFilter = "Todas";

  const renderFilters = () => {
    if (!filters) return;
    replaceChildren(
      filters,
      editorias.map((editoria) =>
        createElement("button", {
          className: "filter-button",
          text: editoria,
          attributes: {
            type: "button",
            "data-blog-filter": editoria,
            "aria-pressed": String(editoria === activeFilter),
          },
        }),
      ),
    );
  };

  const renderBlog = () => {
    const query = normalizeSearchText(search?.value || "");
    const posts = window.artigosUEP.filter((item) => {
      const matchesFilter = activeFilter === "Todas" || item.editoria === activeFilter;
      const haystack = normalizeSearchText(`${item.titulo} ${item.data} ${item.editoria} ${item.resumo}`);
      return matchesFilter && haystack.includes(query);
    });

    replaceChildren(
      blogGrid,
      posts.map((item) => {
        const card = createElement("article", { className: "blog-post-card" });
        const imageLink = createElement("a", {
          attributes: { href: `artigo.html?id=${encodeURIComponent(item.id)}` },
        });
        imageLink.append(createArticleImage(item));
        const content = createElement("div");
        content.append(
          createElement("span", { className: "story-tag", text: item.editoria }),
          createElement("time", { text: item.data }),
          createElement("h3", { text: item.titulo }),
          createElement("p", { text: item.resumo }),
          createElement("a", {
            className: "button button-secondary",
            text: "Abrir artigo",
            attributes: { href: `artigo.html?id=${encodeURIComponent(item.id)}` },
          }),
        );
        card.append(imageLink, content);
        return card;
      }),
    );
    decorateIcons(blogGrid);
    setupReveal(blogGrid);
  };

  filters?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-blog-filter]") : null;
    if (!button) return;
    activeFilter = button.getAttribute("data-blog-filter") || "Todas";
    renderFilters();
    renderBlog();
  });
  search?.addEventListener("input", renderBlog);
  renderFilters();
  renderBlog();
};

// Institutional pages preserve the existing data and ordering.
const cleanPageParagraphs = (page) => {
  const paragraphs = (page.corpo || []).filter(Boolean);
  if (
    paragraphs.length > 3 &&
    paragraphs[0].length > 900 &&
    paragraphs.slice(1, 4).every((paragraph) => paragraphs[0].includes(paragraph))
  ) {
    return paragraphs.slice(1);
  }
  return paragraphs;
};

const renderHistory = (paragraphs) => {
  const presidentStart = paragraphs.findIndex((paragraph) => paragraph.toUpperCase() === "PRESIDENTES");
  const presidents = presidentStart >= 0 ? paragraphs.slice(presidentStart + 1) : [];
  const bodyParagraphs = presidentStart >= 0 ? paragraphs.slice(0, presidentStart) : paragraphs;
  const blocks = [];
  let insertedCandido = false;

  bodyParagraphs.forEach((paragraph) => {
    if (paragraph === "Fundação") {
      blocks.push(`<h2>${escapeHtml(paragraph)}</h2>`);
      return;
    }
    if (paragraph.startsWith("No dia 6 de Setembro") && !insertedCandido) {
      blocks.push("<h2>Cândido Pinto</h2>");
      blocks.push(
        "<p>Cândido Pinto de Melo foi um dos mais notáveis presidentes da UEP, eleito em meio aos anos de chumbo, em plena Ditadura Militar. Perseguido, sofreu um atentado em 29 de abril de 1969 que o deixou em uma cadeira de rodas pelo resto da vida.</p>",
      );
      insertedCandido = true;
    }
    if (paragraph.startsWith("Após o atentado")) blocks.push("<h2>O fechamento da entidade</h2>");
    if (paragraph.startsWith("Foram muitas as lutas")) blocks.push("<h2>A reconstrução da UEP</h2>");
    if (paragraph.startsWith("Atualmente a UEP")) blocks.push("<h2>A UEP hoje</h2>");
    blocks.push(`<p>${escapeHtml(paragraph)}</p>`);
  });

  if (presidents.length) {
    blocks.push("<h2>Presidentes</h2>");
    blocks.push(`<ul class="content-list">${presidents.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
  }
  return blocks.join("");
};

const renderDirectory = () =>
  (window.diretoriaUEP || [])
    .map(
      (section) => `
        <section class="directory-section">
          <h2>${escapeHtml(section.title)}</h2>
          <div class="directory-grid">
            ${section.people
              .map(
                ([name, mandate, role]) => `
                  <article class="directory-person">
                    ${iconSvg("users")}
                    <span>${escapeHtml(role)}</span>
                    <strong>${escapeHtml(name)}</strong>
                    <p>${escapeHtml(mandate)}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");

const renderEntities = (paragraphs) => {
  const intro = paragraphs.slice(0, 4).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  const entities = paragraphs.slice(4).map((paragraph) => `<li>${escapeHtml(paragraph)}</li>`).join("");
  return `${intro}<h2>Entidades que constroem a UEP</h2><ul class="content-list">${entities}</ul>`;
};

const renderContacts = (paragraphs) => `
  <div class="contact-grid">
    ${paragraphs
      .map((paragraph) => {
        const [label, ...rest] = paragraph.split(":");
        const value = rest.join(":").trim();
        return `
          <article class="contact-card">
            ${iconSvg(iconForText(label, value))}
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value || paragraph)}</strong>
          </article>
        `;
      })
      .join("")}
  </div>
`;

const renderDefaultContent = (paragraphs) =>
  paragraphs
    .map((paragraph) => {
      const isHeading =
        paragraph.length < 44 &&
        (paragraph === paragraph.toUpperCase() || ["Fundação", "PRESIDENTES"].includes(paragraph));
      return isHeading ? `<h2>${escapeHtml(paragraph)}</h2>` : `<p>${escapeHtml(paragraph)}</p>`;
    })
    .join("");

const renderContentPage = () => {
  const pageRoot = document.querySelector("[data-content-page]");
  if (!pageRoot || !window.paginasUEP) return;
  const key = pageRoot.getAttribute("data-content-page");
  const page = window.paginasUEP.find((item) => item.key === key);
  if (!page) return;

  const paragraphs = cleanPageParagraphs(page);
  const title = document.querySelector("[data-page-title]");
  const label = document.querySelector("[data-page-label]");
  const intro = document.querySelector("[data-page-intro]");
  const content = document.querySelector("#page-body");
  const links = document.querySelector("#page-links");
  if (title) title.textContent = page.navTitle || page.title;
  if (label) label.textContent = page.navTitle;
  if (intro && !intro.textContent.trim() && paragraphs[0]) intro.textContent = paragraphs[0];

  const renderers = {
    historia: renderHistory,
    diretoria: renderDirectory,
    entidades: renderEntities,
    contatos: renderContacts,
  };
  if (content) content.innerHTML = (renderers[page.key] || renderDefaultContent)(paragraphs);

  if (links && page.links?.length) {
    replaceChildren(
      links,
      page.links.map((link) =>
        createElement("a", {
          text: link.text || link.href,
          attributes: { href: safeUrl(link.href) },
        }),
      ),
    );
  }
};

// Gallery
const setupMediaLightbox = () => {
  const images = [...document.querySelectorAll(".media-gallery-grid img, .media-logo-frame img")];
  if (!images.length) return;
  const dialog = createElement("dialog", {
    className: "media-lightbox",
    attributes: { "aria-label": "Imagem ampliada" },
  });
  const closeButton = createElement("button", {
    className: "dialog-close",
    text: "×",
    attributes: { type: "button", "aria-label": "Fechar imagem" },
  });
  const expandedImage = createElement("img", {
    attributes: { alt: "", loading: "eager", decoding: "async" },
  });
  dialog.append(closeButton, expandedImage);
  body.append(dialog);

  const clearExpandedImage = () => {
    expandedImage.removeAttribute("src");
    expandedImage.alt = "";
  };

  const openImage = (image) => {
    expandedImage.src = safeUrl(image.dataset.fullSrc || image.currentSrc || image.src, image.src);
    expandedImage.alt = image.alt || "Imagem ampliada";
    openDialog(dialog, image);
  };

  images.forEach((image) => {
    image.classList.add("media-openable");
    image.setAttribute("role", "button");
    image.setAttribute("tabindex", "0");
    image.setAttribute("aria-label", `Abrir imagem: ${image.alt || "imagem do acervo"}`);
    image.addEventListener("click", () => openImage(image));
    image.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      openImage(image);
    });
  });
  closeButton.addEventListener("click", () => {
    clearExpandedImage();
    dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") clearExpandedImage();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    clearExpandedImage();
    restoreDialogFocus(dialog);
  });
};

// Breadcrumbs, SEO and performance
const setupBreadcrumbs = (article) => {
  const main = document.querySelector("main");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  if (!main || currentPage === "index.html" || main.querySelector(".breadcrumbs")) return;
  const heading = article?.titulo || main.querySelector("h1")?.textContent || document.title.split("|")[0].trim();
  if (!heading) return;

  const nav = createElement("nav", { className: "breadcrumbs", attributes: { "aria-label": "Breadcrumb" } });
  const list = createElement("ol");
  const homeItem = createElement("li");
  homeItem.append(createElement("a", { text: "Início", attributes: { href: "index.html" } }));
  const currentItem = createElement("li", { text: cleanText(heading), attributes: { "aria-current": "page" } });
  list.append(homeItem, currentItem);
  nav.append(list);
  main.prepend(nav);
};

const setupSeoMetadata = () => {
  const title = document.title;
  const description = document.querySelector('meta[name="description"]')?.content || "";
  const canonical = document.querySelector('link[rel="canonical"]')?.href || SITE_BASE_URL;
  const image = body.dataset.ogImage || new URL("assets/logo-uep.jpg", SITE_BASE_URL).href;
  const isArticle = window.location.pathname.endsWith("artigo.html");

  setMeta('meta[property="og:type"]', { property: "og:type", content: isArticle ? "article" : "website" });
  setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "UEP Cândido Pinto" });
  setMeta('meta[property="og:title"]', { property: "og:title", content: title });
  setMeta('meta[property="og:description"]', { property: "og:description", content: description });
  setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
  setMeta('meta[property="og:image"]', { property: "og:image", content: image });
  setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
  setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });

  if (!document.querySelector('script[data-uep-structured-data]')) {
    const structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";
    structuredData.dataset.uepStructuredData = "";
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "UEP Cândido Pinto",
      url: SITE_BASE_URL,
      logo: new URL("assets/logo-uep.jpg", SITE_BASE_URL).href,
      sameAs: ["https://www.instagram.com/uepoficial/", "https://web.facebook.com/oficialUEP"],
    });
    document.head.append(structuredData);
  }
};

const setupImagePerformance = () => {
  const eagerSelectors = ".brand img, .article-main-image, .form-hero img";
  document.querySelectorAll("img").forEach((image) => {
    if (!image.hasAttribute("decoding")) image.decoding = "async";
    if (!image.matches(eagerSelectors) && !image.hasAttribute("loading")) image.loading = "lazy";
  });
};

let revealObserver;
const revealSelectors = [
  ".page-hero",
  ".section-heading",
  ".news-card",
  ".movement-section",
  ".service-split",
  ".journal-showcase",
  ".organize-section",
  ".social-section",
  ".blog-post-card",
  ".content-page-card",
  ".content-side-card",
  ".directory-person",
  ".related-card",
  ".media-logo-card",
  ".media-gallery-grid figure",
].join(",");

const setupReveal = (scope = document) => {
  if (preferences.calmMode || !("IntersectionObserver" in window)) {
    scope.querySelectorAll(revealSelectors).forEach((element) => element.classList.add("is-visible"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
  }
  scope.querySelectorAll(revealSelectors).forEach((element) => {
    if (element.classList.contains("reveal-target")) return;
    element.classList.add("reveal-target");
    revealObserver.observe(element);
  });
};

// Initialization order keeps dynamic content available to search, SEO and breadcrumbs.
setupCookieNotice();
normalizeSharedChrome();
renderContentPage();
const activeArticle = renderArticlePage();
renderHomeNews();
setupBlog();
setupSiteSearch();
setupActiveNavigation();
setupMobileMenu();
setupScrollProgress();
setupCondensedHeader();
setupExternalLinks();
setupMediaLightbox();
setupBreadcrumbs(activeArticle);
setupSeoMetadata();
setupImagePerformance();
decorateIcons();
setupReveal();
