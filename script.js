// DOM এলিমেন্টগুলোকে ধরছি
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const audioList = document.getElementById('audioList');
const videoList = document.getElementById('videoList');

// লোকাল স্টোরেজ থেকে আগের ফাইলগুলো লোড করছি
let files = JSON.parse(localStorage.getItem('mediaFiles') || '[]');

// UI-তে ফাইলগুলো দেখাচ্ছি
renderFiles();

// আপলোড বাটনে ক্লিক ইভেন্ট
uploadBtn.addEventListener('click', () => {
  const file = fileInput.files[0]; // ইউজার যে ফাইল সিলেক্ট করেছে

  if (!file) return alert('ফাইল সিলেক্ট করুন');

  const mime = file.type;

  // শুধু audio/video টাইপ চেক করছি
  if (!mime.startsWith('audio/') && !mime.startsWith('video/')) {
    return alert('শুধু অডিও বা ভিডিও ফাইল আপলোড করা যাবে');
  }

  // ব্রাউজারে লোকাল URL তৈরি করছি
  const url = URL.createObjectURL(file);

  // টাইপ নির্ধারণ করছি
  const type = mime.startsWith('video/') ? 'video' : 'audio';

  // নতুন ফাইল অবজেক্ট বানাচ্ছি
  const newFile = {
    id: Date.now(), // ইউনিক আইডি
    name: file.name,
    type,
    url
  };

  // লোকাল স্টোরেজে সেভ করছি
  files.push(newFile);
  localStorage.setItem('mediaFiles', JSON.stringify(files));

  // UI রিফ্রেশ করছি
  renderFiles();

  // ইনপুট ফিল্ড ক্লিয়ার করছি
  fileInput.value = '';
});

// UI-তে ফাইল দেখানোর ফাংশন
function renderFiles() {
  audioList.innerHTML = '';
  videoList.innerHTML = '';

  files.forEach(file => {
    const card = document.createElement('div');
    card.className = 'media-card';

    // ফাইলের নাম, প্লেয়ার, এবং Delete বাটন দেখাচ্ছি
    card.innerHTML = `
      <strong>${file.name}</strong><br>
      ${file.type === 'video'
        ? `<video src="${file.url}" controls width="300"></video>`
        : `<audio src="${file.url}" controls></audio>`}
      <br>
      <button class="delete" onclick="deleteFile(${file.id})">Delete</button>
    `;

    // টাইপ অনুযায়ী সেকশনে দেখাচ্ছি
    if (file.type === 'video') {
      videoList.appendChild(card);
    } else {
      audioList.appendChild(card);
    }
  });
}

// Delete ফাংশন
function deleteFile(id) {
  // আইডি দিয়ে ফাইল ফিল্টার করে বাদ দিচ্ছি
  files = files.filter(f => f.id !== id);

  // লোকাল স্টোরেজ আপডেট করছি
  localStorage.setItem('mediaFiles', JSON.stringify(files));

  // UI রিফ্রেশ করছি
  renderFiles();
}
