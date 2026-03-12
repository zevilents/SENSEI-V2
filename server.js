require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname)));

// Konfigurasi menggunakan Google Gemini API
const client = new OpenAI({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/', // <-- URL Khusus Gemini
  // Kita biarkan nama variabelnya OPENROUTER_API_KEY agar kamu tidak perlu repot
  // menghapus variabel lama di Render. Tinggal ganti isinya saja nanti.
  apiKey: process.env.OPENROUTER_API_KEY, 
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const completion = await client.chat.completions.create({
      model: 'gemini-1.5-flash', // <-- Model Gemini yang super cepat & pintar
      messages,
    });

    // --- SABUK PENGAMAN ---
    if (!completion || !completion.choices || completion.choices.length === 0) {
      console.error('Respons API Tidak Valid:', completion);
      return res.status(500).json({ 
        error: 'Invalid AI Response', 
        details: 'API Gemini menolak request. Cek API Key.' 
      });
    }
    // -----------------------

    const choice = completion.choices[0];
    const responseMessage = choice.message;

    res.json({
      role: responseMessage.role,
      content: responseMessage.content,
      reasoning_details: null,
    });
  } catch (error) {
    console.error('API Error:', error.message);
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
