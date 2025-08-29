// Globals
let db;
let currentType = 'video';

// Open (or create) IndexedDB
const openReq = indexedDB.open('mediaDB', 1);

openReq.onupgradeneeded = e => {
  db = e.target.result;
  if (!db.objectStoreNames.contains('files')) {
    db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
  }
};

openReq.onsuccess = e => {
  db = e.target.result;
  renderList();
};

openReq.onerror = () => {
  alert('Failed to open storage.');
};

// DOM Refs
const fileInput = document.getElementById('fileInput');
const fileList  = document.getElementById('fileList');
const tabs      = document.querySelectorAll('.tab-btn');

// Handle file selection
fileInput.addEventListener('change', async () => {
  const files = Array.from(fileInput.files);
  for (const file of files) {
    await addToDB(file);
  }
  fileInput.value = '';
  renderList();
});

// Add file entry to IndexedDB
function addToDB(file) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const entry = {
      name: file.name,
      type: file.type.startsWith('video') ? 'video' : 'audio',
      blob: file
    };
    const req = store.add(entry);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// Render list of currentType files
function renderList() {
  fileList.innerHTML = '';
  const tx    = db.transaction('files', 'readonly');
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

// Build a media card
function createCard({ name, blob, type }) {
  const card = document.createElement('div');
  card.className = 'card';

  const url = URL.createObjectURL(blob);
  if (type === 'video') {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    card.appendChild(video);
  } else {
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    card.appendChild(audio);
  }

  const fname = document.createElement('div');
  fname.className = 'fname';
  fname.textContent = name;
  card.appendChild(fname);

  fileList.appendChild(card);
}

// Switch tabs
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentType = btn.dataset.type;
    renderList();
  });
});
