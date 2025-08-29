const fileInput    = document.getElementById('fileInput');
const gallery      = document.getElementById('gallery');
const shareBtn     = document.getElementById('shareBtn');
const screenVideo  = document.getElementById('screenPreview');

fileInput.addEventListener('change', () => {
  gallery.innerHTML = ''; // clear previous entries

  Array.from(fileInput.files).forEach(file => {
    const url = URL.createObjectURL(file);
    const ext = file.name.split('.').pop().toLowerCase();
    const card = document.createElement('div');
    card.className = 'card';

    // Video
    if (['mp4','webm','ogg'].includes(ext)) {
      const vid = document.createElement('video');
      vid.controls = true;
      vid.src = url;
      card.appendChild(vid);

    // Audio
    } else if (['mp3','wav','aac'].includes(ext)) {
      const aud = document.createElement('audio');
      aud.controls = true;
      aud.src = url;
      card.appendChild(aud);

    // PDF
    } else if (ext === 'pdf') {
      const obj = document.createElement('object');
      obj.data = url;
      obj.type = 'application/pdf';
      card.appendChild(obj);

    // Text or other
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.textContent = 'Download: ' + file.name;
      card.appendChild(link);
    }

    // Filename caption
    const nameDiv = document.createElement('div');
    nameDiv.className = 'filename';
    nameDiv.textContent = file.name;
    card.appendChild(nameDiv);

    gallery.appendChild(card);
  });
});

// Screen-sharing demo
shareBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenVideo.srcObject = stream;
    screenVideo.hidden = false;
  } catch (err) {
    alert('Cannot share screen: ' + err.message);
  }
});
