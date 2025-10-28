// app.js - main application (imports service + ui helpers)
import {
  apiGet,
  apiPost,
  apiDelete,
  safeFetchJSON,
  serviceLoadUsers,
  serviceLoadWings,
  serviceLoadMonth,
  serviceSaveTask,
  serviceDeleteTask,
  localLoadMonth,
  localSaveMonth,
} from "./raci-service.js";

import {
  ensureLoadingOverlay,
  showLoading,
  hideLoading,
  ensureToastContainer,
  showToast,
  ensureBadgeTooltip,
  showBadgeTooltip,
  moveBadgeTooltip,
  hideBadgeTooltip,
} from "./raci-ui.js";

import { createUsersModule } from "./raci-users.js";
import { createSelectModule } from "./raci-select.js";

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

  // Format date string like "2025-11-10" -> "10 Nov 2025"
  function formatDateDisplay(dateStr) {
    if (!dateStr) return "";
    const ymd = String(dateStr)
      .trim()
      .match(/^(\d{4})-(\d{2})-(\d{2})$/);
    let d;
    if (ymd) {
      const y = parseInt(ymd[1], 10);
      const m = parseInt(ymd[2], 10) - 1;
      const day = parseInt(ymd[3], 10);
      d = new Date(y, m, day);
    } else {
      d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
    }
    try {
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

  /* ---------- check deadline helpers ---------- */
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

  /* ---------- small UI: loading overlay & toast container & tooltip ---------- */
  function uiEnsureInit() {
    ensureLoadingOverlay();
    ensureToastContainer();
    ensureBadgeTooltip();
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

  // current logged-in employee id (optional) & currentUser object
  let empId = localStorage.getItem("employee_id") || "";
  let currentUser = null;
  let currentUserId = null;

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

  /* ---------- inline status options + colors ---------- */
  const STATUS_OPTIONS = [
    "Not Started",
    "In Progress",
    "Completed",
    "Blocked",
    "On Hold",
    "Overdue",
  ];
  const STATUS_BG = {
    "Not Started": "#F5F5F5",
    "In Progress": "#E8F4FF",
    Completed: "#E9F7EF",
    Blocked: "#FFF1F0",
    "On Hold": "#FFF6E6",
    Overdue: "#FFF1F0",
  };

  function applyStatusStylingToRow(rowEl, status) {
    if (!rowEl) return;
    const bg = STATUS_BG[status] || "";
    const accentMap = {
      "Not Started": "#BDBDBD",
      "In Progress": "#4DA1FF",
      Completed: "#2EB27E",
      Blocked: "#F06666",
      "On Hold": "#FFA94D",
      Overdue: "#D03434",
    };
    const accent = accentMap[status] || "#CCCCCC";
    rowEl.style.backgroundColor = bg;
    rowEl.style.borderLeft = status
      ? `4px solid ${accent}`
      : "4px solid transparent";
    rowEl.style.paddingLeft = rowEl.style.paddingLeft || "8px";
  }

  // If a task is In Progress and deadline has passed, convert it to Overdue:
  //  - update monthData locally (optimistic)
  //  - persist via serviceSaveTask() in background
  // returns true if we changed the status locally
  async function ensureOverdueStatusIfNeeded(task) {
    try {
      if (!task || !task.deadline) return false;
      const cur = String(task.status || "").trim();
      // do not change if already Completed, On Hold, Blocked, or Overdue
      const protectedStatuses = new Set([
        "Completed",
        "On Hold",
        "Blocked",
        "Overdue",
      ]);
      if (protectedStatuses.has(cur)) return false;
      // Only auto-convert if currently "In Progress" and deadline passed
      if (cur === "In Progress" && isDeadlinePast(task.deadline)) {
        // local optimistic update
        const prev = task.status || "";
        task.status = "Overdue";
        localSaveMonth(currentMonth, monthData);
        // prepare payload for server (keep same shape)
        const payload = {
          id: task.id,
          month: currentMonth,
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
        // fire-and-forget save; show toast on success
        serviceSaveTask(payload)
          .then((res) => {
            if (res && res.ok) {
              // optionally notify
              showToast &&
                showToast("info", "Task marked Overdue (deadline passed)");
              // try to refresh month data if server is authoritative
              if (res.source === "server") {
                return serviceLoadMonth(currentMonth).then((md) => {
                  monthData = md || monthData;
                });
              }
            } else {
              // rollback locally if server refused (best-effort)
              // (we keep the local optimistic change, but revert if server returned serverError)
              if (res && res.serverError) {
                task.status = prev;
                localSaveMonth(currentMonth, monthData);
                showToast &&
                  showToast("error", "Failed to persist overdue status");
              }
            }
          })
          .catch((err) => {
            console.warn("Failed save Overdue:", err);
            // keep optimistic local change; it can be resolved later manually
          });
        return true;
      }
      return false;
    } catch (err) {
      console.error("ensureOverdueStatusIfNeeded error", err);
      return false;
    }
  }

  async function handleInlineStatusChange(taskId, newStatus, rowEl, selEl) {
    try {
      const task = (monthData.tasks || []).find((t) => idEq(t.id, taskId));
      if (!task) {
        showToast("error", "Task not found");
        return;
      }
      const oldStatus = task.status || "";
      // optimistic update
      task.status = newStatus;
      localSaveMonth(currentMonth, monthData);
      applyStatusStylingToRow(rowEl, newStatus);

      // try to save to server
      const payload = { ...task, month: currentMonth };
      const res = await serviceSaveTask(payload);

      if (res && res.ok) {
        if (res.source === "server") {
          monthData = await serviceLoadMonth(currentMonth);
          await reloadAll();
        }
        showToast("success", "Status updated");
      } else if (res && res.serverError) {
        task.status = oldStatus;
        localSaveMonth(currentMonth, monthData);
        applyStatusStylingToRow(rowEl, oldStatus);
        selEl.value = oldStatus || "";
        console.error("Server error:", res.raw || res);
        showToast("error", "Server error while updating status");
      } else {
        task.status = oldStatus;
        localSaveMonth(currentMonth, monthData);
        applyStatusStylingToRow(rowEl, oldStatus);
        selEl.value = oldStatus || "";
        showToast("error", "Failed to save status");
        console.error(res);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("error", "Error updating status");
    }
  }

  /* ---------- avatar + tooltip wiring ----------
     makeAvatarElement accepts clickable boolean (default true)
  */
  function makeAvatarElement(user, size = 36, clickable = true) {
    const el = document.createElement("div");
    el.className = "avatar small";
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.borderRadius = "50%";
    el.style.overflow = "hidden";
    el.style.display = "inline-flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.cursor = clickable ? "pointer" : "default";
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

    // If not clickable, prevent opening user details on click
    if (!clickable) {
      el.addEventListener("click", (ev) => ev.stopPropagation());
    }

    return el;
  }

  /* ---------- avatar chip with overlay badge (inside avatar) ----------
     Creates an avatar element wrapped in a container and inserts a badge element
     inside the avatar (absolutely positioned). The badge is visible only on mobile
     via CSS, and hidden on desktop (as requested).
  */
  function makeAvatarChipWithBadge(
    uid,
    roleLetter = "",
    size = 44,
    currentUserId
  ) {
    const u = (users || []).find((x) => idEq(x.id, uid)) || null;

    const container = document.createElement("div");
    container.className = "avatar-chip";

    // avatar wrapper (relative) so the badge can be absolutely positioned inside
    const avatarWrap = document.createElement("div");
    avatarWrap.className = "avatar-with-badge";
    avatarWrap.style.display = "inline-block";
    avatarWrap.style.position = "relative";
    avatarWrap.style.lineHeight = 0;

    // create avatar element (clickable depending on usage)
    const avatar = makeAvatarElement(u || { name: uid }, size, true);
    avatar.style.width = size + "px";
    avatar.style.height = size + "px";
    avatar.style.borderRadius = "50%";
    avatar.style.boxSizing = "border-box";
    if (currentUserId && idEq(uid, currentUserId)) {
      avatar.style.boxShadow = "0 0 0 3px rgba(13,110,253,0.09)";
    }
    avatar.setAttribute("aria-label", u ? u.name || u.emp || uid : uid);

    avatarWrap.appendChild(avatar);

    // badge overlay element — placed INSIDE avatarWrap so it visually overlaps avatar
    if (roleLetter) {
      const badge = document.createElement("div");
      badge.className = `avatar-badge ${roleLetter.toLowerCase()}`; // e.g. "avatar-badge r"
      badge.textContent = roleLetter;
      avatarWrap.appendChild(badge);
    }

    container.appendChild(avatarWrap);
    return container;
  }

  /* ---------- users/select modules ---------- */
  const usersModule = createUsersModule({
    getUsers: () => users,
    getMonthData: () => monthData,
    makeAvatarElement,
    esc,
    idEq,
    showUserDetail,
    containerRootSelector: "#view-container",
    usersTplId: "users-tpl",
    defaultPageSize: 10,
  });

  const selectModule = createSelectModule({
    getUsers: () => users,
    getWings: () => wings,
    getMonthData: () => monthData,
    getTempRaci: () => tempRaci,
    setTempRaci: (newRaci) => {
      tempRaci = newRaci;
    },
    getTempPickRole: () => tempPickRole,
    setTempPickRole: (r) => (tempPickRole = r),
    makeAvatarElement,
    esc,
    idEq,
    modalSelectInstance: modalSelect,
    selectModalSelector: "#modal-select-user",
    defaultPageSize: 8,
  });

  /* ---------- helper: update nav visibility by role ---------- */
  function updateNavVisibilityByRole() {
    // Role values: 0,1 => admin: show all tabs
    // role 2 => restrict: hide Users (and others you don't want)
    const allowedForNonAdmin = new Set([
      "dashboard",
      "your-work",
      "manage",
      "about",
    ]);
    const isAdmin =
      currentUser && (currentUser.role === 0 || currentUser.role === 1);
    navLinks.forEach((link) => {
      const view = link.dataset.view;
      if (isAdmin) {
        link.style.display = ""; // show
      } else {
        if (allowedForNonAdmin.has(view)) link.style.display = "";
        else link.style.display = "none";
      }
    });

    // If current active nav was hidden, switch to dashboard
    const active = document.querySelector(".nav-link.active");
    if (active && active.style.display === "none") {
      const dash = document.querySelector('.nav-link[data-view="dashboard"]');
      $$("#main-nav .nav-link").forEach((n) => n.classList.remove("active"));
      if (dash) dash.classList.add("active");
    }
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
    uiEnsureInit();

    // wire nav links
    navLinks.forEach((a) => a.addEventListener("click", navClick));
    if (monthPicker) monthPicker.value = currentMonth;
    monthPicker?.addEventListener("change", onMonthChange);

    selectModule.ensureControls();

    selectModule.onSave(() => {
      refreshRaciPreview();
      showToast("success", "Selection applied");
    });
    selectModule.onClear(() => {
      refreshRaciPreview();
      showToast("info", "Cleared selection");
    });

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

    navLinks.forEach((n) => n.classList.remove("active"));
    const defaultNav = document.querySelector(
      '.nav-link[data-view="dashboard"]'
    );
    if (defaultNav) defaultNav.classList.add("active");
    await renderView("dashboard");
  }

  /* ---------- reload helpers ---------- */
  async function reloadAll() {
    showLoading("Loading");
    users = await serviceLoadUsers();
    wings = await serviceLoadWings();
    monthData = await serviceLoadMonth(currentMonth);
    hideLoading();
    updateStatsUI();
    selectModule.populateWingFilter((wings || []).map((w) => w.name));

    // resolve currentUser from empId (if present)
    currentUser = null;
    currentUserId = null;
    empId = localStorage.getItem("employee_id") || empId || "";
    if (empId && users && users.length) {
      currentUser =
        users.find(
          (u) => String(u.emp || u.employee_id || "") === String(empId)
        ) ||
        users.find(
          (u) => u.extra && String(u.extra.employee_id || "") === String(empId)
        );
      if (currentUser) currentUserId = currentUser.id;
    }

    // update navigation visibility according to role
    updateNavVisibilityByRole();
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
          dataset: { view: "dashboard" },
        }
      ).dataset.view
    );
  }

  /* ---------- render views ---------- */
  async function renderView(view) {
    document.body.dataset.view = view;

    const titles = {
      dashboard: "Dashboard",
      manage: "Manage RACI",
      wings: "Wings",
      users: "Users",
      "your-work": "Your Work",
      reports: "Reports",
      about: "What is RACI?",
    };
    const subs = {
      dashboard: "RACI Matrix (read-only)",
      manage: "Create / Edit tasks and RACI assignments",
      wings: "Manage Wings & Subwings",
      users: "Users & User Panel",
      "your-work": "Tasks assigned to you (R/A/C/I)",
      reports: "Generate month reports",
      about: "Learn about the RACI responsibility matrix",
    };

    $("#view-title") &&
      ($("#view-title").textContent = titles[view] || "Dashboard");
    $("#view-sub") && ($("#view-sub").textContent = subs[view] || "");

    viewContainer.innerHTML = "";
    await reloadAll();

    // guard the Users page: only role 0 or 1 can access
    const viewerIsAdmin =
      currentUser && (currentUser.role === 0 || currentUser.role === 1);
    if (view === "users" && !viewerIsAdmin) {
      const card = document.createElement("div");
      card.className = "card p-4";
      card.innerHTML = `<h5 class="mb-2">Access Denied</h5>
        <div class="small text-muted">You don't have permission to view the Users page.</div>`;
      viewContainer.appendChild(card);
      return;
    }

    if (view === "dashboard") {
      const tpl = document.getElementById("dashboard-tpl");
      if (tpl) viewContainer.appendChild(tpl.content.cloneNode(true));
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
    } else if (view === "manage") {
      const tpl = document.getElementById("manage-tpl");
      if (tpl) viewContainer.appendChild(tpl.content.cloneNode(true));
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
      renderManageArea();
    } else if (view === "wings") {
      const tpl = document.getElementById("wings-tpl");
      if (tpl) viewContainer.appendChild(tpl.content.cloneNode(true));
      renderWingsList();
    } else if (view === "users") {
      // already guarded above for non-admins
      await usersModule.render();
    } else if (view === "reports") {
      const tpl = document.getElementById("reports-tpl");
      if (tpl) viewContainer.appendChild(tpl.content.cloneNode(true));
      $("#reportMonth").value = currentMonth;
      $("#btn-generate-report")?.addEventListener("click", () => {
        const m = $("#reportMonth").value || currentMonth;
        generateReport(m);
      });
      $("#btn-export-report")?.addEventListener("click", () => {
        const m = $("#reportMonth").value || currentMonth;
        exportCSV(m);
      });
    } else if (view === "about") {
      const tpl = document.getElementById("about-tpl");
      if (tpl) viewContainer.appendChild(tpl.content.cloneNode(true));
      else renderAbout();
    } else if (view === "your-work") {
      if (
        window._yourWork &&
        typeof window._yourWork.renderYourWorkView === "function"
      ) {
        try {
          await window._yourWork.renderYourWorkView();
        } catch (err) {
          console.error("Error loading Your Work view:", err);
          showToast && showToast("error", "Failed to load Your Work view");
          const card = document.createElement("div");
          card.className = "card p-4";
          card.innerHTML = `<h5 class="mb-2">Your Work</h5><div class="small text-muted">Failed to load the Your Work module. Check console for details.</div>`;
          viewContainer.appendChild(card);
        }
      } else {
        const card = document.createElement("div");
        card.className = "card p-4";
        card.innerHTML = `<h5 class="mb-2">Your Work</h5><div class="small text-muted">The Your Work module is not loaded. Make sure <code>your-work.js</code> is included after <code>app.js</code>.</div>`;
        viewContainer.appendChild(card);
      }
    } else {
      renderDashboardArea();
    }
  }

  /* ---------- dashboard/manage helpers ---------- */
  function renderDashboardArea() {
    const area = $("#dashboardArea");
    if (!area) return;
    area.innerHTML = "";
    const wingFilter = $("#filterWing") ? $("#filterWing").value : "";
    const subFilter = $("#filterSubwing") ? $("#filterSubwing").value : "";

    // base tasks after wing/sub filters
    let tasks = (monthData.tasks || []).filter((t) => {
      if (wingFilter && t.wing !== wingFilter) return false;
      if (subFilter && t.subwing !== subFilter) return false;
      return true;
    });

    // apply permission:
    // - admins (role 0 or 1) see all tasks
    // - non-admins see tasks where they are in ANY role (R, A, C, or I)
    const isAdmin =
      currentUser && (currentUser.role === 0 || currentUser.role === 1);
    if (!isAdmin) {
      if (!currentUserId) {
        tasks = []; // not logged in -> no tasks
      } else {
        tasks = tasks.filter((t) =>
          ["responsible", "accountable", "consulted", "informed"].some(
            (r) =>
              Array.isArray(t[r]) && t[r].some((id) => idEq(id, currentUserId))
          )
        );
      }
    }

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

                // Before rendering, try to auto-convert to Overdue when applicable (non-blocking)
                // We don't await it here to keep render responsive.
                ensureOverdueStatusIfNeeded(task).catch((e) => {
                  console.warn("Overdue check/save failed", e);
                });

                // move status before deadline
                const metaCell = row.querySelector(".row-meta");
                metaCell.textContent = task.status || "";
                const deadlineCell = row.querySelector(".deadline-col");
                deadlineCell.textContent = formatDateDisplay(
                  task.deadline || ""
                );
                if (
                  metaCell &&
                  deadlineCell &&
                  metaCell.parentNode === deadlineCell.parentNode
                ) {
                  metaCell.parentNode.insertBefore(metaCell, deadlineCell);
                }

                // center status visually in dashboard
                const statusCol = row.querySelector(".status-col");
                if (statusCol) {
                  statusCol.style.justifyContent = "center";
                  statusCol.style.textAlign = "center";
                }

                // fill role containers - avatars clickable only if viewer (currentUser) is admin (role 0 or 1)
                fillRoleContainer(
                  row.querySelector(".role-r"),
                  task.responsible,
                  true,
                  "R"
                );
                fillRoleContainer(
                  row.querySelector(".role-a"),
                  task.accountable,
                  true,
                  "A"
                );
                fillRoleContainer(
                  row.querySelector(".role-c"),
                  task.consulted,
                  true,
                  "C"
                );
                fillRoleContainer(
                  row.querySelector(".role-i"),
                  task.informed,
                  true,
                  "I"
                );

                // apply styling
                const rowRoot =
                  row.querySelector(".matrix-row") ||
                  row.firstElementChild ||
                  row;
                applyStatusStylingToRow(rowRoot, task.status || "");

                rowsRoot.appendChild(row);
              });
            area.appendChild(phase);
          });
      });
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
    let tasks = (monthData.tasks || []).filter((t) => {
      if (wingFilter && t.wing !== wingFilter) return false;
      if (subFilter && t.subwing !== subFilter) return false;
      return true;
    });

    // permission: only admins see all tasks; others only those where currentUser is accountable
    const isAdmin =
      currentUser && (currentUser.role === 0 || currentUser.role === 1);
    if (!isAdmin) {
      if (!currentUserId) tasks = [];
      else
        tasks = tasks.filter(
          (t) =>
            Array.isArray(t.accountable) &&
            t.accountable.some((id) => idEq(id, currentUserId))
        );
    }

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

                const rowRoot =
                  row.querySelector(".matrix-row") ||
                  row.firstElementChild ||
                  row;
                rowRoot.dataset.taskId = task.id;

                // Title
                row.querySelector(".row-title").textContent = task.title;

                // Before rendering, try to auto-convert to Overdue when applicable (non-blocking)
                ensureOverdueStatusIfNeeded(task).catch((e) => {
                  console.warn("Overdue check/save failed", e);
                });

                // create inline status select and ensure it's BEFORE deadline
                const metaCell = row.querySelector(".row-meta");
                metaCell.innerHTML = "";
                const select = document.createElement("select");
                select.className = "form-select form-select-sm";
                select.style.minWidth = "150px";
                STATUS_OPTIONS.forEach((s) => {
                  const opt = document.createElement("option");
                  opt.value = s;
                  opt.textContent = s;
                  if (s === (task.status || "")) opt.selected = true;
                  select.appendChild(opt);
                });
                select.onchange = (e) =>
                  handleInlineStatusChange(
                    task.id,
                    e.target.value,
                    rowRoot,
                    select
                  );

                metaCell.appendChild(select);

                // deadline cell: formatted
                const deadlineCell = row.querySelector(".deadline-col");
                deadlineCell.textContent = formatDateDisplay(
                  task.deadline || ""
                );

                // move status cell before deadline cell
                if (
                  metaCell &&
                  deadlineCell &&
                  metaCell.parentNode === deadlineCell.parentNode
                ) {
                  metaCell.parentNode.insertBefore(metaCell, deadlineCell);
                }

                // roles - avatars clickable only if viewer (currentUser) is admin
                fillRoleContainer(
                  row.querySelector(".role-r"),
                  task.responsible,
                  true,
                  "R"
                );
                fillRoleContainer(
                  row.querySelector(".role-a"),
                  task.accountable,
                  true,
                  "A"
                );
                fillRoleContainer(
                  row.querySelector(".role-c"),
                  task.consulted,
                  true,
                  "C"
                );
                fillRoleContainer(
                  row.querySelector(".role-i"),
                  task.informed,
                  true,
                  "I"
                );

                // actions (desktop)
                const act = row.querySelector(".actions-col");
                if (act)
                  act.innerHTML = `<div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-sm btn-outline-secondary" data-action="edit-task" data-id="${task.id}"><i class="fa fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete-task" data-id="${task.id}"><i class="fa fa-trash"></i></button>
          </div>`;

                // MOBILE: duplicate a compact action bar inside task column visible only on small screens
                // uses Bootstrap utility class d-md-none to show only on < md (md = 768px).
                const taskCol = row.querySelector(".task-col");
                if (taskCol) {
                  const mobileActions = document.createElement("div");
                  mobileActions.className = "d-md-none mt-2";
                  mobileActions.style.display = "flex";
                  mobileActions.style.justifyContent = "flex-end";
                  mobileActions.innerHTML = `<div class="btn-group" role="group" aria-label="mobile actions">
                    <button class="btn btn-sm btn-outline-secondary" data-action="edit-task" data-id="${task.id}"><i class="fa fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete-task" data-id="${task.id}"><i class="fa fa-trash"></i></button>
                  </div>`;
                  taskCol.appendChild(mobileActions);
                }

                // apply immediate styling according to status
                applyStatusStylingToRow(rowRoot, task.status || "");

                rowsRoot.appendChild(row);
              });
            area.appendChild(phase);
          });
      });
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

  /* ---------- fillRoleContainer ----------
     Accepts `allowViewerClick` boolean and `roleLetter`.
     Avatars will be clickable only when:
       - allowViewerClick is true (context allows it), AND
       - current viewer (currentUser) has role 0 or 1 (admin).
     For role === 2 viewers avatars are never clickable and Users page is hidden.
  */
  function fillRoleContainer(
    container,
    ids,
    allowViewerClick = true,
    roleLetter = ""
  ) {
    container.innerHTML = "";
    const viewerIsAdmin =
      currentUser && (currentUser.role === 0 || currentUser.role === 1);
    const avatarsClickable = !!allowViewerClick && !!viewerIsAdmin;
    (ids || []).forEach((id) => {
      const u = users.find((x) => idEq(x.id, id));
      if (!u) {
        const sp = document.createElement("div");
        sp.className = "small text-muted";
        sp.textContent = "—";
        container.appendChild(sp);
        return;
      }

      // Use the avatar-with-badge chip
      const el = makeAvatarChipWithBadge(id, roleLetter, 35, currentUserId);

      if (avatarsClickable) {
        el.addEventListener("click", () => {
          if (!viewerIsAdmin) return;
          const nav = document.querySelector('.nav-link[data-view="users"]');
          if (nav) nav.click();
          setTimeout(() => {
            usersModule.render().then(() => showUserDetail(u));
          }, 120);
        });
      } else {
        el.addEventListener("click", (ev) => ev.stopImmediatePropagation());
      }
      container.appendChild(el);
    });
  }

  /* ---------- select / task modal integration ---------- */
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
      // keep ISO for form input (value), but the UI displays formatted elsewhere
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

      // NEW TASK: auto-select creator as Accountable (if we have a currentUserId)
      tempRaci = {
        responsible: [],
        accountable: currentUserId ? [currentUserId] : [],
        consulted: [],
        informed: [],
      };

      if (preWing) taskWingEl.value = preWing;
      if (preSub) populateTaskSubwing(preWing || "", preSub);
    }

    taskWingEl.onchange = () => populateTaskSubwing(taskWingEl.value);
    refreshRaciPreview();

    // btn-raci opens the select modal for editing roles
    $$(".btn-raci").forEach((b) => {
      b.onclick = () => {
        tempPickRole = b.getAttribute("data-role");
        selectModule.open(tempPickRole);
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

  /* ---------- form submit (task) ---------- */
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

  /* ---------- remaining helpers (populateSelect, populateSubFilter, exportCSV, reports, about) ---------- */

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

  function namesFromIds(ids) {
    return (ids || [])
      .map((id) => (users.find((u) => idEq(u.id, id)) || {}).name || "")
      .filter(Boolean)
      .join(", ");
  }

  /* reports/exportCSV/about (copied from your original app.js for completeness) */
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
      )}</td><td>${esc(formatDateDisplay(t.deadline || ""))}</td><td>${esc(
        namesFromIds(t.responsible || [])
      )}</td><td>${esc(namesFromIds(t.accountable || []))}</td><td>${esc(
        namesFromIds(t.consulted || [])
      )}</td><td>${esc(namesFromIds(t.informed || []))}</td></tr>`;
    });
    html += "</tbody></table>";
    tgt.innerHTML = html;
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
              formatDateDisplay(t.deadline || ""),
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
        rows.push([
          t.wing,
          t.subwing,
          t.title,
          formatDateDisplay(t.deadline || ""),
          "",
          "",
          "",
        ]);
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

  function renderAbout() {
    const tpl = document.getElementById("about-tpl");
    if (tpl) {
      viewContainer.appendChild(tpl.content.cloneNode(true));
      return;
    }
    const card = document.createElement("div");
    card.className = "card p-4";
    card.innerHTML = `
      <h4 class="mb-2">RACI Matrix — Responsibility Assignment</h4>
      <p>RACI is a lightweight model that clarifies roles and responsibilities for tasks or processes.</p>
      <ul>
        <li><strong>R — Responsible</strong>: Person(s) who do the work to complete the task.</li>
        <li><strong>A — Accountable</strong>: Single person who is ultimately answerable and who signs off.</li>
        <li><strong>C — Consulted</strong>: People whose input is sought (two-way communication).</li>
        <li><strong>I — Informed</strong>: People kept up-to-date (one-way communication).</li>
      </ul>
    `;
    viewContainer.appendChild(card);
  }

  /* ---------- showUserDetail + refresh preview ---------- */
  function rolesForUser(uid, t) {
    const r = [];
    if ((t.responsible || []).some((i) => idEq(i, uid))) r.push("R");
    if ((t.accountable || []).some((i) => idEq(i, uid))) r.push("A");
    if ((t.consulted || []).some((i) => idEq(i, uid))) r.push("C");
    if ((t.informed || []).some((i) => idEq(i, uid))) r.push("I");
    return r.join(", ") || "—";
  }
  function showUserDetail(user) {
    // Guard: only admin viewers can open user detail
    const viewerIsAdmin =
      currentUser && (currentUser.role === 0 || currentUser.role === 1);
    if (!viewerIsAdmin) {
      showToast &&
        showToast("error", "You don't have permission to view user details.");
      return;
    }

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
    // show non-clickable avatar in user detail header
    header.appendChild(makeAvatarElement(user, 48, false));
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
      top.style.display = "grid";
      top.style.gridTemplateColumns = "1fr auto 1fr";
      top.style.alignItems = "center";
      top.style.columnGap = "10px";

      const left = document.createElement("div");
      left.style.justifySelf = "start";
      left.innerHTML = `
        <div class="fw-semibold">${esc(t.title)}</div>
        <div class="small text-muted">${esc(t.wing)} › ${esc(t.subwing)}</div>
      `;

      const middle = document.createElement("div");
      middle.style.justifySelf = "center";
      middle.style.display = "flex";
      middle.style.flexWrap = "wrap";
      middle.style.gap = "4px";

      const userRoles = rolesForUser(user.id, t)
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean);

      middle.innerHTML = userRoles
        .map(
          (role) =>
            `<span class="badge rounded-pill bg-primary-subtle text-primary border border-primary px-2 py-1" style="font-size: 0.75rem;">${esc(
              role
            )}</span>`
        )
        .join("");

      const right = document.createElement("div");
      right.style.justifySelf = "end";
      right.className = "small text-muted";
      right.textContent = formatDateDisplay(t.deadline || "");

      top.appendChild(left);
      top.appendChild(middle);
      top.appendChild(right);

      card.appendChild(top);
      detail.appendChild(card);
    });
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

  /* ---------- boot ---------- */
  await init();

  // expose debug helpers
  window._raci = {
    reloadAll,
    serviceLoadUsers,
    serviceLoadWings,
    serviceLoadMonth,
    serviceSaveTask,
    serviceDeleteTask,
    getState: () => ({ users, wings, monthData, currentMonth, currentUser }),
    showToast,
  };
})();
