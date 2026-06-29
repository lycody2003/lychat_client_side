import { ref } from "vue";
import api from "./api";

function safeGet(key) {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  } catch {
  }
}

function safeRemove(key) {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  } catch {
  }
}

const user = ref(JSON.parse(safeGet("lychat_user") || "null"));

export function useAuth() {
  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    safeSet("lychat_token", data.token);
    safeSet("lychat_user", JSON.stringify(data.user));
    user.value = data.user;
    return data.user;
  }

  async function register(username, email, password) {
    const { data } = await api.post("/auth/register", { username, email, password });
    safeSet("lychat_token", data.token);
    safeSet("lychat_user", JSON.stringify(data.user));
    user.value = data.user;
    return data.user;
  }

  function logout() {
    api.post("/auth/logout").catch(() => {});
    safeRemove("lychat_token");
    safeRemove("lychat_user");
    user.value = null;
  }

  return { user, login, register, logout };
}