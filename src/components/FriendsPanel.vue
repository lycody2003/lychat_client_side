<template>
  <div class="friends-panel">
    <div class="search-box">
      <input v-model="query" placeholder="Search by username..." @input="search" />
    </div>

    <div v-if="searchResults.length" class="section">
      <h4>Results</h4>
      <div v-for="u in searchResults" :key="u._id" class="row">
        <div class="avatar">{{ initials(u.username) }}</div>
        <span class="uname">{{ u.username }}</span>
        <button class="small-btn" @click="addFriend(u._id)">Add</button>
      </div>
    </div>

    <div v-if="incomingRequests.length" class="section">
      <h4>Friend Requests</h4>
      <div v-for="r in incomingRequests" :key="r._id" class="row">
        <div class="avatar">{{ initials(r.from.username) }}</div>
        <span class="uname">{{ r.from.username }}</span>
        <button class="small-btn accept" @click="accept(r._id)">✓</button>
        <button class="small-btn reject" @click="reject(r._id)">✕</button>
      </div>
    </div>

    <div class="section">
      <h4>Friends ({{ friends.length }})</h4>
      <div v-if="!friends.length" class="empty">No friends yet — search above to add some!</div>
      <div v-for="f in friends" :key="f._id" class="row clickable" @click="$emit('open-dm', f)">
        <div class="avatar">
          {{ initials(f.username) }}
          <span class="dot" :class="{ on: f.status === 'online' }"></span>
        </div>
        <span class="uname">{{ f.username }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../composables/api";

defineEmits(["open-dm"]);

const query = ref("");
const searchResults = ref([]);
const friends = ref([]);
const incomingRequests = ref([]);

let searchTimeout = null;
function search() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (!query.value.trim()) return (searchResults.value = []);
    const { data } = await api.get("/friends/search", { params: { q: query.value.trim() } });
    searchResults.value = data;
  }, 300);
}

async function loadFriends() {
  const { data } = await api.get("/friends");
  friends.value = data;
}

async function loadRequests() {
  const { data } = await api.get("/friends/requests");
  incomingRequests.value = data;
}

async function addFriend(userId) {
  await api.post("/friends/requests", { toUserId: userId });
  searchResults.value = searchResults.value.filter((u) => u._id !== userId);
}

async function accept(requestId) {
  await api.post(`/friends/requests/${requestId}/accept`);
  incomingRequests.value = incomingRequests.value.filter((r) => r._id !== requestId);
  await loadFriends();
}

async function reject(requestId) {
  await api.post(`/friends/requests/${requestId}/reject`);
  incomingRequests.value = incomingRequests.value.filter((r) => r._id !== requestId);
}

function initials(name) {
  return name ? name.slice(0, 2).toUpperCase() : "?";
}

onMounted(() => {
  loadFriends();
  loadRequests();
});

defineExpose({ loadFriends, loadRequests });
</script>

<style scoped>
.friends-panel {
  padding: 12px 14px;
  overflow-y: auto;
  flex: 1;
  font-family: "Inter", system-ui, sans-serif;
}

.search-box input {
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 13px;
  outline: none;
  margin-bottom: 14px;
}
.search-box input:focus { border-color: #7c4dff; }

.section { margin-bottom: 18px; }

.section h4 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c6c84;
  margin: 0 0 8px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 6px;
  border-radius: 8px;
}

.row.clickable { cursor: pointer; }
.row.clickable:hover { background: rgba(255, 255, 255, 0.05); }

.avatar {
  position: relative;
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

.dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #5a5a70;
  border: 2px solid #14151f;
}
.dot.on { background: #4ade80; }

.uname {
  flex: 1;
  font-size: 13.5px;
  color: #d8d8e8;
}

.small-btn {
  border: none;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  background: #7c4dff;
  color: white;
}

.small-btn.accept { background: #22c55e; }
.small-btn.reject { background: #ef4444; padding: 5px 9px; }

.empty {
  color: #5a5a70;
  font-size: 12.5px;
}
</style>
