// 1. Track data – update 'file' paths to match your repo's audio folder
const tracks = [
  { name: 'I Guess',       file: 'audio/i_guess.mp3' },
  { name: 'Rain',          file: 'audio/rain.mp3' },
  { name: 'TT/Shutdown',   file: 'audio/tt_shutdown.mp3' },
  { name: 'Rain (Live)',   file: 'audio/rain_live.mp3' }
];

const trackListEl  = document.getElementById('trackList');
const searchInput  = document.getElementById('searchInput');
const playAllBtn   = document.getElementById('playAll');
const pauseAllBtn  = document.getElementById('pauseAll');

let currentAudio = null;

// 2. Build the track list
function renderTracks(filter = '') {
  trackListEl.innerHTML = '';
  tracks
    .filter(t => t.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach((t, idx) => {
      const trackEl = document.createElement('div');
      trackEl.className = 'track';
      trackEl.innerHTML = `
        <div class="track-info">
          <span class="track-name">${t.name}</span>
          <span class="track-duration">0:00</span>
        </div>
        <div class="track-controls">
          <button class="play-pause"><i class="fas fa-play"></i></button>
          <input type="range" class="progress" min="0" max="100" value="0" />
          <input type="range" class="volume" min="0" max="1" step="0.01" value="1" />
          <audio src="${t.file}" preload="metadata"></audio>
        </div>
      `;
      setupTrack(trackEl, idx);
      trackListEl.appendChild(trackEl);
    });
}

// 3. Attach behaviors to one track
function setupTrack(trackEl, idx) {
  const audioEl     = trackEl.querySelector('audio');
  const playBtn     = trackEl.querySelector('.play-pause');
  const icon        = playBtn.querySelector('i');
  const progressEl  = trackEl.querySelector('.progress');
  const volumeEl    = trackEl.querySelector('.volume');
  const durationEl  = trackEl.querySelector('.track-duration');

  // Show actual duration once loaded
  audioEl.onloadedmetadata = () => {
    const d = audioEl.duration;
    const mins = Math.floor(d / 60);
    const secs = String(Math.floor(d % 60)).padStart(2,'0');
    durationEl.textContent = `${mins}:${secs}`;
  };

  // Sync progress bar
  audioEl.ontimeupdate = () => {
    const pct = (audioEl.currentTime / audioEl.duration) * 100;
    progressEl.value = pct || 0;
  };

  // Clicking progress bar
  progressEl.addEventListener('input', () => {
    audioEl.currentTime = (progressEl.value / 100) * audioEl.duration;
  });

  // Volume slider
  volumeEl.addEventListener('input', () => {
    audioEl.volume = volumeEl.value;
  });

  // Play/pause toggle
  playBtn.addEventListener('click', () => {
    if (currentAudio && currentAudio !== audioEl) {
      currentAudio.pause();
      currentAudio.parentElement
                  .querySelector('.play-pause i')
                  .className = 'fas fa-play';
    }
    if (audioEl.paused) {
      audioEl.play();
      icon.className = 'fas fa-pause';
      playBtn.classList.add('playing');
      currentAudio = audioEl;
    } else {
      audioEl.pause();
      icon.className = 'fas fa-play';
      playBtn.classList.remove('playing');
    }
  });
}

// 4. Global play/pause
playAllBtn.addEventListener('click', () => {
  if (!currentAudio) {
    // if none playing, start the first track
    const firstAudio = document.querySelector('audio');
    firstAudio?.play();
    const btn = firstAudio.parentElement.querySelector('.play-pause');
    btn.querySelector('i').className = 'fas fa-pause';
    btn.classList.add('playing');
    currentAudio = firstAudio;
  } else {
    currentAudio.play();
    const btn = currentAudio.parentElement.querySelector('.play-pause');
    btn.querySelector('i').className = 'fas fa-pause';
    btn.classList.add('playing');
  }
});

pauseAllBtn.addEventListener('click', () => {
  document.querySelectorAll('audio').forEach(a => a.pause());
  document.querySelectorAll('.play-pause i').forEach(i => i.className = 'fas fa-play');
  document.querySelectorAll('.play-pause').forEach(b => b.classList.remove('playing'));
});

// 5. Live search
searchInput.addEventListener('input', e => {
  renderTracks(e.target.value);
});

// Initial render
renderTracks();
