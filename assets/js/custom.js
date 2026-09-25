/** Dismisses the site-wide announcement bar when the close control is clicked. */
document.querySelector(".announcement-bar__close")?.addEventListener("click", function () {
  this.closest(".announcement-bar")?.remove();
});

/** Closes all primary-nav dropdown folders; reassigned when folder toggles are initialized. */
let closeAllNavFolders = function () {};

/**
 * Wires Accounts (and other) nav folder toggles: click accordion, keyboard focus,
 * Escape, outside click, and closes folders when the mobile breakpoint changes.
 */
function initNavFolderToggle() {
  const folderToggles = document.querySelectorAll(".nav-folder-toggle");
  if (!folderToggles.length) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 768px)");

  /** Updates ARIA and classes for one folder open/closed state. */
  function setFolderOpen(toggle, open) {
    const folderItem = toggle.closest(".nav-item-has-folder");
    const folderId = toggle.getAttribute("aria-controls");
    const folder = folderId ? document.getElementById(folderId) : null;

    if (!folderItem || !folder) {
      return;
    }

    folderItem.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    folder.setAttribute("aria-hidden", open ? "false" : "true");
  }

  closeAllNavFolders = function () {
    folderToggles.forEach(function (toggle) {
      setFolderOpen(toggle, false);
    });
  };

  folderToggles.forEach(function (toggle) {
    const folderItem = toggle.closest(".nav-item-has-folder");
    let openedByPointer = false;

    /** Opens this folder and closes siblings (keyboard navigation). */
    function openFolderForFocus() {
      closeAllNavFolders();
      setFolderOpen(toggle, true);
    }

    toggle.addEventListener("pointerdown", function () {
      openedByPointer = true;
    });

    toggle.addEventListener("focus", function () {
      if (openedByPointer) {
        return;
      }

      openFolderForFocus();
    });

    if (folderItem) {
      folderItem.addEventListener("focusin", function () {
        if (openedByPointer) {
          return;
        }

        openFolderForFocus();
      });

      folderItem.addEventListener("focusout", function (event) {
        const nextFocus = event.relatedTarget;

        if (nextFocus && folderItem.contains(nextFocus)) {
          return;
        }

        setFolderOpen(toggle, false);
      });

      folderItem.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          setFolderOpen(toggle, false);
          toggle.focus();
        }
      });
    }

    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      openedByPointer = false;

      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        setFolderOpen(toggle, false);
        return;
      }

      closeAllNavFolders();
      setFolderOpen(toggle, true);
    });
  });

  document.addEventListener("click", function (event) {
    if (event.target.closest(".nav-item-has-folder")) {
      return;
    }

    closeAllNavFolders();
  });

  mobileQuery.addEventListener("change", function () {
    closeAllNavFolders();
  });

  closeAllNavFolders();
}

/**
 * Mobile hamburger menu: open/close panel, backdrop, body scroll lock, and
 * sync toggle label/icon; closes nav folders when the menu closes.
 */
function initMainNavToggle() {
  const navigation = document.querySelector(".mobile-site-primary-navigation");
  const toggle = document.querySelector(".main-nav__toggle");
  const menu = document.getElementById("main-nav-menu");
  if (!navigation || !toggle || !menu) return;

  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const backdrop = navigation.querySelector(".main-nav__backdrop");
  const closeButton = menu.querySelector(".main-nav__close");
  const toggleLabel = toggle.querySelector(".main-nav__toggle-label");
  const toggleIcon = toggle.querySelector(".main-nav__toggle-icon");

  /** Returns whether the mobile main nav drawer is open. */
  function isMenuOpen() {
    return navigation.classList.contains("mobile-site-primary-navigation--open");
  }

  /** Applies open/closed state, ARIA, backdrop, and focus for the main nav. */
  function setMenuOpen(open) {
    navigation.classList.toggle("mobile-site-primary-navigation--open", open);
    toggle.classList.toggle("main-nav__toggle--open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");

    if (mobileQuery.matches) {
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("main-nav-open", open);

      if (backdrop) {
        backdrop.hidden = !open;
      }
    } else {
      menu.removeAttribute("aria-hidden");
      document.body.classList.remove("main-nav-open");

      if (backdrop) {
        backdrop.hidden = true;
      }
    }

    if (toggleLabel) {
      toggleLabel.textContent = open ? "Close" : "Menu";
    }

    if (toggleIcon) {
      toggleIcon.className = open
        ? "fa-solid fa-xmark main-nav__toggle-icon"
        : "fa-solid fa-bars main-nav__toggle-icon";
    }

    if (open && mobileQuery.matches) {
      closeButton?.focus();
    }

    if (!open) {
      closeAllNavFolders();
    }
  }

  toggle.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(!isMenuOpen());
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });

  backdrop?.addEventListener("click", function () {
    setMenuOpen(false);
    toggle.focus();
  });

  closeButton?.addEventListener("click", function (event) {
    event.preventDefault();
    setMenuOpen(false);
    toggle.focus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isMenuOpen()) {
      setMenuOpen(false);
      toggle.focus();
    }
  });

  mobileQuery.addEventListener("change", function () {
    setMenuOpen(false);
  });

  setMenuOpen(false);
}

/**
 * Moves the header social link block into the mobile nav slot at ≤768px,
 * and back into the header on larger viewports.
 */
function initSocialLinksPlacement() {
  const socialLinks = document.querySelector(".site-header .social-links");
  const headerSlot = document.querySelector(".site-header__social");
  const mobileSlot = document.querySelector(".mobile-social-links");
  if (!socialLinks || !headerSlot || !mobileSlot) return;

  const mobileQuery = window.matchMedia("(max-width: 768px)");

  /** Appends social links to the slot appropriate for the current breakpoint. */
  function placeSocialLinks() {
    if (mobileQuery.matches) {
      mobileSlot.appendChild(socialLinks);
    } else {
      headerSlot.appendChild(socialLinks);
    }
  }

  mobileQuery.addEventListener("change", placeSocialLinks);
  placeSocialLinks();
}

/**
 * Collapsible online banking block in the header at ≤1250px; always expanded
 * on wider screens with ARIA reset.
 */
function initMobileOnlineBankingToggle() {
  const container = document.querySelector(".online-banking-container");
  const toggle = document.querySelector(".mobile-online-banking__toggle");
  const content = document.getElementById("online-banking-content");
  if (!container || !toggle || !content) return;

  const mobileQuery = window.matchMedia("(max-width: 1250px)");
  const isDropdown = container.classList.contains("online-banking-container--dropdown");

  /** Returns whether the mobile online banking panel is expanded. */
  function isOpen() {
    return container.classList.contains("online-banking-container--open");
  }

  /** Opens or closes the panel on mobile; clears mobile state on desktop. */
  function setOnlineBankingOpen(open) {
    if (!mobileQuery.matches && !isDropdown) {
      container.classList.remove("online-banking-container--open");
      toggle.setAttribute("aria-expanded", "false");
      content.removeAttribute("aria-hidden");
      return;
    }

    container.classList.toggle("online-banking-container--open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    content.setAttribute("aria-hidden", open ? "false" : "true");
  }

  toggle.addEventListener("click", function (event) {
    event.preventDefault();

    if (!mobileQuery.matches && !isDropdown) {
      return;
    }

    setOnlineBankingOpen(!isOpen());
  });

  if (isDropdown) {
    document.addEventListener("click", function (event) {
      if (!isOpen()) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (container.contains(target) || toggle.contains(target)) {
        return;
      }

      setOnlineBankingOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setOnlineBankingOpen(false);
        toggle.focus();
      }
    });
  }

  mobileQuery.addEventListener("change", function () {
    if (!isDropdown) {
      setOnlineBankingOpen(false);
    }
  });

  setOnlineBankingOpen(false);
}

/**
 * Converts heading text into a URL-safe fragment id (e.g. "Holiday Club Accounts" → holiday-club-accounts).
 * @param {string} text
 * @returns {string}
 */
function slugifyHeadingId(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Reads the current location hash and returns the target element id, or null if absent/invalid.
 * @returns {string|null}
 */
function getHashTargetId() {
  const hash = window.location.hash;

  if (!hash || hash.length < 2) {
    return null;
  }

  try {
    return decodeURIComponent(hash.slice(1));
  } catch (error) {
    return hash.slice(1);
  }
}

/**
 * Scrolls to the element matching the URL hash and focuses it for accessibility.
 * @returns {HTMLElement|null} The scrolled-to element, or null if not found.
 */
function scrollToHashTarget() {
  const id = getHashTargetId();

  if (!id) {
    return null;
  }

  const target = document.getElementById(id);

  if (!target) {
    return null;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  target.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });

  if (typeof target.focus === "function") {
    target.focus({ preventScroll: true });
  }

  return target;
}

/**
 * On load and on hashchange, scrolls to the in-page section for window.location.hash.
 */
function initPageHashNavigation() {
  /** Handles initial hash and subsequent hash updates. */
  function handleHashChange() {
    scrollToHashTarget();
  }

  handleHashChange();
  window.addEventListener("hashchange", handleHashChange);
}

/**
 * Builds the internal page sidebar from `.entry-content h2` headings: assigns ids,
 * anchor links, and mobile dropdown; then enables hash-based deep linking.
 */
function initSidebarNavigation() {
  const sidebar = document.querySelector(".sidebar-navigation");
  const contentRoot = document.querySelector(".entry-content");
  if (!sidebar || !contentRoot) {
    return;
  }

  const headings = contentRoot.querySelectorAll("h2");
  if (!headings.length) {
    sidebar.hidden = true;
    return;
  }

  const nav = document.createElement("nav");
  nav.className = "sidebar-navigation__nav";
  nav.setAttribute("aria-label", "On this page");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "sidebar-navigation__toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "sidebar-navigation-panel");
  toggle.innerHTML =
    '<span class="sidebar-navigation__toggle-label"><i class="fa-solid fa-list" aria-hidden="true"></i><span>Menu</span></span>' +
    '<i class="fa-solid fa-chevron-down sidebar-navigation__toggle-icon" aria-hidden="true"></i>';

  const panel = document.createElement("div");
  panel.className = "sidebar-navigation__panel";
  panel.id = "sidebar-navigation-panel";
  panel.setAttribute("aria-hidden", "true");

  const list = document.createElement("ul");
  list.className = "sidebar-navigation__list";

  const usedIds = new Set();

  headings.forEach(function (heading) {
    let id = heading.id;

    if (!id) {
      let baseId = slugifyHeadingId(heading.textContent || "");
      if (!baseId) {
        baseId = "section";
      }

      id = baseId;
      let suffix = 2;

      while (usedIds.has(id) || document.getElementById(id)) {
        id = baseId + "-" + suffix;
        suffix += 1;
      }

      heading.id = id;
    }

    usedIds.add(id);
    heading.tabIndex = -1;

    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.className = "sidebar-navigation__link";
    link.href = "#" + id;
    link.textContent = (heading.textContent || "").trim();
    listItem.appendChild(link);
    list.appendChild(listItem);
  });

  panel.appendChild(list);
  nav.appendChild(toggle);
  nav.appendChild(panel);
  sidebar.appendChild(nav);

  initSidebarNavigationDropdown(sidebar, toggle, panel);
  initPageHashNavigation();
}

/**
 * Mobile (≤960px) expand/collapse for the sidebar "Menu" panel; desktop keeps the list visible.
 * @param {HTMLElement} sidebar
 * @param {HTMLButtonElement} toggle
 * @param {HTMLElement} panel
 */
function initSidebarNavigationDropdown(sidebar, toggle, panel) {
  const dropdownQuery = window.matchMedia("(max-width: 960px)");

  /** Opens or closes the sidebar panel on small screens; no-op styling on desktop. */
  function setSidebarNavOpen(open) {
    if (!dropdownQuery.matches) {
      sidebar.classList.remove("sidebar-navigation--open");
      toggle.setAttribute("aria-expanded", "true");
      panel.removeAttribute("aria-hidden");
      return;
    }

    sidebar.classList.toggle("sidebar-navigation--open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("aria-hidden", open ? "false" : "true");
  }

  toggle.addEventListener("click", function (event) {
    event.preventDefault();

    if (!dropdownQuery.matches) {
      return;
    }

    setSidebarNavOpen(!sidebar.classList.contains("sidebar-navigation--open"));
  });

  panel.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setSidebarNavOpen(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && sidebar.classList.contains("sidebar-navigation--open")) {
      setSidebarNavOpen(false);
      toggle.focus();
    }
  });

  dropdownQuery.addEventListener("change", function () {
    setSidebarNavOpen(false);
  });

  setSidebarNavOpen(false);
}

/** Runs all page feature initializers after the DOM is ready. */
function initSiteScripts() {
  initNavFolderToggle();
  initMainNavToggle();
  initSocialLinksPlacement();
  initMobileOnlineBankingToggle();
  initSidebarNavigation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSiteScripts);
} else {
  initSiteScripts();
}

/**
 * Subtle vertical parallax on the homepage promo background; disabled when
 * prefers-reduced-motion is set.
 */
(function initPromoParallax() {
  const promo = document.querySelector(".promo");
  const layer = promo?.querySelector(".promo__parallax");
  if (!promo || !layer) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;

  /** Sets parallax translate from promo position in the viewport. */
  function updateParallax() {
    ticking = false;

    if (motionQuery.matches) {
      layer.style.transform = "";
      return;
    }

    const rect = promo.getBoundingClientRect();
    const viewHeight = window.innerHeight;

    if (rect.bottom < 0 || rect.top > viewHeight) return;

    const sectionCenter = rect.top + rect.height / 2;
    const viewCenter = viewHeight / 2;
    const offset = (sectionCenter - viewCenter) * -0.2;

    layer.style.transform = "translate3d(0, " + offset + "px, 0)";
  }

  /** Schedules a single rAF parallax update on scroll or resize. */
  function onScrollOrResize() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  motionQuery.addEventListener("change", updateParallax);
  updateParallax();
})();
