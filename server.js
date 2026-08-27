const express = require('express');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

app.use(express.json());

const users = [];
const bots = []; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

app.get('/', (req, res) => {
    res.status(200).send("🚀 AI Chat App Backend is running successfully!");
});

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Password နှစ်ခု မတူပါ။" });
        }
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: "Email ရှိနှင့်ပြီးသားပါ။" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: Date.now().toString(), name, email, password: hashedPassword, points: 100 };
        users.push(newUser);
        res.status(201).json({ message: "အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။", userId: newUser.id, name: newUser.name });
    } catch (err) {
        res.status(500).json({ error: "ဆာဗာအမှားအယွင်းရှိပါသည်။" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email);
        if (!user) return res.status(404).json({ error: "အကောင့်မရှိပါ။" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Password မှားယွင်းနေပါသည်။" });
        res.status(200).json({ message: "အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်။", userId: user.id, name: user.name });
    } catch (err) {
        res.status(500).json({ error: "ဆာဗာအမှားအယွင်းရှိပါသည်။" });
    }
});

app.post('/api/newbot', (req, res) => {
    try {
        const { username, bio, creatorId } = req.body;
        const existingBot = bots.find(b => b.username === username);
        if (existingBot) return res.status(400).json({ error: "ဤအမည်ဖြင့် ဇာတ်ကောင်ရှိပြီးသားပါ။" });
        const randomString = Math.random().toString(36).substring(2, 10);
        const token = `tear®${randomString}`;
        const newBot = { id: Date.now().toString(), username, bio, token, creatorId };
        bots.push(newBot);
        res.status(201).json({ message: "AI ဇာတ်ကောင် ဖန်တီးပြီးပါပြီ။", token, username });
    } catch (err) {
        res.status(500).json({ error: "ဆာဗာအမှားအယွင်းရှိပါသည်။" });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { botUsername, userMessage } = req.body;
        const bot = bots.find(b => b.username === botUsername);
        if (!bot) return res.status(404).json({ error: "AI ဇာတ်ကောင် မတွေ့ပါ။" });
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `မင်းရဲ့ဇာတ်စရိုက်: "${bot.bio}"။ User ကပြောသည်: "${userMessage}"။ မြန်မာလို ချိုသာစွာ ပြန်ပေးပါ။`;
        const result = await model.generateContent(prompt);
        const aiReply = (await result.response).text();
        res.status(200).json({ botUsername: bot.username, reply: aiReply });
    } catch (err) {
        res.status(500).json({ error: "AI ချိတ်ဆက်မှု အမှားရှိသည်။" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
