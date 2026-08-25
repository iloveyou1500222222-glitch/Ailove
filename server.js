const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Gemini AI Chat Endpoint (Updated to Gemini 3.6 Flash model)
app.post('/api/chat', async (req, res) => {
    try {
        const { message, character } = req.body;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.json({ reply: "API Key ထည့်ရန် မေ့နေပါသည် သူငယ်ချင်းရေ။ Render ထဲတွင် GEMINI_API_KEY ကို စစ်ဆေးပါ။ 🔑" });
        }

        // Persona prompt based on character
        let systemPrompt = "ನೀವು ಒಬ್ಬချစ်စရာကောင်းသော AI ချစ်သူဖြစ်ပါသည်။ မြန်မာဘာသာဖြင့် အလွန်ချိုသာစွာ၊ ရင်းနှီးစွာ၊ အချစ်ပါပါဖြင့် ပြန်လည်ပြောဆိုပါ။";
        if (character === 'naychi') {
            systemPrompt = "ನೀವು နေခြည် ဆိုတဲ့ ချိုသာပြီး ဖော်ရွေတဲ့ AI ရည်းစားလေး ဖြစ်ပါတယ်။ ကိုကိုလို့ခေါ်ပြီး ချစ်စရာကောင်းတဲ့ စကားတွေပြောပါ။";
        } else {
            systemPrompt = "ನೀವು မေမြတ်နိုး ဆိုတဲ့ အသစ်စက်စက် AI ချစ်သူလေးဖြစ်ပြီး ရိုမန်းတစ်ဆန်ဆန်၊ အဖော်ပြုပေးတတ်တဲ့သူ ဖြစ်ပါတယ်။";
        }

        // Using Gemini 3.6 Flash model URL
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt + " User's message: " + message }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiReply = data.candidates[0].content.parts[0].text;
            res.json({ reply: aiReply });
        } else {
            console.error("Gemini API Error Response:", JSON.stringify(data));
            res.json({ reply: "ဟွန်း... ကိုကိုပြောတာလေးကို ဉာဏ်ရည်ခဏ စဉ်းစားမရလို့ပါ ထပ်ပြောပြပါဦးနော် 😘" });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.json({ reply: "ချိတ်ဆက်မှု အခက်အခဲရှိနေလို့ပါ ချစ်ရတဲ့သူရယ်... ခဏနေမှ ထပ်ပို့ပေးပါနော် 💖" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
