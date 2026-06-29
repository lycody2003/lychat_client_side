<template>
  <div class="msg-row" :class="{ mine: isMine }">
    <div v-if="!isMine" class="avatar">{{ initials(message.sender?.username) }}</div>
    <div class="bubble-wrap">
      <span v-if="!isMine" class="sender-name">{{ message.sender?.username }}</span>
      <div class="bubble" :class="{ mine: isMine }">
        <p>{{ message.text }}</p>
      </div>
      <span class="time">{{ formatTime(message.createdAt) }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  message: Object,
  isMine: Boolean,
});

function initials(name) {
  return name ? name.slice(0, 2).toUpperCase() : "?";
}

function formatTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
</script>

<style scoped>
.msg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  align-items: flex-end;
}

.msg-row.mine {
  flex-direction: row-reverse;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5b8cff, #7c4dff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 60%;
}

.msg-row.mine .bubble-wrap {
  align-items: flex-end;
}

.sender-name {
  font-size: 11.5px;
  color: #8e8ea3;
  margin-bottom: 3px;
  padding-left: 4px;
}

.bubble {
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  color: #e6e6f0;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.bubble.mine {
  background: linear-gradient(135deg, #7c4dff, #5b8cff);
  color: white;
}

.time {
  font-size: 10.5px;
  color: #5a5a70;
  margin-top: 3px;
  padding: 0 4px;
}
</style>
