require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname)));

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Menggunakan fetch langsung ke OpenRouter sesuai permintaanmu
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "arcee-ai/trinity-mini:free",
        "messages": messages,
        // Karena kamu bilang "gak mau reasoning", kita set false di sini
        "reasoning": { "enabled": false } 
      })
    });

    const result = await response.json();

    // Cek jika ada error dari OpenRouter (misal API Key salah atau kuota habis)
    if (!response.ok) {
      console.error('OpenRouter Error:', result);
      return res.status(response.status).json({
        error: 'OpenRouter API Error',
        details: result.error?.message || 'Terjadi kesalahan pada server OpenRouter'
      });
    }

    const aiMessage = result.choices[0].message;

    // Kirim balik ke frontend
    res.json({
      role: aiMessage.role,
      content: aiMessage.content,
      // Kita tetap kirim null untuk reasoning_details karena fitur dimatikan
      reasoning_details: null 
    });

  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌸 Server Sakura Academy Aktif di Port ${PORT}`);
});
