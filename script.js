// Refs
const audioInput  = document.getElementById('audioInput');
const videoInput  = document.getElementById('videoInput');
const allListEl   = document.getElementById('allList');
const audioListEl = document.getElementById('audioList');
const videoListEl = document.getElementById('videoList');
const likedListEl = document.getElementById('likedList');
const audioPlayer = document.getElementById('audioPlayer');
const videoPlayer = document.getElementById('videoPlayer');

// In-memory arrays
let audioFiles = [];
let videoFiles = [];
let likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');

// Persist likes
function saveLikes() {
  localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
}

// Helper to build “All Files” list
function getAllFiles() {
  return [
    ...audioFiles.map(f => ({ ...f, type: 'audio' })),
    ...videoFiles.map(f => ({ ...f, type: 'video' }))
  ];
}

// Handle uploads
audioInput.addEventListener('change', e => {
  Array.from(e.target.files).forEach(file => {
    audioFiles.push({ name: file.name, url: URL.createObjectURL(file) });
  });
  e.target.value = '';
  renderAll();
});

videoInput.addEventListener('change', e => {
  Array.from(e.target.files).forEach(file => {
    videoFiles.push({ name: file.name, url: URL.createObjectURL(file) });
  });
  e.target.value = '';
  renderAll();
});

// Core render function
function renderList(container, list, isAll=false, isLiked=false) {
  container.innerHTML = '';
  list.forEach((f, i) => {
    const li = document.createElement('li');
    // play button always present
    let btns = `
      <button class="btn play-btn"
        data-type="${isAll? f.type : isLiked? 'liked' : container.id.replace('List','')}"
        data-index="${i}">
        ▶
      </button>`;
    // like button on non-all lists
    if (!isAll) {
      const liked = likedSongs.find(x => x.url === f.url);
      btns += `
        <button class="btn like-btn ${liked? 'liked':''}"
          data-type="${isLiked? 'liked' : container.id.replace('List','')}"
          data-index="${i}">
          <i class="fa fa-heart"></i>
        </button>`;
    }
    li.innerHTML = `<span>${f.name}</span><div>${btns}</div>`;
    container.append(li);
  });
}

// Re-render everything
function renderAll() {
  renderList(allListEl,  getAllFiles(),    true);
  renderList(audioListEl, audioFiles,      false);
  renderList(videoListEl, videoFiles,      false);
  renderList(likedListEl, likedSongs,      false, true);
}

// Delegate clicks for play & like
document.body.addEventListener('click', e => {
  // Play
  if (e.target.closest('.play-btn')) {
    const btn  = e.target.closest('.play-btn');
    let type   = btn.dataset.type;
    const idx  = +btn.dataset.index;
    let fileObj;

    if (type === 'all')       fileObj = getAllFiles()[idx];
    else if (type === 'audio') fileObj = audioFiles[idx];
    else if (type === 'video') fileObj = videoFiles[idx];
    else /* liked */           fileObj = likedSongs[idx];

    // hide/pause both
    audioPlayer.pause(); videoPlayer.pause();
    audioPlayer.hidden = true; videoPlayer.hidden = true;

    // play on correct player
    if (fileObj.type === 'audio' || type==='audio' || type==='liked') {
      audioPlayer.src    = fileObj.url;
      audioPlayer.hidden = false;
      audioPlayer.play();
    } else {
      videoPlayer.src    = fileObj.url;
      videoPlayer.hidden = false;
      videoPlayer.play();
    }
  }

  // Like/unlike
  if (e.target.closest('.like-btn')) {
    const btn  = e.target.closest('.like-btn');
    const type = btn.dataset.type;
    const idx  = +btn.dataset.index;
    let f;

    if (type === 'audio')      f = audioFiles[idx];
    else if (type === 'video') f = videoFiles[idx];
    else /* liked */           f = likedSongs[idx];

    const exists = likedSongs.find(x => x.url === f.url);
    if (exists) likedSongs = likedSongs.filter(x => x.url !== f.url);
    else         likedSongs.push({ name: f.name, url: f.url });

    saveLikes();
    renderAll();
  }
});

// Initial paint
renderAll();
