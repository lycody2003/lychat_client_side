<template>
  <AuthView v-if="!user" @authenticated="onAuthenticated" />

  <div v-else class="app-layout">
    <ChatSidebar
      :user="user"
      :rooms="rooms"
      :active-room-id="activeRoom?._id"
      @select-room="selectRoom"
      @create-room="createRoom"
      @logout="onLogout"
      @open-dm="openDM"
    />
    <ChatWindow
      :room="activeRoom"
      :messages="messages"
      :current-user-id="user?.id"
      :typing-users="typingUsernames"
      @send="sendMessage"
      @typing="handleTyping"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import AuthView from "./components/AuthView.vue";
import ChatSidebar from "./components/ChatSidebar.vue";
import ChatWindow from "./components/ChatWindow.vue";
import { useAuth } from "./composables/useAuth";
import { useSocket } from "./composables/useSocket";
import api from "./composables/api";

const { user, logout } = useAuth();
const { connect, disconnect, getSocket } = useSocket();

const rooms = ref([]);
const activeRoom = ref(null);
const messages = ref([]);
const typingUsernames = ref([]);
const typingClearTimers = {};

async function onAuthenticated() {
  await bootstrap();
}

async function bootstrap() {
  connect();
  await loadRooms();
  bindSocketEvents();
}

async function loadRooms() {
  const { data } = await api.get("/rooms");
  rooms.value = data;
}

async function openDM(friend) {
  const { data: room } = await api.post(`/friends/${friend._id}/dm`);
  // tag it so Sidebar/ChatWindow can show friend's name instead of room.name if needed
  room.name = room.name || friend.username;
  selectRoom(room);
}

async function createRoom(name) {
  const { data } = await api.post("/rooms", { name });
  rooms.value.unshift(data);
  selectRoom(data);
}

async function selectRoom(room) {
  const socket = getSocket();
  if (activeRoom.value) socket?.emit("room:leave", { roomId: activeRoom.value._id });

  activeRoom.value = room;
  typingUsernames.value = [];
  socket?.emit("room:join", { roomId: room._id });

  const { data } = await api.get(`/messages/${room._id}`);
  messages.value = data;
}

function sendMessage(text) {
  const socket = getSocket();
  if (!activeRoom.value) return;
  socket?.emit("message:send", { roomId: activeRoom.value._id, text });
}

function handleTyping(isTyping) {
  const socket = getSocket();
  if (!activeRoom.value) return;
  socket?.emit(isTyping ? "typing:start" : "typing:stop", { roomId: activeRoom.value._id });
}

function bindSocketEvents() {
  const socket = getSocket();
  if (!socket) return;

  socket.on("message:new", (msg) => {
    if (activeRoom.value && msg.room === activeRoom.value._id) {
      messages.value.push(msg);
    }
  });

  socket.on("typing:start", ({ roomId, username }) => {
    if (activeRoom.value?._id !== roomId) return;
    if (!typingUsernames.value.includes(username)) typingUsernames.value.push(username);
    clearTimeout(typingClearTimers[username]);
    typingClearTimers[username] = setTimeout(() => {
      typingUsernames.value = typingUsernames.value.filter((u) => u !== username);
    }, 2000);
  });


}

function onLogout() {
  disconnect();
  logout();
  rooms.value = [];
  activeRoom.value = null;
  messages.value = [];
}

onMounted(() => {
  if (user.value) bootstrap();
});

onBeforeUnmount(() => disconnect());
</script>

<style>
* { box-sizing: border-box; }
body { margin: 0; }

.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
</style>
