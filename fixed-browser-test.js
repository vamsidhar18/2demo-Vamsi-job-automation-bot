
node -e 
const { chromium } = require('playwright');
(async () => {
  try {
    console.log('Testing basic browser launch...');
    const browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Browser launched');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();
    console.log('✅ Test completed');
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
})();
