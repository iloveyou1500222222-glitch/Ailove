const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());

// ယာယီ Database (နောက်ပိုင်း MongoDB သို့မဟုတ် Firebase သုံးပါမည်)
const users = [];

// 1. Sign Up API (အကောင့်ဖွင့်ခြင်း)
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Password နှစ်ခု တူမတူ စစ်ဆေးခြင်း
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Password နှစ်ခု မတူပါ။ ကျေးဇူးပြု၍ ပြန်စစ်ပါ။" });
        }

        // Email ရှိပြီးသားလား စစ်ဆေးခြင်း
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: "ဤ Email ဖြင့် အကောင့်ရှိနှင့်ပြီးသား ဖြစ်ပါသည်။" });
        }

        // Password ကို လုံခြုံရေးအတွက် Hash လုပ်ခြင်း
        const hashedPassword = await bcrypt.hash(password, 10);

        // User အသစ် သိမ်းဆည်းခြင်း
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            profilePic: "", // Default PF 
            points: 100 // အစအဦး ပွိုင့်လက်ကျန်
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

// 2. Login API (အကောင့်ဝင်ခြင်း)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
