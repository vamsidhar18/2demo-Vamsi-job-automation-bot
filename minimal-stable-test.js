// 🦊 Firefox Browser Test - Alternative to Chromium
require('dotenv').config();
const { firefox } = require('playwright');

async function firefoxTest() {
  console.log('🦊 Testing with Firefox instead of Chromium...\n');
  
  let browser = null;
  
  try {
    console.log('🔧 Environment Check:');
    console.log(`✅ Password: ${process.env.JOBRIGHT_PASSWORD ? 'Set' : 'Missing'}`);

    console.log('\n🦊 Launching Firefox...');
    browser = await firefox.launch({
      headless: false,
      slowMo: 1000,
      timeout: 30000
    });
    
    console.log('✅ Firefox launched successfully');

    const page = await browser.newPage();
    console.log('✅ Page created');

    console.log('\n🌐 Testing JobRight.ai with Firefox...');
    await page.goto('https://jobright.ai', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    console.log('✅ JobRight.ai loaded in Firefox');

    await page.waitForTimeout(3000);

    const title = await page.title();
    const url = page.url();
    console.log(`📋 Title: ${title}`);
    console.log(`📍 URL: ${url}`);

    await page.screenshot({ 
      path: `firefox-jobright-${Date.now()}.png`,
      fullPage: true 
    });
    console.log('📸 Firefox screenshot saved');

    console.log('\n🔍 Looking for SIGN IN with Firefox...');
    const buttons = await page.$$eval('button, a', elements => 
      elements.map(el => el.textContent?.trim()).filter(text => text && text.includes('SIGN'))
    );
    
    if (buttons.length > 0) {
      console.log('✅ Found sign-in related buttons:', buttons);
    } else {
      console.log('⚠️ No sign-in buttons found');
    }

    // Keep browser open for a moment
    console.log('\n⏳ Keeping Firefox open for 5 seconds...');
    await page.waitForTimeout(5000);

    console.log('\n🎉 Firefox test completed successfully!');

  } catch (error) {
    console.error('\n💥 Firefox test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('✅ Firefox closed');
    }
  }
}

firefoxTest();