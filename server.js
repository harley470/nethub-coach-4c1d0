const express = require('express');
const app = express();
app.use(express.raw({ type: '*/*', limit: '50mb' }));
const { handler } = require('./netlify/functions/proxy');
app.all('/', async (req, res) => {
  const event = {
    httpMethod: req.method,
    headers: req.headers,
    body: req.body ? req.body.toString() : null,
    queryStringParameters: req.query,
  };
  try {
    const result = await handler(event);
    res.status(result.statusCode);
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.set(key, value);
      });
    }
    res.send(result.body || '');
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
