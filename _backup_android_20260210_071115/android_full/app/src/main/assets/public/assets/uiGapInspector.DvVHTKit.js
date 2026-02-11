const getComputedStyleSubset = (el) => {
  if (!el) return null;
  const cs = getComputedStyle(el);
  return {
    position: cs.position,
    top: cs.top,
    height: cs.height,
    minHeight: cs.minHeight,
    maxHeight: cs.maxHeight,
    paddingTop: cs.paddingTop,
    paddingBottom: cs.paddingBottom,
    marginTop: cs.marginTop,
    marginBottom: cs.marginBottom,
    overflow: cs.overflow,
    overflowY: cs.overflowY,
    transform: cs.transform,
    zIndex: cs.zIndex,
    display: cs.display
  };
};
const getSelectorPath = (el) => {
  if (!el) return "null";
  const parts = [];
  let current = el;
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
    } else if (current.className && typeof current.className === "string") {
      const classes = current.className.trim().split(/\s+/).slice(0, 2).join(".");
      if (classes) selector += `.${classes}`;
    }
    parts.unshift(selector);
    current = current.parentElement;
  }
  return parts.join(" > ");
};
const getParentChain = (el, maxDepth = 5) => {
  const chain = [];
  let current = el;
  let depth = 0;
  while (current && current !== document.documentElement && depth < maxDepth) {
    chain.push(getSelectorPath(current));
    current = current.parentElement;
    depth++;
  }
  return chain;
};
const findHeaderElement = () => {
  const selectors = [
    ".unified-header-wrapper",
    "[data-header]",
    "header",
    ".header",
    "#header",
    ".unified-header"
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
};
const createHighlightBox = (rect, color, label) => {
  const box = document.createElement("div");
  box.className = "m1-gap-highlight";
  box.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 2px solid ${color};
    background: ${color}22;
    pointer-events: none;
    z-index: 999998;
    box-sizing: border-box;
  `;
  const labelEl = document.createElement("div");
  labelEl.style.cssText = `
    position: absolute;
    top: -20px;
    left: 0;
    background: ${color};
    color: white;
    font-size: 10px;
    font-family: monospace;
    padding: 2px 6px;
    border-radius: 2px;
    white-space: nowrap;
  `;
  labelEl.textContent = label;
  box.appendChild(labelEl);
  return box;
};
const createHeaderBottomLine = (headerBottom) => {
  const line = document.createElement("div");
  line.className = "m1-gap-header-line";
  line.style.cssText = `
    position: fixed;
    top: ${headerBottom}px;
    left: 0;
    right: 0;
    height: 2px;
    background: red;
    pointer-events: none;
    z-index: 999997;
  `;
  const label = document.createElement("div");
  label.style.cssText = `
    position: absolute;
    top: 4px;
    left: 10px;
    background: red;
    color: white;
    font-size: 11px;
    font-family: monospace;
    padding: 2px 8px;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  `;
  label.textContent = `Header Bottom: ${Math.round(headerBottom)}px`;
  line.appendChild(label);
  return line;
};
const clearHighlights = () => {
  document.querySelectorAll(".m1-gap-highlight, .m1-gap-header-line").forEach((el) => el.remove());
};
const generateReport = () => {
  const visualViewport = window.visualViewport;
  const isCapacitor = !!window.Capacitor || window.location.protocol === "capacitor:";
  const isPWA = window.matchMedia("(display-mode: standalone)").matches;
  const headerEl = findHeaderElement();
  const headerRect = headerEl?.getBoundingClientRect() || null;
  const headerBottom = headerRect?.bottom || 0;
  const criticalY = headerBottom + 2;
  const criticalX = window.innerWidth / 2;
  const gapEl = document.elementFromPoint(criticalX, criticalY);
  const report = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    viewport: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      visualViewportHeight: visualViewport?.height || null,
      visualViewportOffsetTop: visualViewport?.offsetTop || null,
      devicePixelRatio: window.devicePixelRatio,
      isCapacitor,
      isPWA,
      userAgent: navigator.userAgent.slice(0, 100)
    },
    computedStyles: {
      html: getComputedStyleSubset(document.documentElement) || {},
      body: getComputedStyleSubset(document.body) || {},
      root: getComputedStyleSubset(document.getElementById("root")),
      main: getComputedStyleSubset(document.querySelector("main"))
    },
    header: {
      selector: headerEl ? getSelectorPath(headerEl) : "NOT FOUND",
      rect: headerRect,
      bottom: headerBottom,
      computedStyles: getComputedStyleSubset(headerEl)
    },
    gapElement: gapEl ? {
      selector: getSelectorPath(gapEl),
      tagName: gapEl.tagName,
      className: gapEl.className || "",
      id: gapEl.id || "",
      rect: gapEl.getBoundingClientRect(),
      computedStyles: getComputedStyleSubset(gapEl),
      parentChain: getParentChain(gapEl)
    } : null,
    diagnosis: "",
    suggestedFix: ""
  };
  const diagnoses = [];
  const fixes = [];
  const mainPaddingTop = report.computedStyles.main?.paddingTop;
  if (mainPaddingTop && parseInt(mainPaddingTop) > 100) {
    diagnoses.push(`DOUBLE PADDING: <main> has paddingTop=${mainPaddingTop}`);
    fixes.push("Remove duplicate paddingTop from child components (AppHome, etc.)");
  }
  if (report.gapElement?.computedStyles?.paddingTop) {
    const gapPadding = parseInt(report.gapElement.computedStyles.paddingTop);
    if (gapPadding > 80) {
      diagnoses.push(`GAP ELEMENT has large paddingTop: ${report.gapElement.computedStyles.paddingTop}`);
      fixes.push(`Check ${report.gapElement.selector} for duplicate header offset`);
    }
  }
  const safeAreaElements = document.querySelectorAll('[style*="safe-area-inset-top"]');
  if (safeAreaElements.length > 2) {
    diagnoses.push(`MULTIPLE safe-area-inset-top usages: ${safeAreaElements.length} elements`);
    fixes.push("Consolidate safe-area handling to single wrapper");
  }
  if (headerRect && report.gapElement?.rect) {
    const actualGap = report.gapElement.rect.top - headerRect.bottom;
    if (actualGap > 20) {
      diagnoses.push(`EXCESSIVE GAP: ${Math.round(actualGap)}px between header bottom and content`);
    }
  }
  report.diagnosis = diagnoses.length > 0 ? diagnoses.join(" | ") : "No obvious issues detected";
  report.suggestedFix = fixes.length > 0 ? fixes.join(" | ") : "Check for nested paddingTop or duplicate safe-area";
  return report;
};
const showOverlay = () => {
  clearHighlights();
  const headerEl = findHeaderElement();
  const headerRect = headerEl?.getBoundingClientRect();
  const headerBottom = headerRect?.bottom || 0;
  const line = createHeaderBottomLine(headerBottom);
  document.body.appendChild(line);
  const criticalY = headerBottom + 2;
  const criticalX = window.innerWidth / 2;
  const gapEl = document.elementFromPoint(criticalX, criticalY);
  if (gapEl) {
    const rect = gapEl.getBoundingClientRect();
    const highlight = createHighlightBox(rect, "#00D1FF", `Gap: ${gapEl.tagName}${gapEl.id ? "#" + gapEl.id : ""}`);
    document.body.appendChild(highlight);
  }
  if (headerRect) {
    const headerHighlight = createHighlightBox(headerRect, "#FF00FF", "Header");
    document.body.appendChild(headerHighlight);
  }
  const contentY = headerBottom + 100;
  const contentEl = document.elementFromPoint(criticalX, contentY);
  if (contentEl && contentEl !== gapEl) {
    const contentRect = contentEl.getBoundingClientRect();
    const contentHighlight = createHighlightBox(contentRect, "#00FF88", "Content Start");
    document.body.appendChild(contentHighlight);
  }
};
const highlightSelector = (selector) => {
  clearHighlights();
  const el = document.querySelector(selector);
  if (el) {
    const rect = el.getBoundingClientRect();
    const highlight = createHighlightBox(rect, "#FFFF00", selector);
    document.body.appendChild(highlight);
  }
};
const pickAtY = (y) => {
  const x = window.innerWidth / 2;
  const el = document.elementFromPoint(x, y);
  if (el) {
    const rect = el.getBoundingClientRect();
    const highlight = createHighlightBox(rect, "#FF6600", `Y=${y}`);
    document.body.appendChild(highlight);
  }
  return el;
};
const disableOverlay = () => {
  clearHighlights();
};
const isDebugEnabled = () => {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("m1_ui_debug") === "1") return true;
  const url = new URL(window.location.href);
  if (url.searchParams.get("ui_debug") === "1") return true;
  return false;
};
const autoRun = () => {
  if (!isDebugEnabled()) return;
  setTimeout(() => {
    showOverlay();
    generateReport();
  }, 2e3);
};
const initUiGapInspector = () => {
  if (typeof window === "undefined") return;
  window.__m1UiDebug = {
    report: () => {
      const r = generateReport();
      return r;
    },
    highlight: highlightSelector,
    pick: pickAtY,
    off: disableOverlay,
    show: showOverlay,
    isEnabled: isDebugEnabled,
    enable: () => {
      localStorage.setItem("m1_ui_debug", "1");
    },
    disable: () => {
      localStorage.removeItem("m1_ui_debug");
      disableOverlay();
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoRun);
  } else {
    autoRun();
  }
};
const uiGapInspector = {
  init: initUiGapInspector,
  report: generateReport,
  highlight: highlightSelector,
  pick: pickAtY,
  off: disableOverlay,
  show: showOverlay
};

export { uiGapInspector as default, initUiGapInspector };
