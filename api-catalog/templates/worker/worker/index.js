const puppeteer = require('puppeteer');
const Queue = require('bull');

const screenshotQueue = new Queue('screenshots', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

console.log('🔧 Hydra Worker starting...');

screenshotQueue.process(async (job) => {
  const { url, options } = job.data;
  console.log(`📸 Taking screenshot of ${url}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const screenshot = await page.screenshot({
      fullPage: options?.fullPage || false,
      type: options?.format || 'png'
    });
    await browser.close();
    return {
      success: true,
      screenshot: screenshot.toString('base64'),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
});

screenshotQueue.on('completed', (job) => console.log(`✅ Job ${job.id} completed`));
screenshotQueue.on('failed', (job, err) => console.error(`❌ Job ${job.id} failed:`, err.message));

console.log('✨ Worker ready');
