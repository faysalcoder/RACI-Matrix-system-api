// your-work.js
// Your Work view integrated with main app month (#monthPicker)
// - uses serviceLoadUsers / serviceLoadMonth from raci-service.js
// - uses raci-ui.js avatar + tooltip helpers
// Include this file after app.js as type="module"

import { serviceLoadUsers, serviceLoadMonth } from "./raci-service.js";
import {
  ensureLoadingOverlay,
  ensureToastContainer,
  showToast,
  ensureBadgeTooltip,
  showBadgeTooltip,
  moveBadgeTooltip,
  hideBadgeTooltip,
} from "./raci-ui.js";

(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // small utils
  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
  function idEq(a, b) {
    return String(a) === String(b);
  }
  function initials(name) {
    return (name || "")
      .split(" ")
      .map((p) => p[0] || "")
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  function colorFromString(s) {
    let h = 0;
    for (let i = 0; i < (s || "").length; i++)
      h = s.charCodeAt(i) + ((h << 5) - h);
    const c = (h & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  }

  function getCurrentMonthFromApp() {
    const el = $("#monthPicker");
    return el ? el.value || "" : "";
  }

  function formatMonthHuman(ym) {
    if (!ym) return "";
    const parts = String(ym).split("-");
    if (parts.length !== 2) return ym;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (Number.isNaN(y) || Number.isNaN(m)) return ym;
    return new Date(y, m - 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  // ensure helpers (kept so tooltip/toast functions exist)
  ensureLoadingOverlay && ensureLoadingOverlay();
  ensureToastContainer && ensureToastContainer();
  ensureBadgeTooltip && ensureBadgeTooltip();

  /* ---------- avatar helpers ---------- */
  function makeAvatarElement(user, size = 36) {
    const el = document.createElement("div");
    el.className = "avatar small";
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.borderRadius = "50%";
    el.style.overflow = "hidden";
    el.style.display = "inline-flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.cursor = "default";
    el.style.flex = "0 0 auto";
    el.style.userSelect = "none";
    el.style.background = "#ddd";

    if (user && user.profile_img) {
      const img = document.createElement("img");
      img.src = user.profile_img;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.onerror = () => {
        if (img.parentNode) img.parentNode.removeChild(img);
        el.textContent = initials(
          user.name || user.emp || user.employee_id || ""
        );
        el.style.background = colorFromString(
          user.name || user.emp || String(Math.random())
        );
      };
      el.appendChild(img);
    } else {
      el.textContent = initials(
        user ? user.name || user.emp || user.employee_id : ""
      );
      el.style.background = colorFromString(
        user
          ? user.name || user.emp || String(Math.random())
          : String(Math.random())
      );
    }

    el.addEventListener("mouseenter", (ev) => {
      const name =
        (user && (user.name || user.emp || user.employee_id)) || "Unknown";
      showBadgeTooltip(name, ev.pageX, ev.pageY);
    });
    el.addEventListener("mousemove", (ev) =>
      moveBadgeTooltip(ev.pageX, ev.pageY)
    );
    el.addEventListener("mouseleave", hideBadgeTooltip);

    return el;
  }

  function makeAvatarChipWithRole(
    uid,
    usersMap,
    roleLetter,
    size = 44,
    currentUserId
  ) {
    const u = usersMap[uid];
    const container = document.createElement("div");
    container.style.display = "inline-flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;
    container.style.position = "relative";
    container.style.boxSizing = "border-box";
    container.style.userSelect = "none";

    const avWrap = document.createElement("div");
    avWrap.style.position = "relative";
    avWrap.style.lineHeight = "0";
    avWrap.style.display = "inline-block";

    const avatar = makeAvatarElement(u || { name: uid }, size);
    avatar.style.pointerEvents = "auto";
    avatar.style.border = "2px solid transparent";
    avatar.style.boxSizing = "border-box";

    if (currentUserId && idEq(uid, currentUserId)) {
      avatar.style.boxShadow = "0 0 0 3px rgba(13,110,253,0.09)";
    }

    avatar.setAttribute("aria-label", u ? u.name || u.emp || uid : uid);
    avWrap.appendChild(avatar);

    const badge = document.createElement("div");
    badge.style.position = "absolute";
    badge.style.bottom = "-6px";
    badge.style.right = "-6px";
    badge.style.minWidth = "20px";
    badge.style.height = "20px";
    badge.style.display = "inline-flex";
    badge.style.alignItems = "center";
    badge.style.justifyContent = "center";
    badge.style.borderRadius = "999px";
    badge.style.fontSize = "11px";
    badge.style.lineHeight = "1";
    badge.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)";
    badge.style.padding = "0 6px";
    if (roleLetter === "R") {
      badge.style.background = "#0d6efd";
      badge.style.color = "#fff";
    } else if (roleLetter === "A") {
      badge.style.background = "#198754";
      badge.style.color = "#fff";
    } else if (roleLetter === "C") {
      badge.style.background = "#f59e0b";
      badge.style.color = "#000";
    } else {
      badge.style.background = "#6c757d";
      badge.style.color = "#fff";
    }
    badge.textContent = roleLetter || "";
    avWrap.appendChild(badge);

    container.appendChild(avWrap);
    return container;
  }

  function makeAvatarChipById(uid, usersMap, size = 34) {
    const u = usersMap[uid];
    if (!u) {
      const sp = document.createElement("div");
      sp.className = "small text-muted";
      sp.textContent = "—";
      return sp;
    }
    const av = makeAvatarElement(u, size);
    av.style.pointerEvents = "auto";
    return av;
  }

  /* ---------- nav and listener management (idempotent) ---------- */
  let navHandler = null;
  let mainMonthListener = null;
  let renderLock = null; // prevents parallel renders
  let attached = false; // ensures attachNavHandler called only once

  function ensureNavLink() {
    let existing = document.querySelector('.nav-link[data-view="your-work"]');
    if (existing) return existing;
    const main = document.querySelector("#main-nav");
    if (!main) return null;
    const a = document.createElement("a");
    a.className = "nav-link";
    a.href = "#";
    a.dataset.view = "your-work";
    a.innerHTML = `<i class="fa-solid fa-briefcase"></i><span class="label"> Your Work</span>`;
    main.appendChild(a);
    return a;
  }

  function attachNavHandler() {
    if (attached) return;
    attached = true;
    const link = ensureNavLink();
    if (!link) return;
    if (navHandler) link.removeEventListener("click", navHandler);
    navHandler = (e) => {
      e && e.preventDefault();
      $$("#main-nav .nav-link").forEach((n) => n.classList.remove("active"));
      link.classList.add("active");
      safeRender();
    };
    link.addEventListener("click", navHandler);
    if (link.classList.contains("active")) safeRender();
  }

  function safeRender() {
    if (renderLock) return renderLock;
    renderLock = (async () => {
      try {
        await renderYourWorkViewInner();
      } catch (err) {
        console.error("YourWork render error", err);
      } finally {
        renderLock = null;
      }
    })();
    return renderLock;
  }

  /* ---------- main view (no showLoading/hideLoading calls) ---------- */
  async function renderYourWorkViewInner() {
    const viewContainer = $("#view-container");
    if (!viewContainer) {
      console.warn("No #view-container — cannot render Your Work.");
      return;
    }

    $("#view-title") && ($("#view-title").textContent = "Your Work");
    $("#view-sub") &&
      ($("#view-sub").textContent = "Tasks assigned to you (R/A/C/I)");

    viewContainer.innerHTML = "";

    // root card
    const root = document.createElement("div");
    root.className = "card p-3";

    // top controls
    const top = document.createElement("div");
    top.className = "d-flex gap-2 align-items-center mb-3 flex-wrap";

    const empWrap = document.createElement("div");
    empWrap.id = "yw-emp-area";
    empWrap.style.minWidth = "220px";

    const monthWrap = document.createElement("div");
    monthWrap.className = "d-flex align-items-center gap-2";
    monthWrap.innerHTML = `<label class="small text-muted mb-0">Month</label>
      <input id="yw-month-display" class="form-control form-control-sm" style="width:180px" disabled />`;

    const searchWrap = document.createElement("div");
    searchWrap.style.flex = "1";
    searchWrap.innerHTML = `<input id="yw-search" class="form-control form-control-sm" placeholder="Search tasks, wing, subwing..." />`;

    top.appendChild(empWrap);
    top.appendChild(monthWrap);
    top.appendChild(searchWrap);

    const meta = document.createElement("div");
    meta.className = "d-flex justify-content-between align-items-center mb-2";
    const countEl = document.createElement("div");
    countEl.id = "yw-count";
    countEl.className = "small text-muted";
    meta.appendChild(countEl);

    const listRoot = document.createElement("div");
    listRoot.id = "yw-list";
    listRoot.className = "yw-list";

    // minimal styles for visual separation
    const style = document.createElement("style");
    style.textContent = `
      .yw-list .yw-item {
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0 6px 18px rgba(12, 34, 56, 0.06);
        padding: 12px;
        margin-bottom: 12px;
        border: 1px solid rgba(0,0,0,0.04);
      }
      .yw-list .yw-item .row-title { font-size: 1rem; margin-bottom: 4px; }
      .yw-list .yw-item .row-sub { color: #6c757d; font-size: 0.85rem; }
      .yw-list .yw-item .roles-badges .badge { font-weight:600; }
      .yw-list .yw-item .task-meta { color: #6c757d; font-size: 0.9rem; }
      .yw-list .yw-item .detail-table { background: #fff; }
      @media (max-width: 720px) {
        .yw-list .yw-item { padding: 10px; }
      }
    `;

    root.appendChild(style);
    root.appendChild(top);
    root.appendChild(meta);
    root.appendChild(listRoot);
    viewContainer.appendChild(root);

    // state
    let users = [];
    let usersMap = {};
    let monthData = { tasks: [] };
    let empId = localStorage.getItem("employee_id") || "";
    let currentUser = null;
    let currentUserId = null;

    const searchInput = $("#yw-search");
    const monthDisplay = $("#yw-month-display");

    function syncMonthDisplay() {
      const m = getCurrentMonthFromApp() || "";
      monthDisplay.value = formatMonthHuman(m);
    }

    function renderEmployeeArea() {
      empWrap.innerHTML = "";
      if (!empId) {
        const el = document.createElement("div");
        el.className = "d-flex gap-2";
        el.innerHTML = `<input id="yw-emp-input" class="form-control form-control-sm" placeholder="Set your Employee ID" style="min-width:160px" />
          <button id="yw-emp-save" class="btn btn-sm btn-primary">Save</button>`;
        empWrap.appendChild(el);
        $("#yw-emp-save").addEventListener("click", async () => {
          const v = ($("#yw-emp-input").value || "").trim();
          if (!v) return showToast && showToast("info", "Enter employee id");
          localStorage.setItem("employee_id", v);
          empId = v;
          await safeRender();
        });
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "d-flex gap-2 align-items-center";
      wrapper.innerHTML = `<div id="yw-emp-badge" style="display:flex;align-items:center;gap:10px"></div>
        <button id="yw-emp-change" class="btn btn-sm btn-outline-secondary ms-2">Change</button>`;
      empWrap.appendChild(wrapper);

      $("#yw-emp-change").addEventListener("click", () => {
        localStorage.removeItem("employee_id");
        empId = "";
        currentUser = null;
        currentUserId = null;
        safeRender();
      });

      const badgeArea = $("#yw-emp-badge");
      badgeArea.innerHTML = "";
      if (currentUser) {
        const av = makeAvatarElement(currentUser, 44);
        badgeArea.appendChild(av);
        const info = document.createElement("div");
        info.innerHTML = `<div class="fw-semibold">${esc(
          currentUser.name || `Employee ${empId}`
        )}</div>
           <div class="small text-muted">${esc(
             currentUser.emp || currentUser.employee_id || empId
           )}</div>`;
        badgeArea.appendChild(info);
      } else {
        const fake = document.createElement("div");
        fake.style.display = "flex";
        fake.style.gap = "10px";
        const av = document.createElement("div");
        av.style.width = "44px";
        av.style.height = "44px";
        av.style.borderRadius = "50%";
        av.style.display = "inline-flex";
        av.style.alignItems = "center";
        av.style.justifyContent = "center";
        av.style.fontWeight = "600";
        av.textContent = initials(empId || "U");
        av.style.background = colorFromString(empId || String(Math.random()));
        fake.appendChild(av);
        const info = document.createElement("div");
        info.innerHTML = `<div class="fw-semibold">Employee ${esc(
          empId
        )}</div><div class="small text-muted">${esc(empId)}</div>`;
        fake.appendChild(info);
        badgeArea.appendChild(fake);
      }
    }

    function buildUsersMap(list) {
      usersMap = {};
      (list || []).forEach((u) => (usersMap[u.id] = u));
    }

    function tasksForUser(allTasks) {
      if (!currentUserId) return [];
      return (allTasks || []).filter((t) =>
        ["responsible", "accountable", "consulted", "informed"].some((r) =>
          (t[r] || []).some((id) => idEq(id, currentUserId))
        )
      );
    }

    function matchesSearch(t) {
      const q = (searchInput.value || "").trim().toLowerCase();
      if (!q) return true;
      return (
        (t.title || "").toLowerCase().includes(q) ||
        (t.wing || "").toLowerCase().includes(q) ||
        (t.subwing || "").toLowerCase().includes(q) ||
        (t.deadline || "").toLowerCase().includes(q)
      );
    }

    function renderList(tasks) {
      listRoot.innerHTML = "";
      const frag = document.createDocumentFragment();
      const sorted = (tasks || []).slice().sort((a, b) => {
        const da = a.deadline || "";
        const db = b.deadline || "";
        if (da && db) return da.localeCompare(db);
        if (da && !db) return -1;
        if (!da && db) return 1;
        return (a.title || "").localeCompare(b.title || "");
      });

      sorted.forEach((t) => {
        const item = document.createElement("div");
        item.className = "yw-item";

        const topRow = document.createElement("div");
        topRow.style.display = "grid";
        topRow.style.gridTemplateColumns = "1fr 140px 140px 90px";
        topRow.style.alignItems = "center";
        topRow.style.columnGap = "12px";

        const col1 = document.createElement("div");
        col1.innerHTML = `<div class="row-title">${esc(t.title)}</div>
                          <div class="row-sub">${esc(t.wing || "")} › ${esc(
          t.subwing || ""
        )}</div>`;

        const col2 = document.createElement("div");
        col2.className = "task-meta";
        col2.textContent = t.deadline || "";

        const col3 = document.createElement("div");
        col3.className = "roles-badges";
        col3.style.display = "flex";
        col3.style.gap = "8px";

        if ((t.responsible || []).some((id) => idEq(id, currentUserId))) {
          const b = document.createElement("span");
          b.className = "badge bg-primary";
          b.textContent = "R";
          col3.appendChild(b);
        }
        if ((t.accountable || []).some((id) => idEq(id, currentUserId))) {
          const b = document.createElement("span");
          b.className = "badge bg-success";
          b.textContent = "A";
          col3.appendChild(b);
        }
        if ((t.consulted || []).some((id) => idEq(id, currentUserId))) {
          const b = document.createElement("span");
          b.className = "badge bg-warning text-dark";
          b.textContent = "C";
          col3.appendChild(b);
        }
        if ((t.informed || []).some((id) => idEq(id, currentUserId))) {
          const b = document.createElement("span");
          b.className = "badge bg-secondary";
          b.textContent = "I";
          col3.appendChild(b);
        }
        if (!col3.childElementCount) {
          const dash = document.createElement("div");
          dash.className = "small text-muted";
          dash.textContent = "—";
          col3.appendChild(dash);
        }

        const col4 = document.createElement("div");
        col4.style.textAlign = "right";
        const toggle = document.createElement("button");
        toggle.className = "btn btn-sm btn-outline-secondary";
        toggle.type = "button";
        toggle.textContent = "View";
        col4.appendChild(toggle);

        topRow.appendChild(col1);
        topRow.appendChild(col2);
        topRow.appendChild(col3);
        topRow.appendChild(col4);

        item.appendChild(topRow);

        // details
        const detail = document.createElement("div");
        detail.style.display = "none";
        detail.className = "mt-3 detail-table";

        const tableWrap = document.createElement("div");
        tableWrap.style.borderTop = "1px solid rgba(0,0,0,0.06)";
        tableWrap.style.padding = "12px";

        const headerRow = document.createElement("div");
        headerRow.style.display = "grid";
        headerRow.style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
        headerRow.style.gap = "8px";
        headerRow.style.paddingBottom = "8px";
        headerRow.style.alignItems = "center";
        headerRow.innerHTML = `
          <div class="small fw-semibold">Responsible</div>
          <div class="small fw-semibold">Accountable</div>
          <div class="small fw-semibold">Consulted</div>
          <div class="small fw-semibold">Informed</div>
        `;
        tableWrap.appendChild(headerRow);

        const avatarsRow = document.createElement("div");
        avatarsRow.style.display = "grid";
        avatarsRow.style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
        avatarsRow.style.gap = "8px";
        avatarsRow.style.alignItems = "start";

        const makeAvColumn = (arr, letter) => {
          const container = document.createElement("div");
          container.style.display = "flex";
          container.style.flexWrap = "wrap";
          container.style.gap = "8px";
          container.style.alignItems = "flex-start";

          if (!(arr || []).length) {
            const none = document.createElement("div");
            none.className = "small text-muted";
            none.textContent = "—";
            container.appendChild(none);
          } else {
            (arr || []).forEach((uid) => {
              const chip = makeAvatarChipWithRole(
                uid,
                usersMap,
                letter,
                44,
                currentUserId
              );
              chip.style.pointerEvents = "auto";
              container.appendChild(chip);
            });
          }
          return container;
        };

        avatarsRow.appendChild(makeAvColumn(t.responsible || [], "R"));
        avatarsRow.appendChild(makeAvColumn(t.accountable || [], "A"));
        avatarsRow.appendChild(makeAvColumn(t.consulted || [], "C"));
        avatarsRow.appendChild(makeAvColumn(t.informed || [], "I"));

        tableWrap.appendChild(avatarsRow);
        detail.appendChild(tableWrap);
        item.appendChild(detail);

        toggle.addEventListener("click", () => {
          const shown = detail.style.display !== "block";
          // close others
          $$("#yw-list .yw-item .detail-table").forEach(
            (d) => (d.style.display = "none")
          );
          $$("#yw-list .yw-item button").forEach(
            (b) => (b.textContent = "View")
          );
          detail.style.display = shown ? "block" : "none";
          toggle.textContent = shown ? "Hide" : "View";
        });

        frag.appendChild(item);
      });

      listRoot.appendChild(frag);
      countEl.textContent = `${sorted.length} task${
        sorted.length === 1 ? "" : "s"
      }`;
    }

    // LOAD: single-run load (deduped by renderLock)
    try {
      // load users once
      users = await serviceLoadUsers();
      buildUsersMap(users);

      // resolve current user if empId present
      currentUser = null;
      currentUserId = null;
      if (empId) {
        currentUser =
          users.find(
            (u) => String(u.emp || u.employee_id || "") === String(empId)
          ) ||
          users.find(
            (u) =>
              u.extra &&
              u.extra.employee_id &&
              String(u.extra.employee_id) === String(empId)
          );
        if (currentUser) currentUserId = currentUser.id;
      }

      renderEmployeeArea();
      syncMonthDisplay();

      // load month tasks (sync with main app)
      const month = getCurrentMonthFromApp() || "";
      monthData = await serviceLoadMonth(month || "");

      const tasks = tasksForUser(monthData.tasks || []).filter(matchesSearch);
      renderList(tasks);
    } catch (err) {
      console.error("Your Work load error", err);
      showToast && showToast("error", "Failed to load Your Work");
    }

    // events (idempotent attach)
    let debounce = null;
    if (searchInput) {
      if (searchInput.__yw_handler__)
        searchInput.removeEventListener("input", searchInput.__yw_handler__);
      searchInput.__yw_handler__ = () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          const tasks = tasksForUser(monthData.tasks || []).filter(
            matchesSearch
          );
          renderList(tasks);
        }, 160);
      };
      searchInput.addEventListener("input", searchInput.__yw_handler__);
    }

    // month picker watch - attach/remove safely
    const mainMonthPicker = $("#monthPicker");
    if (mainMonthPicker) {
      if (mainMonthListener)
        mainMonthPicker.removeEventListener("change", mainMonthListener);
      mainMonthListener = () => {
        syncMonthDisplay();
        const month = getCurrentMonthFromApp() || "";
        if (!month) return;
        serviceLoadMonth(month)
          .then((md) => {
            monthData = md || { tasks: [] };
            const tasks = tasksForUser(monthData.tasks || []).filter(
              matchesSearch
            );
            renderList(tasks);
          })
          .catch((e) => {
            console.error(e);
            showToast && showToast("error", "Failed to load month data");
          });
      };
      mainMonthPicker.addEventListener("change", mainMonthListener);
    }
  } // end inner render

  function buildUsersMap(list) {
    // placeholder (actual build happens inside inner function)
    return;
  }

  attachNavHandler();

  // expose a safe entry so other code can trigger the view without double-loading
  window._yourWork = window._yourWork || {};
  window._yourWork.renderYourWorkView = safeRender;
})();
