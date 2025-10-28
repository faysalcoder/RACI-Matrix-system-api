// your-work.js
// Your Work view integrated with main app month (#monthPicker)
// - uses serviceLoadUsers / serviceLoadMonth / serviceSaveTask from raci-service.js
// - uses raci-ui.js avatar + tooltip helpers
// Include this file after app.js as type="module"

import {
  serviceLoadUsers,
  serviceLoadMonth,
  serviceSaveTask,
} from "./raci-service.js";
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

  /* ---------- tiny helpers ---------- */
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

  // Format date strings to "10 Nov 2025"
  function formatDateDisplay(dateStr) {
    if (!dateStr) return "";
    const s = String(dateStr).trim();
    // Prefer YYYY-MM-DD parse
    const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    let d;
    if (ymd) {
      const y = parseInt(ymd[1], 10);
      const m = parseInt(ymd[2], 10) - 1;
      const day = parseInt(ymd[3], 10);
      d = new Date(y, m, day);
    } else {
      d = new Date(s);
      if (isNaN(d.getTime())) return s;
    }
    try {
      // Use en-GB with short month to match "10 Nov 2025"
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${String(d.getDate()).padStart(2, "0")} ${
        months[d.getMonth()] || ""
      } ${d.getFullYear()}`;
    }
  }

  /* ---------- ensure small helpers exist ---------- */
  ensureLoadingOverlay && ensureLoadingOverlay();
  ensureToastContainer && ensureToastContainer();
  ensureBadgeTooltip && ensureBadgeTooltip();

  /* ---------- avatar helpers (kept from your code) ---------- */
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

  /* ---------- render / lifecycle helpers (idempotent) ---------- */
  let navHandler = null;
  let mainMonthListener = null;
  let renderLock = null;
  let attached = false;

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

  /* ---------- status helpers ---------- */
  const STATUS_OPTIONS = [
    "Not Started",
    "In Progress",
    "Completed",
    "Blocked",
    "On Hold",
    "Overdue",
  ];
  function statusToClass(s) {
    if (!s) return "status-not-started";
    const key = String(s).toLowerCase();
    if (key.includes("progress")) return "status-in-progress";
    if (key.includes("completed") || key.includes("done"))
      return "status-completed";
    if (key.includes("overdue")) return "status-overdue";
    if (key.includes("block")) return "status-blocked";
    if (key.includes("hold")) return "status-on-hold";
    return "status-not-started";
  }
  function makeStatusBadge(status) {
    const span = document.createElement("span");
    const cls = statusToClass(status);
    span.className = `status-badge ${cls}`;
    span.textContent = status || "Not Started";
    span.title = status || "";
    span.style.padding = "6px 10px";
    span.style.borderRadius = "999px";
    span.style.fontWeight = 700;
    span.style.fontSize = "0.85rem";
    // Prevent wrapping of status text
    span.style.whiteSpace = "nowrap";
    span.style.display = "inline-block";
    span.style.maxWidth = "220px";
    span.style.overflow = "hidden";
    span.style.textOverflow = "ellipsis";

    // Inline color for Overdue if CSS doesn't include it
    if (cls === "status-overdue") {
      span.style.background = "#fff1f0";
      span.style.color = "#bf2e2e";
      span.style.border = "1px solid rgba(240,102,102,0.12)";
    }

    return span;
  }
  function makeSpinnerInline() {
    const s = document.createElement("span");
    s.className = "spinner-border spinner-border-sm";
    s.setAttribute("role", "status");
    s.setAttribute("aria-hidden", "true");
    s.style.marginLeft = "6px";
    return s;
  }

  /* ---------- deadline helpers (Overdue detection + auto-convert) ---------- */
  // Returns true if deadline (yyyy-mm-dd or other date parseable) is strictly before now.
  // For date-only deadlines we treat the deadline as 23:59:59 on the given day.
  function isDeadlinePast(deadlineStr) {
    if (!deadlineStr) return false;
    const ymd = String(deadlineStr)
      .trim()
      .match(/^(\d{4})-(\d{2})-(\d{2})$/);
    let dl;
    if (ymd) {
      const y = parseInt(ymd[1], 10);
      const m = parseInt(ymd[2], 10) - 1;
      const d = parseInt(ymd[3], 10);
      // end of day
      dl = new Date(y, m, d, 23, 59, 59, 999);
    } else {
      dl = new Date(deadlineStr);
    }
    if (isNaN(dl.getTime())) return false;
    const now = new Date();
    return now.getTime() > dl.getTime();
  }

  // If a task is In Progress and deadline has passed, convert it to Overdue:
  //  - update monthData/tasks object locally (optimistic)
  //  - persist via serviceSaveTask() (best-effort)
  // returns true if changed locally
  async function ensureOverdueStatusIfNeeded(task) {
    try {
      if (!task || !task.deadline) return false;
      const cur = String(task.status || "").trim();
      const protectedStatuses = new Set([
        "Completed",
        "On Hold",
        "Blocked",
        "Overdue",
      ]);
      if (protectedStatuses.has(cur)) return false;
      if (cur === "In Progress" && isDeadlinePast(task.deadline)) {
        const prev = task.status || "";
        task.status = "Overdue";

        // best-effort persist
        const payload = {
          id: task.id,
          month: getCurrentMonthFromApp() || "",
          wing: task.wing,
          subwing: task.subwing,
          title: task.title,
          deadline: task.deadline || "",
          status: task.status,
          responsible: [...(task.responsible || [])],
          accountable: [...(task.accountable || [])],
          consulted: [...(task.consulted || [])],
          informed: [...(task.informed || [])],
          createdAt: task.createdAt || new Date().toISOString(),
        };

        serviceSaveTask(payload)
          .then(async (res) => {
            if (res && res.ok) {
              showToast &&
                showToast("info", "Task marked Overdue (deadline passed)");
              if (res.source === "server") {
                // refresh month data if server authoritative
                try {
                  const md = await serviceLoadMonth(
                    getCurrentMonthFromApp() || ""
                  );
                  if (md) {
                    // replace tasks in local view's monthData when caller has it
                  }
                } catch (e) {}
              }
            } else if (res && res.serverError) {
              // rollback locally on server error
              task.status = prev;
              showToast &&
                showToast("error", "Failed to persist overdue status");
            }
          })
          .catch((err) => {
            console.warn("Failed to persist overdue status:", err);
            // keep optimistic local change
          });

        return true;
      }
      return false;
    } catch (err) {
      console.error("ensureOverdueStatusIfNeeded error", err);
      return false;
    }
  }

  /* ---------- main renderer ---------- */
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

    // root card + styles
    const root = document.createElement("div");
    root.className = "card p-3";

    const style = document.createElement("style");
    style.textContent = `
      .yw-top { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:12px; }
      .yw-emp { min-width:220px; display:flex; align-items:center; gap:10px; }
      .yw-search { flex:1; min-width:200px; }
      .yw-count { color: #6c757d; font-size:0.95rem; margin-bottom:8px; }
      .yw-list .yw-item { background:#fff; border-radius:10px; padding:12px; margin-bottom:12px; box-shadow:0 6px 18px rgba(12,34,56,0.06); border:1px solid rgba(0,0,0,0.04); }
      /* top grid columns: title, roles, status, deadline, actions */
      .yw-item .top-grid { display:grid; grid-template-columns: 1fr 200px 260px 140px 90px; gap:12px; align-items:center; column-gap:12px; }
      .row-title { font-weight:600; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .row-sub { color:#6c757d; font-size:0.88rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .roles-badges { display:flex; gap:8px; align-items:center; flex-wrap:wrap; min-width:0; justify-content:flex-start; }
      .roles-badges .badge { font-weight:700; padding:6px 8px; border-radius:8px; font-size:0.85rem; white-space:nowrap; }
      .status-wrapper { display:flex; align-items:center; gap:8px; white-space:nowrap; min-width:0; }
      .status-select { min-width:140px; max-width:220px; white-space:nowrap; }
      .yw-item .detail { margin-top:10px; display:none; padding-top:10px; border-top:1px solid rgba(0,0,0,0.06); }
      .yw-item .detail-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:8px; }
      .status-badge.status-in-progress { background:#E8F4FF; color:#0d6efd; border-radius:12px; padding:6px 10px; border:1px solid rgba(77,161,255,0.15); }
      .status-badge.status-completed { background:#E9F7EF; color:#2eb27e; border:1px solid rgba(46,178,126,0.12); }
      .status-badge.status-blocked { background:#FFF1F0; color:#f06666; border:1px solid rgba(240,102,102,0.12); }
      .status-badge.status-on-hold { background:#FFF6E6; color:#ffa94d; border:1px solid rgba(255,169,77,0.12); }
      .status-badge.status-not-started { background:#F5F5F5; color:#6c757d; border:1px solid rgba(108,117,125,0.06); }
      .status-badge.status-overdue { /* fallback style if user CSS supports it */ }
      /* make sure long titles won't push layout badly */
      .top-grid > div { min-width: 0; }
      @media (max-width:980px){
        .yw-item .top-grid { grid-template-columns: 1fr 1fr; }
        /* hide only the status/select (3rd) and deadline (4th) on small screens,
           keep the actions (5th) visible so the "View" button remains accessible */
        .top-grid > :nth-child(3),
        .top-grid > :nth-child(4) { display: none; }
        .top-grid > :first-child{ grid-column:1 / -1; }
      }
    `;

    // top controls
    const top = document.createElement("div");
    top.className = "yw-top";

    const empWrap = document.createElement("div");
    empWrap.className = "yw-emp";
    empWrap.id = "yw-emp-area";

    const monthWrap = document.createElement("div");
    monthWrap.style.display = "flex";
    monthWrap.style.alignItems = "center";
    monthWrap.style.gap = "8px";
    monthWrap.innerHTML = `<label class="small text-muted mb-0">Month</label><input id="yw-month-display" class="form-control form-control-sm" style="width:180px" disabled />`;

    const searchWrap = document.createElement("div");
    searchWrap.className = "yw-search";
    searchWrap.innerHTML = `<input id="yw-search" class="form-control form-control-sm" placeholder="Search tasks, wing, subwing..." />`;

    top.appendChild(empWrap);
    top.appendChild(monthWrap);
    top.appendChild(searchWrap);

    const countEl = document.createElement("div");
    countEl.className = "yw-count";
    countEl.id = "yw-count";

    const listRoot = document.createElement("div");
    listRoot.id = "yw-list";
    listRoot.className = "yw-list";

    root.appendChild(style);
    root.appendChild(top);
    root.appendChild(countEl);
    root.appendChild(listRoot);
    viewContainer.appendChild(root);

    /* ---------- state ---------- */
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
        const box = document.createElement("div");
        box.style.display = "flex";
        box.style.gap = "8px";
        box.innerHTML = `<input id="yw-emp-input" class="form-control form-control-sm" placeholder="Set your Employee ID" style="min-width:160px" />
          <button id="yw-emp-save" class="btn btn-sm btn-primary">Save</button>`;
        empWrap.appendChild(box);
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
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.gap = "10px";
      wrapper.innerHTML = `<div id="yw-emp-badge" style="display:flex;align-items:center;gap:10px"></div>
        <button id="yw-emp-change" class="btn btn-sm btn-outline-secondary">Change</button>`;
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
      const deadlineFormatted =
        (t.deadline && formatDateDisplay(t.deadline)) || "";
      return (
        (t.title || "").toLowerCase().includes(q) ||
        (t.wing || "").toLowerCase().includes(q) ||
        (t.subwing || "").toLowerCase().includes(q) ||
        (deadlineFormatted || "").toLowerCase().includes(q) ||
        (t.deadline || "").toLowerCase().includes(q)
      );
    }

    /* ---------- render list ---------- */
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

        const topGrid = document.createElement("div");
        topGrid.className = "top-grid";

        // Title column
        const cTitle = document.createElement("div");
        const titleText = esc(t.title || "");
        cTitle.innerHTML = `<div class="row-title" title="${titleText}">${titleText}</div>
                            <div class="row-sub" title="${esc(
                              t.wing || ""
                            )} › ${esc(t.subwing || "")}">${esc(
          t.wing || ""
        )} › ${esc(t.subwing || "")}</div>`;

        // Roles column (compact)
        const cRoles = document.createElement("div");
        cRoles.className = "roles-badges";
        if ((t.responsible || []).some((id) => idEq(id, currentUserId))) {
          const b = document.createElement("span");
          b.className = "badge bg-primary";
          b.textContent = "R";
          cRoles.appendChild(b);
        }
        if ((t.accountable || []).some((id) => idEq(id, currentUserId))) {
          const b = document.createElement("span");
          b.className = "badge bg-success";
          b.textContent = "A";
          cRoles.appendChild(b);
        }
        if ((t.consulted || []).some((id) => idEq(id, currentUserId))) {
          const b = document.createElement("span");
          b.className = "badge bg-warning text-dark";
          b.textContent = "C";
          cRoles.appendChild(b);
        }
        if ((t.informed || []).some((id) => idEq(id, currentUserId))) {
          const b = document.createElement("span");
          b.className = "badge bg-secondary";
          b.textContent = "I";
          cRoles.appendChild(b);
        }
        if (!cRoles.childElementCount) {
          const none = document.createElement("div");
          none.className = "small text-muted";
          none.textContent = "—";
          cRoles.appendChild(none);
        }

        // Before rendering status, check Overdue auto-convert (non-blocking)
        ensureOverdueStatusIfNeeded(t).catch((e) => {
          // non-fatal; just log
          console.warn("Overdue check failed", e);
        });

        // Status column: badge always visible. Select visible ONLY for Accountable users.
        const cStatus = document.createElement("div");
        cStatus.className = "status-wrapper";
        const badgeWrap = document.createElement("div");
        badgeWrap.appendChild(makeStatusBadge(t.status || "Not Started"));

        // Determine if current user is accountable
        const isAccountable =
          currentUserId &&
          Array.isArray(t.accountable) &&
          t.accountable.some((id) => idEq(id, currentUserId));

        // If accountable -> show select inline (clean style). Otherwise only badge.
        let select = null;
        if (isAccountable) {
          select = document.createElement("select");
          select.className = "form-select form-select-sm status-select";
          select.setAttribute("aria-label", "Change task status");
          STATUS_OPTIONS.forEach((opt) => {
            const o = document.createElement("option");
            o.value = opt;
            o.textContent = opt;
            if ((t.status || "") === opt) o.selected = true;
            select.appendChild(o);
          });
        }

        // Save state indicator (spinner)
        const spinnerWrap = document.createElement("span");
        spinnerWrap.style.display = "inline-flex";
        spinnerWrap.style.alignItems = "center";

        cStatus.appendChild(badgeWrap);
        if (select) cStatus.appendChild(select);
        cStatus.appendChild(spinnerWrap);

        // Deadline (formatted)
        const cDeadline = document.createElement("div");
        cDeadline.className = "task-meta";
        const formatted = formatDateDisplay(t.deadline || "");
        cDeadline.textContent = formatted;
        if (formatted) cDeadline.title = formatted;

        // Actions (View/Details)
        const cActions = document.createElement("div");
        cActions.style.textAlign = "right";
        const btnView = document.createElement("button");
        btnView.className = "btn btn-sm btn-outline-secondary";
        btnView.type = "button";
        btnView.textContent = "View";
        cActions.appendChild(btnView);

        topGrid.appendChild(cTitle);
        topGrid.appendChild(cRoles);
        topGrid.appendChild(cStatus);
        topGrid.appendChild(cDeadline);
        topGrid.appendChild(cActions);

        item.appendChild(topGrid);

        // details (expandable)
        const detail = document.createElement("div");
        detail.className = "detail";
        const detailGrid = document.createElement("div");
        detailGrid.className = "detail-grid";
        const makeAvColumn = (arr, letter) => {
          const box = document.createElement("div");
          box.style.display = "flex";
          box.style.flexWrap = "wrap";
          box.style.gap = "8px";
          if (!(arr || []).length) {
            const dash = document.createElement("div");
            dash.className = "small text-muted";
            dash.textContent = "—";
            box.appendChild(dash);
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
              box.appendChild(chip);
            });
          }
          return box;
        };
        detailGrid.appendChild(makeAvColumn(t.responsible || [], "R"));
        detailGrid.appendChild(makeAvColumn(t.accountable || [], "A"));
        detailGrid.appendChild(makeAvColumn(t.consulted || [], "C"));
        detailGrid.appendChild(makeAvColumn(t.informed || [], "I"));
        detail.appendChild(detailGrid);
        item.appendChild(detail);

        // view toggle
        btnView.addEventListener("click", () => {
          const show = detail.style.display !== "block";
          // close other details
          $$("#yw-list .yw-item .detail").forEach(
            (d) => (d.style.display = "none")
          );
          $$("#yw-list .yw-item button").forEach(
            (b) => (b.textContent = "View")
          );
          detail.style.display = show ? "block" : "none";
          btnView.textContent = show ? "Hide" : "View";
        });

        // Save handler for select (only exists if isAccountable)
        if (select) {
          let saving = false;
          // set disabled initial state defensively if not actually accountable
          select.disabled = !isAccountable;

          select.addEventListener("change", async () => {
            if (saving) return;
            // guard: ensure still accountable
            const stillAcc =
              currentUserId &&
              Array.isArray(t.accountable) &&
              t.accountable.some((id) => idEq(id, currentUserId));
            if (!stillAcc) {
              showToast &&
                showToast("error", "Only Accountable can update status");
              // revert selection visually:
              select.value = t.status || "Not Started";
              return;
            }

            const newStatus = select.value;
            const prevStatus = t.status || "";

            // optimistic UI
            t.status = newStatus;
            badgeWrap.innerHTML = "";
            badgeWrap.appendChild(makeStatusBadge(newStatus));

            // spinner on
            spinnerWrap.innerHTML = "";
            spinnerWrap.appendChild(makeSpinnerInline());
            select.disabled = true;
            saving = true;

            // prepare payload - keep same shape app expects
            const payload = {
              id: t.id,
              month: getCurrentMonthFromApp() || "",
              wing: t.wing,
              subwing: t.subwing,
              title: t.title,
              deadline: t.deadline || "",
              status: newStatus,
              responsible: [...(t.responsible || [])],
              accountable: [...(t.accountable || [])],
              consulted: [...(t.consulted || [])],
              informed: [...(t.informed || [])],
              createdAt: t.createdAt || new Date().toISOString(),
            };

            try {
              const res = await serviceSaveTask(payload);
              if (res && res.ok) {
                // attempt to refresh month data
                try {
                  const month = getCurrentMonthFromApp() || "";
                  monthData = (await serviceLoadMonth(month)) || monthData;
                } catch (e) {
                  console.warn("Failed to reload month after status save", e);
                }
                showToast && showToast("success", "Status updated");
                // ask main app to refresh if available
                if (
                  window._raci &&
                  typeof window._raci.reloadAll === "function"
                ) {
                  try {
                    window._raci.reloadAll();
                  } catch (e) {}
                }
              } else {
                // rollback
                t.status = prevStatus;
                badgeWrap.innerHTML = "";
                badgeWrap.appendChild(makeStatusBadge(prevStatus));
                select.value = prevStatus || "Not Started";
                showToast &&
                  showToast(
                    "error",
                    res && res.serverError
                      ? "Server error while updating status"
                      : "Failed to update status"
                  );
              }
            } catch (err) {
              // rollback
              t.status = prevStatus;
              badgeWrap.innerHTML = "";
              badgeWrap.appendChild(makeStatusBadge(prevStatus));
              select.value = prevStatus || "Not Started";
              showToast && showToast("error", "Failed to update status");
              console.error("Status save error:", err);
            } finally {
              spinnerWrap.innerHTML = "";
              saving = false;
              // re-enable select only if still accountable
              const still =
                currentUserId &&
                Array.isArray(t.accountable) &&
                t.accountable.some((id) => idEq(id, currentUserId));
              select.disabled = !still;
            }
          });
        }

        frag.appendChild(item);
      });

      listRoot.appendChild(frag);
      countEl.textContent = `${sorted.length} task${
        sorted.length === 1 ? "" : "s"
      }`;
    }

    /* ---------- loading initial data ---------- */
    try {
      users = await serviceLoadUsers();
      buildUsersMap(users);

      // resolve current user from empId
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

      const month = getCurrentMonthFromApp() || "";
      monthData = await serviceLoadMonth(month || "");
      const tasks = tasksForUser(monthData.tasks || []).filter(matchesSearch);
      renderList(tasks);
    } catch (err) {
      console.error("Your Work load error", err);
      showToast && showToast("error", "Failed to load Your Work");
    }

    /* ---------- events ---------- */
    if (searchInput) {
      let debounce = null;
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

    // monthPicker change - reload tasks for new month
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
  } // end renderYourWorkViewInner

  attachNavHandler();

  // expose safe entry for main app
  window._yourWork = window._yourWork || {};
  window._yourWork.renderYourWorkView = safeRender;
})();
