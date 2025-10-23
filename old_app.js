/* app.js — full client with:
   - load/save tasks to /api/raci.php
   - load users/wings from /api/users.php and /api/wings.php
   - profile badges with hover tooltip
   - loading overlay during API calls
   - toasts for success/error/delete/cancel
   - select-user modal filters and "view all" option
   Drop into your app (replace your old app.js).
*/

(async function () {
  /* ---------- tiny helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const uid = () => "id_" + Math.random().toString(36).slice(2, 9);
  const pad = (n) => String(n).padStart(2, "0");
  const today = new Date();
  const defaultMonth = () =>
    `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;

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
      .map((s) => s[0] || "")
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

  /* ---------- small UI: loading overlay & toast container & tooltip ---------- */
  // Create loading overlay
  function ensureLoadingOverlay() {
    if ($("#raci-loading-overlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "raci-loading-overlay";
    overlay.style.position = "fixed";
    overlay.style.left = 0;
    overlay.style.top = 0;
    overlay.style.right = 0;
    overlay.style.bottom = 0;
    overlay.style.background = "rgba(0,0,0,0.25)";
    overlay.style.zIndex = 9999;
    overlay.style.display = "none";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.innerHTML = `<div style="background:rgba(255,255,255,0.95);padding:20px;border-radius:8px;display:flex;align-items:center;gap:12px;">
      <div class="spinner-border" role="status" aria-hidden="true"></div>
      <div id="raci-loading-text">Loading...</div>
    </div>`;
    document.body.appendChild(overlay);
  }
  function showLoading(text = "Loading...") {
    ensureLoadingOverlay();
    $("#raci-loading-text").textContent = text;
    $("#raci-loading-overlay").style.display = "flex";
  }
  function hideLoading() {
    const el = $("#raci-loading-overlay");
    if (el) el.style.display = "none";
  }

  // Toast system (bottom-right)
  function ensureToastContainer() {
    if ($("#raci-toast-container")) return;
    const cont = document.createElement("div");
    cont.id = "raci-toast-container";
    cont.style.position = "fixed";
    cont.style.right = "16px";
    cont.style.bottom = "16px";
    cont.style.zIndex = 10001;
    cont.style.display = "flex";
    cont.style.flexDirection = "column";
    cont.style.gap = "10px";
    document.body.appendChild(cont);
  }
  function showToast(type = "info", text = "", ttl = 4000) {
    ensureToastContainer();
    const id = "toast_" + Math.random().toString(36).slice(2, 9);
    const item = document.createElement("div");
    item.id = id;
    item.style.minWidth = "220px";
    item.style.maxWidth = "360px";
    item.style.padding = "10px 12px";
    item.style.borderRadius = "8px";
    item.style.boxShadow = "0 4px 10px rgba(0,0,0,0.12)";
    item.style.color = "#fff";
    item.style.fontSize = "14px";
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.justifyContent = "space-between";
    item.style.gap = "10px";
    const colorMap = {
      success: "#198754",
      error: "#dc3545",
      info: "#0d6efd",
      warning: "#f59e0b",
    };
    item.style.background = colorMap[type] || colorMap.info;
    item.innerHTML = `<div style="flex:1">${esc(
      text
    )}</div><div style="margin-left:8px;cursor:pointer;font-weight:700">✕</div>`;
    const container = $("#raci-toast-container");
    container.appendChild(item);
    // close on click X
    item.querySelector("div:last-child").addEventListener("click", () => {
      if (item.parentNode) item.parentNode.removeChild(item);
    });
    // auto dismiss
    setTimeout(() => {
      if (item.parentNode) item.parentNode.removeChild(item);
    }, ttl);
  }

  // Tooltip for badges (follows cursor)
  function ensureBadgeTooltip() {
    if ($("#raci-badge-tooltip")) return;
    const tip = document.createElement("div");
    tip.id = "raci-badge-tooltip";
    tip.style.position = "fixed";
    tip.style.pointerEvents = "none";
    tip.style.padding = "6px 8px";
    tip.style.borderRadius = "6px";
    tip.style.background = "rgba(0,0,0,0.85)";
    tip.style.color = "#fff";
    tip.style.fontSize = "13px";
    tip.style.zIndex = 10000;
    tip.style.display = "none";
    document.body.appendChild(tip);
  }
  function showBadgeTooltip(text, pageX, pageY) {
    ensureBadgeTooltip();
    const tip = $("#raci-badge-tooltip");
    tip.textContent = text;
    tip.style.display = "block";
    // position above cursor
    const offsetY = 18;
    let left = pageX + 8;
    let top = pageY - offsetY - 8;
    // if near right edge, keep inside
    const rect = tip.getBoundingClientRect();
    if (left + rect.width > window.innerWidth - 8)
      left = window.innerWidth - rect.width - 8;
    if (top < 8) top = pageY + offsetY;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }
  function moveBadgeTooltip(pageX, pageY) {
    const tip = $("#raci-badge-tooltip");
    if (!tip || tip.style.display === "none") return;
    const offsetY = 18;
    let left = pageX + 8;
    let top = pageY - offsetY - 8;
    const rect = tip.getBoundingClientRect();
    if (left + rect.width > window.innerWidth - 8)
      left = window.innerWidth - rect.width - 8;
    if (top < 8) top = pageY + offsetY;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }
  function hideBadgeTooltip() {
    const tip = $("#raci-badge-tooltip");
    if (tip) tip.style.display = "none";
  }

  /* ---------- API helpers ---------- */
  const API_ROOT = "/raci/api";
  async function safeFetchText(url, opts = {}) {
    try {
      const res = await fetch(url, opts);
      const text = await res.text();
      return { ok: true, status: res.status, text };
    } catch (err) {
      return { ok: false, status: 0, error: String(err) };
    }
  }
  async function safeFetchJSON(url, opts = {}) {
    const r = await safeFetchText(url, opts);
    if (!r.ok) return r;
    try {
      const json = JSON.parse(r.text);
      return { ok: true, status: r.status, data: json, raw: r.text };
    } catch (e) {
      return {
        ok: false,
        status: r.status,
        raw: r.text,
        error: "Invalid JSON from server",
      };
    }
  }
  async function apiGet(path) {
    showLoading("Loading...");
    const r = await safeFetchJSON(API_ROOT + path, {
      credentials: "same-origin",
    });
    hideLoading();
    return r;
  }
  async function apiPost(path, body) {
    showLoading("Saving...");
    const r = await safeFetchJSON(API_ROOT + path, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    hideLoading();
    return r;
  }
  async function apiDelete(path) {
    showLoading("Deleting...");
    const r = await safeFetchJSON(API_ROOT + path, {
      method: "DELETE",
      credentials: "same-origin",
    });
    hideLoading();
    return r;
  }

  /* ---------- service (server-backed, fallback) ---------- */
  const localPrefix = "raci_";
  function localLoadMonth(m) {
    try {
      return JSON.parse(
        localStorage.getItem(localPrefix + m) || '{"tasks":[]}'
      );
    } catch (e) {
      return { tasks: [] };
    }
  }
  function localSaveMonth(m, obj) {
    localStorage.setItem(localPrefix + m, JSON.stringify(obj || { tasks: [] }));
  }

  async function serviceLoadUsers() {
    const r = await apiGet("/users.php");
    if (r.ok && r.data) {
      // normalize many shapes
      const raw = Array.isArray(r.data)
        ? r.data
        : Array.isArray(r.data.data)
        ? r.data.data
        : Array.isArray(r.data.users)
        ? r.data.users
        : [];
      return raw.map((u) => ({
        ...u,
        emp: u.emp || u.employee_id || "",
        profile_img: u.profile_img || u.profile || u.profile_img || "",
      }));
    }
    console.warn("serviceLoadUsers failed:", r.error || r.raw);
    return [];
  }
  async function serviceLoadWings() {
    const r = await apiGet("/wings.php");
    if (r.ok && r.data) {
      const raw = Array.isArray(r.data)
        ? r.data
        : Array.isArray(r.data.data)
        ? r.data.data
        : Array.isArray(r.data.wings)
        ? r.data.wings
        : [];
      return raw.map((w) => ({
        id: w.id || w.dept_id || String(Math.random()).slice(2),
        name: w.name || w.dept_name || w.dept || "",
        subwings: Array.isArray(w.subwings)
          ? w.subwings.map((s) => ({
              id: s.id || s.subwing_id || String(Math.random()).slice(2),
              name: s.name || s.subwing_name || s.subwing_name || s.name,
            }))
          : Array.isArray(w.sub_wings)
          ? w.sub_wings.map((s) => ({
              id: s.subwing_id || String(Math.random()).slice(2),
              name: s.subwing_name || s.name || "",
            }))
          : [],
      }));
    }
    console.warn("serviceLoadWings failed:", r.error || r.raw);
    return [];
  }
  async function serviceLoadMonth(m) {
    if (!m) return { tasks: [] };
    const r = await apiGet(`/raci.php?month=${encodeURIComponent(m)}`);
    if (r.ok && r.data) {
      const d = r.data;
      if (d.data && Array.isArray(d.data.tasks)) return d.data;
      if (d.tasks && Array.isArray(d.tasks)) return d;
      if (Array.isArray(d)) return { tasks: d };
      if (Array.isArray(d.data)) return { tasks: d.data };
      return d || { tasks: [] };
    }
    console.warn(
      "serviceLoadMonth failed — falling back to local:",
      r.error || r.raw
    );
    return localLoadMonth(m);
  }

  async function serviceSaveTask(taskObj) {
    // prevent sending client-generated id for new tasks
    const payload = { ...taskObj };
    if (payload.id && String(payload.id).startsWith("id_")) delete payload.id;
    if (!payload.month) payload.month = new Date().toISOString().slice(0, 7);

    const r = await apiPost("/raci.php", payload);
    if (r.ok) {
      try {
        const fresh = await serviceLoadMonth(payload.month);
        localSaveMonth(payload.month, fresh);
      } catch (e) {}
      showToast("success", "Task saved successfully");
      return { ok: true, source: "server", resp: r.data };
    }
    // error
    if (r.raw && typeof r.raw === "string") {
      const fkRegex =
        /Integrity constraint violation|Cannot add or update a child row|foreign key constraint/i;
      const phpFatalRegex = /Fatal error|Uncaught PDOException/i;
      if (fkRegex.test(r.raw) || phpFatalRegex.test(r.raw)) {
        return {
          ok: false,
          serverError: true,
          message: "Server-side DB error",
          raw: r.raw,
        };
      }
      return {
        ok: false,
        serverError: true,
        message: "Server returned non-JSON",
        raw: r.raw,
      };
    }
    // fallback to local
    try {
      const m = payload.month;
      const local = localLoadMonth(m);
      local.tasks = local.tasks || [];
      const idx = local.tasks.findIndex((t) => idEq(t.id, taskObj.id));
      if (idx >= 0) local.tasks[idx] = taskObj;
      else local.tasks.push(taskObj);
      localSaveMonth(m, local);
      showToast("info", "Saved locally (server unreachable)");
      return { ok: true, source: "local" };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  async function serviceDeleteTask(taskId, month) {
    const r = await apiDelete(`/raci.php?id=${encodeURIComponent(taskId)}`);
    if (r.ok) {
      try {
        await serviceLoadMonth(month || new Date().toISOString().slice(0, 7));
      } catch (e) {}
      showToast("success", "Task deleted");
      return { ok: true, source: "server", resp: r.data };
    }
    // remove locally
    try {
      const local = localLoadMonth(
        month || new Date().toISOString().slice(0, 7)
      );
      local.tasks = (local.tasks || []).filter((t) => !idEq(t.id, taskId));
      localSaveMonth(month || new Date().toISOString().slice(0, 7), local);
      showToast("info", "Deleted locally (server unreachable)");
      return { ok: true, source: "local" };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  /* ---------- state ---------- */
  let users = [];
  let wings = [];
  let currentMonth = defaultMonth();
  let monthData = { tasks: [] };
  let tempRaci = {
    responsible: [],
    accountable: [],
    consulted: [],
    informed: [],
  };
  let tempPickRole = null;

  /* ---------- UI refs ---------- */
  const navLinks = $$(".nav-link[data-view]");
  const viewContainer = $("#view-container");
  const monthPicker = $("#monthPicker");
  const sidebar = $("#sidebar");
  const btnToggle = $("#btn-toggle-sidebar");
  const modalTaskEl = $("#modal-task");
  const modalSelectEl = $("#modal-select-user");
  const modalAddUserEl = $("#modal-add-user");
  const modalTask =
    window.bootstrap && bootstrap.Modal && modalTaskEl
      ? new bootstrap.Modal(modalTaskEl)
      : null;
  const modalSelect =
    window.bootstrap && bootstrap.Modal && modalSelectEl
      ? new bootstrap.Modal(modalSelectEl)
      : null;
  const modalAddUser =
    window.bootstrap && bootstrap.Modal && modalAddUserEl
      ? new bootstrap.Modal(modalAddUserEl)
      : null;

  /* ---------- avatar + tooltip wiring ---------- */
  function makeAvatarElement(user, size = 36) {
    const el = document.createElement("div");
    el.className = "avatar small";
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.borderRadius = "50%";
    el.style.overflow = "hidden";
    el.style.display = "inline-flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.cursor = "pointer";
    el.style.flex = "0 0 auto";
    if (user && user.profile_img) {
      const img = document.createElement("img");
      img.src = user.profile_img;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.onerror = () => {
        if (img.parentNode) img.parentNode.removeChild(img);
        el.textContent = initials(user.name);
        el.style.background = colorFromString(user.name);
      };
      el.appendChild(img);
    } else {
      el.textContent = initials(user ? user.name : "");
      el.style.background = colorFromString(
        user ? user.name : String(Math.random())
      );
    }
    // tooltip show/hide
    el.addEventListener("mouseenter", (ev) => {
      if (user && user.name) showBadgeTooltip(user.name, ev.pageX, ev.pageY);
    });
    el.addEventListener("mousemove", (ev) =>
      moveBadgeTooltip(ev.pageX, ev.pageY)
    );
    el.addEventListener("mouseleave", hideBadgeTooltip);
    el.title = user ? user.name : "";
    return el;
  }
  function makeAvatarChip(userId) {
    const u = users.find((x) => idEq(x.id, userId));
    if (!u) {
      const sp = document.createElement("div");
      sp.className = "small text-muted";
      sp.textContent = "—";
      return sp;
    }
    const el = makeAvatarElement(u, 35);
    el.addEventListener("click", () => {
      const nav = document.querySelector('.nav-link[data-view="users"]');
      if (nav) nav.click();
      setTimeout(() => {
        renderView("users").then(() => showUserDetail(u));
      }, 120);
    });
    return el;
  }
  function fillRoleContainer(container, ids) {
    container.innerHTML = "";
    (ids || []).forEach((id) => container.appendChild(makeAvatarChip(id)));
  }

  /* ---------- sidebar toggle ---------- */
  function setupSidebarToggle() {
    btnToggle?.addEventListener("click", () => {
      if (window.innerWidth <= 980) sidebar.classList.toggle("mobile-open");
      else sidebar.classList.toggle("collapsed");
    });
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 980 &&
        sidebar.classList.contains("mobile-open")
      ) {
        if (
          !e.target.closest("#sidebar") &&
          !e.target.closest("#btn-toggle-sidebar")
        )
          sidebar.classList.remove("mobile-open");
      }
    });
    $$("#main-nav .nav-link").forEach((a) =>
      a.addEventListener("click", () => {
        if (window.innerWidth <= 980) sidebar.classList.remove("mobile-open");
      })
    );
  }

  /* ---------- init ---------- */
  async function init() {
    ensureLoadingOverlay();
    ensureToastContainer();
    ensureBadgeTooltip();

    navLinks.forEach((a) => a.addEventListener("click", navClick));
    if (monthPicker) monthPicker.value = currentMonth;
    monthPicker?.addEventListener("change", onMonthChange);

    ensureSelectModalControls();
    $("#select-search")?.addEventListener("input", renderSelectUserList);
    $("#select-view-all")?.addEventListener("change", renderSelectUserList);
    $("#select-filter-wing")?.addEventListener("change", () => {
      populateSubFilter("#select-filter-wing", "#select-filter-subwing");
      renderSelectUserList();
    });
    $("#select-filter-subwing")?.addEventListener(
      "change",
      renderSelectUserList
    );
    $("#select-user-save")?.addEventListener("click", () => {
      applySelectModal();
      modalSelect && modalSelect.hide && modalSelect.hide();
      refreshRaciPreview();
      showToast("success", "Selection applied");
    });
    $("#select-user-clear")?.addEventListener("click", () => {
      if (!tempPickRole) return;
      tempRaci[tempPickRole] = [];
      renderSelectUserList();
      refreshRaciPreview();
      showToast("info", "Cleared selection");
    });

    // detect when modal-task hides to show cancel toast if it wasn't saved
    let modalTaskSaved = false;
    document.addEventListener("submit", (ev) => {
      if (ev.target && ev.target.id === "form-task") modalTaskSaved = true;
    });
    if (modalTaskEl) {
      modalTaskEl.addEventListener("show.bs.modal", () => {
        modalTaskSaved = false;
      });
      modalTaskEl.addEventListener("hidden.bs.modal", () => {
        if (!modalTaskSaved) showToast("warning", "Task creation cancelled");
      });
    }

    // add user submit (optional)
    $("#form-add-user")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = ($("#user-name").value || "").trim();
      const emp = ($("#user-emp").value || "").trim();
      if (!name || !emp) return alert("Name and Employee ID required.");
      const payload = {
        name,
        emp,
        email: $("#user-email") ? $("#user-email").value : "",
        phone: $("#user-phone") ? $("#user-phone").value : "",
      };
      const r = await apiPost("/users.php", payload);
      if (r.ok) {
        await reloadAll();
        modalAddUser && modalAddUser.hide && modalAddUser.hide();
        showToast("success", "User added");
      } else {
        showToast("error", "Add user failed");
        console.error(r);
      }
    });

    document.addEventListener("click", async (ev) => {
      const t = ev.target.closest && ev.target.closest("[data-action]");
      if (t) {
        const action = t.dataset.action;
        if (action === "edit-task") openTaskModal(t.dataset.id);
        if (action === "delete-task") {
          if (!confirm("Delete task?")) {
            showToast("info", "Delete cancelled");
            return;
          }
          const id = t.dataset.id;
          const r = await serviceDeleteTask(id, currentMonth);
          if (r.ok) {
            monthData = await serviceLoadMonth(currentMonth);
            await renderView("manage");
          } else {
            showToast("error", "Delete failed");
            console.error(r);
          }
        }
      }
      if (ev.target.closest && ev.target.closest("#btn-add-user"))
        modalAddUser && modalAddUser.show && modalAddUser.show();
    });

    await reloadAll();
    setupSidebarToggle();
    await renderView("manage");
  }

  /* ---------- reload helpers ---------- */
  async function reloadAll() {
    showLoading("Loading users & wings...");
    users = await serviceLoadUsers();
    wings = await serviceLoadWings();
    monthData = await serviceLoadMonth(currentMonth);
    hideLoading();
    updateStatsUI();
    populateSelect(
      "#select-filter-wing",
      (wings || []).map((w) => w.name),
      "(all wings)"
    );
    populateSubFilter("#select-filter-wing", "#select-filter-subwing");
  }

  function updateStatsUI() {
    $("#stat-tasks") &&
      ($("#stat-tasks").textContent = (monthData.tasks || []).length);
    $("#stat-wings") && ($("#stat-wings").textContent = (wings || []).length);
    $("#stat-users") && ($("#stat-users").textContent = (users || []).length);
    if (currentMonth) {
      const [y, m] = currentMonth.split("-");
      $("#stat-month") &&
        ($("#stat-month").textContent = new Date(y, m - 1).toLocaleString(
          "en-US",
          { month: "long", year: "numeric" }
        ));
    }
  }

  /* ---------- navigation ---------- */
  async function navClick(e) {
    e.preventDefault();
    navLinks.forEach((n) => n.classList.remove("active"));
    e.currentTarget.classList.add("active");
    const view = e.currentTarget.getAttribute("data-view");
    await renderView(view);
  }
  async function onMonthChange() {
    currentMonth = monthPicker.value || defaultMonth();
    monthData = await serviceLoadMonth(currentMonth);
    await renderView(
      (
        document.querySelector(".nav-link.active") || {
          dataset: { view: "manage" },
        }
      ).dataset.view
    );
  }

  /* ---------- render views ---------- */
  async function renderView(view) {
    document.body.dataset.view = view;
    $("#view-title") &&
      ($("#view-title").textContent =
        {
          dashboard: "Dashboard",
          manage: "Manage RACI",
          wings: "Wings",
          users: "Users",
          reports: "Reports",
          about: "What is RACI?",
        }[view] || "Dashboard");
    $("#view-sub") &&
      ($("#view-sub").textContent =
        {
          dashboard: "RACI Matrix (read-only)",
          manage: "Create / Edit tasks and RACI assignments",
          wings: "Manage Wings & Subwings",
          users: "Users & User Panel",
          reports: "Generate month reports",
          about: "Learn about the RACI responsibility matrix",
        }[view] || "");
    viewContainer.innerHTML = "";
    await reloadAll();
    ensureSelectModalControls();
    if (view === "dashboard") renderDashboard();
    else if (view === "manage") renderManage();
    else if (view === "wings") renderWings();
    else if (view === "users") renderUsers();
    else if (view === "reports") renderReports();
    else renderDashboard();
  }

  /* ---------- dashboard ---------- */
  function renderDashboard() {
    const tpl = document.getElementById("dashboard-tpl");
    if (!tpl) return;
    viewContainer.appendChild(tpl.content.cloneNode(true));
    populateSelect(
      "#filterWing",
      (wings || []).map((w) => w.name),
      "All Wings"
    );
    populateSubFilter("#filterWing", "#filterSubwing");
    $("#filterWing")?.addEventListener("change", () =>
      populateSubFilter("#filterWing", "#filterSubwing")
    );
    $("#filterSubwing")?.addEventListener("change", renderDashboardArea);
    $("#clearFilters")?.addEventListener("click", () => {
      $("#filterWing").value = "";
      $("#filterSubwing").value = "";
      renderDashboardArea();
    });
    $("#dashboard-export")?.addEventListener("click", () =>
      exportCSV(currentMonth)
    );
    renderDashboardArea();
  }
  function renderDashboardArea() {
    const area = $("#dashboardArea");
    if (!area) return;
    area.innerHTML = "";
    const wingFilter = $("#filterWing") ? $("#filterWing").value : "";
    const subFilter = $("#filterSubwing") ? $("#filterSubwing").value : "";
    const tasks = (monthData.tasks || []).filter((t) => {
      if (wingFilter && t.wing !== wingFilter) return false;
      if (subFilter && t.subwing !== subFilter) return false;
      return true;
    });
    const grouped = {};
    tasks.forEach((t) => {
      if (!grouped[t.wing]) grouped[t.wing] = {};
      if (!grouped[t.wing][t.subwing]) grouped[t.wing][t.subwing] = [];
      grouped[t.wing][t.subwing].push(t);
    });
    if (Object.keys(grouped).length === 0) {
      area.innerHTML = `<div class="card p-4 text-center text-muted">No tasks for ${currentMonth}. Use Manage RACI to add tasks.</div>`;
      return;
    }
    Object.keys(grouped)
      .sort()
      .forEach((wing) => {
        Object.keys(grouped[wing])
          .sort()
          .forEach((sub) => {
            const phase = document
              .getElementById("phase-tpl")
              .content.cloneNode(true);
            phase.querySelector(".phase-name").textContent = `${wing} › ${sub}`;
            phase.querySelector(".phase-meta").textContent = `${
              (grouped[wing][sub] || []).length
            } tasks`;
            phase.querySelector(".phase-accent").style.background =
              colorFromString(sub || wing);
            const rowsRoot = phase.querySelector(".matrix-rows");
            grouped[wing][sub]
              .sort((a, b) =>
                (a.deadline || "").localeCompare(b.deadline || "")
              )
              .forEach((task) => {
                const row = document
                  .getElementById("row-tpl")
                  .content.cloneNode(true);
                row.querySelector(".row-title").textContent = task.title;
                row.querySelector(".row-meta").textContent = task.status || "";
                row.querySelector(".deadline-col").textContent =
                  task.deadline || "";
                fillRoleContainer(
                  row.querySelector(".role-r"),
                  task.responsible
                );
                fillRoleContainer(
                  row.querySelector(".role-a"),
                  task.accountable
                );
                fillRoleContainer(row.querySelector(".role-c"), task.consulted);
                fillRoleContainer(row.querySelector(".role-i"), task.informed);
                rowsRoot.appendChild(row);
              });
            area.appendChild(phase);
          });
      });
  }

  /* ---------- manage ---------- */
  function renderManage() {
    const tpl = document.getElementById("manage-tpl");
    if (!tpl) return;
    viewContainer.appendChild(tpl.content.cloneNode(true));
    populateSelect(
      "#manage-filter-wing",
      (wings || []).map((w) => w.name),
      "All Wings"
    );
    populateSubFilter("#manage-filter-wing", "#manage-filter-subwing");
    $("#manage-filter-wing")?.addEventListener("change", () =>
      populateSubFilter("#manage-filter-wing", "#manage-filter-subwing")
    );
    $("#manage-filter-subwing")?.addEventListener("change", renderManageArea);
    $("#manage-clear-filters")?.addEventListener("click", () => {
      $("#manage-filter-wing").value = "";
      $("#manage-filter-subwing").value = "";
      renderManageArea();
    });
    $("#btn-new-task")?.addEventListener("click", () => openTaskModal());
    $("#btn-export-json")?.addEventListener("click", () => {
      const payload = { users, wings, monthKey: currentMonth, monthData };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `raci_export_${currentMonth}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    $("#btn-import")?.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const fr = new FileReader();
        fr.onload = async () => {
          try {
            const data = JSON.parse(fr.result);
            if (Array.isArray(data.users)) {
              for (const u of data.users)
                await apiPost("/users.php", {
                  name: u.name,
                  emp: u.emp || u.employee_id || "",
                });
            }
            if (
              data.monthKey &&
              data.monthData &&
              Array.isArray(data.monthData.tasks)
            ) {
              for (const t of data.monthData.tasks) {
                const payload = { ...t, month: data.monthKey };
                await serviceSaveTask(payload);
              }
            }
            showToast("success", "Import complete");
            await renderView("manage");
          } catch (err) {
            console.error(err);
            showToast("error", "Invalid JSON");
          }
        };
        fr.readAsText(f);
      };
      input.click();
    });
    renderManageArea();
  }
  function renderManageArea() {
    const area = $("#manageArea");
    if (!area) return;
    area.innerHTML = "";
    const wingFilter = $("#manage-filter-wing")
      ? $("#manage-filter-wing").value
      : "";
    const subFilter = $("#manage-filter-subwing")
      ? $("#manage-filter-subwing").value
      : "";
    const tasks = (monthData.tasks || []).filter((t) => {
      if (wingFilter && t.wing !== wingFilter) return false;
      if (subFilter && t.subwing !== subFilter) return false;
      return true;
    });
    if (tasks.length === 0) {
      area.innerHTML = `<div class="card p-4 text-center text-muted">No tasks for ${currentMonth}. Add via New Task.</div>`;
      return;
    }
    const grouped = {};
    tasks.forEach((t) => {
      if (!grouped[t.wing]) grouped[t.wing] = {};
      if (!grouped[t.wing][t.subwing]) grouped[t.wing][t.subwing] = [];
      grouped[t.wing][t.subwing].push(t);
    });
    Object.keys(grouped)
      .sort()
      .forEach((wing) => {
        Object.keys(grouped[wing])
          .sort()
          .forEach((sub) => {
            const phase = document
              .getElementById("phase-tpl")
              .content.cloneNode(true);
            phase.querySelector(".phase-name").textContent = `${wing} › ${sub}`;
            phase.querySelector(".phase-meta").textContent = `${wing} • ${sub}`;
            phase.querySelector(".phase-accent").style.background =
              colorFromString(sub || wing);
            const rowsRoot = phase.querySelector(".matrix-rows");
            grouped[wing][sub]
              .sort((a, b) =>
                (a.deadline || "").localeCompare(b.deadline || "")
              )
              .forEach((task) => {
                const row = document
                  .getElementById("row-tpl")
                  .content.cloneNode(true);
                row.querySelector(".row-title").textContent = task.title;
                row.querySelector(".row-meta").textContent = task.status || "";
                row.querySelector(".deadline-col").textContent =
                  task.deadline || "";
                fillRoleContainer(
                  row.querySelector(".role-r"),
                  task.responsible
                );
                fillRoleContainer(
                  row.querySelector(".role-a"),
                  task.accountable
                );
                fillRoleContainer(row.querySelector(".role-c"), task.consulted);
                fillRoleContainer(row.querySelector(".role-i"), task.informed);
                const act = row.querySelector(".actions-col");
                if (act)
                  act.innerHTML = `<div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-sm btn-outline-secondary" data-action="edit-task" data-id="${task.id}"><i class="fa fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete-task" data-id="${task.id}"><i class="fa fa-trash"></i></button>
          </div>`;
                rowsRoot.appendChild(row);
              });
            area.appendChild(phase);
          });
      });
  }

  /* ---------- wings/users ---------- */
  function renderWings() {
    const tpl = document.getElementById("wings-tpl");
    if (!tpl) return;
    viewContainer.appendChild(tpl.content.cloneNode(true));
    renderWingsList();
  }
  function renderWingsList() {
    const list = $("#wingsList");
    const subs = $("#subwingsList");
    if (!list || !subs) return;
    list.innerHTML = "";
    subs.innerHTML = "";
    if (!wings || wings.length === 0) {
      list.innerHTML = '<div class="small text-muted">No wings yet</div>';
      return;
    }
    wings.forEach((w) => {
      const btn = document.createElement("button");
      btn.className = "list-group-item list-group-item-action";
      btn.textContent = w.name;
      btn.dataset.id = w.id;
      btn.addEventListener("click", () => {
        $$("#wingsList .list-group-item").forEach((x) =>
          x.classList.remove("active")
        );
        btn.classList.add("active");
        subs.innerHTML = "";
        if (!w.subwings || w.subwings.length === 0)
          subs.innerHTML = '<div class="small text-muted">No subwings</div>';
        else
          w.subwings.forEach((s) => {
            const sdiv = document.createElement("div");
            sdiv.className = "list-group-item";
            sdiv.textContent = s.name;
            subs.appendChild(sdiv);
          });
      });
      list.appendChild(btn);
    });
  }

  function renderUsers() {
    const tpl = document.getElementById("users-tpl");
    if (!tpl) return;
    viewContainer.appendChild(tpl.content.cloneNode(true));
    populateSelect(
      "#userFilterWing",
      (wings || []).map((w) => w.name),
      "All Wings"
    );
    $("#searchUser")?.addEventListener("input", renderUsersList);
    $("#userFilterWing")?.addEventListener("change", renderUsersList);
    renderUsersList();
  }
  function renderUsersList() {
    const list = $("#usersList");
    if (!list) return;
    list.innerHTML = "";
    const q = $("#searchUser")
      ? $("#searchUser").value.trim().toLowerCase()
      : "";
    const wingFilter = $("#userFilterWing") ? $("#userFilterWing").value : "";
    if (!users || users.length === 0) {
      list.innerHTML = '<div class="small text-muted">No users yet</div>';
      return;
    }
    users.forEach((u) => {
      if (wingFilter) {
        const inProfile = (u.wing || "") === wingFilter;
        const present = (monthData.tasks || []).some(
          (t) =>
            t.wing === wingFilter &&
            ["responsible", "accountable", "consulted", "informed"].some((r) =>
              (t[r] || []).some((i) => idEq(i, u.id))
            )
        );
        if (!inProfile && !present) return;
      }
      if (
        q &&
        !(
          (u.name || "").toLowerCase().includes(q) ||
          String(u.emp || u.employee_id || "")
            .toLowerCase()
            .includes(q)
        )
      )
        return;
      const item = document.createElement("div");
      item.className =
        "list-group-item d-flex align-items-center justify-content-between";
      const left = document.createElement("div");
      left.className = "d-flex align-items-center gap-3";
      left.appendChild(makeAvatarElement(u, 36));
      const info = document.createElement("div");
      info.innerHTML = `<div class="fw-semibold user-name clickable" data-id="${
        u.id
      }" style="cursor:pointer">${esc(
        u.name
      )}</div><div class="small text-muted">${esc(
        u.emp || u.employee_id || ""
      )} ${u.dept ? "• " + esc(u.dept) : ""} ${
        u.wing ? "• " + esc(u.wing) : ""
      }</div>`;
      left.appendChild(info);
      const right = document.createElement("div");
      right.className = "d-flex gap-2";
      right.innerHTML = `<button class="btn btn-sm btn-outline-secondary btn-view" data-id="${u.id}"><i class="fa fa-eye"></i></button>`;
      item.appendChild(left);
      item.appendChild(right);
      list.appendChild(item);
    });
    $$(".user-name.clickable").forEach((el) =>
      el.addEventListener("click", () => {
        const u = users.find((x) => idEq(x.id, el.dataset.id));
        if (u) showUserDetail(u);
      })
    );
    $$(".btn-view").forEach((b) =>
      b.addEventListener("click", () => {
        const u = users.find((x) => idEq(x.id, b.dataset.id));
        if (u) showUserDetail(u);
      })
    );
  }
  function rolesForUser(uid, t) {
    const r = [];
    if ((t.responsible || []).some((i) => idEq(i, uid))) r.push("R");
    if ((t.accountable || []).some((i) => idEq(i, uid))) r.push("A");
    if ((t.consulted || []).some((i) => idEq(i, uid))) r.push("C");
    if ((t.informed || []).some((i) => idEq(i, uid))) r.push("I");
    return r.join(", ") || "—";
  }
  function showUserDetail(user) {
    const detail = $("#userDetail");
    if (!detail) return;
    monthData = monthData || { tasks: [] };
    const tasks = (monthData.tasks || []).filter((t) =>
      ["responsible", "accountable", "consulted", "informed"].some((r) =>
        (t[r] || []).some((i) => idEq(i, user.id))
      )
    );
    detail.innerHTML = "";
    const header = document.createElement("div");
    header.className = "mb-2 d-flex align-items-center gap-2";
    header.appendChild(makeAvatarElement(user, 48));
    const htext = document.createElement("div");
    htext.innerHTML = `<strong>${esc(
      user.name
    )}</strong><div class="small text-muted">${esc(
      user.emp || user.employee_id || ""
    )}</div>`;
    header.appendChild(htext);
    detail.appendChild(header);
    if (!tasks.length) {
      const none = document.createElement("div");
      none.className = "small text-muted";
      none.textContent = `No assignments for ${currentMonth}`;
      detail.appendChild(none);
      return;
    }
    tasks.forEach((t) => {
      const card = document.createElement("div");
      card.className = "card mb-2 p-2";
      const top = document.createElement("div");
      top.className = "d-flex justify-content-between";
      top.innerHTML = `<div><div class="fw-semibold">${esc(
        t.title
      )}</div><div class="small text-muted">${esc(t.wing)} › ${esc(
        t.subwing
      )}</div></div><div class="small text-muted">${esc(
        t.deadline || ""
      )}</div>`;
      card.appendChild(top);
      const roles = document.createElement("div");
      roles.className = "small mt-1";
      roles.textContent = `Roles: ${rolesForUser(user.id, t)}`;
      card.appendChild(roles);
      detail.appendChild(card);
    });
  }

  /* ---------- reports ---------- */
  function renderReports() {
    const tpl = document.getElementById("reports-tpl");
    if (!tpl) return;
    viewContainer.appendChild(tpl.content.cloneNode(true));
    $("#reportMonth").value = currentMonth;
    $("#btn-generate-report")?.addEventListener("click", () => {
      const m = $("#reportMonth").value || currentMonth;
      generateReport(m);
    });
    $("#btn-export-report")?.addEventListener("click", () => {
      const m = $("#reportMonth").value || currentMonth;
      exportCSV(m);
    });
  }
  async function generateReport(month) {
    const data =
      month === currentMonth ? monthData : await serviceLoadMonth(month);
    const tasks = data.tasks || [];
    const tgt = $("#reportResult");
    if (!tgt) return;
    if (!tasks.length) {
      tgt.innerHTML = `<div class="small text-muted">No tasks for ${month}</div>`;
      return;
    }
    let html = `<table class="table table-sm"><thead><tr><th>Wing</th><th>Subwing</th><th>Task</th><th>Deadline</th><th>R</th><th>A</th><th>C</th><th>I</th></tr></thead><tbody>`;
    tasks.forEach((t) => {
      html += `<tr><td>${esc(t.wing)}</td><td>${esc(t.subwing)}</td><td>${esc(
        t.title
      )}</td><td>${esc(t.deadline || "")}</td><td>${esc(
        namesFromIds(t.responsible || [])
      )}</td><td>${esc(namesFromIds(t.accountable || []))}</td><td>${esc(
        namesFromIds(t.consulted || [])
      )}</td><td>${esc(namesFromIds(t.informed || []))}</td></tr>`;
    });
    html += "</tbody></table>";
    tgt.innerHTML = html;
  }
  function namesFromIds(ids) {
    return (ids || [])
      .map((id) => (users.find((u) => idEq(u.id, id)) || {}).name || "")
      .filter(Boolean)
      .join(", ");
  }
  function exportCSV(month) {
    const data = month === currentMonth ? monthData : { tasks: [] };
    const tasks = data.tasks || [];
    if (!tasks.length)
      return showToast("info", "No tasks to export for selected month.");
    const rows = [
      ["Wing", "Subwing", "Task", "Deadline", "Role", "Name", "Employee ID"],
    ];
    tasks.forEach((t) => {
      ["responsible", "accountable", "consulted", "informed"].forEach(
        (role) => {
          (t[role] || []).forEach((uid) => {
            const u = users.find((x) => idEq(x.id, uid)) || {
              name: "",
              emp: "",
              employee_id: "",
            };
            rows.push([
              t.wing,
              t.subwing,
              t.title,
              t.deadline || "",
              role.charAt(0).toUpperCase(),
              u.name,
              u.emp || u.employee_id || "",
            ]);
          });
        }
      );
      if (
        ["responsible", "accountable", "consulted", "informed"].every(
          (r) => (t[r] || []).length === 0
        )
      )
        rows.push([t.wing, t.subwing, t.title, t.deadline || "", "", "", ""]);
    });
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `raci_${month || currentMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------- task modal + select modal ---------- */
  async function openTaskModal(taskId = null, preWing = "", preSub = "") {
    users = await serviceLoadUsers();
    wings = await serviceLoadWings();
    monthData = await serviceLoadMonth(currentMonth);

    const taskWingEl = $("#task-wing");
    if (!taskWingEl) return alert("Task modal missing #task-wing element.");
    taskWingEl.innerHTML =
      `<option value="">Select Wing</option>` +
      (wings || [])
        .map((w) => `<option value="${esc(w.name)}">${esc(w.name)}</option>`)
        .join("");
    const taskIdEl = $("#task-id");
    const taskSubEl = $("#task-subwing");
    const taskTitleEl = $("#task-title");
    const taskDeadlineEl = $("#task-deadline");
    const taskStatusEl = $("#task-status");

    if (taskId) {
      const t = (monthData.tasks || []).find((x) => idEq(x.id, taskId));
      if (!t) return alert("Task not found");
      taskIdEl.value = t.id;
      taskWingEl.value = t.wing;
      populateTaskSubwing(t.wing, t.subwing);
      taskTitleEl.value = t.title;
      taskDeadlineEl.value = t.deadline || "";
      taskStatusEl.value = t.status || "In Progress";
      tempRaci = {
        responsible: [...(t.responsible || [])],
        accountable: [...(t.accountable || [])],
        consulted: [...(t.consulted || [])],
        informed: [...(t.informed || [])],
      };
    } else {
      taskIdEl.value = "";
      taskWingEl.value = preWing || "";
      populateTaskSubwing(preWing || "", preSub || "");
      taskTitleEl.value = "";
      taskDeadlineEl.value = "";
      taskStatusEl.value = "In Progress";
      tempRaci = {
        responsible: [],
        accountable: [],
        consulted: [],
        informed: [],
      };
      if (preWing) taskWingEl.value = preWing;
      if (preSub) populateTaskSubwing(preWing || "", preSub);
    }

    taskWingEl.onchange = () => populateTaskSubwing(taskWingEl.value);
    refreshRaciPreview();
    $$(".btn-raci").forEach((b) => {
      b.onclick = () => {
        tempPickRole = b.getAttribute("data-role");
        openSelectModal(
          tempPickRole,
          $("#task-wing").value || "",
          $("#task-subwing").value || ""
        );
      };
    });
    modalTask && modalTask.show && modalTask.show();
  }
  function populateTaskSubwing(wingName, selectSub = "") {
    const taskSubEl = $("#task-subwing");
    if (!taskSubEl) return;
    taskSubEl.innerHTML = `<option value="">Select subwing</option>`;
    if (!wingName) return;
    const w = (wings || []).find((x) => x.name === wingName);
    (w?.subwings || []).forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.name;
      opt.textContent = s.name;
      taskSubEl.appendChild(opt);
    });
    if (selectSub) taskSubEl.value = selectSub;
  }

  /* ---------- select modal controls ---------- */
  function ensureSelectModalControls() {
    const modal = $("#modal-select-user");
    if (!modal) return;
    const body = modal.querySelector(".modal-body");
    const footer = modal.querySelector(".modal-footer");
    if (!body || !footer) return;

    if (!$("#select-search")) {
      const s = document.createElement("input");
      s.id = "select-search";
      s.className = "form-control mb-2";
      s.placeholder = "Search name or employee id";
      body.insertBefore(s, body.firstChild);
    }
    if (!$("#select-filter-wing")) {
      const wrap = document.createElement("div");
      wrap.className = "d-flex gap-2 mb-2 align-items-center";
      const wsel = document.createElement("select");
      wsel.id = "select-filter-wing";
      wsel.className = "form-select";
      wsel.style.maxWidth = "200px";
      const ssel = document.createElement("select");
      ssel.id = "select-filter-subwing";
      ssel.className = "form-select";
      ssel.style.maxWidth = "200px";
      const vwrap = document.createElement("div");
      vwrap.style.display = "flex";
      vwrap.style.alignItems = "center";
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.id = "select-view-all";
      chk.style.marginRight = "6px";
      const lbl = document.createElement("label");
      lbl.htmlFor = "select-view-all";
      lbl.textContent = "View all users";
      vwrap.appendChild(chk);
      vwrap.appendChild(lbl);
      wrap.appendChild(wsel);
      wrap.appendChild(ssel);
      wrap.appendChild(vwrap);
      body.insertBefore(
        wrap,
        body.querySelector("#select-search")
          ? body.querySelector("#select-search").nextSibling
          : body.firstChild
      );
      populateSelect(
        "#select-filter-wing",
        (wings || []).map((w) => w.name),
        "(all wings)"
      );
      populateSubFilter("#select-filter-wing", "#select-filter-subwing");
    }
    if (!$("#select-user-list")) {
      const list = document.createElement("div");
      list.id = "select-user-list";
      list.className = "list-group";
      body.appendChild(list);
    }
    if (!$("#select-user-save")) {
      const btnClear = document.createElement("button");
      btnClear.id = "select-user-clear";
      btnClear.className = "btn btn-outline-secondary";
      btnClear.textContent = "Clear";
      const btnSave = document.createElement("button");
      btnSave.id = "select-user-save";
      btnSave.className = "btn btn-primary";
      btnSave.textContent = "Save";
      footer.appendChild(btnClear);
      footer.appendChild(btnSave);
    }
  }

  function openSelectModal(role, filterWing = "", filterSub = "") {
    tempPickRole = role;
    const label = $("#select-role-label");
    if (label) label.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    if ($("#select-filter-wing"))
      $("#select-filter-wing").value = filterWing || "";
    populateSubFilter("#select-filter-wing", "#select-filter-subwing");
    if ($("#select-filter-subwing") && filterSub)
      $("#select-filter-subwing").value = filterSub;
    if ($("#select-view-all")) $("#select-view-all").checked = false;
    if ($("#select-search")) $("#select-search").value = "";
    renderSelectUserList();
    modalSelect && modalSelect.show && modalSelect.show();
  }

  function renderSelectUserList() {
    const list = $("#select-user-list");
    if (!list) return;
    list.innerHTML = "";
    if (!users || users.length === 0) {
      list.innerHTML = '<div class="small text-muted">No users yet</div>';
      return;
    }
    const viewAll = $("#select-view-all")
      ? $("#select-view-all").checked
      : false;
    const fw = viewAll
      ? ""
      : $("#select-filter-wing")
      ? $("#select-filter-wing").value
      : "";
    const fs = viewAll
      ? ""
      : $("#select-filter-subwing")
      ? $("#select-filter-subwing").value
      : "";
    const q = $("#select-search")
      ? ($("#select-search").value || "").trim().toLowerCase()
      : "";

    const filtered = users.filter((u) => {
      if (fw) {
        const inProfile = (u.wing || "") === fw;
        const hasAssign = (monthData.tasks || []).some(
          (t) =>
            t.wing === fw &&
            (fs ? t.subwing === fs : true) &&
            ["responsible", "accountable", "consulted", "informed"].some((r) =>
              (t[r] || []).some((i) => idEq(i, u.id))
            )
        );
        if (!inProfile && !hasAssign) return false;
      }
      if (fs) {
        const inProfile = (u.subwing || "") === fs;
        const hasAssign = (monthData.tasks || []).some(
          (t) =>
            t.wing === fw &&
            t.subwing === fs &&
            ["responsible", "accountable", "consulted", "informed"].some((r) =>
              (t[r] || []).some((i) => idEq(i, u.id))
            )
        );
        if (!inProfile && !hasAssign) return false;
      }
      if (
        q &&
        !(
          (u.name || "").toLowerCase().includes(q) ||
          String(u.emp || u.employee_id || "")
            .toLowerCase()
            .includes(q)
        )
      )
        return false;
      return true;
    });

    filtered.forEach((u) => {
      const item = document.createElement("div");
      item.className =
        "list-group-item d-flex align-items-center justify-content-between";
      const left = document.createElement("div");
      left.className = "d-flex align-items-center gap-3";
      left.appendChild(makeAvatarElement(u, 36));
      left.insertAdjacentHTML(
        "beforeend",
        `<div><div class="fw-semibold">${esc(
          u.name
        )}</div><div class="small text-muted">${esc(
          u.emp || u.employee_id || ""
        )}</div></div>`
      );
      const right = document.createElement("div");
      const checked = (tempRaci[tempPickRole] || []).some((i) => idEq(i, u.id));
      right.innerHTML = `<input ${
        checked ? "checked" : ""
      } class="form-check-input select-uid" type="checkbox" data-uid="${
        u.id
      }">`;
      item.appendChild(left);
      item.appendChild(right);
      list.appendChild(item);
    });

    if (!filtered.length)
      list.innerHTML =
        '<div class="small text-muted">No users matched the current filter.</div>';
  }

  function applySelectModal() {
    const list = $("#select-user-list");
    if (!list) return;
    const checked = Array.from(
      list.querySelectorAll("input.select-uid:checked")
    ).map((cb) => cb.dataset.uid);
    if (!tempPickRole) return;
    tempRaci[tempPickRole] = checked;
  }

  function refreshRaciPreview() {
    const preview = $("#task-raci-preview");
    if (!preview) return;
    preview.innerHTML = "";
    ["responsible", "accountable", "consulted", "informed"].forEach((role) => {
      const arr = tempRaci[role] || [];
      const chip = document.createElement("div");
      chip.className = "raci-chip";
      chip.style.marginRight = "6px";
      chip.style.display = "inline-block";
      const label = role.charAt(0).toUpperCase();
      if (!arr.length) chip.textContent = `${label}: —`;
      else {
        const names = arr
          .map(
            (id) => (users.find((u) => idEq(u.id, id)) || {}).name || "Unknown"
          )
          .slice(0, 3);
        chip.textContent = `${label}: ${names.join(", ")}${
          arr.length > 3 ? "..." : ""
        }`;
      }
      preview.appendChild(chip);
    });
  }

  /* ---------- saving / deleting ---------- */
  async function deleteTaskAndRefresh(id) {
    const r = await serviceDeleteTask(id, currentMonth);
    if (r.ok) {
      monthData = await serviceLoadMonth(currentMonth);
      await renderView("manage");
    } else {
      showToast("error", "Delete failed");
      console.error(r);
    }
  }

  /* ---------- form submit ---------- */
  document.addEventListener("submit", async (ev) => {
    if (ev.target && ev.target.id === "form-task") {
      ev.preventDefault();
      const taskIdEl = $("#task-id");
      const taskWingEl = $("#task-wing");
      const taskSubEl = $("#task-subwing");
      const taskTitleEl = $("#task-title");
      const taskDeadlineEl = $("#task-deadline");
      const taskStatusEl = $("#task-status");
      const isNew = !taskIdEl.value;
      const idVal = taskIdEl.value || uid();
      const wing = (taskWingEl.value || "").trim();
      const subwing = (taskSubEl.value || "").trim();
      const title = (taskTitleEl.value || "").trim();
      const deadline = taskDeadlineEl.value || "";
      const status = taskStatusEl.value || "In Progress";
      if (!wing || !subwing || !title)
        return alert("Fill Wing, Subwing and Task title.");

      const payload = {
        ...(isNew ? {} : { id: idVal }),
        month: currentMonth,
        wing,
        subwing,
        title,
        deadline,
        status,
        responsible: [...(tempRaci.responsible || [])],
        accountable: [...(tempRaci.accountable || [])],
        consulted: [...(tempRaci.consulted || [])],
        informed: [...(tempRaci.informed || [])],
        createdAt: isNew
          ? new Date().toISOString()
          : monthData.tasks.find((t) => idEq(t.id, idVal))?.createdAt ||
            new Date().toISOString(),
      };

      // optimistic local update
      monthData.tasks = monthData.tasks || [];
      const idx = monthData.tasks.findIndex((t) => idEq(t.id, idVal));
      if (idx >= 0) monthData.tasks[idx] = { ...payload, id: idVal };
      else monthData.tasks.push({ ...payload, id: idVal });
      localSaveMonth(currentMonth, monthData);
      refreshRaciPreview();

      const res = await serviceSaveTask(payload);
      if (res.ok && res.source === "server") {
        monthData = await serviceLoadMonth(currentMonth);
        await reloadAll();
        modalTask && modalTask.hide && modalTask.hide();
        await renderView("manage");
        return;
      }
      if (res.ok && res.source === "local") {
        modalTask && modalTask.hide && modalTask.hide();
        await renderView("manage");
        return;
      }
      if (res.serverError) {
        console.error("Server Error Raw:", res.raw || res);
        showToast("error", "Server error while saving (check logs)");
        modalTask && modalTask.hide && modalTask.hide();
        await renderView("manage");
        return;
      }
      showToast("error", "Save failed");
      console.error(res);
    }
  });

  /* ---------- helpers ---------- */
  function populateSelect(selector, items, placeholder = "All") {
    const el = $(selector);
    if (!el) return;
    el.innerHTML =
      `<option value="">${placeholder}</option>` +
      items.map((i) => `<option value="${esc(i)}">${esc(i)}</option>`).join("");
  }
  function populateSubFilter(wingSelector, subSelector) {
    const wingName = $(wingSelector).value;
    const subEl = $(subSelector);
    if (!subEl) return;
    if (!wingName) {
      const allSubs = (wings || []).reduce(
        (acc, w) => acc.concat((w.subwings || []).map((s) => s.name)),
        []
      );
      const uniq = Array.from(new Set(allSubs));
      subEl.innerHTML =
        `<option value="">All Subwings</option>` +
        uniq
          .map((s) => `<option value="${esc(s)}">${esc(s)}</option>`)
          .join("");
    } else {
      const w = (wings || []).find((x) => x.name === wingName);
      const subs = w ? (w.subwings || []).map((s) => s.name) : [];
      subEl.innerHTML =
        `<option value="">All Subwings</option>` +
        subs
          .map((s) => `<option value="${esc(s)}">${esc(s)}</option>`)
          .join("");
    }
  }

  /* ---------- boot ---------- */
  await init();

  // expose some debug helpers
  window._raci = {
    reloadAll,
    serviceLoadUsers,
    serviceLoadWings,
    serviceLoadMonth,
    serviceSaveTask,
    serviceDeleteTask,
    getState: () => ({ users, wings, monthData, currentMonth }),
    showToast,
  };
})();
