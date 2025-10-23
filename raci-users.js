// raci-users.js
// exports createUsersModule(opts)
// opts:
//  - getUsers(): returns users array
//  - getMonthData(): returns monthData
//  - makeAvatarElement(user, size)
//  - esc, idEq
//  - showUserDetail(user)
//  - containerRootSelector: where to append the users template (app passes "#view-container")
//  - usersTplId: id of the template element (default "users-tpl")
//  - defaultPageSize: number

export function createUsersModule(opts = {}) {
  const {
    getUsers,
    getMonthData,
    makeAvatarElement,
    esc,
    idEq,
    showUserDetail,
    containerRootSelector = "#view-container",
    usersTplId = "users-tpl",
    defaultPageSize = 10,
  } = opts;

  let page = 1;
  let pageSize = defaultPageSize;

  // preserved node reference (the actual DOM node, not HTML)
  let _preservedUserDetailNode = null;
  // single delegated list click handler reference (so we can remove it)
  let _listClickHandler = null;

  // ---------- helpers ----------

  function uniqueArray(arr) {
    return Array.from(new Set((arr || []).filter(Boolean)));
  }

  // detach #user-detail (or #userDetail) node and store reference
  function detachUserDetailNode() {
    try {
      const existing =
        document.getElementById("user-detail") ||
        document.getElementById("userDetail");
      if (existing && existing.parentNode) {
        _preservedUserDetailNode = existing.parentNode.removeChild(existing);
      } else {
        _preservedUserDetailNode = null;
      }
    } catch (e) {
      console.error("raci-users: detachUserDetailNode error", e);
      _preservedUserDetailNode = null;
    }
  }

  // re-attach preserved node to the DOM (replace placeholder if present)
  function reattachUserDetailNode(root) {
    try {
      if (!_preservedUserDetailNode) return;

      const placeholder =
        document.getElementById("user-detail") ||
        document.getElementById("userDetail");

      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.replaceChild(
          _preservedUserDetailNode,
          placeholder
        );
      } else {
        const usersList = document.getElementById("usersList");
        if (usersList && usersList.parentNode) {
          usersList.parentNode.insertBefore(
            _preservedUserDetailNode,
            usersList.nextSibling
          );
        } else if (root) {
          root.appendChild(_preservedUserDetailNode);
        } else {
          document.body.appendChild(_preservedUserDetailNode);
        }
      }

      _preservedUserDetailNode = null;
    } catch (e) {
      console.error("raci-users: reattachUserDetailNode error", e);
      _preservedUserDetailNode = null;
    }
  }

  // populate wing filter from users and monthData tasks
  function populateWingFilterOptions(selectedValue = "") {
    const wingEl = document.getElementById("userFilterWing");
    if (!wingEl) return;
    const users = getUsers() || [];
    const monthData = getMonthData() || { tasks: [] };

    const userWings = users.map((u) => u.wing).filter(Boolean);
    const taskWings = (monthData.tasks || [])
      .map((t) => t.wing)
      .filter(Boolean);
    const all = uniqueArray([...userWings, ...taskWings]).sort((a, b) =>
      String(a).localeCompare(String(b))
    );

    const opts =
      `<option value="">All Wings</option>` +
      all.map((w) => `<option value="${esc(w)}">${esc(w)}</option>`).join("");
    wingEl.innerHTML = opts;
    if (selectedValue) wingEl.value = selectedValue;
  }

  // ---------- render view ----------
  async function render() {
    const root = document.querySelector(containerRootSelector);
    if (!root) return;

    // Preserve user-detail node to keep its state & listeners
    detachUserDetailNode();

    // Clear and clone template
    root.innerHTML = "";
    const tpl = document.getElementById(usersTplId);
    if (!tpl) {
      root.innerHTML =
        '<div class="card p-4 small text-muted">Users template missing</div>';
      if (_preservedUserDetailNode) {
        root.appendChild(_preservedUserDetailNode);
        _preservedUserDetailNode = null;
      }
      return;
    }

    root.appendChild(tpl.content.cloneNode(true));

    // Reattach preserved user-detail node (replaces placeholder if exists)
    reattachUserDetailNode(root);

    // Populate wing filter options (so wings show up)
    populateWingFilterOptions();

    // wire filters with safe removal of existing handlers
    const searchEl = document.getElementById("searchUser");
    const wingEl = document.getElementById("userFilterWing");

    if (searchEl) {
      if (searchEl.__raci_bound_input)
        searchEl.removeEventListener("input", searchEl.__raci_bound_input);
      const onInput = () => {
        page = 1;
        renderList();
      };
      searchEl.__raci_bound_input = onInput;
      searchEl.addEventListener("input", onInput);
    }
    if (wingEl) {
      if (wingEl.__raci_bound_change)
        wingEl.removeEventListener("change", wingEl.__raci_bound_change);
      const onChange = () => {
        page = 1;
        renderList();
      };
      wingEl.__raci_bound_change = onChange;
      wingEl.addEventListener("change", onChange);
    }

    // ensure pagination container exists (placed below #usersList)
    const usersList = document.getElementById("usersList");
    if (usersList && !document.getElementById("usersListPagination")) {
      const pg = document.createElement("div");
      pg.id = "usersListPagination";
      pg.className = "mt-2";
      usersList.parentNode.appendChild(pg);
    }

    await renderList();
  }

  // ---------- render list ----------
  async function renderList() {
    const list = document.getElementById("usersList");
    if (!list) return;
    list.innerHTML = "";

    const users = getUsers() || [];
    const monthData = getMonthData() || { tasks: [] };

    // refresh wing filter options each render (keeps it up-to-date)
    const wingFilterEl = document.getElementById("userFilterWing");
    const currentWingVal = wingFilterEl ? wingFilterEl.value : "";
    populateWingFilterOptions(currentWingVal);

    const qEl = document.getElementById("searchUser");
    const q = qEl ? (qEl.value || "").trim().toLowerCase() : "";
    const wingFilter = wingFilterEl ? wingFilterEl.value : "";

    if (!users.length) {
      list.innerHTML = '<div class="small text-muted">No users yet</div>';
      renderPagination(0);
      return;
    }

    const filtered = users.filter((u) => {
      if (wingFilter) {
        const inProfile = (u.wing || "") === wingFilter;
        const present = (monthData.tasks || []).some(
          (t) =>
            t.wing === wingFilter &&
            ["responsible", "accountable", "consulted", "informed"].some((r) =>
              (t[r] || []).some((i) => idEq(i, u.id))
            )
        );
        if (!inProfile && !present) return false;
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

    if (!paged.length) {
      list.innerHTML =
        '<div class="small text-muted">No users matched the current filter.</div>';
      renderPagination(total);
      return;
    }

    paged.forEach((u) => {
      const item = document.createElement("div");
      item.className =
        "list-group-item d-flex align-items-center justify-content-between";

      const left = document.createElement("div");
      left.className = "d-flex align-items-center gap-3";

      // avatar element must expose data-avatar-user-id so global listeners can pick it up
      const avatarEl = makeAvatarElement(u, 36);
      try {
        if (avatarEl && avatarEl.setAttribute)
          avatarEl.setAttribute("data-avatar-user-id", u.id);
      } catch (e) {
        /* ignore */
      }
      left.appendChild(avatarEl);

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
      right.innerHTML = `<button class="btn btn-sm btn-outline-secondary btn-view" data-id="${
        u.id
      }" aria-label="View user ${esc(
        u.name
      )}"><i class="fa fa-eye"></i></button>`;

      item.appendChild(left);
      item.appendChild(right);
      list.appendChild(item);
    });

    // delegated click handling for this list - remove old listener if any
    if (_listClickHandler) list.removeEventListener("click", _listClickHandler);

    _listClickHandler = function (ev) {
      const target = ev.target;
      const clickable =
        target.closest &&
        (target.closest(".user-name.clickable") ||
          target.closest(".btn-view") ||
          target.closest("[data-avatar-user-id]"));
      if (!clickable) return;
      const id =
        clickable.dataset.id || clickable.getAttribute("data-avatar-user-id");
      if (!id) return;
      const u = (getUsers() || []).find((x) => idEq(x.id, id));
      if (u) {
        try {
          showUserDetail(u);
        } catch (e) {
          console.error("raci-users: showUserDetail threw", e);
        }
      }
    };

    list.addEventListener("click", _listClickHandler);

    // ensure global avatar listener (only attached once)
    if (!document.__raci_users_global_avatar_attached) {
      document.addEventListener("click", (ev) => {
        const avatar =
          ev.target.closest && ev.target.closest("[data-avatar-user-id]");
        if (!avatar) return;
        const id = avatar.getAttribute("data-avatar-user-id");
        if (!id) return;
        const u = (getUsers() || []).find((x) => idEq(x.id, id));
        if (!u) return;
        const usersListEl = document.getElementById("usersList");
        if (usersListEl) {
          try {
            showUserDetail(u);
          } catch (e) {
            console.error("raci-users: global avatar showUserDetail error", e);
          }
        } else {
          // Not in users view; app should handle navigation to users view then call usersModule.render() and showUserDetail
        }
      });
      document.__raci_users_global_avatar_attached = true;
    }

    renderPagination(total);
  }

  // ---------- pagination ----------
  function renderPagination(totalItems) {
    const container = document.getElementById("usersListPagination");
    if (!container) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const leftHtml = `<div class="d-flex align-items-center gap-2"><div class="small text-muted">Show</div><select id="usersPageSizeSel" class="form-select form-select-sm" style="width:70px">
      <option value="5">5</option>
      <option value="10">10</option>
      <option value="25">25</option>
      <option value="50">50</option>
    </select>`;

    const maxButtons = 7;
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1)
      startPage = Math.max(1, endPage - maxButtons + 1);

    let pagesHtml = "";
    pagesHtml += `<button class="btn btn-sm btn-outline-secondary me-1" id="usersPrev">Prev</button>`;
    for (let p = startPage; p <= endPage; p++) {
      pagesHtml += `<button class="btn btn-sm ${
        p === page ? "btn-primary" : "btn-outline-secondary"
      } me-1 page-btn" data-page="${p}">${p}</button>`;
    }
    pagesHtml += `<button class="btn btn-sm btn-outline-secondary ms-1" id="usersNext">Next</button>`;

    const infoHtml = `<div class="small text-muted">${totalItems} users</div>`;

    container.innerHTML = `<div class="d-flex justify-content-between align-items-center">${leftHtml}<div>${pagesHtml}</div>${infoHtml}</div>`;

    const sel = document.getElementById("usersPageSizeSel");
    if (sel) {
      sel.value = String(pageSize);
      if (sel.__raci_bound_change)
        sel.removeEventListener("change", sel.__raci_bound_change);
      sel.__raci_bound_change = () => {
        pageSize = parseInt(sel.value, 10) || defaultPageSize;
        page = 1;
        renderList();
      };
      sel.addEventListener("change", sel.__raci_bound_change);
    }

    document.getElementById("usersPrev")?.addEventListener("click", () => {
      if (page > 1) {
        page -= 1;
        renderList();
      }
    });
    document.getElementById("usersNext")?.addEventListener("click", () => {
      if (page < totalPages) {
        page += 1;
        renderList();
      }
    });

    (container.querySelectorAll(".page-btn") || []).forEach((b) =>
      b.addEventListener("click", () => {
        const p = parseInt(b.dataset.page, 10);
        if (!isNaN(p) && p !== page) {
          page = p;
          renderList();
        }
      })
    );
  }

  // ---------- public API ----------
  return {
    render, // render view + list
    renderList,
    setPageSize: (n) => {
      pageSize = n;
      page = 1;
    },
    resetPage: () => (page = 1),
  };
}
