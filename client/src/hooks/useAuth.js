// ══════════════════════════════════════
// useAuth.js — Simple two-user auth
// Stores current user in localStorage
// Namespaces all app data per user
// ══════════════════════════════════════

import { useState, useEffect } from "react";

var USERS = [
  { id: "daniel", name: "Daniel", password: "iGoMango10!" },
  { id: "brittany", name: "Brittany", password: "IcePrincess" },
];

export function useAuth() {
  var _user = useState(null);
  var user = _user[0], setUser = _user[1];
  var _loading = useState(true);
  var loading = _loading[0], setLoading = _loading[1];

  useEffect(function () {
    var saved = localStorage.getItem("ats:currentUser");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) {}
    }
    setLoading(false);
  }, []);

  function login(username, password) {
    var lower = username.toLowerCase().trim();
    for (var i = 0; i < USERS.length; i++) {
      if (USERS[i].id === lower && USERS[i].password === password) {
        var userData = { id: USERS[i].id, name: USERS[i].name };
        setUser(userData);
        localStorage.setItem("ats:currentUser", JSON.stringify(userData));
        return { success: true };
      }
    }
    return { success: false, error: "Invalid username or password" };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("ats:currentUser");
  }

  return { user: user, loading: loading, login: login, logout: logout };
}

export function getCurrentUserId() {
  try {
    var saved = localStorage.getItem("ats:currentUser");
    if (saved) return JSON.parse(saved).id;
  } catch (e) {}
  return "default";
}