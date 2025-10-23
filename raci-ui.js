// raci-ui.js
// UI helpers used by the RACI app:
// - loading overlay: ensureLoadingOverlay(), showLoading(text), hideLoading()
// - toast notifications: ensureToastContainer(), showToast(type, text, ttl)
// - badge tooltip (minimal, anchored above avatar): ensureBadgeTooltip(), showBadgeTooltip(text, pageX, pageY), moveBadgeTooltip(), hideBadgeTooltip()
// This file is intentionally minimal and dependency-free.

///////////////////////////
// Loading overlay
///////////////////////////
export function ensureLoadingOverlay() {
  if (document.getElementById("raci-loading-overlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "raci-loading-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    left: "0",
    top: "0",
    right: "0",
    bottom: "0",
    background: "rgba(0,0,0,0.25)",
    zIndex: "9999",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
  });
  overlay.innerHTML = `<div style="background:rgba(255,255,255,0.96);padding:16px;border-radius:8px;display:flex;align-items:center;gap:10px;box-shadow:0 6px 20px rgba(0,0,0,0.08);">
    <div style="width:18px;height:18px;border:3px solid rgba(0,0,0,0.12);border-top-color:rgba(0,0,0,0.5);border-radius:50%;animation:raci-spin 1s linear infinite"></div>
    <div id="raci-loading-text" style="font-size:14px;color:#111">Loading...</div>
  </div>
  <style>
    @keyframes raci-spin { to { transform: rotate(360deg); } }
  </style>`;
  document.body.appendChild(overlay);
}
export function showLoading(text = "Loading...") {
  ensureLoadingOverlay();
  const txt = document.getElementById("raci-loading-text");
  if (txt) txt.textContent = text;
  const o = document.getElementById("raci-loading-overlay");
  if (o) o.style.display = "flex";
}
export function hideLoading() {
  const o = document.getElementById("raci-loading-overlay");
  if (o) o.style.display = "none";
}

///////////////////////////
// Toast notifications
///////////////////////////
export function ensureToastContainer() {
  if (document.getElementById("raci-toast-container")) return;
  const cont = document.createElement("div");
  cont.id = "raci-toast-container";
  Object.assign(cont.style, {
    position: "fixed",
    right: "16px",
    bottom: "16px",
    zIndex: "10001",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "360px",
  });
  document.body.appendChild(cont);
}
export function showToast(type = "info", text = "", ttl = 4000) {
  ensureToastContainer();
  const id = "toast_" + Math.random().toString(36).slice(2, 9);
  const item = document.createElement("div");
  item.id = id;
  Object.assign(item.style, {
    minWidth: "220px",
    maxWidth: "360px",
    padding: "10px 12px",
    borderRadius: "8px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    color: "#fff",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    opacity: "0",
    transform: "translateY(6px)",
    transition: "opacity 160ms ease, transform 160ms ease",
  });
  const colorMap = {
    success: "#198754",
    error: "#dc3545",
    info: "#0d6efd",
    warning: "#f59e0b",
  };
  item.style.background = colorMap[type] || colorMap.info;
  item.innerHTML = `<div style="flex:1;line-height:1.2;word-break:break-word">${String(
    text || ""
  )}</div><div style="margin-left:8px;cursor:pointer;font-weight:700">✕</div>`;
  const cont = document.getElementById("raci-toast-container");
  cont.appendChild(item);
  // animate in
  requestAnimationFrame(() => {
    item.style.opacity = "1";
    item.style.transform = "translateY(0)";
  });
  // close on X
  const x = item.querySelector("div:last-child");
  if (x) x.addEventListener("click", () => item.remove());
  // auto remove
  setTimeout(() => {
    if (item.parentNode) {
      item.style.opacity = "0";
      item.style.transform = "translateY(6px)";
      setTimeout(() => item.remove(), 160);
    }
  }, ttl);
}

///////////////////////////
// Minimal badge tooltip
// - anchored above the .avatar element (centered)
// - flips below if there's no room above
// - clamps inside viewport
// - simple, minimal styling
///////////////////////////

/*
 API:
   ensureBadgeTooltip()
   showBadgeTooltip(text, pageX, pageY)  // pageX/pageY are optional (passed from mouse event)
   moveBadgeTooltip()  // intentionally no-op to remain compatible
   hideBadgeTooltip()
*/

export function ensureBadgeTooltip() {
  if (document.getElementById("raci-badge-tooltip")) return;
  const tip = document.createElement("div");
  tip.id = "raci-badge-tooltip";
  // minimal clean styling
  Object.assign(tip.style, {
    position: "fixed", // viewport-relative
    pointerEvents: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    background: "rgba(0,0,0,0.85)",
    color: "#fff",
    fontSize: "13px",
    zIndex: "999999",
    display: "none",
    whiteSpace: "nowrap",
    maxWidth: "320px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
    transition: "opacity 120ms ease",
    opacity: "0",
  });
  document.body.appendChild(tip);

  // hide tooltip when clicking on a badge/avatar
  // bind once
  if (!tip.dataset.clickBound) {
    document.addEventListener("click", (ev) => {
      try {
        if (ev.target && ev.target.closest && ev.target.closest(".avatar")) {
          hideBadgeTooltip();
        }
      } catch (e) {
        // ignore
      }
    });
    // also hide on pointerdown for better mobile responsiveness
    document.addEventListener("pointerdown", (ev) => {
      try {
        if (ev.target && ev.target.closest && ev.target.closest(".avatar")) {
          hideBadgeTooltip();
        }
      } catch (e) {}
    });
    tip.dataset.clickBound = "1";
  }
}

/**
 * Convert page coords to client coords (viewport) if needed.
 */
function _pageToClient(pageX, pageY) {
  if (typeof pageX !== "number" || typeof pageY !== "number")
    return [undefined, undefined];
  const clientX =
    pageX > window.innerWidth
      ? pageX - (window.scrollX || window.pageXOffset || 0)
      : pageX;
  const clientY =
    pageY > window.innerHeight
      ? pageY - (window.scrollY || window.pageYOffset || 0)
      : pageY;
  return [clientX, clientY];
}

/**
 * Attempt to find avatar element under the pointer using client coords.
 * Returns the closest ancestor with class "avatar".
 */
function _findAvatarUnderPointer(clientX, clientY) {
  if (typeof clientX !== "number" || typeof clientY !== "number") return null;
  try {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    return el.closest ? el.closest(".avatar") : null;
  } catch (e) {
    return null;
  }
}

/**
 * Position the tooltip centered above anchor, flip below if needed, clamp inside viewport.
 */
function _positionTooltipForAnchor(tip, anchor) {
  if (!tip || !anchor) return;
  tip.style.display = "block";
  tip.style.visibility = "hidden";
  tip.style.opacity = "0";

  // Let browser paint so getBoundingClientRect returns correct values
  requestAnimationFrame(() => {
    const tipRect = tip.getBoundingClientRect();
    const aRect = anchor.getBoundingClientRect();
    const gap = 8;

    // center horizontally
    let left = aRect.left + (aRect.width - tipRect.width) / 2;
    if (left < 8) left = 8;
    if (left + tipRect.width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - tipRect.width - 8);
    }

    // prefer above
    let top = aRect.top - tipRect.height - gap;
    let placedBelow = false;
    if (top < 8) {
      // flip below
      top = aRect.bottom + gap;
      placedBelow = true;
      // clamp bottom
      if (top + tipRect.height > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - tipRect.height - 8);
      }
    }

    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
    tip.style.visibility = "visible";
    tip.style.opacity = "1";
  });
}

/**
 * Show tooltip.
 * text: string to show
 * pageX/pageY: optional pointer coordinates (pass ev.pageX, ev.pageY or ev.clientX, ev.clientY)
 */
export function showBadgeTooltip(
  text = "",
  pageX = undefined,
  pageY = undefined
) {
  ensureBadgeTooltip();
  const tip = document.getElementById("raci-badge-tooltip");
  if (!tip) return;
  tip.textContent = text || "";

  // Convert page to client coords if needed
  const [clientX, clientY] = _pageToClient(pageX, pageY);

  // Try to find avatar element under pointer
  let anchor = _findAvatarUnderPointer(clientX, clientY);

  // If no anchor found, try some fallback: nearest .avatar inside document using elementFromPoint offsets
  if (!anchor && typeof clientX === "number") {
    const offsets = [0, -6, 6, -12, 12];
    for (const dx of offsets) {
      for (const dy of offsets) {
        const el = document.elementFromPoint(clientX + dx, clientY + dy);
        if (!el) continue;
        const a = el.closest && el.closest(".avatar");
        if (a) {
          anchor = a;
          break;
        }
      }
      if (anchor) break;
    }
  }

  // If still no anchor, we place near pointer (centered) or center-screen fallback
  if (!anchor) {
    tip.style.display = "block";
    tip.style.visibility = "hidden";
    tip.style.opacity = "0";
    requestAnimationFrame(() => {
      const rect = tip.getBoundingClientRect();
      const cx = typeof clientX === "number" ? clientX : window.innerWidth / 2;
      const cy = typeof clientY === "number" ? clientY : 120;
      let left = cx - rect.width / 2;
      let top = cy - rect.height - 8;
      if (left < 8) left = 8;
      if (left + rect.width > window.innerWidth - 8)
        left = Math.max(8, window.innerWidth - rect.width - 8);
      if (top < 8) top = cy + 8;
      tip.style.left = `${Math.round(left)}px`;
      tip.style.top = `${Math.round(top)}px`;
      tip.style.visibility = "visible";
      tip.style.opacity = "1";
    });
    return;
  }

  // anchor found: position above anchor and show
  _positionTooltipForAnchor(tip, anchor);
}

/**
 * Compatible no-op: tooltip is anchored above the avatar (doesn't follow pointer).
 * Keeping the function avoids needing to edit other files that call moveBadgeTooltip.
 */
export function moveBadgeTooltip() {
  // intentionally empty
}

/** Hide tooltip (keeps element for reuse). */
export function hideBadgeTooltip() {
  const tip = document.getElementById("raci-badge-tooltip");
  if (!tip) return;
  tip.style.opacity = "0";
  tip.style.visibility = "hidden";
  tip.style.display = "none";
}
