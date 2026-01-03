const KEY_V2 = "mf_favs_v2";
const KEY_OLD = "mf_favs"; // your old movie-only list

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function migrateIfNeeded() {
  const v2 = readJSON(KEY_V2, null);
  if (v2) return;

  const old = readJSON(KEY_OLD, []);
  // old format: [123, 456]
  const migrated = Array.isArray(old)
    ? old.map((id) => ({ type: "movie", id }))
    : [];

  writeJSON(KEY_V2, migrated);
}

export function useFavorites() {
  migrateIfNeeded();

  function list() {
    return readJSON(KEY_V2, []);
  }

  function has(type, id) {
    return list().some((x) => x.type === type && x.id === Number(id));
  }

  function toggle(type, id) {
    const cur = list();
    const nid = Number(id);
    const idx = cur.findIndex((x) => x.type === type && x.id === nid);
    if (idx >= 0) cur.splice(idx, 1);
    else cur.unshift({ type, id: nid });
    writeJSON(KEY_V2, cur);
    return cur;
  }

  function remove(type, id) {
    const cur = list().filter((x) => !(x.type === type && x.id === Number(id)));
    writeJSON(KEY_V2, cur);
    return cur;
  }

  function clear() {
    writeJSON(KEY_V2, []);
    return [];
  }

  return { list, has, toggle, remove, clear };
}
