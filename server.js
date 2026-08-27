const express = require('express');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

app.use(express.json());

// ယာယီ Database များ (နောက်ပိုင်း MongoDB သို့ ပြောင်းနိုင်သည်)
const users = [];
const bots = []; 

// Gemini AI API ချိတ်ဆက်ခြင်း (Render ၏ Environment Variable မှ GEMINI_API_KEY ကို ယူပါမည်)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

// ==========================================
// 1. AUTHENTICATION (Sign Up & Login)
// ==========================================

// Sign Up API (အကောင့်ဖွင့်ခြင်း)
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Password နှစ်ခု မတူပါ။ ကျေးဇူးပြု၍ ပြန်စစ်ပါ။" });
        }

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: "ဤ Email ဖြင့် အကောင့်ရှိနှင့်ပြီးသား ဖြစ်ပါသည်။" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            points: 100 
        };

        users.push(newUser);

        res.status(201).json({ 
            message: "အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။", 
            userId: newUser.id,
            name: newUser.name 
        });

    } catch (err) {
        res.status(500).json({ error: "ဆာဗာတွင် အမှားအယွင်း ရှိနေပါသည်။" });
    }
});

// Login API (အကောင့်ဝင်ခြင်း)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(404).json({ error: "အကောင့်မရှိပါ။ ကျေးဇူးပြု၍ အကောင့်ရင့်ဖွင့်ပါ။" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Password မှားယွင်းနေပါသည်။" });
        }

        res.status(200).json({ 
            message: "အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်။", 
            userId: user.id,
            name: user.name 
        });

    } catch (err) {
        res.status(500).json({ error: "ဆာဗာတွင် အမှားအယွင်း ရှိနေပါသည်။" });
    }
});


// ==========================================
// 2. AI FATHER (Bot Creation & Chat System)
// ==========================================

// AI Bot အသစ် ဖန်တီးခြင်း (/newbotai ပုံစံ)
app.post('/api/newbot', (req, res) => {
    try {
        const { username, bio, creatorId } = req.body;

        const existingBot = bots.find(b => b.username === username);
        if (existingBot) {
            return res.status(400).json({ error: "ဤအမည်ဖြင့် ဇာတ်ကောင်ရှိနှင့်ပြီးသားပါ။ အခြားအမည်ပြောင်းပါ။" });
        }

        // Token ထုတ်ပေးခြင်း (ဥပမာ - tear®abctrer5674)
        const randomString = Math.random().toString(36).substring(2, 10);
        const token = `tear®${randomString}`;
        const botLink = `https://yourapp.com/bot/${username}`;

        const newBot = {
            id: Date.now().toString(),
            username, // ဥပမာ - @love45_ai
            bio,      // ဇာတ်ညွှန်း သို့မဟုတ် စရိုက်
            token,
            botLink,
            creatorId
        };

        bots.push(newBot);

        res.status(201).json({
            message: "AI ဇာတ်ကောင် ဖန်တီးခြင်း အောင်မြင်ပါသည်။",
            token: newBot.token,
            botLink: newBot.botLink,
            username: newBot.username
        });

    } catch (err) {
        res.status(500).json({ error: "ဆာဗာတွင် အမှားအယွင်း ရှိနေပါသည်။" });
    }
});

// ကိုယ်ပိုင် Bot အချက်အလက်များ ကြည့်ရန် (/mybotai ပုံစံ)
app.get('/api/mybots/:creatorId', (req, res) => {
    try {
        const { creatorId } = req.params;
        const userBots = bots.filter(b => b.creatorId === creatorId);
        res.status(200).json({ bots: userBots });
    } catch (err) {
        res.status(500).json({ error: "ဆာဗာအမှားအယွင်းရှိပါသည်။" });
    }
});

// AI ဇာတ်ကောင်နှင့် စကားပြောခြင်း (Gemini AI Integration)
app.post('/api/chat', async (req, res) => {
    try {
        const { botUsername, userMessage } = req.body;

        const bot = bots.find(b => b.username === botUsername);
        if (!bot) {
            return res.status(404).json({ error: "ဤ AI ဇာတ်ကောင်ကို မတွေ့ရှိပါ။" });
        }

        if (!bot.bio || bot.bio.trim() === "") {
            return res.status(400).json({ error: "ဇာတ်ညွှန်းမရှိသေးပါ။ ကျေးဇူးပြု၍ ဇာတ်ညွှန်းအရင်ထည့်ပါ။" });
        }

        // Gemini AI မော်ဒယ်ကို ခေါ်ယူခြင်း
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        မင်းရဲ့ ဇာတ်စရိုက် (Personality) က ဒီလိုဖြစ်တယ်: "${bot.bio}"
        အခု User က မင်းကို ဒီလိုပြောတယ်: "${userMessage}"
        မင်းရဲ့ ဇာတ်စရိုက်အတိုင်း မြန်မာလို ချိုသာစွာ သဘာဝကျကျ ပြန်စာရေးပေးပါ။
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiReply = response.text();

        res.status(200).json({ 
            botUsername: bot.username,
            reply: aiReply 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI နှင့် ချိတ်ဆက်ရာတွင် အမှားအယွင်း ရှိနေပါသည်။" });
    }
});

// Server စတင်ခြင်း
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
