// main.js — Docker-ready, uses Nginx proxy paths

// API endpoints (proxied through Nginx)
const apiEndpoints = {
  users: "/api/users",  // hydra-api1
  data2: "/api2/data",  // hydra-api2
  data3: "/api3/data"   // hydra-api3
};

// Utility function to fetch JSON with error handling
async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err);
    return null;
  }
}

// Populate list helper
function populateList(containerId, items, emptyMessage = "No data available") {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (!items || !items.length) {
    container.innerHTML = `<li>${emptyMessage}</li>`;
    return;
  }
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

// Load users from API1
async function loadUsers() {
  const data = await fetchJson(apiEndpoints.users);
  populateList("user-list", data?.users, "No users found");
}

// Load data from API2
async function loadData2() {
  const data = await fetchJson(apiEndpoints.data2);
  populateList("data-list", data?.data, "No data found in API2");
}

// Load data from API3
async function loadData3() {
  const data = await fetchJson(apiEndpoints.data3);
  populateList("data3-list", data?.data, "No data found in API3");
}

// Initialize dashboard
function init() {
  loadUsers();
  loadData2();
  loadData3();
}

// Run on page load
window.addEventListener("DOMContentLoaded", init);
