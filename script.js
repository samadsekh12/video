// References
const audioInput  = document.getElementById('audioInput');
const videoInput  = document.getElementById('videoInput');
const audioListEl = document.getElementById('audioList');
const videoListEl = document.getElementById('videoList');
const audioPlayer = document.getElementById('audioPlayer');
const videoPlayer = document.getElementById('videoPlayer');

// In-memory storage
let audioFiles = [];
let videoFiles = [];

// Handle audio uploads
audioInput.addEventListener('change', e => {
  Array.from(e.target.files).forEach(file => {
    const url = URL.createObjectURL(file);
    audioFiles.push({ name: file.name, url });
  });
  e.target.value = '';
  renderList('audio');
});

// Handle video uploads
videoInput.addEventListener('change', e => {
  Array.from(e.target.files).forEach(file => {
    const url = URL.createObjectURL(file);
    videoFiles.push({ name: file.name, url });
  });
  e.target.value = '';
  renderList('video');
});

// Render either audio or video list
function renderList(type) {
  if (type === 'audio') {
    audioListEl.innerHTML = '';
    audioFiles.forEach((f, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${f.name}</span>
        <button class="play-btn" data-type="audio" data-index="${i}">
          Play
        </button>`;
      audioListEl.append(li);
    });
  } else {
    videoListEl.innerHTML = '';
    videoFiles.forEach((f, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${f.name}</span>
        <button class="play-btn" data-type="video" data-index="${i}">
          Play
        </button>`;
      videoListEl.append(li);
    });
  }
}

// Delegate play-button clicks
document.body.addEventListener('click', e => {
  if (!e.target.matches('.play-btn')) return;
  const type  = e.target.dataset.type;
  const idx   = +e.target.dataset.index;

  // Pause & hide both players
  audioPlayer.pause();
  videoPlayer.pause();
  audioPlayer.hidden = true;
  videoPlayer.hidden = true;

  if (type === 'audio') {
    const file = audioFiles[idx];
    audioPlayer.src    = file.url;
    audioPlayer.hidden = false;
    audioPlayer.play();
  } else {
    const file = videoFiles[idx];
    videoPlayer.src    = file.url;
    videoPlayer.hidden = false;
    videoPlayer.play();
  }
});
