// routes/ai.js — AI proxy: keeps API keys server-side
// Never forward raw API keys to the browser.

const router = require('express').Router();
const auth = require('../middleware/auth');

const SYSTEM_PROMPT = `You are Priya, an AI safety assistant in the SHE SAFE women safety app. 
Be concise, empathetic, and practical. Focus on actionable safety advice.
Always recommend calling 112 (India Emergency) in real emergencies.
Never make up facts. If you don't know something, say so.`;

router.post('/chat', auth, async (req, res) => {
  const { messages, context } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const openAIKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openAIKey && !geminiKey) {
    return res.status(503).json({ error: 'No AI backend configured on server. Using offline knowledge base.' });
  }

  // Build message array with optional context injection
  const systemContent = context
    ? `${SYSTEM_PROMPT}\n\nUser context: ${context}`
    : SYSTEM_PROMPT;

  try {
    if (openAIKey) {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAIKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemContent },
            ...messages.slice(-10), // last 10 for context window
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
      const data = await resp.json();
      if (data.error) return res.status(502).json({ error: data.error.message });
      return res.json({ reply: data.choices[0].message.content, model: data.model });
    }

    if (geminiKey) {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: messages.slice(-10).map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
            systemInstruction: { parts: [{ text: systemContent }] },
          }),
        }
      );
      const data = await resp.json();
      if (data.error) return res.status(502).json({ error: data.error.message });
      return res.json({ reply: data.candidates[0].content.parts[0].text, model: 'gemini-pro' });
    }
  } catch (err) {
    console.error('AI proxy error:', err);
    return res.status(502).json({ error: 'AI service unreachable' });
  }
});

module.exports = router;
