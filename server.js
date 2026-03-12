require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname)));

const client = new OpenAI({
  baseURL: 'https://free.v36.cm/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages,
    });

    const choice = completion.choices[0];
    const responseMessage = choice.message;

    res.json({
      role: responseMessage.role,
      content: responseMessage.content,
      reasoning_details: responseMessage.reasoning_content || null,
    });
  } catch (error) {
    console.error('OpenRouter API Error:', error.message);
    res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌸 Server running on http://localhost:${PORT}`);
});
