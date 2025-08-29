// DOM references
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const audioList = document.getElementById('audioList');
const videoList = document.getElementById('videoList');
const toastEl = document.getElementById('toast');

// Active object URLs to revoke on rerender/deletion
let activeURLs = [];

// IndexedDB setup
const DB_NAME = 'mediahub-db';
const DB_VERSION = 1;
const STORE = 'files';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('kind', 'kind');
        store.createIndex('createdAt', 'createdAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

async function dbAdd(record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).add(record);
  });
}

async function dbGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).delete(id);
  });
}

// Helpers
function showToast(msg, kind = 'info') {
  toastEl.textContent = msg;
  toastEl.style.background = kind === 'error' ? '#dc2626' : kind === 'success' ? '#16a34a' : '#111827';
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1800);
}

function getBaseName(filename) {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

function makeId() {
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
}

// Upload flow
uploadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) return showToast('Please select a file first', 'error');

  const mime = file.type || '';
  if (!mime.startsWith('audio/') && !mime.startsWith('video/')) {
    return showToast('Only audio or video files are allowed', 'error');
  }

  const kind = mime.startsWith('video/') ? 'video' : 'audio';
  const id = makeId();
  const createdAt = Date.now();

  // Store Blob and metadata in IndexedDB
  const record = {
    id,
    name: file.name,
    mime,
    kind,                 // 'audio' | 'video'
    baseName: getBaseName(file.name), // for folder grouping
    createdAt,
    file                  // Blob (the actual media)
  };

  try {
    await dbAdd(record);
    showToast('Uploaded', 'success');
    fileInput.value = '';
    await renderFiles();
  } catch (e) {
    console.error(e);
    showToast('Failed to save file', 'error');
  }
});

// Render
async function renderFiles() {
  // Revoke previous object URLs to avoid leaks
  activeURLs.forEach(URL.revokeObjectURL);
  activeURLs = [];

  audioList.innerHTML = '';
  videoList.innerHTML = '';

  const items = await dbGetAll();
  // Sort newest first
  items.sort((a, b) => b.createdAt - a.createdAt);

  // Split by kind
  const audios = items.filter(it => it.kind === 'audio');
  const videos = items.filter(it => it.kind === 'video');

  // Render audios
  audios.forEach(file => {
    const url = URL.createObjectURL(file.file);
    activeURLs.push(url);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${escapeHtml(file.name)}</h3>
      <audio class="media" src="${url}" controls></audio>
      <div class="meta">Type: Audio • ${new Date(file.createdAt).toLocaleString()}</div>
      <div style="margin-top:8px;">
        <button class="btn delete small" data-id="${file.id}">Delete</button>
      </div>
    `;
    card.querySelector('button.delete').addEventListener('click', () => handleDelete(file.id));
    audioList.appendChild(card);
  });

  // Group videos by baseName for "folder" simulation
  const byFolder = new Map();
  videos.forEach(file => {
    const key = file.baseName || 'Untitled';
    if (!byFolder.has(key)) byFolder.set(key, []);
    byFolder.get(key).push(file);
  });

  // Render video folders
  for (const [folderName, group] of byFolder.entries()) {
    const folder = document.createElement('div');
    folder.className = 'folder';

    // Folder title
    const title = document.createElement('div');
    title.className = 'folder-title';
    title.innerHTML = `<h3>📁 ${escapeHtml(folderName)}</h3><span class="meta">${group.length} item(s)</span>`;
    folder.appendChild(title);

    // Each video inside the folder
    group.forEach(file => {
      const url = URL.createObjectURL(file.file);
      activeURLs.push(url);

      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '10px';
      card.innerHTML = `
        <h3>${escapeHtml(file.name)}</h3>
        <video class="media" src="${url}" controls playsinline></video>
        <div class="meta">Type: Video • ${new Date(file.createdAt).toLocaleString()}</div>
        <div style="margin-top:8px;">
          <button class="btn delete small" data-id="${file.id}">Delete</button>
        </div>
      `;
      card.querySelector('button.delete').addEventListener('click', () => handleDelete(file.id));
      folder.appendChild(card);
    });

    videoList.appendChild(folder);
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this file permanently?')) return;
  try {
    await dbDelete(id);
    showToast('Deleted', 'success');
    await renderFiles();
  } catch (e) {
    console.error(e);
    showToast('Failed to delete', 'error');
  }
}

// Simple HTML escaper
function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Initial render
renderFiles();
