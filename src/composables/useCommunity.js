import { computed, ref } from "vue";

const LS_LISTS = "mf_lists_v1";
const LS_RATINGS = "mf_ratings_v1";
const LS_COMMENTS = "mf_comments_v1";

// singleton state (shared across app)
const lists = ref(loadJSON(LS_LISTS, []));
const ratings = ref(loadJSON(LS_RATINGS, {}));
const comments = ref(loadJSON(LS_COMMENTS, {}));

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function keyOf(type, id) {
  return `${type}:${id}`;
}

export function useCommunity() {
  // ===== LISTS =====
  const allLists = computed(() => lists.value);

  function createList(name) {
    const n = (name || "").trim();
    if (!n) return null;

    const newList = {
      id: uid("list"),
      name: n,
      createdAt: new Date().toISOString(),
      items: [], // { type, id, label, poster_path, year, addedAt }
    };

    lists.value = [newList, ...lists.value];
    saveJSON(LS_LISTS, lists.value);
    return newList;
  }

  function renameList(listId, name) {
    const n = (name || "").trim();
    if (!n) return;

    lists.value = lists.value.map((l) => (l.id === listId ? { ...l, name: n } : l));
    saveJSON(LS_LISTS, lists.value);
  }

  function deleteList(listId) {
    lists.value = lists.value.filter((l) => l.id !== listId);
    saveJSON(LS_LISTS, lists.value);
  }

  function listHas(listId, type, id) {
    const l = lists.value.find((x) => x.id === listId);
    if (!l) return false;
    return l.items.some((it) => it.type === type && String(it.id) === String(id));
  }

  function addToList(listId, type, item) {
    if (!item?.id) return;

    lists.value = lists.value.map((l) => {
      if (l.id !== listId) return l;

      const exists = l.items.some((it) => it.type === type && String(it.id) === String(item.id));
      if (exists) return l;

      const label = item.title || item.name || "Untitled";
      const year =
        (item.release_date || item.first_air_date || "").slice(0, 4) || "";

      const entry = {
        type,
        id: item.id,
        label,
        poster_path: item.poster_path || null,
        year,
        addedAt: new Date().toISOString(),
      };

      return { ...l, items: [entry, ...l.items] };
    });

    saveJSON(LS_LISTS, lists.value);
  }

  function removeFromList(listId, type, id) {
    lists.value = lists.value.map((l) => {
      if (l.id !== listId) return l;
      return {
        ...l,
        items: l.items.filter((it) => !(it.type === type && String(it.id) === String(id))),
      };
    });

    saveJSON(LS_LISTS, lists.value);
  }

  function toggleInList(listId, type, item) {
    if (!item?.id) return;
    if (listHas(listId, type, item.id)) removeFromList(listId, type, item.id);
    else addToList(listId, type, item);
  }

  // ===== RATINGS =====
  function getRating(type, id) {
    return ratings.value[keyOf(type, id)] ?? null;
  }

  function setRating(type, id, value) {
    const v = Number(value);
    const k = keyOf(type, id);

    if (!Number.isFinite(v) || v < 1 || v > 10) {
      delete ratings.value[k];
    } else {
      ratings.value[k] = v;
    }

    saveJSON(LS_RATINGS, ratings.value);
  }

  function clearRating(type, id) {
    const k = keyOf(type, id);
    delete ratings.value[k];
    saveJSON(LS_RATINGS, ratings.value);
  }

  // ===== COMMENTS =====
  function getComments(type, id) {
    const k = keyOf(type, id);
    return comments.value[k] || [];
  }

  function addComment(type, id, text) {
    const t = (text || "").trim();
    if (!t) return;

    const k = keyOf(type, id);
    const entry = {
      id: uid("c"),
      text: t,
      createdAt: new Date().toISOString(),
    };

    comments.value[k] = [entry, ...(comments.value[k] || [])];
    saveJSON(LS_COMMENTS, comments.value);
  }

  function deleteComment(type, id, commentId) {
    const k = keyOf(type, id);
    comments.value[k] = (comments.value[k] || []).filter((c) => c.id !== commentId);
    saveJSON(LS_COMMENTS, comments.value);
  }

  return {
    // lists
    allLists,
    createList,
    renameList,
    deleteList,
    listHas,
    addToList,
    removeFromList,
    toggleInList,

    // ratings
    getRating,
    setRating,
    clearRating,

    // comments
    getComments,
    addComment,
    deleteComment,
  };
}
