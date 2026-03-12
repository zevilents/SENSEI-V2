require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname)));

// Konfigurasi kembali ke OpenRouter
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY, // Pakai API Key OpenRouter kamu di Render
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Memanggil OpenRouter dengan fitur reasoning diaktifkan
    const apiResponse = await client.chat.completions.create({
      model: 'arcee-ai/trinity-large-preview:free',
      messages: messages,
      reasoning: { enabled: true } // AKTIFKAN FITUR BERPIKIR
    });

    const choice = apiResponse.choices[0];
    const responseMessage = choice.message;

    // Kirim balik konten dan detail pemikirannya (reasoning_details) ke frontend
    res.json({
      role: responseMessage.role,
      content: responseMessage.content,
      // OpenRouter mengirim reasoning dalam properti reasoning_details
      reasoning_details: responseMessage.reasoning_details || null 
    });

  } catch (error) {
    console.error('OpenRouter Error:', error.message);
    res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌸 Sensei Thinking Engine running on port ${PORT}`);
});
