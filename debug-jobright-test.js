// 🔧 DEBUG JOBRIGHT TEST - Better error handling
// File: debug-jobright-test.js

// Description: Test the jobRight function with better error handling
cat > debug-jobright-test.js << 'EOF'
// 🔧 DEBUG JOBRIGHT TEST - Better error handling
// File: debug-jobright-test.js

require('dotenv').config();
const { chromium } = require('playwright');

async function debugJobRightTest() {
  console.log('🔧 Debug JobRight.ai Test - Better Error Handling...\n');
  
  let browser = null;
  let page = null;
  
  try {
    // Step 1: Environment Debug
    console.log('🔧 Step 1: Environment Debug');
    console.log(`✅ Node.js version: ${process.version}`);
    console.log(`✅ Current directory: ${process.cwd()}`);
    console.log(`✅ Password exists: ${process.env.JOBRIGHT_PASSWORD ? 'YES' : 'NO'}`);
    console.log(`✅ Password length: ${process.env.JOBRIGHT_PASSWORD ? process.env.JOBRIGHT_PASSWORD.length : 0} characters`);
    
    if (!process.env.JOBRIGHT_PASSWORD) {
      throw new Error('JOBRIGHT_PASSWORD not found in environment variables');
    }

    // Step 2: Playwright Test
    console.log('\n🎭 Step 2: Playwright Test');
    console.log('Launching browser...');
    
    browser = await chromium.launch({
      headless: false,
      slowMo: 1000,
      timeout: 30000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    console.log('✅ Browser launched successfully');

    // Step 3: Create Context and Page
    console.log('\n📄 Step 3: Creating browser context...');
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    page = await context.newPage();
    console.log('✅ Page created successfully');

    // Step 4: Navigate
    console.log('\n🌐 Step 4: Navigation Test');
    console.log('Navigating to JobRight.ai...');
    
    await page.goto('https://jobright.ai', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    console.log('✅ Page loaded successfully');

    // Step 5: Take screenshot and analyze
    console.log('\n🔍 Step 5: Page Analysis');
    await page.waitForTimeout(3000);
    
    const pageTitle = await page.title();
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    console.log(`📋 Page Title: ${pageTitle}`);

    await page.screenshot({ 
      path: `debug-success-${Date.now()}.png`,
      fullPage: true 
    });
    console.log('📸 Screenshot saved successfully');

    console.log('\n🎉 Basic test passed! Browser and navigation working.');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    console.error('Error type:', error.name);
    
    if (page) {
      try {
        await page.screenshot({ 
          path: `debug-error-${Date.now()}.png`,
          fullPage: true 
        });
        console.log('📸 Error screenshot saved');
      } catch (e) {
        console.log('❌ Could not save screenshot');
      }
    }
  } finally {
    if (browser) {
      console.log('\n🧹 Cleaning up...');
      await browser.close();
      console.log('✅ Browser closed');
    }
  }
}

debugJobRightTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error.message);
    process.exit(1);
  });
EOF