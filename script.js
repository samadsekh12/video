const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const audioList = document.getElementById('audioList');
const videoList = document.getElementById('videoList');

// Load existing files from localStorage
let files = JSON.parse(localStorage.getItem('mediaFiles') || '[]');
renderFiles();

// Upload button click handler
uploadBtn.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (!file) return alert('Please select a file.');

  const mime = file.type;

  // Validate file type
  if (!mime.startsWith('audio/') && !mime.startsWith('video/')) {
    return alert('Only audio or video files are allowed.');
  }

  // Create local URL and metadata
  const url = URL.createObjectURL(file);
  const type = mime.startsWith('video/') ? 'video' : 'audio';

  const newFile = {
    id: Date.now(),
    name: file.name,
    type,
    url
  };

  // Save to localStorage
  files.push(newFile);
  localStorage.setItem('mediaFiles', JSON.stringify(files));

  // Refresh UI
  renderFiles();
  fileInput.value = '';
});

// Render files into UI
function renderFiles() {
  audioList.innerHTML = '';
  videoList.innerHTML = '';

  files.forEach(file => {
    const card = document.createElement('div');
    card.className = 'media-card';

    card.innerHTML = `
      <strong>${file.name}</strong><br>
      ${file.type === 'video'
        ? `<video src="${file.url}" controls width="300"></video>`
        : `<audio src="${file.url}" controls></audio>`}
      <br>
      <button class="delete" onclick="deleteFile(${file.id})">Delete</button>
    `;

    if (file.type === 'video') {
      videoList.appendChild(card);
    } else {
      audioList.appendChild(card);
    }
  });
}

// Delete file by ID
function deleteFile(id) {
  files = files.filter(f => f.id !== id);
  localStorage.setItem('mediaFiles', JSON.stringify(files));
  renderFiles();
}
