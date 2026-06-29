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

interface User {
  _id: string;
  username: string;
  status?: string;
}

interface FriendRequest {
  _id: string;
  from: User;
}

defineEmits<{ "open-dm": [friend: User] }>();

const query = ref("");
const searchResults = ref<User[]>([]);
const friends = ref<User[]>([]);
const incomingRequests = ref<FriendRequest[]>([]);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function search() {
  clearTimeout(searchTimeout ?? undefined);
  searchTimeout = setTimeout(async () => {
    if (!query.value.trim()) {
      searchResults.value = [];
      return;
    }
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

async function addFriend(userId: string) {
  await api.post("/friends/requests", { toUserId: userId });
  searchResults.value = searchResults.value.filter((u) => u._id !== userId);
}

async function accept(requestId: string) {
  await api.post(`/friends/requests/${requestId}/accept`);
  incomingRequests.value = incomingRequests.value.filter((r) => r._id !== requestId);
  await loadFriends();
}

async function reject(requestId: string) {
  await api.post(`/friends/requests/${requestId}/reject`);
  incomingRequests.value = incomingRequests.value.filter((r) => r._id !== requestId);
}

function initials(name: string) {
  return name ? name.slice(0, 2).toUpperCase() : "?";
}

onMounted(() => {
  loadFriends();
  loadRequests();
});

defineExpose({ loadFriends, loadRequests });
</script>