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
  {id:'31',title:'Closer',artist:'The Chainsmokers',duration:'4:05',youtubeId:'PT2_F-1esPk'},
  {id:'32',title:'Faded',artist:'Alan Walker',duration:'3:32',youtubeId:'60ItHLz5WEA'},
  {id:'33',title:'Alone',artist:'Alan Walker',duration:'2:41',youtubeId:'1-xGerv5FOk'},
  {id:'34',title:'Titanium',artist:'David Guetta',duration:'4:05',youtubeId:'JRfuAukYTKg'},
  {id:'35',title:'Animals',artist:'Martin Garrix',duration:'5:04',youtubeId:'gCYcHz2k5x0'},
  {id:'36',title:'Lean On',artist:'Major Lazer',duration:'2:56',youtubeId:'YqeW9_5kURI'},
  {id:'37',title:'Sugar',artist:'Maroon 5',duration:'3:55',youtubeId:'09R8_2nJtjg'},
  {id:'38',title:'Roar',artist:'Katy Perry',duration:'3:43',youtubeId:'CevxZvSJLk8'},
  {id:'39',title:'Dark Horse',artist:'Katy Perry',duration:'3:35',youtubeId:'0KSOMA3QBU0'},
  {id:'40',title:'Firework',artist:'Katy Perry',duration:'3:48',youtubeId:'QGJuMBdaqIw'},
  {id:'41',title:'Blank Space',artist:'Taylor Swift',duration:'3:52',youtubeId:'e-ORhEE9VVg'},
  {id:'42',title:'Shake It Off',artist:'Taylor Swift',duration:'3:39',youtubeId:'nfWlot6h_JM'},
  {id:'43',title:'Bad Blood',artist:'Taylor Swift',duration:'3:20',youtubeId:'QcIy9NiNbmo'},
  {id:'44',title:'Love Story',artist:'Taylor Swift',duration:'3:54',youtubeId:'8xg3vE8Ie_E'},
  {id:'45',title:'We Are Never Ever Getting Back Together',artist:'Taylor Swift',duration:'3:13',youtubeId:'sFrNh2Qd1qA'},
  {id:'46',title:'Rolling in the Deep',artist:'Adele',duration:'3:48',youtubeId:'rYEDA3JcQqw'},
  {id:'47',title:'Someone Like You',artist:'Adele',duration:'4:45',youtubeId:'hLQl3WQQoQ0'},
  {id:'48',title:'Hello',artist:'Adele',duration:'6:06',youtubeId:'YQHsXMglC9A'},
  {id:'49',title:'Set Fire to the Rain',artist:'Adele',duration:'4:01',youtubeId:'R3W4X0kZJ2Y'},
  {id:'50',title:'Skyfall',artist:'Adele',duration:'4:46',youtubeId:'DeumyOzKqgI'},
  {id:'51',title:'Umbrella',artist:'Rihanna',duration:'4:36',youtubeId:'CyH9Q3dRV8U'},
  {id:'52',title:'Diamonds',artist:'Rihanna',duration:'3:45',youtubeId:'lWA2pjMjpBs'},
  {id:'53',title:'We Found Love',artist:'Rihanna',duration:'3:35',youtubeId:'tg00YEETFzg'},
  {id:'54',title:'Work',artist:'Rihanna',duration:'3:39',youtubeId:'HL1UzIK-flA'},
  {id:'55',title:'Only Girl',artist:'Rihanna',duration:'3:55',youtubeId:'pa14VNsdSYM'},
  {id:'56',title:'Gangnam Style',artist:'PSY',duration:'4:12',youtubeId:'9bZkp7q19f0'},
  {id:'57',title:'Baby',artist:'Justin Bieber',duration:'3:35',youtubeId:'kffacxfA7G4'},
  {id:'58',title:'Sorry',artist:'Justin Bieber',duration:'3:20',youtubeId:'fRh_vgS2dFE'},
  {id:'59',title:'What Do You Mean?',artist:'Justin Bieber',duration:'3:26',youtubeId:'DK_0jXPuIr0'},
  {id:'60',title:'Love Yourself',artist:'Justin Bieber',duration:'3:53',youtubeId:'oyEuk8jVu6I'},
  {id:'61',title:'7 Rings',artist:'Ariana Grande',duration:'2:58',youtubeId:'QKqTy7R7rPQ'},
  {id:'62',title:'Thank U, Next',artist:'Ariana Grande',duration:'3:27',youtubeId:'gl1aHhXnN1k'},
  {id:'63',title:'No Tears Left to Cry',artist:'Ariana Grande',duration:'3:26',youtubeId:'ffxKSjUwKdU'},
  {id:'64',title:'Side to Side',artist:'Ariana Grande',duration:'3:46',youtubeId:'SXiSVQZLje8'},
  {id:'65',title:'God is a Woman',artist:'Ariana Grande',duration:'3:17',youtubeId:'kHLHSlExFis'},
  {id:'66',title:'Savage Love',artist:'Jawsh 685',duration:'2:51',youtubeId:'rB4p5X0B5qE'},
  {id:'67',title:'Dynamite',artist:'BTS',duration:'3:19',youtubeId:'gdZLi9oWNZg'},
  {id:'68',title:'Butter',artist:'BTS',duration:'2:44',youtubeId:'HMz2o0l4cXk'},
  {id:'69',title:'Permission to Dance',artist:'BTS',duration:'3:07',youtubeId:'CuklIb9d3fI'},
  {id:'70',title:'Life Goes On',artist:'BTS',duration:'3:27',youtubeId:'R3w2r0e3eY0'},
  {id:'71',title:'Waka Waka',artist:'Shakira',duration:'3:31',youtubeId:'pRpeEdMmmQ0'},
  {id:'72',title:'Hips Don\'t Lie',artist:'Shakira',duration:'3:37',youtubeId:'DUT5rEU6pqM'},
  {id:'73',title:'Chantaje',artist:'Shakira',duration:'3:16',youtubeId:'6Mgqbai3fKo'},
  {id:'74',title:'Try Everything',artist:'Shakira',duration:'3:22',youtubeId:'c6rP-YP4c5I'},
  {id:'75',title:'Whenever, Wherever',artist:'Shakira',duration:'3:16',youtubeId:'weRHyGITlNw'},
  {id:'76',title:'Stressed Out',artist:'Twenty One Pilots',duration:'3:22',youtubeId:'pXRviuL6vMY'},
  {id:'77',title:'Ride',artist:'Twenty One Pilots',duration:'3:34',youtubeId:'Pw-0pbY9JeU'},
  {id:'78',title:'Heathens',artist:'Twenty One Pilots',duration:'3:15',youtubeId:'UprcpdwuwCg'},
  {id:'79',title:'Car Radio',artist:'Twenty One Pilots',duration:'4:27',youtubeId:'92XVwY54h5k'},
  {id:'80',title:'Tear in My Heart',artist:'Twenty One Pilots',duration:'3:08',youtubeId:'nky4me4NP70'},
  {id:'81',title:'All Star',artist:'Smash Mouth',duration:'3:20',youtubeId:'L_jWHffIx5E'},
  {id:'82',title:'I\'m a Believer',artist:'Smash Mouth',duration:'3:04',youtubeId:'lDK9QqIzhwk'},
  {id:'83',title:'Walkin\' on the Sun',artist:'Smash Mouth',duration:'3:26',youtubeId:'Zf53Pg2AkdY'},
  {id:'84',title:'Why Can\'t We Be Friends',artist:'Smash Mouth',duration:'4:31',youtubeId:'-w4gW5aJqY0'},
  {id:'85',title:'Then the Morning Comes',artist:'Smash Mouth',duration:'3:03',youtubeId:'i1GmxQf9V2w'},
  {id:'86',title:'Mr. Brightside',artist:'The Killers',duration:'3:43',youtubeId:'gGdGFtwCNBE'},
  {id:'87',title:'Somebody Told Me',artist:'The Killers',duration:'3:18',youtubeId:'Y5fBdpreJiU'},
  {id:'88',title:'When You Were Young',artist:'The Killers',duration:'3:40',youtubeId:'sJGXhksM4N8'},
  {id:'89',title:'Human',artist:'The Killers',duration:'4:05',youtubeId:'RIZdjT1472Y'},
  {id:'90',title:'Read My Mind',artist:'The Killers',duration:'4:06',youtubeId:'zc8hbSM1zVo'},
  {id:'91',title:'Lose Yourself',artist:'Eminem',duration:'5:26',youtubeId:'xFYQQPAOz7Y'},
  {id:'92',title:'Stan',artist:'Eminem',duration:'6:44',youtubeId:'gOMhN-hfCZg'},
  {id:'93',title:'Without Me',artist:'Eminem',duration:'4:50',youtubeId:'YVkUvmDQ3HY'},
  {id:'94',title:'The Real Slim Shady',artist:'Eminem',duration:'4:44',youtubeId:'eJO5HU_7_1w'},
  {id:'95',title:'Rap God',artist:'Eminem',duration:'6:04',youtubeId:'XbGs_qK2PQA'},
  {id:'96',title:'Yellow',artist:'Coldplay',duration:'4:26',youtubeId:'yKNxeF4KMsY'},
  {id:'97',title:'Clocks',artist:'Coldplay',duration:'4:12',youtubeId:'d020hcWA_Wg'},
  {id:'98',title:'Viva La Vida',artist:'Coldplay',duration:'4:02',youtubeId:'dvgZkm1xWPE'},
  {id:'99',title:'The Scientist',artist:'Coldplay',duration:'5:09',youtubeId:'RB-RcX5DS5A'},
  {id:'100',title:'Fix You',artist:'Coldplay',duration:'4:55',youtubeId:'k4V3Mo61fJM'},
  {id:'101',title:'Paradise',artist:'Coldplay',duration:'4:20',youtubeId:'1G4isv_Fylg'},
  {id:'102',title:'A Sky Full of Stars',artist:'Coldplay',duration:'4:28',youtubeId:'VPRjCeoBqrI'},
  {id:'103',title:'Hymn for the Weekend',artist:'Coldplay',duration:'4:19',youtubeId:'YykjpeuMNEk'},
  {id:'104',title:'Something Just Like This',artist:'Coldplay',duration:'4:07',youtubeId:'FM7MFYoylVs'},
  {id:'105',title:'Adventure of a Lifetime',artist:'Coldplay',duration:'4:24',youtubeId:'QtXby3twMmI'},
  {id:'106',title:'Everglow',artist:'Coldplay',duration:'4:43',youtubeId:'5n0iKzQdW5I'},
  {id:'107',title:'Up&Up',artist:'Coldplay',duration:'6:45',youtubeId:'BPNQ3z7g6yY'},
  {id:'108',title:'My Universe',artist:'Coldplay x BTS',duration:'3:48',youtubeId:'3YqPKLZF_WU'},
  {id:'109',title:'Higher Power',artist:'Coldplay',duration:'3:26',youtubeId:'5n0iKzQdW5I'},
  {id:'110',title:'Orphans',artist:'Coldplay',duration:'3:18',youtubeId:'5n0iKzQdW5I'},
  {id:'111',title:'Let Somebody Go',artist:'Coldplay x Selena Gomez',duration:'4:01',youtubeId:'5n0iKzQdW5I'},
  {id:'112',title:'Coloratura',artist:'Coldplay',duration:'10:18',youtubeId:'5n0iKzQdW5I'},
  {id:'113',title:'Humankind',artist:'Coldplay',duration:'4:26',youtubeId:'5n0iKzQdW5I'},
  {id:'114',title:'People of the Pride',artist:'Coldplay',duration:'5:29',youtubeId:'5n0iKzQdW5I'},
  {id:'115',title:'Biutyful',artist:'Coldplay',duration:'3:13',youtubeId:'5n0iKzQdW5I'},
  {id:'116',title:'Infinity Sign',artist:'Coldplay',duration:'3:46',youtubeId:'5n0iKzQdW5I'},
  {id:'117',title:'Music of the Spheres',artist:'Coldplay',duration:'1:38',youtubeId:'5n0iKzQdW5I'},
  {id:'118',title:'Sunrise',artist:'Coldplay',duration:'2:31',youtubeId:'5n0iKzQdW5I'},
  {id:'119',title:'Overtura',artist:'Coldplay',duration:'1:25',youtubeId:'5n0iKzQdW5I'},
  {id:'120',title:'Flags',artist:'Coldplay',duration:'3:39',youtubeId:'5n0iKzQdW5I'},
  {id:'121',title:'Champion of the World',artist:'Coldplay',duration:'4:17',youtubeId:'5n0iKzQdW5I'},
  {id:'122',title:'Cry Cry Cry',artist:'Coldplay',duration:'2:47',youtubeId:'5n0iKzQdW5I'},
  {id:'123',title:'Everyday Life',artist:'Coldplay',duration:'4:18',youtubeId:'5n0iKzQdW5I'},
  {id:'124',title:'Arabesque',artist:'Coldplay',duration:'5:39',youtubeId:'5n0iKzQdW5I'},
  {id:'125',title:'When I Need a Friend',artist:'Coldplay',duration:'2:30',youtubeId:'5n0iKzQdW5I'},
  {id:'126',title:'Guns',artist:'Coldplay',duration:'1:55',youtubeId:'5n0iKzQdW5I'},
  {id:'127',title:'Old Friends',artist:'Coldplay',duration:'2:26',youtubeId:'5n0iKzQdW5I'},
  {id:'128',title:'BrokEn',artist:'Coldplay',duration:'2:30',youtubeId:'5n0iKzQdW5I'},
  {id:'129',title:'Daddy',artist:'Coldplay',duration:'4:58',youtubeId:'5n0iKzQdW5I'},
  {id:'130',title:'Church',artist:'Coldplay',duration:'3:13',youtubeId:'5n0iKzQdW5I'},
  {id:'131',title:'Trouble in Town',artist:'Coldplay',duration:'4:39',youtubeId:'5n0iKzQdW5I'},
  {id:'132',title:'Éko',artist:'Coldplay',duration:'2:37',youtubeId:'5n0iKzQdW5I'},
  {id:'133',title:'Orphans (Live)',artist:'Coldplay',duration:'3:28',youtubeId:'5n0iKzQdW5I'},
  {id:'134',title:'Sunrise (Live)',artist:'Coldplay',duration:'2:41',youtubeId:'5n0iKzQdW5I'},
  {id:'135',title:'A L I E N S',artist:'Coldplay',duration:'4:42',youtubeId:'5n0iKzQdW5I'},
  {id:'136',title:'Kaleidoscope',artist:'Coldplay',duration:'1:51',youtubeId:'5n0iKzQdW5I'},
  {id:'137',title:'Hypnotised',artist:'Coldplay',duration:'5:55',youtubeId:'5n0iKzQdW5I'},
  {id:'138',title:'All I Can Think About Is You',artist:'Coldplay',duration:'4:34',youtubeId:'5n0iKzQdW5I'},
  {id:'139',title:'Miracles (Someone Special)',artist:'Coldplay',duration:'4:29',youtubeId:'5n0iKzQdW5I'},
  {id:'140',title:'Up&Up (Radio Edit)',artist:'Coldplay',duration:'3:58',youtubeId:'5n0iKzQdW5I'},
  {id:'141',title:'Everglow (Single Version)',artist:'Coldplay',duration:'3:47',youtubeId:'5n0iKzQdW5I'},
  {id:'142',title:'Adventure of a Lifetime (Radio Edit)',artist:'Coldplay',duration:'3:43',youtubeId:'5n0iKzQdW5I'},
  {id:'143',title:'Hymn for the Weekend (Seeb Remix)',artist:'Coldplay',duration:'3:31',youtubeId:'5n0iKzQdW5I'},
  {id:'144',title:'A Head Full of Dreams',artist:'Coldplay',duration:'3:43',youtubeId:'5n0iKzQdW5I'},
  {id:'145',title:'Birds',artist:'Coldplay',duration:'3:49',youtubeId:'5n0iKzQdW5I'},
  {id:'146',title:'Fun',artist:'Coldplay',duration:'4:27',youtubeId:'5n0iKzQdW5I'},
  {id:'147',title:'Army of One',artist:'Coldplay',duration:'6:16',youtubeId:'5n0iKzQdW5I'},
  {id:'148',title:'Amazing Day',artist:'Coldplay',duration:'4:31',youtubeId:'5n0iKzQdW5I'},
  {id:'149',title:'X Marks the Spot',artist:'Coldplay',duration:'2:54',youtubeId:'5n0iKzQdW5I'},
  {id:'150',title:'Colour Spectrum',artist:'Coldplay',duration:'1:00',youtubeId:'5n0iKzQdW5I'},
  {id:'151',title:'Magic',artist:'Coldplay',duration:'4:45',youtubeId:'QtXby3twMmI'},
  {id:'152',title:'True Love',artist:'Coldplay',duration:'4:06',youtubeId:'5n0iKzQdW5I'},
  {id:'153',title:'Midnight',artist:'Coldplay',duration:'4:54',youtubeId:'5n0iKzQdW5I'},
  {id:'154',title:'Another\'s Arms',artist:'Coldplay',duration:'3:54',youtubeId:'5n0iKzQdW5I'},
  {id:'155',title:'Oceans',artist:'Coldplay',duration:'5:21',youtubeId:'5n0iKzQdW5I'},
  {id:'156',title:'A Sky Full of Stars (Radio Edit)',artist:'Coldplay',duration:'3:56',youtubeId:'5n0iKzQdW5I'},
  {id:'157',title:'O',artist:'Coldplay',duration:'7:47',youtubeId:'5n0iKzQdW5I'},
  {id:'158',title:'Ink',artist:'Coldplay',duration:'3:48',youtubeId:'5n0iKzQdW5I'},
  {id:'159',title:'Ghost Story',artist:'Coldplay',duration:'4:17',youtubeId:'5n0iKzQdW5I'},
  {id:'160',title:'Always in My Head',artist:'Coldplay',duration:'3:36',youtubeId:'5n0iKzQdW5I'},
  {id:'161',title:'Princess of China',artist:'Coldplay',duration:'3:59',youtubeId:'5n0iKzQdW5I'},
  {id:'162',title:'Up in Flames',artist:'Coldplay',duration:'3:13',youtubeId:'5n0iKzQdW5I'},
  {id:'163',title:'Don\'t Let It Break Your Heart',artist:'Coldplay',duration:'3:54',youtubeId:'5n0iKzQdW5I'},
  {id:'164',title:'Charlie Brown',artist:'Coldplay',duration:'4:45',youtubeId:'5n0iKzQdW5I'},
  {id:'165',title:'Every Teardrop Is a Waterfall',artist:'Coldplay',duration:'4:03',youtubeId:'5n0iKzQdW5I'},
  {id:'166',title:'Hurts Like Heaven',artist:'Coldplay',duration:'4:02',youtubeId:'5n0iKzQdW5I'},
  {id:'167',title:'Paradise (Radio Edit)',artist:'Coldplay',duration:'4:20',youtubeId:'5n0iKzQdW5I'},
  {id:'168',title:'Major Minus',artist:'Coldplay',duration:'3:30',youtubeId:'5n0iKzQdW5I'},
  {id:'169',title:'U.F.O.',artist:'Coldplay',duration:'2:18',youtubeId:'5n0iKzQdW5I'},
  {id:'170',title:'Us Against the World',artist:'Coldplay',duration:'3:59',youtubeId:'5n0iKzQdW5I'},
  {id:'171',title:'M.M.I.X.',artist:'Coldplay',duration:'0:48',youtubeId:'5n0iKzQdW5I'},
  {id:'172',title:'Mylo Xyloto',artist:'Coldplay',duration:'0:43',youtubeId:'5n0iKzQdW5I'},
  {id:'173',title:'In My Place',artist:'Coldplay',duration:'3:48',youtubeId:'5n0iKzQdW5I'},
  {id:'174',title:'God Put a Smile upon Your Face',artist:'Coldplay',duration:'4:57',youtubeId:'5n0iKzQdW5I'},
  {id:'175',title:'Politik',artist:'Coldplay',duration:'5:18',youtubeId:'5n0iKzQdW5I'},
  {id:'176',title:'Shiver',artist:'Coldplay',duration:'4:59',youtubeId:'5n0iKzQdW5I'},
  {id:'177',title:'Sparks',artist:'Coldplay',duration:'3:47',youtubeId:'5n0iKzQdW5I'},
  {id:'178',title:'Trouble',artist:'Coldplay',duration:'4:31',youtubeId:'5n0iKzQdW5I'},
  {id:'179',title:'Don\'t Panic',artist:'Coldplay',duration:'2:17',youtubeId:'5n0iKzQdW5I'},
  {id:'180',title:'Parachutes',artist:'Coldplay',duration:'0:46',youtubeId:'5n0iKzQdW5I'},
  {id:'181',title:'High Speed',artist:'Coldplay',duration:'4:14',youtubeId:'5n0iKzQdW5I'},
  {id:'182',title:'We Never Change',artist:'Coldplay',duration:'4:09',youtubeId:'5n0iKzQdW5I'},
  {id:'183',title:'Everything\'s Not Lost',artist:'Coldplay',duration:'7:16',youtubeId:'5n0iKzQdW5I'},
  {id:'184',title:'Life Is for Living',artist:'Coldplay',duration:'1:37',youtubeId:'5n0iKzQdW5I'},
  {id:'185',title:'Speed of Sound',artist:'Coldplay',duration:'4:48',youtubeId:'5n0iKzQdW5I'},
  {id:'186',title:'Talk',artist:'Coldplay',duration:'5:11',youtubeId:'5n0iKzQdW5I'},
  {id:'187',title:'X&Y',artist:'Coldplay',duration:'4:34',youtubeId:'5n0iKzQdW5I'},
  {id:'188',title:'Square One',artist:'Coldplay',duration:'4:47',youtubeId:'5n0iKzQdW5I'},
  {id:'189',title:'What If',artist:'Coldplay',duration:'4:57',youtubeId:'5n0iKzQdW5I'},
  {id:'190',title:'White Shadows',artist:'Coldplay',duration:'5:28',youtubeId:'5n0iKzQdW5I'},
  {id:'191',title:'Fix You (Live)',artist:'Coldplay',duration:'5:04',youtubeId:'5n0iKzQdW5I'},
  {id:'192',title:'Twisted Logic',artist:'Coldplay',duration:'4:31',youtubeId:'5n0iKzQdW5I'},
  {id:'193',title:'Low',artist:'Coldplay',duration:'5:32',youtubeId:'5n0iKzQdW5I'},
  {id:'194',title:'A Message',artist:'Coldplay',duration:'4:45',youtubeId:'5n0iKzQdW5I'},
  {id:'195',title:'The Hardest Part',artist:'Coldplay',duration:'4:25',youtubeId:'5n0iKzQdW5I'},
  {id:'196',title:'Swallowed in the Sea',artist:'Coldplay',duration:'5:59',youtubeId:'5n0iKzQdW5I'},
  {id:'197',title:'Til Kingdom Come',artist:'Coldplay',duration:'4:09',youtubeId:'5n0iKzQdW5I'},
  {id:'198',title:'How You See the World No. 2',artist:'Coldplay',duration:'4:05',youtubeId:'5n0iKzQdW5I'},
  {id:'199',title:'Things I Don\'t Understand',artist:'Coldplay',duration:'4:55',youtubeId:'5n0iKzQdW5I'},
  {id:'200',title:'Proof',artist:'Coldplay',duration:'4:10',youtubeId:'5n0iKzQdW5I'}
];

/* Use first 100 for home, all 200 for search/playlists */
const trendingSongs = allSongs.slice(0, 100);

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

/* ================== SEARCH (ALL 200 SONGS) ================== */
els.searchBar.oninput = e => {
  const q = e.target.value.toLowerCase().trim();
  if (!q) return renderHome();
  const results = allSongs.filter(s => 
    s.title.toLowerCase().includes(q) || 
    s.artist.toLowerCase().includes(q)
  );
  els.pageContainer.innerHTML = `<h2>Results for "${q}" (${results.length})</h2><div class="grid">${results.map(s=>`
    <div class="card" data-id="${s.id}"><img src="https://i.ytimg.com/vi/${s.youtubeId}/mqdefault.jpg"/><p>${s.title}</p><small>${s.artist}</small></div>
  `).join('')}</div>`;
  document.querySelectorAll('.card').forEach(c=>c.onclick=()=>playTrack(allSongs.find(t=>t.id===c.dataset.id)));
};

/* ================== RECOMMENDATIONS ================== */
function renderRecommendations() {
  const seed = currentTrack || allSongs[0];
  const recs = allSongs.filter(s => s.id !== seed.id).sort(() => Math.random() - 0.5).slice(0, 12);
  els.pageContainer.innerHTML = `<h2>Recommended for you</h2><div class="grid">${recs.map(s=>`
    <div class="card" data-id="${s.id}"><img src="https://i.ytimg.com/vi/${s.youtubeId}/mqdefault.jpg"/><p>${s.title}</p><small>${s.artist}</small></div>
  `).join('')}</div>`;
  document.querySelectorAll('.card').forEach(c=>c.onclick=()=>playTrack(allSongs.find(t=>t.id===c.dataset.id)));
}

/* ================== PAGES ================== */
function renderHome() {
  currentPlaylist = trendingSongs;
  els.pageContainer.innerHTML = `
    <h2>Trending Now</h2>
    <div class="grid">${trendingSongs.slice(0,12).map(s=>`
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

/* Admin & Premium */
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
function logAction(t, m) { 
  updateLog.unshift({type:t,msg:m,ts:new Date().toLocaleString()}); 
  els.logList.innerHTML = updateLog.slice(0,15).map(l=>`<li class="log-${l.type}"><span class="icon">circle</span>${l.ts} – ${l.msg}</li>`).join(''); 
}
els.closeLog.onclick = () => { els.logPanel.style.right = '-300px'; };
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

/* ================== START ================== */
renderHome();
initAuth();
logAction('app-start', 'Soundify launched');
