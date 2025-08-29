const fileInput = document.getElementById('fileInput');
const audioList = document.getElementById('audioList');
const videoList = document.getElementById('videoList');

let files = JSON.parse(localStorage.getItem('mediaFiles') || '[]');
renderFiles();

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const type = file.type.startsWith('video/') ? 'video' : 'audio';

  const newFile = {
    id: Date.now(),
    name: file.name,
    type,
    url
  };

  files.push(newFile);
  localStorage.setItem('mediaFiles', JSON.stringify(files));
  renderFiles();
});

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
      <button onclick="deleteFile(${file.id})">Delete</button>
    `;

    if (file.type === 'video') {
      videoList.appendChild(card);
    } else {
      audioList.appendChild(card);
    }
  });
}

function deleteFile(id) {
  files = files.filter(f => f.id !== id);
  localStorage.setItem('mediaFiles', JSON.stringify(files));
  renderFiles();
}
