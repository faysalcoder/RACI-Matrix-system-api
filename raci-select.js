// raci-select.js
// exports createSelectModule(opts)
// opts:
//  - getUsers()
//  - getWings()
//  - getMonthData()
//  - getTempRaci(), setTempRaci(newRaci)
//  - getTempPickRole(), setTempPickRole(role)
//  - makeAvatarElement, esc, idEq
//  - modalSelectInstance (bootstrap modal instance) - optional
//  - selectModalSelector - e.g. "#modal-select-user"
//  - defaultPageSize

export function createSelectModule(opts = {}) {
  const {
    getUsers,
    getWings,
    getMonthData,
    getTempRaci,
    setTempRaci,
    getTempPickRole,
    setTempPickRole,
    makeAvatarElement,
    esc,
    idEq,
    modalSelectInstance,
    selectModalSelector = "#modal-select-user",
    defaultPageSize = 8,
  } = opts;

  let page = 1;
  let pageSize = defaultPageSize;
  let onSaveCb = null;
  let onClearCb = null;

  // Persisted selection across pages
  let selectedIds = new Set();

  // Persisted search string so it survives DOM changes and modal open/close
  let searchQuery = "";

  // simple debounce util
  function debounce(fn, wait = 300) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function ensureControls() {
    const modal = document.querySelector(selectModalSelector);
    if (!modal) return;
    const body = modal.querySelector(".modal-body");
    const footer = modal.querySelector(".modal-footer");
    if (!body || !footer) return;

    // --- Search input (always present) ---
    let s = modal.querySelector("#select-search");
    if (!s) {
      s = document.createElement("input");
      s.id = "select-search";
      s.className = "form-control mb-2";
      s.placeholder = "Search name or employee id";
      // insert at top of modal body
      body.insertBefore(s, body.firstChild);
    }
    // ensure the input shows the current persistent searchQuery
    s.value = searchQuery || "";

    // attach a single debounced input listener (avoid duplicate listeners)
    if (!s._raci_search_wired) {
      s.addEventListener(
        "input",
        debounce((ev) => {
          searchQuery = (ev.target.value || "").trim();
          page = 1;
          renderList();
        }, 300)
      );
      s._raci_search_wired = true;
    }

    // --- Filters toggle + wing/subwing selects ---
    if (!modal.querySelector("#select-toggle-filters")) {
      const searchEl = modal.querySelector("#select-search");
      const togglediv = document.createElement("div");
      togglediv.className = "mb-2 d-flex justify-content-end";
      const btn = document.createElement("button");
      btn.id = "select-toggle-filters";
      btn.className = "btn btn-sm btn-outline-secondary";
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "Filters ▾";
      togglediv.appendChild(btn);
      body.insertBefore(
        togglediv,
        searchEl ? searchEl.nextSibling : body.firstChild
      );

      const filterContainer = document.createElement("div");
      filterContainer.id = "select-filters";
      filterContainer.style.display = "none";
      filterContainer.className = "mb-2";

      const row1 = document.createElement("div");
      row1.className = "d-flex gap-2 mb-2 align-items-center";

      const wsel = document.createElement("select");
      wsel.id = "select-filter-wing";
      wsel.className = "form-select";
      wsel.style.maxWidth = "200px";

      const ssel = document.createElement("select");
      ssel.id = "select-filter-subwing";
      ssel.className = "form-select";
      ssel.style.maxWidth = "200px";

      row1.appendChild(wsel);
      row1.appendChild(ssel);

      const row2 = document.createElement("div");
      row2.className = "d-flex align-items-center mb-2 gap-2";
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.id = "select-view-all";
      chk.style.marginRight = "6px";
      chk.checked = true;
      const lbl = document.createElement("label");
      lbl.htmlFor = "select-view-all";
      lbl.textContent = "View all users";
      row2.appendChild(chk);
      row2.appendChild(lbl);

      const row3 = document.createElement("div");
      row3.className = "d-flex justify-content-end gap-2";
      const btnFilterClear = document.createElement("button");
      btnFilterClear.type = "button";
      btnFilterClear.className = "btn btn-sm btn-outline-secondary";
      btnFilterClear.id = "select-filter-clear";
      btnFilterClear.textContent = "Clear Filters";
      const btnFilterApply = document.createElement("button");
      btnFilterApply.type = "button";
      btnFilterApply.className = "btn btn-sm btn-primary";
      btnFilterApply.id = "select-apply-filters";
      btnFilterApply.textContent = "Apply Filters";
      row3.appendChild(btnFilterClear);
      row3.appendChild(btnFilterApply);

      filterContainer.appendChild(row1);
      filterContainer.appendChild(row2);
      filterContainer.appendChild(row3);
      body.insertBefore(filterContainer, togglediv.nextSibling);

      btn.addEventListener("click", () => {
        const isShown = filterContainer.style.display !== "none";
        if (isShown) {
          filterContainer.style.display = "none";
          btn.setAttribute("aria-expanded", "false");
          btn.textContent = "Filters ▾";
          const viewAllEl = modal.querySelector("#select-view-all");
          if (viewAllEl) viewAllEl.checked = true;
        } else {
          filterContainer.style.display = "block";
          btn.setAttribute("aria-expanded", "true");
          btn.textContent = "Filters ▴";
          const viewAllEl = modal.querySelector("#select-view-all");
          if (viewAllEl) viewAllEl.checked = false;
        }
        // IMPORTANT: do NOT clear searchQuery here — search must remain active
        page = 1;
        renderList();
      });

      btnFilterApply.addEventListener("click", () => {
        const viewAllEl = modal.querySelector("#select-view-all");
        if (viewAllEl) viewAllEl.checked = false;
        page = 1;
        renderList();
      });
      btnFilterClear.addEventListener("click", () => {
        const fw = modal.querySelector("#select-filter-wing");
        const fs = modal.querySelector("#select-filter-subwing");
        const viewAllEl = modal.querySelector("#select-view-all");
        if (fw) fw.value = "";
        if (fs) fs.value = "";
        if (viewAllEl) viewAllEl.checked = true;
        // do not clear searchQuery — keep whatever user typed
        page = 1;
        renderList();
      });

      // populate wing filter immediately (if wings already available)
      populateWingFilter((getWings() || []).map((w) => w.name));

      // change wiring (to keep subwing list in sync)
      modal.addEventListener("change", (ev) => {
        if (!ev.target) return;
        if (ev.target.id === "select-filter-wing") {
          populateSubFilter("#select-filter-wing", "#select-filter-subwing");
          page = 1;
          renderList();
        }
        if (ev.target.id === "select-filter-subwing") {
          page = 1;
          renderList();
        }
        if (ev.target.id === "select-view-all") {
          page = 1;
          renderList();
        }
      });
    }

    // --- user list container ---
    if (!document.querySelector("#select-user-list")) {
      const list = document.createElement("div");
      list.id = "select-user-list";
      list.className = "list-group";
      const modal = document.querySelector(selectModalSelector);
      const body = modal.querySelector(".modal-body");
      body.appendChild(list);
    }

    // --- pagination container ---
    if (!document.querySelector("#selectUserListPagination")) {
      const pg = document.createElement("div");
      pg.id = "selectUserListPagination";
      pg.className = "d-flex align-items-center justify-content-between mt-2";
      const modal = document.querySelector(selectModalSelector);
      const body = modal.querySelector(".modal-body");
      body.appendChild(pg);
    }

    // --- footer save/clear wiring ---
    const modalEl = document.querySelector(selectModalSelector);
    if (!modalEl) return;
    const footerEl = modalEl.querySelector(".modal-footer");
    if (!footerEl) return;

    // If the app's HTML already includes Save/Clear, wire them. Otherwise create them.
    let btnClear = footerEl.querySelector("#select-user-clear");
    let btnSave = footerEl.querySelector("#select-user-save");

    if (!btnClear) {
      btnClear = document.createElement("button");
      btnClear.id = "select-user-clear";
      btnClear.className = "btn btn-outline-secondary";
      btnClear.textContent = "Clear";
      footerEl.appendChild(btnClear);
    }
    if (!btnSave) {
      btnSave = document.createElement("button");
      btnSave.id = "select-user-save";
      btnSave.className = "btn btn-primary";
      btnSave.textContent = "Save";
      footerEl.appendChild(btnSave);
    }

    // prevent attaching duplicate listeners
    btnClear.replaceWith(btnClear.cloneNode(true));
    btnSave.replaceWith(btnSave.cloneNode(true));
    btnClear = footerEl.querySelector("#select-user-clear");
    btnSave = footerEl.querySelector("#select-user-save");

    btnClear.addEventListener("click", () => {
      const pickRole = getTempPickRole();
      if (!pickRole) return;
      selectedIds.clear();
      setTempRaci({ ...getTempRaci(), [pickRole]: [] });
      // rerender so checkboxes reflect cleared state
      renderList();
      if (onClearCb) onClearCb();
    });

    btnSave.addEventListener("click", () => {
      applySelectionFromList();
      // hide modal (use provided instance or fallback)
      if (
        modalSelectInstance &&
        typeof modalSelectInstance.hide === "function"
      ) {
        modalSelectInstance.hide();
      } else {
        // fallback: try to find bootstrap Modal via DOM and call .hide
        try {
          const mEl = document.querySelector(selectModalSelector);
          if (mEl) {
            const bs =
              window.bootstrap &&
              bootstrap.Modal &&
              bootstrap.Modal.getInstance(mEl);
            if (bs && typeof bs.hide === "function") bs.hide();
            else mEl.classList.remove("show"); // fallback visual
          }
        } catch (e) {
          // ignore
        }
      }
      if (onSaveCb) onSaveCb();
    });
  }

  function open(role, filterWing = "", filterSub = "") {
    setTempPickRole(role);
    // initialize selectedIds from tempRaci for that role
    selectedIds = new Set((getTempRaci()[role] || []).map(String));

    const label = document.querySelector("#select-role-label");
    if (label) label.textContent = role.charAt(0).toUpperCase() + role.slice(1);

    ensureControls();

    const modal = document.querySelector(selectModalSelector);
    if (!modal) return;
    const filtersEl = modal.querySelector("#select-filters");
    const toggleBtn = modal.querySelector("#select-toggle-filters");
    const viewAllEl = modal.querySelector("#select-view-all");

    if (filterWing || filterSub) {
      if (filtersEl) filtersEl.style.display = "block";
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "true");
        toggleBtn.textContent = "Filters ▴";
      }
      if (modal.querySelector("#select-filter-wing")) {
        modal.querySelector("#select-filter-wing").value = filterWing || "";
        populateSubFilter("#select-filter-wing", "#select-filter-subwing");
      }
      if (modal.querySelector("#select-filter-subwing")) {
        modal.querySelector("#select-filter-subwing").value = filterSub || "";
      }
      if (viewAllEl) viewAllEl.checked = false;
    } else {
      if (filtersEl) filtersEl.style.display = "none";
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.textContent = "Filters ▾";
      }
      if (viewAllEl) viewAllEl.checked = true;
      if (modal.querySelector("#select-filter-wing"))
        modal.querySelector("#select-filter-wing").value = "";
      populateSubFilter("#select-filter-wing", "#select-filter-subwing");
      if (modal.querySelector("#select-filter-subwing"))
        modal.querySelector("#select-filter-subwing").value = "";
    }

    // DO NOT clear searchQuery or the input here — keep persistent behavior
    // ensureControls already restored the search input value

    page = 1;
    renderList();

    if (modalSelectInstance && typeof modalSelectInstance.show === "function") {
      modalSelectInstance.show();
    } else {
      // fallback: add .show class
      const mEl = document.querySelector(selectModalSelector);
      if (mEl) mEl.classList.add("show");
    }
  }

  function renderList() {
    const list = document.querySelector("#select-user-list");
    if (!list) return;
    list.innerHTML = "";
    const users = (getUsers() || []).slice();
    const monthData = getMonthData() || { tasks: [] };

    const modal = document.querySelector(selectModalSelector);
    // defensive: if modal not present, still use persisted values
    const viewAll =
      modal && modal.querySelector("#select-view-all")
        ? modal.querySelector("#select-view-all").checked
        : true;
    const fw =
      viewAll && modal
        ? ""
        : modal && modal.querySelector("#select-filter-wing")
        ? modal.querySelector("#select-filter-wing").value
        : "";
    const fs =
      viewAll && modal
        ? ""
        : modal && modal.querySelector("#select-filter-subwing")
        ? modal.querySelector("#select-filter-subwing").value
        : "";
    // prefer DOM value if present, otherwise fallback to persistent searchQuery
    const q =
      modal && modal.querySelector("#select-search")
        ? (modal.querySelector("#select-search").value || "")
            .trim()
            .toLowerCase()
        : (searchQuery || "").trim().toLowerCase();

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

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page > totalPages) page = totalPages;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    paged.forEach((u) => {
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
      const checked = selectedIds.has(String(u.id));
      right.innerHTML = `<input ${
        checked ? "checked" : ""
      } class="form-check-input select-uid" type="checkbox" data-uid="${
        u.id
      }" aria-label="select user">`;

      item.appendChild(left);
      item.appendChild(right);
      list.appendChild(item);
    });

    if (!paged.length)
      list.innerHTML =
        '<div class="small text-muted">No users matched the current filter.</div>';

    // wire checkbox change events for current page (persist to selectedIds)
    Array.from(list.querySelectorAll("input.select-uid")).forEach((cb) => {
      cb.addEventListener("change", (ev) => {
        const uid = ev.target.dataset.uid;
        if (!uid) return;
        if (ev.target.checked) selectedIds.add(String(uid));
        else selectedIds.delete(String(uid));
      });
    });

    renderPagination(total);
  }

  function renderPagination(totalItems) {
    const container = document.querySelector("#selectUserListPagination");
    if (!container) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const leftHtml = `<div class="d-flex align-items-center gap-2"><div class="small text-muted">Show</div><select id="selectUsersPageSizeSel" class="form-select form-select-sm" style="width:70px">
      <option value="5">5</option>
      <option value="8">8</option>
      <option value="15">15</option>
    </select></div>`;

    const maxButtons = 5;
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1)
      startPage = Math.max(1, endPage - maxButtons + 1);

    let pagesHtml = "";
    pagesHtml += `<button class="btn btn-sm btn-outline-secondary me-1" id="selectPrev">Prev</button>`;
    for (let p = startPage; p <= endPage; p++) {
      pagesHtml += `<button class="btn btn-sm ${
        p === page ? "btn-primary" : "btn-outline-secondary"
      } me-1 select-page-btn" data-page="${p}">${p}</button>`;
    }
    pagesHtml += `<button class="btn btn-sm btn-outline-secondary ms-1" id="selectNext">Next</button>`;

    const infoHtml = `<div class="small text-muted">${totalItems} users</div>`;

    container.innerHTML = `<div class="d-flex justify-content-between align-items-center">${leftHtml}<div>${pagesHtml}</div>${infoHtml}</div>`;

    const sel = document.getElementById("selectUsersPageSizeSel");
    if (sel) {
      sel.value = String(pageSize);
      sel.addEventListener("change", () => {
        pageSize = parseInt(sel.value, 10) || defaultPageSize;
        page = 1;
        renderList();
      });
    }
    document.getElementById("selectPrev")?.addEventListener("click", () => {
      if (page > 1) {
        page -= 1;
        renderList();
      }
    });
    document.getElementById("selectNext")?.addEventListener("click", () => {
      if (page < totalPages) {
        page += 1;
        renderList();
      }
    });
    (container.querySelectorAll(".select-page-btn") || []).forEach((b) =>
      b.addEventListener("click", () => {
        const p = parseInt(b.dataset.page, 10);
        if (!isNaN(p) && p !== page) {
          page = p;
          renderList();
        }
      })
    );
  }

  function applySelectionFromList() {
    const pickRole = getTempPickRole();
    if (!pickRole) return;
    // convert Set -> array, ensure strings match stored IDs type in rest of app
    const arr = Array.from(selectedIds);
    setTempRaci({ ...getTempRaci(), [pickRole]: arr });
  }

  function populateWingFilter(wingNames = []) {
    const el = document.querySelector("#select-filter-wing");
    if (!el) return;
    el.innerHTML =
      `<option value="">(all wings)</option>` +
      wingNames
        .map((n) => `<option value="${esc(n)}">${esc(n)}</option>`)
        .join("");
    populateSubFilter("#select-filter-wing", "#select-filter-subwing");
  }

  function populateSubFilter(wingSelector, subSelector) {
    const wingName = document.querySelector(wingSelector)?.value;
    const subEl = document.querySelector(subSelector);
    if (!subEl) return;
    const wings = getWings() || [];
    if (!wingName) {
      const allSubs = wings.reduce(
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
      const w = wings.find((x) => x.name === wingName);
      const subs = w ? (w.subwings || []).map((s) => s.name) : [];
      subEl.innerHTML =
        `<option value="">All Subwings</option>` +
        subs
          .map((s) => `<option value="${esc(s)}">${esc(s)}</option>`)
          .join("");
    }
  }

  function onSave(cb) {
    onSaveCb = cb;
  }
  function onClear(cb) {
    onClearCb = cb;
  }

  return {
    ensureControls,
    open,
    renderList,
    populateWingFilter,
    onSave,
    onClear,
  };
}
