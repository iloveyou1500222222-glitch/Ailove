const express = require('express');
const { GoogleGenAI } = require('@google/genai'); // Google GenAI SDK အသစ်
const app = express();

app.use(express.json());

// ယာယီ Database များ (နောက်ပိုင်း MongoDB သို့ ပြောင်းနိုင်သည်)
const bots = []; 

// Google GenAI ကို ချိတ်ဆက်ခြင်း (Gemini API Key ထည့်ရန်)
// ⚠️ သင်၏ Gemini API Key ကို ဒီနေရာတွင် ထည့်ပါ သို့မဟုတ် Environment Variable သုံးပါ
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY" });

// 1. AI Bot အသစ် ဖန်တီးခြင်း (AI Father - /newbotai ပုံစံ)
app.post('/api/newbot', (req, res) => {
    try {
        const { username, bio, creatorId } = req.body;

        // အမည် (@user) တူတာ ရှိမရှိ စစ်ဆေးခြင်း
        const existingBot = bots.find(b => b.username === username);
        if (existingBot) {
            return res.status(400).json({ error: "ဤအမည်ဖြင့် ဇာတ်ကောင်ရှိနှင့်ပြီးသားပါ။ အခြားအမည်ပြောင်းပါ။" });
        }

        // Token ထုတ်ပေးခြင်း (ဥပမာ - tear®abctrer5674)
        const randomString = Math.random().toString(36).substring(2, 10);
        const token = `tear®${randomString}`;

        // Bot Link ဖန်တီးခြင်း
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

// 2. ကိုယ်ပိုင် Bot အချက်အလက်များ ကြည့်ရန် (/mybotai ပုံစံ)
app.get('/api/mybots/:creatorId', (req, res) => {
    try {
        const { creatorId } = req.params;
        const userBots = bots.filter(b => b.creatorId === creatorId);
        res.status(200).json({ bots: userBots });
    } catch (err) {
        res.status(500).json({ error: "ဆာဗာအမှားအယွင်းရှိပါသည်။" });
    }
});

// 3. AI ဇာတ်ကောင်နှင့် စကားပြောခြင်း (Gemini AI Integration)
app.post('/api/chat', async (req, res) => {
    try {
        const { botUsername, userMessage } = req.body;

        // သက်ဆိုင်ရာ Bot ကို ရှာခြင်း
        const bot = bots.find(b => b.username === botUsername);
        if (!bot) {
            return res.status(404).json({ error: "ဤ AI ဇာတ်ကောင်ကို မတွေ့ရှိပါ။" });
        }

        // ဇာတ်ညွှန်း (Bio/Personality) မရှိသေးရင် သတိပေးခြင်း
        if (!bot.bio || bot.bio.trim() === "") {
            return res.status(400).json({ error: "ဇာတ်ညွှန်းမရှိသေးပါ။ ကျေးဇူးပြု၍ ဇာတ်ညွှန်းအရင်ထည့်ပါ။" });
        }

        // Gemini AI သို့ ဇာတ်ညွှန်းနှင့် မက်ဆေ့ချ် ပို့ပြီး အဖြေတောင်းခြင်း
        const prompt = `
        မင်းရဲ့ ဇာတ်စရိုက် (Personality) က ဒီလိုဖြစ်တယ်: "${bot.bio}"
        အခု User က မင်းကို ဒီလိုပြောတယ်: "${userMessage}"
        မင်းရဲ့ ဇာတ်စရိုက်အတိုင်း မြန်မာလို ချိုသာစွာ သဘာဝကျကျ ပြန်စာရေးပေးပါ။
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const aiReply = response.text;

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
