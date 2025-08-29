// Globals
let db;
let currentType = 'video'; // default tab

// Open (or create) IndexedDB
const request = indexedDB.open('mediaDB', 1);
request.onupgradeneeded = e => {
  db = e.target.result;
  if (!db.objectStoreNames.contains('files')) {
    db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
  }
};
request.onsuccess = e => {
  db = e.target.result;
  renderList();
};
request.onerror = () => alert('IndexedDB failed to open');

// DOM refs
const fileInput = document.getElementById('fileInput');
const fileList  = document.getElementById('fileList');
const tabs      = document.querySelectorAll('.tab-btn');

// Handle file selection
fileInput.addEventListener('change', async () => {
  const files = Array.from(fileInput.files);
  for (const f of files) {
    await addToDB(f);
  }
  fileInput.value = ''; // reset input
  renderList();
});

// Add file to IndexedDB
function addToDB(file) {
  return new Promise((res, rej) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const entry = {
      name: file.name,
      type: file.type.startsWith('video') ? 'video' : 'audio',
      blob: file
    };
    const req = store.add(entry);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

// Render files of the current tab
function renderList() {
  fileList.innerHTML = '';
  const tx = db.transaction('files', 'readonly');
  const store = tx.objectStore('files');
  const cursorReq = store.openCursor();

  cursorReq.onsuccess = e => {
    const cursor = e.target.result;
    if (!cursor) return;
    const record = cursor.value;
    if (record.type === currentType) {
      createCard(record);
    }
    cursor.continue();
  };
}

// Build one media-card
function createCard({ name, blob, type }) {
  const card = document.createElement('div');
  card.className = 'card';

  const url = URL.createObjectURL(blob);
  if (type === 'video') {
    const vid = document.createElement('video');
    vid.src = url;
    vid.controls = true;
    card.appendChild(vid);
  } else {
    const aud = document.createElement('audio');
    aud.src = url;
    aud.controls = true;
    card.appendChild(aud);
  }

  const fname = document.createElement('div');
  fname.className = 'fname';
  fname.textContent = name;
  card.appendChild(fname);

  fileList.appendChild(card);
}

// Tab switching
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentType = btn.dataset.type;
    renderList();
  });
});
