const express = require('express');
const app = express();

app.use(express.json());

// simple homepage
app.get('/', (req, res) => {
  res.send('✅ Click Tracker running successfully on /');
});

// sample click tracking endpoint
app.post('/track', (req, res) => {
  const { userId, url } = req.body;
  console.log(`Tracked click: user=${userId}, url=${url}`);
  res.json({ success: true, message: 'Click tracked successfully!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Click Tracker running on port ${PORT}`));
