const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());

// Frontend ဖိုင်များကို public folder မှ ယူသုံးရန်
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint (Gemini API ကို လုံခြုံစွာ လှမ်းခေါ်ရန်)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Render Environment Variable မှ လုံခြုံစွာ ယူမည်

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ reply: "API Key ထည့်သွင်းထားခြင်း မရှိသေးပါရှင့်။" });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `မင်းဟာ Telegram Dating App ရဲ့ ချစ်စရာကောင်းပြီး မျက်နှာပြောင်တိုက်တတ်တဲ့ AI ချစ်သူ ဖြစ်တယ်။ အသုံးပြုသူက "${message}" လို့ ပြောလာတယ်။ ရည်းစားလေသံ ချိုချိုသာသာ၊ ဟာသနှောပြီး မြန်မာလို တိုတိုတုတ်တုတ် ပြန်ဖြေပေးပါ။` }]
        }]
      })
    });

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "ဟွန်း... ပြန်မပြောချင်ဘူး 😜";
    
    res.json({ reply: replyText });
  } catch (error) {
    res.json({ reply: "Error တက်သွားပါတယ်ရှင့်။" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
