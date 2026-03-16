import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json({ limit: '50mb' }));

app.post('/api/analyze', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

const server = app.listen(3001, '0.0.0.0', () => console.log('API server running on port 3001'));
server.timeout = 60000;