// ══════════════════════════════════════
// storage.js — localStorage with per-user namespacing
// All keys prefixed with ats:{userId}: so each user's
// resumes, scans, chats stay separate
// ══════════════════════════════════════

import { getCurrentUserId } from "../hooks/useAuth";

function prefix(key) {
  var userId = getCurrentUserId();
  return "ats:" + userId + ":" + key;
}

export function get(key) {
  try {
    var raw = localStorage.getItem(prefix(key));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(prefix(key), JSON.stringify(value));
  } catch (e) {}
}

export function remove(key) {
  localStorage.removeItem(prefix(key));
}