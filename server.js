const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

const bots = [];

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Short Video & Chat App</title>
        <style>
            body { margin: 0; background: #000; color: #fff; font-family: sans-serif; overflow-x: hidden; }
            .nav { position: fixed; bottom: 0; width: 100%; display: flex; justify-content: space-around; background: #111; padding: 12px 0; border-top: 1px solid #333; z-index: 100; }
            .nav button { background: none; border: none; color: #888; font-size: 14px; cursor: pointer; }
            .nav button.active { color: #ff2d55; font-weight: bold; }
            .screen { display: none; padding: 20px; padding-bottom: 80px; height: 100vh; box-sizing: border-box; overflow-y: auto; }
            .screen.active { display: block; }
            .video-feed { height: 100vh; background: #1a1a1a; display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; position: relative; }
            .actions { position: absolute; right: 20px; bottom: 100px; display: flex; flex-direction: column; align-items: center; gap: 15px; }
            .actions button { background: rgba(0,0,0,0.5); border: none; color: #fff; border-radius: 50%; width: 45px; height: 45px; cursor: pointer; font-size: 18px; }
            .chat-box { display: flex; flex-direction: column; height: 80vh; justify-content: space-between; }
            .messages { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 10px; }
            .msg { padding: 10px 15px; border-radius: 10px; max-width: 75%; word-break: break-word; }
            .msg.user { background: #ff2d55; align-self: flex-end; }
            .msg.bot { background: #333; align-self: flex-start; }
            .input-area { display: flex; gap: 10px; }
            .input-area input { flex-grow: 1; padding: 12px; border-radius: 5px; border: 1px solid #444; background: #222; color: #fff; }
            .input-area button { background: #ff2d55; color: #fff; border: none; padding: 0 20px; border-radius: 5px; cursor: pointer; }
        </style>
    </head>
    <body>

        <div id="home" class="screen active">
            <div class="video-feed" style="background: linear-gradient(135deg, #2c3e50, #000);">
                <h2>Short Video Feed (TikTok ပုံစံ)</h2>
                <p>Creator: @aifather</p>
                <div class="actions">
                    <button onclick="switchTab('chat')">💬</button>
                    <button>⭐</button>
                    <button>🔗</button>
                </div>
            </div>
        </div>

        <div id="friends" class="screen">
            <h2>Notifications & Friends</h2>
            <p>@mgmg က သင့်ဗီဒီယိုတွင် @ခေါ်ဆိုခဲ့သည်</p>
        </div>

        <div id="aifather" class="screen">
            <h2>AI Father (Bot Manager)</h2>
            <div class="chat-box">
                <div class="messages" id="botLogs">
                    <div class="msg bot">🤖 AI Father သို့ ကြိုဆိုပါသည်။ /newbotai ဟု ရိုက်၍ ဇာတ်ကောင်ဖန်တီးပါ။</div>
                </div>
                <div class="input-area">
                    <input type="text" id="cmdInput" placeholder="Command ရိုက်ရန် (/newbotai)...">
                    <button onclick="sendCmd()">ပို့ရန်</button>
                </div>
            </div>
        </div>

        <div id="screen-profile" class="screen">
            <h2>Profile မျက်နှာပြင်</h2>
            <p>User Points: 100</p>
        </div>

        <div id="screen-admin" class="screen">
            <h2>Admin & Settings</h2>
            <p>Admin Control Panel</p>
        </div>

        <div class="nav">
            <button onclick="switchTab('home')" class="active" id="nav-home">Home</button>
            <button onclick="switchTab('friends')" id="nav-friends">Friends</button>
            <button onclick="switchTab('aifather')" id="nav-aifather">AI Father</button>
            <button onclick="switchTab('screen-profile')" id="nav-profile">Profile</button>
            <button onclick="switchTab('screen-admin')" id="nav-admin">Admin</button>
        </div>

        <script>
            function switchTab(tabId) {
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
                
                document.getElementById(tabId === 'chat' ? 'home' : tabId).classList.add('active');
                if(tabId === 'chat') tabId = 'home';
                document.getElementById('nav-' + tabId.replace('screen-', ''))?.classList.add('active');
            }

            async function sendCmd() {
                const input = document.getElementById('cmdInput');
                const logs = document.getElementById('botLogs');
                const text = input.value.trim();
                if(!text) return;

                logs.innerHTML += '<div class="msg user">' + text + '</div>';
                input.value = '';

                const res = await fetch('/api/newbot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: text, bio: "Friendly AI", creatorId: "1" })
                });
                const data = await res.json();

                logs.innerHTML += '<div class="msg bot">' + (data.message || data.error) + '</div>';
                logs.scrollTop = logs.scrollHeight;
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/api/newbot', (req, res) => {
    const { username, bio } = req.body;
    const token = 'tear®' + Math.random().toString(36).substring(2, 8);
    bots.push({ username, bio, token });
    res.json({ message: "AI ဇာတ်ကောင် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။ Token: " + token });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
