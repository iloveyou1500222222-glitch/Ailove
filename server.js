const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

const users = [];
const videos = [];
const channels = [];
const bots = [];
const matches = [];

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pink Super App - Ultimate Edition</title>
        <style>
            :root {
                --pink: #ff2d55;
                --light-pink: #ff6584;
                --bg: #0b0b0b;
                --card: #161616;
                --text: #fff;
            }
            body { margin: 0; background: var(--bg); color: var(--text); font-family: sans-serif; overflow-x: hidden; }
            
            .nav { position: fixed; bottom: 0; width: 100%; display: flex; justify-content: space-around; background: #121212; padding: 10px 0; border-top: 1px solid #222; z-index: 1000; }
            .nav button { background: none; border: none; color: #777; font-size: 11px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; }
            .nav button.active { color: var(--pink); font-weight: bold; }
            .nav button span { font-size: 16px; }

            .screen { display: none; padding: 15px; padding-bottom: 90px; height: 100vh; box-sizing: border-box; overflow-y: auto; }
            .screen.active { display: block; }

            .box { background: var(--card); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #262626; }
            input, textarea, select { width: 100%; padding: 12px; margin: 8px 0; border-radius: 8px; border: 1px solid #333; background: #1f1f1f; color: #fff; box-sizing: border-box; }
            
            .btn-pink { background: linear-gradient(135deg, var(--pink), var(--light-pink)); color: #fff; border: none; padding: 12px; width: 100%; border-radius: 8px; font-weight: bold; cursor: pointer; }
            
            /* TikTok Style Feed */
            .video-wrap { background: var(--card); border-radius: 12px; overflow: hidden; margin-bottom: 15px; }
            video { width: 100%; max-height: 350px; background: #000; object-fit: cover; }
            
            /* Litmatch Swipe / Match */
            .match-card { background: linear-gradient(135deg, #1a1a1a, #2a1a22); border: 1px solid var(--pink); border-radius: 15px; padding: 25px; text-align: center; margin-top: 20px; }
            
            /* Chat */
            .chat-box { display: flex; flex-direction: column; height: 75vh; justify-content: space-between; }
            .messages { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-bottom: 10px; }
            .msg { padding: 10px 14px; border-radius: 10px; max-width: 75%; word-break: break-word; font-size: 14px; }
            .msg.user { background: var(--pink); align-self: flex-end; }
            .msg.bot { background: #222; align-self: flex-start; border-left: 3px solid var(--light-pink); }
        </style>
    </head>
    <body>

        <!-- (1) AUTH -->
        <div id="auth-screen" class="screen active">
            <h1 style="color: var(--pink); text-align: center; margin-top: 50px;">🌸 Pink Super App</h1>
            <div class="box">
                <h3>အကောင့်ဝင်ရန် / ဖွင့်ရန်</h3>
                <input type="email" id="email" placeholder="Email...">
                <input type="password" id="password" placeholder="Password...">
                <button class="btn-pink" onclick="auth('login')">အကောင့်ဝင်မည်</button>
                <button class="btn-pink" style="background:#222; margin-top:8px; border:1px solid var(--pink);" onclick="auth('signup')">အသစ်စာရင်းသွင်းမည်</button>
                <p id="authMsg" style="color: var(--light-pink); text-align:center; font-size:13px;"></p>
            </div>
        </div>

        <!-- (2) TIKTOK STYLE VIDEO FEED -->
        <div id="home" class="screen">
            <h3 style="color: var(--pink); margin-top:0;">🎥 Short Video Feed</h3>
            <div id="feedContainer"><p style="color:#666;">ဗီဒီယိုများ မရှိသေးပါ။</p></div>
        </div>

        <!-- (3) LITMATCH & MOCHAT (SOUL MATCH & AI DATING) -->
        <div id="discover" class="screen">
            <h3 style="color: var(--pink); margin-top:0;">💖 Litmatch Soul & Mochat AI</h3>
            <div class="match-card">
                <h2 id="matchName" style="color: var(--light-pink); margin-top:0;">✨ ရေစက်ဆုံရန် ရှာဖွေပါ</h2>
                <p id="matchBio" style="font-size: 13px; color: #aaa;">အထီးကျန်နေသူများအတွက် AI ဇာတ်ကောင် သို့မဟုတ် မိတ်ဆွေရှာဖွေရန် ခလုတ်နှိပ်ပါ။</p>
                <button class="btn-pink" onclick="findMatch()">💘 Soul Match ရှာမည်</button>
            </div>
            <div class="box" style="margin-top:20px;">
                <h4 style="margin:0 0 10px 0; color:var(--light-pink);">🤖 AI ဇာတ်ကောင်အသစ်ဖန်တီးရန်</h4>
                <input type="text" id="botName" placeholder="Bot အမည် (ဥပမာ - @rose_ai)">
                <textarea id="botBio" placeholder="စရိုက် (ဥပမာ - အလွန်ချိုသာသော ချစ်သူကောင်မလေး)"></textarea>
                <button class="btn-pink" onclick="createBot()">ဇာတ်ကောင်ဖန်တီးမည်</button>
            </div>
        </div>

        <!-- (4) TELEGRAM STYLE CHANNELS & BOT GP -->
        <div id="telegram" class="screen">
            <h3 style="color: var(--pink); margin-top:0;">📢 Telegram Channels & Bot Groups</h3>
            <div class="box">
                <input type="text" id="channelName" placeholder="Channel / Group အမည်...">
                <button class="btn-pink" onclick="createChannel()">Channel ဖန်တီးမည်</button>
            </div>
            <div id="channelContainer"></div>
        </div>

        <!-- (5) CHAT ROOM -->
        <div id="chat-room" class="screen">
            <h3 id="chatTitle" style="color: var(--pink); margin-top:0;">💬 Chat</h3>
            <div class="chat-box">
                <div class="messages" id="msgBox"></div>
                <div style="display:flex; gap:8px;">
                    <input type="text" id="chatInput" placeholder="စာရေးရန်..." style="margin:0;">
                    <button class="btn-pink" style="width:70px; margin:0;" onclick="sendMsg()">ပို့</button>
                </div>
            </div>
        </div>

        <!-- (6) STUDIO / PROFILE -->
        <div id="profile" class="screen">
            <h3 style="color: var(--pink); margin-top:0;">👤 Studio & Profile</h3>
            <div class="box">
                <h4 style="margin-top:0; color:var(--light-pink);">📤 ဗီဒီယိုတင်ရန် (TikTok Style)</h4>
                <input type="text" id="vTitle" placeholder="ဗီဒီယို ခေါင်းစဉ်...">
                <input type="text" id="vUrl" placeholder="MP4 Video Link...">
                <button class="btn-pink" onclick="uploadVideo()">ဗီဒီယိုတင်မည်</button>
            </div>
            <button class="btn-pink" style="background:#222; border:1px solid #444; margin-top:20px;" onclick="logout()">အကောင့်ထွက်မည်</button>
        </div>

        <!-- BOTTOM NAV -->
        <div class="nav" id="bottomNav" style="display:none;">
            <button onclick="switchTab('home')" class="active" id="nav-home"><span>🎥</span>Feed</button>
            <button onclick="switchTab('discover')" id="nav-discover"><span>💖</span>Match</button>
            <button onclick="switchTab('telegram')" id="nav-telegram"><span>📢</span>Channels</button>
            <button onclick="switchTab('profile')" id="nav-profile"><span>👤</span>Studio</button>
        </div>

        <script>
            let currentUser = null;
            let activeTarget = null;

            function switchTab(id) {
                if(!currentUser && id !== 'auth-screen') { alert('အရင်အကောင့်ဝင်ပါ။'); return; }
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
                document.getElementById(id).classList.add('active');
                if(document.getElementById('nav-' + id)) document.getElementById('nav-' + id).classList.add('active');
                if(id === 'home') loadVideos();
                if(id === 'telegram') loadChannels();
            }

            async function auth(type) {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const res = await fetch('/api/' + type, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, password}) });
                const data = await res.json();
                if(res.ok) {
                    currentUser = email;
                    document.getElementById('bottomNav').style.display = 'flex';
                    switchTab('home');
                } else {
                    document.getElementById('authMsg').innerText = data.error;
                }
            }

            async function uploadVideo() {
                const title = document.getElementById('vTitle').value;
                const url = document.getElementById('vUrl').value;
                await fetch('/api/upload', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title, url, uploader: currentUser}) });
                alert('ဗီဒီယို တင်ပြီးပါပြီ။');
                switchTab('home');
            }

            async function loadVideos() {
                const res = await fetch('/api/videos');
                const data = await res.json();
                const c = document.getElementById('feedContainer');
                if(data.length === 0) { c.innerHTML = '<p style="color:#666;">ဗီဒီယို မရှိသေးပါ။</p>'; return; }
                c.innerHTML = data.map(v => \`
                    <div class="video-wrap">
                        <div style="padding:10px; font-weight:bold; color:var(--light-pink);">@\${v.uploader.split('@')[0]}</div>
                        <video controls src="\${v.url}"></video>
                        <div style="padding:10px;"><p style="margin:0;">\${v.title}</p></div>
                    </div>
                \`).join('');
            }

            async function createBot() {
                const username = document.getElementById('botName').value;
                const bio = document.getElementById('botBio').value;
                await fetch('/api/newbot', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username, bio}) });
                alert('AI ဇာတ်ကောင် ဖန်တီးပြီးပါပြီ။');
            }

            async function findMatch() {
                const res = await fetch('/api/match');
                const data = await res.json();
                if(data.name) {
                    document.getElementById('matchName').innerText = data.name;
                    document.getElementById('matchBio').innerText = data.bio;
                    activeTarget = data.name;
                    setTimeout(() => {
                        openChat(data.name);
                    }, 1500);
                }
            }

            async function createChannel() {
                const name = document.getElementById('channelName').value;
                await fetch('/api/channel', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name}) });
                loadChannels();
            }

            async function loadChannels() {
                const res = await fetch('/api/channels');
                const data = await res.json();
                const c = document.getElementById('channelContainer');
                c.innerHTML = data.map(ch => \`
                    <div class="box" style="cursor:pointer;" onclick="openChat('\${ch.name}')">
                        <h4 style="margin:0; color:var(--light-pink);">📢 \${ch.name}</h4>
                        <p style="margin:5px 0 0 0; font-size:12px; color:#aaa;">Telegram Style Channel / Group</p>
                    </div>
                \`).join('');
            }

            function openChat(name) {
                activeTarget = name;
                document.getElementById('chatTitle').innerText = '💬 Chat with ' + name;
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.getElementById('chat-room').classList.add('active');
            }

            async function sendMsg() {
                const input = document.getElementById('chatInput');
                const box = document.getElementById('msgBox');
                const text = input.value.trim();
                if(!text) return;
                box.innerHTML += \`<div class="msg user">\${text}</div>\`;
                input.value = '';

                const res = await fetch('/api/chat', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({target: activeTarget, message: text}) });
                const data = await res.json();
                box.innerHTML += \`<div class="msg bot">\${data.reply}</div>\`;
                box.scrollHeight;
            }

            function logout() { currentUser = null; document.getElementById('bottomNav').style.display = 'none'; switchTab('auth-screen'); }
        </script>
    </body>
    </html>
    `);
});

app.post('/api/signup', (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: "အချက်အလက်ဖြည့်ပါ။" });
    users.push({ email, password });
    res.json({ message: "Success" });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const u = users.find(x => x.email === email && x.password === password);
    if(!u) return res.status(400).json({ error: "အချက်အလက် မှားယွင်းနေသည်။" });
    res.json({ message: "Success" });
});

app.post('/api/upload', (req, res) => { videos.push(req.body); res.json({success:true}); });
app.get('/api/videos', (req, res) => res.json(videos));

app.post('/api/newbot', (req, res) => { bots.push(req.body); res.json({success:true}); });
app.get('/api/match', (req, res) => {
    const defaultBots = [{name: "@rose_ai", bio: "အလွန်ချိုသာဖော်ရွေသော AI ကောင်မလေး"}, {name: "@lonely_boy", bio: "အဖော်ရှာနေတဲ့ AI သူငယ်ချင်း"}];
    const all = [...bots, ...defaultBots];
    const random = all[Math.floor(Math.random() * all.length)];
    res.json(random);
});

app.post('/api/channel', (req, res) => { channels.push(req.body); res.json({success:true}); });
app.get('/api/channels', (req, res) => res.json(channels));

app.post('/api/chat', async (req, res) => {
    try {
        const { target, message } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`User ပြောသည်: "${message}"။ ဇာတ်ကောင် ${target} အနေဖြင့် မြန်မာလို ချိုသာစွာ ပြန်ပေးပါ။`);
        res.json({ reply: (await result.response).text() });
    } catch (e) {
        res.json({ reply: "ဆာဗာချိတ်ဆက်မှု အခက်အခဲရှိပါသည်။" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
