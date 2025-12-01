const enhanceKeyboardNavigation = () => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      document.body.classList.add("using-keyboard");
    }
  });
  document.addEventListener("mousedown", () => {
    document.body.classList.remove("using-keyboard");
  });
  const skipLink = document.querySelector("#skip-to-content");
  if (skipLink) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const main = document.querySelector("main") || document.querySelector('[role="main"]');
      if (main) {
        main.focus();
        main.scrollIntoView();
      }
    });
  }
};
const enhanceARIALabels = () => {
  const unlabeledButtons = document.querySelectorAll("button:not([aria-label]):not([aria-labelledby])");
  unlabeledButtons.forEach((button, index) => {
    if (!button.textContent?.trim()) {
      button.setAttribute("aria-label", `Button ${index + 1}`);
    }
  });
  const unlabeledLinks = document.querySelectorAll("a:not([aria-label]):not([aria-labelledby])");
  unlabeledLinks.forEach((link, index) => {
    if (!link.textContent?.trim()) {
      link.setAttribute("aria-label", `Link ${index + 1}`);
    }
  });
  const unaltedImages = document.querySelectorAll("img:not([alt])");
  unaltedImages.forEach((img) => {
    img.setAttribute("alt", "");
  });
};
const enhanceFormAccessibility = () => {
  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    const id = input.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute("aria-label") && !input.getAttribute("aria-labelledby")) ;
    }
  });
  const requiredInputs = document.querySelectorAll("input[required], select[required], textarea[required]");
  requiredInputs.forEach((input) => {
    if (!input.getAttribute("aria-required")) {
      input.setAttribute("aria-required", "true");
    }
  });
};
const initAccessibilityEnhancements = () => {
  const style = document.createElement("style");
  style.textContent = `
    .using-keyboard *:focus {
      outline: 2px solid #4361ee !important;
      outline-offset: 2px !important;
    }
    
    .using-keyboard button:focus,
    .using-keyboard a:focus,
    .using-keyboard input:focus,
    .using-keyboard select:focus,
    .using-keyboard textarea:focus {
      box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.3) !important;
    }
  `;
  document.head.appendChild(style);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      enhanceKeyboardNavigation();
      enhanceARIALabels();
      enhanceFormAccessibility();
    });
  } else {
    enhanceKeyboardNavigation();
    enhanceARIALabels();
    enhanceFormAccessibility();
  }
};

export { enhanceARIALabels, enhanceFormAccessibility, enhanceKeyboardNavigation, initAccessibilityEnhancements };
