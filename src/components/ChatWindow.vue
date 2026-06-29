<template>
  <main class="chat-window">
    <header class="chat-header">
      <div>
        <h2># {{ room?.name || "Select a channel" }}</h2>
        <p v-if="room?.description">{{ room.description }}</p>
      </div>
      <div class="typing" v-if="typingUsers.length">
        {{ typingUsers.join(", ") }} {{ typingUsers.length > 1 ? "are" : "is" }} typing...
      </div>
    </header>

    <div class="messages" ref="messagesEl">
      <MessageBubble
        v-for="msg in messages"
        :key="msg._id"
        :message="msg"
        :is-mine="msg.sender?._id === currentUserId || msg.sender === currentUserId"
      />
      <p v-if="room && !messages.length" class="empty-state">No messages yet. Say hi! 👋</p>
      <p v-if="!room" class="empty-state">Pick a channel from the sidebar to start chatting.</p>
    </div>

    <form v-if="room" class="input-bar" @submit.prevent="send">
      <input
        v-model="text"
        type="text"
        placeholder="Type a message..."
        @input="onTyping"
      />
      <button type="submit" :disabled="!text.trim()">➤</button>
    </form>
  </main>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import MessageBubble from "./MessageBubble.vue";

const props = defineProps({
  room: Object,
  messages: { type: Array, default: () => [] },
  currentUserId: String,
  typingUsers: { type: Array, default: () => [] },
});
const emit = defineEmits(["send", "typing"]);

const text = ref("");
const messagesEl = ref(null);

function send() {
  if (!text.value.trim()) return;
  emit("send", text.value.trim());
  text.value = "";
}

let typingTimeout = null;
function onTyping() {
  emit("typing", true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => emit("typing", false), 1500);
}

watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
  }
);
</script>

<style scoped>
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0c0d1a;
  font-family: "Inter", system-ui, sans-serif;
}

.chat-header {
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h2 {
  color: white;
  font-size: 17px;
  margin: 0;
}

.chat-header p {
  color: #6c6c84;
  font-size: 12.5px;
  margin: 2px 0 0;
}

.typing {
  font-size: 12px;
  color: #00e0c6;
  font-style: italic;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-state {
  color: #5a5a70;
  text-align: center;
  margin-top: 60px;
  font-size: 14px;
}

.input-bar {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.input-bar input {
  flex: 1;
  padding: 13px 16px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 14px;
  outline: none;
}

.input-bar input:focus {
  border-color: #7c4dff;
}

.input-bar button {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #7c4dff, #00e0c6);
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
}

.input-bar button:hover {
  transform: scale(1.05);
}

.input-bar button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.messages::-webkit-scrollbar { width: 6px; }
.messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
</style>
