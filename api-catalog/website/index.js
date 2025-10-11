const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'website', 
    timestamp: new Date().toISOString() 
  });
});

// Website routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hydra Website - Home</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; }
        .nav { background: #f4f4f4; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .nav a { margin-right: 20px; text-decoration: none; color: #333; font-weight: bold; }
        .nav a:hover { color: #007bff; }
        .service-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .service-card { border: 1px solid #ddd; padding: 20px; border-radius: 5px; background: #f9f9f9; }
        .service-card h3 { margin-top: 0; color: #333; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="nav">
          <a href="/">Home</a>
          <a href="/Lead_Generation_Strategies">Lead Generation</a>
          <a href="/seo">SEO Services</a>
          <a href="/analytics">Analytics</a>
          <a href="/api">API Docs</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/health">Health</a>
        </div>
        
        <h1>🌐 Hydra Website Service</h1>
        <p><strong>Port:</strong> ${PORT} | <strong>Status:</strong> <span style="color: green;">RUNNING</span></p>
        
        <h2>Welcome to Hydra Ecosystem</h2>
        <p>This is the main website service of your distributed microservices architecture.</p>
        
        <h3>Available Services:</h3>
        <div class="service-grid">
          <div class="service-card">
            <h3>🌐 Website</h3>
            <p>Main website service (Port 3000)</p>
          </div>
          <div class="service-card">
            <h3>🚀 API</h3>
            <p>API endpoints (Port 4000)</p>
          </div>
          <div class="service-card">
            <h3>📊 UTM Tracker</h3>
            <p>Marketing tracking (Port 9000)</p>
          </div>
          <div class="service-card">
            <h3>🔗 Backlinking</h3>
            <p>Link management (Port 10000)</p>
          </div>
          <div class="service-card">
            <h3>📇 Indexing</h3>
            <p>Search engine indexing (Port 11000)</p>
          </div>
          <div class="service-card">
            <h3>👷 Worker</h3>
            <p>Background jobs (Port 12000)</p>
          </div>
          <div class="service-card">
            <h3>🖱️ Click Tracker</h3>
            <p>Click analytics (Port 13000)</p>
          </div>
          <div class="service-card">
            <h3>📤 Uploader</h3>
            <p>File processing (Port 14000)</p>
          </div>
          <div class="service-card">
            <h3>🎼 Orchestrator</h3>
            <p>Service coordination (Port 8080)</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Lead Generation Strategies Page
app.get('/Lead_Generation_Strategies', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lead Generation Strategies - Hydra</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .container { max-width: 1000px; margin: 0 auto; }
        .nav { background: #f4f4f4; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .nav a { margin-right: 20px; text-decoration: none; color: #333; font-weight: bold; }
        .nav a:hover { color: #007bff; }
        .strategy { background: #f9f9f9; padding: 20px; margin: 15px 0; border-left: 4px solid #007bff; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="nav">
          <a href="/">Home</a>
          <a href="/Lead_Generation_Strategies">Lead Generation</a>
          <a href="/seo">SEO Services</a>
          <a href="/analytics">Analytics</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
        
        <h1>🚀 Lead Generation Strategies</h1>
        <p>Effective strategies to generate quality leads for your business.</p>
        
        <div class="strategy">
          <h3>1. Content Marketing</h3>
          <p>Create valuable content that attracts potential customers and builds trust.</p>
          <ul>
            <li>Blog posts and articles</li>
            <li>E-books and whitepapers</li>
            <li>Webinars and online courses</li>
          </ul>
        </div>
        
        <div class="strategy">
          <h3>2. SEO Optimization</h3>
          <p>Optimize your website to rank higher in search engine results.</p>
          <ul>
            <li>Keyword research and optimization</li>
            <li>Technical SEO improvements</li>
            <li>Local SEO strategies</li>
          </ul>
        </div>
        
        <div class="strategy">
          <h3>3. Social Media Marketing</h3>
          <p>Leverage social platforms to reach and engage with your audience.</p>
          <ul>
            <li>LinkedIn for B2B leads</li>
            <li>Facebook and Instagram for B2C</li>
            <li>Twitter for real-time engagement</li>
          </ul>
        </div>
        
        <div class="strategy">
          <h3>4. Email Marketing</h3>
          <p>Build and nurture relationships through targeted email campaigns.</p>
          <ul>
            <li>Newsletter subscriptions</li>
            <li>Drip campaigns</li>
            <li>Personalized outreach</li>
          </ul>
        </div>
        
        <div class="strategy">
          <h3>5. Paid Advertising</h3>
          <p>Use targeted ads to reach specific audiences quickly.</p>
          <ul>
            <li>Google Ads (PPC)</li>
            <li>Social media advertising</li>
            <li>Retargeting campaigns</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Additional useful routes
app.get('/seo', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>SEO Services - Hydra</title></head>
    <body>
      <div style="margin: 40px;">
        <h1>🔍 SEO Services</h1>
        <p>Search Engine Optimization services to improve your online visibility.</p>
        <p><a href="/">← Back to Home</a></p>
      </div>
    </body>
    </html>
  `);
});

app.get('/analytics', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Analytics - Hydra</title></head>
    <body>
      <div style="margin: 40px;">
        <h1>📈 Analytics Dashboard</h1>
        <p>Comprehensive analytics and reporting for your business.</p>
        <p><a href="/">← Back to Home</a></p>
      </div>
    </body>
    </html>
  `);
});

app.get('/api', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>API Documentation - Hydra</title></head>
    <body>
      <div style="margin: 40px;">
        <h1>🚀 API Documentation</h1>
        <p>Complete API documentation for Hydra microservices.</p>
        <p><a href="/">← Back to Home</a></p>
      </div>
    </body>
    </html>
  `);
});

app.get('/about', (req, res) => {
  res.send('<h1>About Us</h1><p>This is the about page.</p><a href="/">Home</a>');
});

app.get('/contact', (req, res) => {
  res.send('<h1>Contact</h1><p>Contact us here.</p><a href="/">Home</a>');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head><title>404 - Page Not Found</title></head>
    <body style="margin: 40px;">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p><a href="/">← Back to Home</a></p>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 Website Service running on port ${PORT}`);
});
