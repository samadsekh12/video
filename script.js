// Refs
const audioInput   = document.getElementById('audioInput');
const videoInput   = document.getElementById('videoInput');
const audioListEl  = document.getElementById('audioList');
const videoListEl  = document.getElementById('videoList');
const likedListEl  = document.getElementById('likedList');
const audioPlayer  = document.getElementById('audioPlayer');
const videoPlayer  = document.getElementById('videoPlayer');

// In-memory arrays
let audioFiles = [];
let videoFiles = [];

// Load liked songs from localStorage
let likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');

// Helpers
function saveLikes() {
  localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
}

function isLiked(url) {
  return likedSongs.some(item => item.url === url);
}

// Handle uploads
audioInput.addEventListener('change', e => {
  Array.from(e.target.files).forEach(file => {
    audioFiles.push({ name: file.name, url: URL.createObjectURL(file) });
  });
  e.target.value = '';
  renderLists();
});

videoInput.addEventListener('change', e => {
  Array.from(e.target.files).forEach(file => {
    videoFiles.push({ name: file.name, url: URL.createObjectURL(file) });
  });
  e.target.value = '';
  renderLists();
});

// Render all three lists
function renderLists() {
  renderList(audioListEl, audioFiles, 'audio');
  renderList(videoListEl, videoFiles, 'video');
  renderList(likedListEl, likedSongs, 'liked');
}

// Generic renderer
function renderList(container, list, type) {
  container.innerHTML = '';
  list.forEach((f, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${f.name}</span>
      <div>
        <button class="btn play-btn" data-type="${type}" data-index="${i}">
          ▶
        </button>
        ${type !== 'liked'
          ? `<button class="btn like-btn ${isLiked(f.url)?'liked':''}"
              data-type="${type}" data-index="${i}">
              <i class="fa fa-heart"></i>
            </button>`
          : `<button class="btn like-btn liked" data-type="liked" data-index="${i}">
              <i class="fa fa-heart"></i>
            </button>`
        }
      </div>
    `;
    container.append(li);
  });
}

// Delegate play & like clicks
document.body.addEventListener('click', e => {
  // Play button
  if (e.target.closest('.play-btn')) {
    const btn   = e.target.closest('.play-btn');
    const type  = btn.dataset.type;
    const idx   = +btn.dataset.index;
    let fileObj;

    if (type === 'audio')      fileObj = audioFiles[idx];
    else if (type === 'video') fileObj = videoFiles[idx];
    else /* liked */ {
      fileObj = likedSongs[idx];
      // determine original type for player
      type = fileObj.url.includes('blob:') && audioFiles.some(a=>a.url===fileObj.url)
             ? 'audio' : 'video';
    }

    audioPlayer.pause(); videoPlayer.pause();
    audioPlayer.hidden = true; videoPlayer.hidden = true;

    if (type === 'audio') {
      audioPlayer.src    = fileObj.url;
      audioPlayer.hidden = false;
      audioPlayer.play();
    } else {
      videoPlayer.src    = fileObj.url;
      videoPlayer.hidden = false;
      videoPlayer.play();
    }
  }

  // Like/unlike button
  if (e.target.closest('.like-btn')) {
    const btn   = e.target.closest('.like-btn');
    const type  = btn.dataset.type;
    const idx   = +btn.dataset.index;
    let f;

    if (type === 'audio')       f = audioFiles[idx];
    else if (type === 'video')  f = videoFiles[idx];
    else /* liked */            f = likedSongs[idx];

    // Toggle in likedSongs
    const exists = likedSongs.find(item => item.url === f.url);
    if (exists) {
      likedSongs = likedSongs.filter(item => item.url !== f.url);
    } else {
      likedSongs.push({ name: f.name, url: f.url });
    }
    saveLikes();
    renderLists();
  }
});

// Initial paint
renderLists();
