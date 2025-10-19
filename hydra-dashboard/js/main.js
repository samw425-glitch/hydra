// API endpoints
const apiEndpoints = {
  users: "http://localhost:41000/users", // API1
  data2: "http://localhost:41001/data",  // API2
  data3: "http://localhost:41002/data"   // API3
};

// Utility function to fetch JSON
async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err);
    return { users: [], data: [] };
  }
}

// Populate user list from API1
async function loadUsers() {
  const users = await fetchJson(apiEndpoints.users);
  const userList = document.getElementById('user-list');
  userList.innerHTML = '';
  if (!users.users?.length) {
    userList.innerHTML = '<li>No data available</li>';
    return;
  }
  users.users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u;
    userList.appendChild(li);
  });
}

// Populate data from API2
async function loadData2() {
  const data = await fetchJson(apiEndpoints.data2);
  const dataList = document.getElementById('data-list');
  dataList.innerHTML = '';
  if (!data.data?.length) {
    dataList.innerHTML = '<li>No data available</li>';
    return;
  }
  data.data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    dataList.appendChild(li);
  });
}

// Populate data from API3
async function loadData3() {
  const data = await fetchJson(apiEndpoints.data3);
  const dataList = document.getElementById('data3-list');
  dataList.innerHTML = '';
  if (!data.data?.length) {
    dataList.innerHTML = '<li>No data available</li>';
    return;
  }
  data.data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    dataList.appendChild(li);
  });
}

// Initialize dashboard
function init() {
  loadUsers();
  loadData2();
  loadData3();
}

window.onload = init;
