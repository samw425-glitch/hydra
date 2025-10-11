const express = require('express');
const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());

// UTM tracking routes
app.get('/', (req, res) => {
  res.json({
    service: 'utm-tracker',
    port: PORT,
    status: 'running',
    description: 'UTM parameter tracking service',
    endpoints: ['/track', '/analytics', '/health']
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'utm', timestamp: new Date().toISOString() });
});

// Track UTM parameters
app.get('/track', (req, res) => {
  const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = req.query;
  
  const trackingData = {
    timestamp: new Date().toISOString(),
    utm_source: utm_source || 'direct',
    utm_medium: utm_medium || 'none',
    utm_campaign: utm_campaign || 'organic',
    utm_term: utm_term || '',
    utm_content: utm_content || '',
    ip: req.ip,
    user_agent: req.get('User-Agent')
  };
  
  console.log('📊 UTM Tracked:', trackingData);
  
  res.json({
    success: true,
    message: 'UTM parameters tracked',
    data: trackingData
  });
});

// Analytics endpoint
app.get('/analytics', (req, res) => {
  res.json({
    total_tracks: 1500,
    top_campaigns: ['winter_sale', 'newsletter', 'social_media'],
    conversion_rate: '2.3%'
  });
});

app.listen(PORT, () => {
  console.log(`📊 UTM Tracker running on port ${PORT}`);
});
