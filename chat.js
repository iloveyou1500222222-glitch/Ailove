export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  
  // Vercel Environment Variable ထဲက လျှို့ဝှက် Key ကို ယူသုံးခြင်း
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ reply: "API Key တပ်ဆင်ထားခြင်း မရှိသေးပါရှင့်။" });
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
    
    return res.status(200).json({ reply: replyText });
  } catch (error) {
    return res.status(500).json({ reply: "Error တက်သွားပါတယ်ရှင့်။" });
  }
}
