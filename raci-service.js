// raci-service.js
// API helpers + service wrappers + local storage fallback
export const API_ROOT = "/raci/api";

async function safeFetchText(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    return { ok: true, status: res.status, text };
  } catch (err) {
    return { ok: false, status: 0, error: String(err) };
  }
}
export async function safeFetchJSON(url, opts = {}) {
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

export async function apiGet(path) {
  return await safeFetchJSON(API_ROOT + path, { credentials: "same-origin" });
}
export async function apiPost(path, body) {
  return await safeFetchJSON(API_ROOT + path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
export async function apiDelete(path) {
  return await safeFetchJSON(API_ROOT + path, {
    method: "DELETE",
    credentials: "same-origin",
  });
}

// local storage fallback
const localPrefix = "raci_";
export function localLoadMonth(m) {
  try {
    return JSON.parse(localStorage.getItem(localPrefix + m) || '{"tasks":[]}');
  } catch (e) {
    return { tasks: [] };
  }
}
export function localSaveMonth(m, obj) {
  localStorage.setItem(localPrefix + m, JSON.stringify(obj || { tasks: [] }));
}

// service wrappers (normalize server responses)
export async function serviceLoadUsers() {
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

export async function serviceLoadWings() {
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

export async function serviceLoadMonth(m) {
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

export async function serviceSaveTask(taskObj) {
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
    // showToast called by app layer
    return { ok: true, source: "server", resp: r.data };
  }
  // error handling for common server errors
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
    const idx = local.tasks.findIndex(
      (t) => String(t.id) === String(taskObj.id)
    );
    if (idx >= 0) local.tasks[idx] = taskObj;
    else local.tasks.push(taskObj);
    localSaveMonth(m, local);
    return { ok: true, source: "local" };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function serviceDeleteTask(taskId, month) {
  const r = await apiDelete(`/raci.php?id=${encodeURIComponent(taskId)}`);
  if (r.ok) {
    try {
      await serviceLoadMonth(month || new Date().toISOString().slice(0, 7));
    } catch (e) {}
    return { ok: true, source: "server", resp: r.data };
  }
  // remove locally
  try {
    const local = localLoadMonth(month || new Date().toISOString().slice(0, 7));
    local.tasks = (local.tasks || []).filter(
      (t) => String(t.id) !== String(taskId)
    );
    localSaveMonth(month || new Date().toISOString().slice(0, 7), local);
    return { ok: true, source: "local" };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
