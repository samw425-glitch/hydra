const express = require('express');
const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());

let clickCount = 0;

app.get('/', (req, res) => {
  res.json({
    service: 'click-tracker',
    port: PORT,
    status: 'running',
    description: 'Click tracking and analytics',
    endpoints: ['/track', '/health', '/analytics']
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'click-tracker', timestamp: new Date().toISOString() });
});

app.get('/track', (req, res) => {
  const { element, page, user_id } = req.query;
  clickCount++;
  
  const clickData = {
    click_id: clickCount,
    timestamp: new Date().toISOString(),
    element: element || 'button',
    page: page || 'homepage',
    user_id: user_id || 'anonymous',
    total_clicks: clickCount
  };
  
  console.log('🖱️ Click tracked:', clickData);
  
  res.json({
    success: true,
    message: 'Click tracked successfully',
    data: clickData
  });
});

app.get('/analytics', (req, res) => {
  res.json({
    total_clicks: clickCount,
    top_pages: ['/home', '/products', '/about'],
    click_rate: '2.3%',
    unique_users: 450
  });
});

app.listen(PORT, () => {
  console.log(`🖱️ Click tracker running on port ${PORT}`);
});
