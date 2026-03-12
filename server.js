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

    // 1. Ubah format pesan dari Frontend menjadi format asli Gemini
    let systemInstruction = "";
    const geminiContents = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = msg.content; // Pisahkan instruksi rahasia (System Prompt)
      } else {
        // Gemini menggunakan role 'model' untuk AI, dan 'user' untuk manusia
        geminiContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    const bodyData = {
      contents: geminiContents,
    };

    // Masukkan System Prompt jika ada
    if (systemInstruction) {
      bodyData.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    // 2. Tembak langsung ke API asli Gemini (Persis seperti format CURL kamu!)
    const apiKey = process.env.OPENROUTER_API_KEY; // Tetap pakai variabel ini di Render agar praktis
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    // Gunakan fungsi fetch bawaan tanpa library pihak ketiga
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData)
    });

    const data = await response.json();

    // 3. Tangkap dan tampilkan jika kunci salah atau kuota habis
    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json({ 
        error: 'Gemini API Error', 
        details: data.error?.message || 'Terjadi kesalahan pada server Gemini' 
      });
    }

    // 4. Ambil teks balasan dan kirim kembali ke Frontend
    const textContent = data.candidates[0].content.parts[0].text;

    res.json({
      role: 'assistant',
      content: textContent,
      reasoning_details: null,
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
  console.log(`🌸 Server Sakura running on http://localhost:${PORT}`);
});
