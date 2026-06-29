import { ref } from "vue";
import api from "./api";

const user = ref(JSON.parse(localStorage.getItem("lychat_user") || "null"));

export function useAuth() {
  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("lychat_token", data.token);
    localStorage.setItem("lychat_user", JSON.stringify(data.user));
    user.value = data.user;
    return data.user;
  }

  async function register(username, email, password) {
    const { data } = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("lychat_token", data.token);
    localStorage.setItem("lychat_user", JSON.stringify(data.user));
    user.value = data.user;
    return data.user;
  }

  function logout() {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("lychat_token");
    localStorage.removeItem("lychat_user");
    user.value = null;
  }

  return { user, login, register, logout };
}
