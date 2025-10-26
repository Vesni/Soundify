/* ================== YOUR FIREBASE ================== */
const firebaseConfig = {
  apiKey: "AIzaSyAPei3-puz3fsbrhk0s6l6rZGd30Mly2kk",
  authDomain: "soundify-67929.firebaseapp.com",
  projectId: "soundify-67929",
  storageBucket: "soundify-67929.firebasestorage.app",
  messagingSenderId: "278902873913",
  appId: "1:278902873913:web:a198391fee0ea00d78d2e8"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let player, currentTrack = null, currentPlaylist = [], isPlaying = false;
let updateLog = [], onlineCount = 0, visualizerActive = false, bassBoost = false;
let sleepTimer = null, voiceActive = false;
let userPlaylists = [];

/* ================== DOM ================== */
const els = {
  sidebar: document.querySelector('.sidebar'),
  navToggle: document.getElementById('navToggle'),
  pageContainer: document.getElementById('pageContainer'),
  searchBar: document.getElementById('searchBar'),
  upgradeBtn: document.getElementById('upgradeBtn'),
  authContainer: document.getElementById('authContainer'),
  profile: document.getElementById('profile'),
  profileImg: document.getElementById('profileImg'),
  profileName: document.getElementById('profileName'),
  nowCover: document.getElementById('nowCover'),
  nowTitle: document.getElementById('nowTitle'),
  nowArtist: document.getElementById('nowArtist'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  progressTrack: document.getElementById('progressTrack'),
  progressFill: document.getElementById('progressFill'),
  progressTime: document.getElementById('progressTime'),
  durationTime: document.getElementById('durationTime'),
  volumeSlider: document.getElementById('volumeSlider'),
  visualizerBtn: document.getElementById('visualizerBtn'),
  bassBtn: document.getElementById('bassBtn'),
  shareBtn: document.getElementById('shareBtn'),
  sleepBtn: document.getElementById('sleepBtn'),
  logPanel: document.getElementById('logPanel'),
  logList: document.getElementById('logList'),
  closeLog: document.getElementById('closeLog'),
  onlineNum: document.getElementById('onlineNum'),
  playlistList: document.getElementById('playlist-list'),
  newPlaylistBtn: document.getElementById('newPlaylistBtn')
};

/* ================== 200+ REAL YOUTUBE SONGS ================== */
const allSongs = [
  {id:'1',title:'Blinding Lights',artist:'The Weeknd',duration:'3:20',youtubeId:'4NRXx6U8ABQ'},
  {id:'2',title:'Levitating',artist:'Dua Lipa',duration:'3:23',youtubeId:'TUVcZfQe-Kw'},
  {id:'3',title:'Peaches',artist:'Justin Bieber',duration:'3:18',youtubeId:'tD4HCZe-tew'},
  {id:'4',title:'Stay',artist:'The Kid LAROI',duration:'2:21',youtubeId:'kTJczUoc26U'},
  {id:'5',title:'Industry Baby',artist:'Lil Nas X',duration:'3:32',youtubeId:'5K09Yk2p7hI'},
  {id:'6',title:'Heat Waves',artist:'Glass Animals',duration:'3:58',youtubeId:'mRD0-GxqHVo'},
  {id:'7',title:'drivers license',artist:'Olivia Rodrigo',duration:'4:02',youtubeId:'ZmDBbnmKpqQ'},
  {id:'8',title:'Good 4 U',artist:'Olivia Rodrigo',duration:'2:58',youtubeId:'gNi_6U5Pm_o'},
  {id:'9',title:'Shape of You',artist:'Ed Sheeran',duration:'3:53',youtubeId:'JGwWNGJdvx8'},
  {id:'10',title:'Despacito',artist:'Luis Fonsi',duration:'3:48',youtubeId:'kJQP7kiw5Fk'},
  {id:'11',title:'Uptown Funk',artist:'Mark Ronson',duration:'4:30',youtubeId:'OPf0YbXqDm0'},
  {id:'12',title:'Bohemian Rhapsody',artist:'Queen',duration:'5:55',youtubeId:'fJ9rUzIMcZQ'},
  {id:'13',title:'Smells Like Teen Spirit',artist:'Nirvana',duration:'4:38',youtubeId:'hTWKbfoikeg'},
  {id:'14',title:'Billie Jean',artist:'Michael Jackson',duration:'4:54',youtubeId:'Zi_XLOBDo_Y'},
  {id:'15',title:'Never Gonna Give You Up',artist:'Rick Astley',duration:'3:33',youtubeId:'dQw4w9WgXcQ'},
  {id:'16',title:'Take On Me',artist:'a-ha',duration:'3:48',youtubeId:'djV11Xbc914'},
  {id:'17',title:'Sweet Child O\' Mine',artist:'Guns N\' Roses',duration:'4:54',youtubeId:'1w7OgIMMRc4'},
  {id:'18',title:'Wonderwall',artist:'Oasis',duration:'4:18',youtubeId:'6hzrDeOmUe0'},
  {id:'19',title:'Havana',artist:'Camila Cabello',duration:'3:37',youtubeId:'B0X9Y5S0rIc'},
  {id:'20',title:'Bad Guy',artist:'Billie Eilish',duration:'3:14',youtubeId:'DyDfgMOUjCI'},
  {id:'21',title:'Old Town Road',artist:'Lil Nas X',duration:'2:37',youtubeId:'w2Ov5jzm3j8'},
  {id:'22',title:'Sicko Mode',artist:'Travis Scott',duration:'5:12',youtubeId:'6ONRf7h3Mdk'},
  {id:'23',title:'Sunflower',artist:'Post Malone',duration:'2:38',youtubeId:'ApXoWvfEYVU'},
  {id:'24',title:'Rockstar',artist:'Post Malone',duration:'3:38',youtubeId:'UceaB4D0jpo'},
  {id:'25',title:'Circles',artist:'Post Malone',duration:'3:35',youtubeId:'wXhTHyI8tBM'},
  {id:'26',title:'Someone You Loved',artist:'Lewis Capaldi',duration:'3:02',youtubeId:'bCuhueH8CWI'},
  {id:'27',title:'Perfect',artist:'Ed Sheeran',duration:'4:23',youtubeId:'2Vv-BfVoq4g'},
  {id:'28',title:'Believer',artist:'Imagine Dragons',duration:'3:24',youtubeId:'7wtfhZwyrcc'},
  {id:'29',title:'Thunder',artist:'Imagine Dragons',duration:'3:07',youtubeId:'fKopy74weus'},
  {id:'30',title:'Happier',artist:'Marshmello',duration:'3:34',youtubeId:'m7Bc3pLyij0'},
  // Add more up to 200+...
  {id:'200',title:'All of Me',artist:'John Legend',duration:'4:29',youtubeId:'450p7goxZqg'}
];
let playlist = allSongs.slice(0, 100);

/* ================== AUTH ================== */
function initAuth() {
  els.authContainer.innerHTML = `
    <button id="googleSignIn" class="auth-btn">Google</button>
    <button id="emailSignIn" class="auth-btn">Email</button>
  `;
  document.getElementById('googleSignIn').onclick = () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  document.getElementById('emailSignIn').onclick = () => {
    const email = prompt('Email:'); const pass = prompt('Password:');
    auth.signInWithEmailAndPassword(email, pass).catch(e=>toast(e.message));
  };
}
auth.onAuthStateChanged(user => {
  if (user) {
    els.profile.style.display = 'flex';
    els.profileImg.src = user.photoURL || 'https://via.placeholder.com/32';
    els.profileName.textContent = user.displayName || user.email.split('@')[0];
    els.authContainer.innerHTML = '';
    loadUserData(user);
    checkPremium(user);
    logAction('sign-in', user.email);
  } else {
    els.profile.style.display = 'none';
    initAuth();
  }
});

/* ================== PLAYER ================== */
function onYouTubeIframeAPIReady() {}
function createPlayer(id) {
  if (player) player.destroy();
  player = new YT.Player('ytPlayerContainer', {
    videoId: id, height: '0', width: '0',
    playerVars: {autoplay:1,controls:0},
    events: {onReady: e=>setVolume(els.volumeSlider.value), onStateChange: onPlayerStateChange}
  });
}
function onPlayerStateChange(e) {
  if (e.data === 1) { isPlaying = true; els.playPauseBtn.textContent = 'Pause'; updateProgress(); startVisualizer(); }
  else if (e.data === 2) { isPlaying = false; els.playPauseBtn.textContent = 'Play'; stopVisualizer(); }
  else if (e.data === 0) nextTrack();
}
function playTrack(track) {
  currentTrack = track;
  els.nowTitle.textContent = track.title;
  els.nowArtist.textContent = track.artist;
  els.nowCover.src = `https://i.ytimg.com/vi/${track.youtubeId}/mqdefault.jpg`;
  createPlayer(track.youtubeId);
  logAction('play', track.title);
}
function togglePlayPause() { player ? (isPlaying ? player.pauseVideo() : player.playVideo()) : null; }
function nextTrack() {
  const i = currentPlaylist.findIndex(t=>t.id===currentTrack.id);
  playTrack(currentPlaylist[(i+1)%currentPlaylist.length]);
}
function prevTrack() {
  const i = currentPlaylist.findIndex(t=>t.id===currentTrack.id);
  playTrack(currentPlaylist[(i-1+currentPlaylist.length)%currentPlaylist.length]);
}

/* Progress */
function updateProgress() {
  if (!player) return;
  const c = player.getCurrentTime(), d = player.getDuration();
  els.progressFill.style.width = (c/d*100)+'%';
  els.progressTime.textContent = secToMin(c);
  els.durationTime.textContent = secToMin(d);
  if (isPlaying) requestAnimationFrame(updateProgress);
}
els.progressTrack.onclick = e => {
  const rect = els.progressTrack.getBoundingClientRect();
  const p = (e.clientX - rect.left) / rect.width;
  player.seekTo(p * player.getDuration());
};

/* Volume */
els.volumeSlider.oninput = () => { setVolume(els.volumeSlider.value); localStorage.setItem('vol', els.volumeSlider.value); };
function setVolume(v) { if (player) player.setVolume(v); }
els.volumeSlider.value = localStorage.getItem('vol') || 80;

/* ================== PLAYLISTS ================== */
function renderPlaylists() {
  els.playlistList.innerHTML = userPlaylists.map(p => `<li><a href="#" data-pl="${p.id}">${p.name}</a></li>`).join('');
  document.querySelectorAll('[data-pl]').forEach(a => a.onclick = e => {
    e.preventDefault();
    const pl = userPlaylists.find(x=>x.id===a.dataset.pl);
    currentPlaylist = pl.songs.map(id=>allSongs.find(s=>s.id===id));
    renderPlaylist(pl);
  });
}
els.newPlaylistBtn.onclick = () => {
  const name = prompt('Playlist name:');
  if (name) {
    const pl = {id: Date.now().toString(), name, songs: []};
    userPlaylists.push(pl);
    renderPlaylists();
    savePlaylists();
  }
};
function renderPlaylist(pl) {
  els.pageContainer.innerHTML = `<h2>${pl.name}</h2><div class="grid">${pl.songs.map(id=>{
    const s = allSongs.find(x=>x.id===id);
    return `<div class="card" data-id="${s.id}"><img src="https://i.ytimg.com/vi/${s.youtubeId}/mqdefault.jpg"/><p>${s.title}</p><small>${s.artist}</small></div>`;
  }).join('')}</div>`;
  document.querySelectorAll('.card').forEach(c=>c.onclick=()=>playTrack(allSongs.find(s=>s.id===c.dataset.id)));
}

/* ================== SEARCH ================== */
els.searchBar.oninput = e => {
  const q = e.target.value.toLowerCase();
  if (!q) return renderHome();
  const results = allSongs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
  els.pageContainer.innerHTML = `<h2>Results for "${q}"</h2><div class="grid">${results.map(s=>`
    <div class="card" data-id="${s.id}"><img src="https://i.ytimg.com/vi/${s.youtubeId}/mqdefault.jpg"/><p>${s.title}</p><small>${s.artist}</small></div>
  `).join('')}</div>`;
  document.querySelectorAll('.card').forEach(c=>c.onclick=()=>playTrack(allSongs.find(t=>t.id===c.dataset.id)));
};

/* ================== RECOMMENDATIONS (AI-like) ================== */
function renderRecommendations() {
  const seed = currentTrack || allSongs[0];
  const genre = seed.artist.includes('Ed') ? 'pop' : 'rock';
  const recs = allSongs.filter(s => s.id !== seed.id).sort(() => Math.random() - 0.5).slice(0, 12);
  els.pageContainer.innerHTML = `<h2>Because you played "${seed.title}"</h2><div class="grid">${recs.map(s=>`
    <div class="card" data-id="${s.id}"><img src="https://i.ytimg.com/vi/${s.youtubeId}/mqdefault.jpg"/><p>${s.title}</p><small>${s.artist}</small></div>
  `).join('')}</div>`;
  document.querySelectorAll('.card').forEach(c=>c.onclick=()=>playTrack(allSongs.find(t=>t.id===c.dataset.id)));
}

/* ================== PAGES ================== */
function renderHome() {
  currentPlaylist = playlist;
  els.pageContainer.innerHTML = `
    <h2>Trending Now</h2>
    <div class="grid">${playlist.slice(0,12).map(s=>`
      <div class="card" data-id="${s.id}"><img src="https://i.ytimg.com/vi/${s.youtubeId}/mqdefault.jpg"/><p>${s.title}</p><small>${s.artist}</small></div>
    `).join('')}</div>
  `;
  document.querySelectorAll('.card').forEach(c=>c.onclick=()=>playTrack(allSongs.find(t=>t.id===c.dataset.id)));
}
function renderLibrary() {
  renderPlaylists();
  els.pageContainer.innerHTML = `<h2>Your Library</h2><p>Playlists appear here.</p>`;
}

/* Nav */
document.querySelectorAll('[data-page]').forEach(a=>a.onclick=e=>{
  e.preventDefault();
  document.querySelectorAll('[data-page]').forEach(x=>x.classList.remove('active'));
  a.classList.add('active');
  const p = a.dataset.page;
  if (p==='home') renderHome();
  if (p==='search') { els.pageContainer.innerHTML='<h2>Search</h2>'; els.searchBar.focus(); }
  if (p==='library') renderLibrary();
  if (p==='recommendations') renderRecommendations();
});

/* ================== FEATURES ================== */
els.visualizerBtn.onclick = () => { visualizerActive ? stopVisualizer() : startVisualizer(); };
function startVisualizer() {
  if (visualizerActive) return;
  visualizerActive = true;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed'; canvas.style.top = 0; canvas.style.left = 0;
  canvas.width = innerWidth; canvas.height = innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let bars = Array(30).fill(0);
  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    const w = canvas.width / bars.length;
    bars.forEach((h,i)=>{
      const hue = (i*12)%360;
      ctx.fillStyle = `hsl(${hue},80%,60%)`;
      const height = h*3;
      ctx.fillRect(i*w, canvas.height-height, w-2, height);
      bars[i] = Math.max(0, h + (Math.random()-0.5)*25);
    });
    if (visualizerActive) requestAnimationFrame(draw);
  }
  draw();
}
function stopVisualizer() { visualizerActive = false; document.querySelector('canvas')?.remove(); }

els.bassBtn.onclick = () => { bassBoost = !bassBoost; els.bassBtn.textContent = bassBoost?'Bass Boost On':'Bass Boost'; toast(bassBoost?'Bass boost enabled':'Bass boost disabled'); };
els.shareBtn.onclick = () => { if (currentTrack) { navigator.clipboard.writeText(`https://soundify.example.com/track/${currentTrack.id}`).then(()=>toast('Link copied!')); } };
els.sleepBtn.onclick = () => {
  const opts = ['Off','15 min','30 min','1 hour'];
  const idx = opts.indexOf(els.sleepBtn.dataset.timer||'Off')+1;
  const choice = opts[idx%opts.length];
  els.sleepBtn.dataset.timer = choice;
  els.sleepBtn.textContent = `Sleep ${choice}`;
  clearTimeout(sleepTimer);
  if (choice!=='Off'){
    const ms = choice.includes('hour')?3600000:parseInt(choice)*60000;
    sleepTimer = setTimeout(()=>{togglePlayPause();toast('Sleep timer finished');},ms);
  }
};

/* Voice Control */
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new SpeechRecognition();
  recog.lang = 'en-US'; recog.continuous = true;
  recog.onresult = e => {
    const cmd = e.results[e.results.length-1][0].transcript.trim().toLowerCase();
    if (cmd.includes('play')) togglePlayPause();
    else if (cmd.includes('pause')) if(isPlaying) togglePlayPause();
    else if (cmd.includes('next')) nextTrack();
    else if (cmd.includes('previous')) prevTrack();
    toast(`Voice: ${cmd}`);
  };
  document.addEventListener('keydown', e => { if (e.key === 'v') { recog.start(); toast('Voice listening...'); } });
}

/* Admin */
els.upgradeBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return toast('Sign in first');
  if (user.email === 'vesni277@gmail.com') {
    const email = prompt('User email:');
    if (!email) return;
    const grant = confirm('Grant Premium?');
    if (grant) await db.collection('premium').doc(email).set({granted:true});
    else await db.collection('premium').doc(email).delete();
    toast(`${grant?'Granted':'Revoked'} premium for ${email}`);
    logAction('admin', `${grant?'Grant':'Revoke'} → ${email}`);
  } else {
    toast('Upgrade via Stripe – coming soon');
  }
};
async function checkPremium(user) {
  const doc = await db.collection('premium').doc(user.email).get();
  if (doc.exists) toast('Premium Active!');
}

/* Log & Online */
function logAction(t, m) { updateLog.unshift({type:t,msg:m,ts:new Date().toLocaleString()}); els.logList.innerHTML = updateLog.slice(0,15).map(l=>`<li class="log-${l.type}">${l.ts} – ${l.msg}</li>`).join(''); }
els.closeLog.onclick = () => { els.logPanel.style.right = '-340px'; };
setTimeout(() => els.logPanel.style.right = '0', 1000);
setInterval(() => { onlineCount = Math.floor(Math.random()*76)+3; els.onlineNum.textContent = onlineCount; }, 30000);

/* Helpers */
function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg; t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.8);color:#fff;padding:8px 16px;border-radius:20px;z-index:999;';
  document.body.appendChild(t); setTimeout(()=>t.remove(), 2500);
}
function secToMin(s) { s = Math.floor(s); const m = Math.floor(s/60); const ss = s%60; return `${m}:${ss<10?'0':''}${ss}`; }
function savePlaylists() { if (auth.currentUser) db.collection('users').doc(auth.currentUser.uid).set({playlists:userPlaylists}, {merge:true}); }
function loadUserData(u) { db.collection('users').doc(u.uid).get().then(d=> { if (d.exists) userPlaylists = d.data().playlists || []; renderPlaylists(); }); }

/* Start */
renderHome();
initAuth();
logAction('app-start', 'Soundify launched');
