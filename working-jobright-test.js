// 🚀 Working JobRight.ai Test
require('dotenv').config();
const { chromium } = require('playwright');

async function testJobRight() {
  console.log('🚀 Testing JobRight.ai Automation...\n');
  
  let browser = null;
  let page = null;
  
  try {
    console.log('🔧 Environment Check:');
    console.log(`✅ Password: ${process.env.JOBRIGHT_PASSWORD ? 'Set' : 'Missing'}`);
    
    if (!process.env.JOBRIGHT_PASSWORD) {
      throw new Error('JOBRIGHT_PASSWORD not set in .env file');
    }

    console.log('\n🎭 Launching browser...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 1500
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    page = await context.newPage();
    console.log('✅ Browser ready');

    console.log('\n🌐 Loading JobRight.ai...');
    await page.goto('https://jobright.ai', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    console.log('✅ Page loaded');

    await page.waitForTimeout(3000);

    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ 
      path: `jobright-test-${Date.now()}.png`, 
      fullPage: true 
    });
    console.log('✅ Screenshot saved');

    console.log('\n🔍 Looking for SIGN IN button...');
    
    const signInSelectors = [
      'text="SIGN IN"',
      'button:has-text("SIGN IN")',
      'a:has-text("SIGN IN")',
      'button:has-text("Sign In")',
      'a:has-text("Sign In")'
    ];
    
    let signInFound = false;
    for (const selector of signInSelectors) {
      try {
        console.log(`   Trying: ${selector}`);
        const element = await page.waitForSelector(selector, { timeout: 3000 });
        if (element) {
          console.log(`   ✅ Found SIGN IN with: ${selector}`);
          await element.click();
          signInFound = true;
          console.log('   ✅ SIGN IN clicked');
          break;
        }
      } catch (error) {
        console.log(`   ❌ Failed: ${selector}`);
      }
    }
    
    if (signInFound) {
      await page.waitForTimeout(3000);
      await page.screenshot({ 
        path: `signin-clicked-${Date.now()}.png`
      });
      console.log('📸 Screenshot after SIGN IN click saved');
    } else {
      console.log('⚠️ SIGN IN button not found');
    }

    console.log('\n📝 Looking for login form...');
    await page.waitForTimeout(2000);
    
    const emailField = await page.$('input[type="email"], input[name="email"]');
    const passwordField = await page.$('input[type="password"]');
    
    if (emailField && passwordField) {
      console.log('✅ Login form found!');
      
      await emailField.fill('vdr1800@gmail.com');
      console.log('✅ Email filled');
      
      await passwordField.fill(process.env.JOBRIGHT_PASSWORD);
      console.log('✅ Password filled');
      
      await page.screenshot({ 
        path: `form-filled-${Date.now()}.png`
      });
      console.log('📸 Form filled screenshot saved');
      
      console.log('\n🚀 Submitting form...');
      const submitBtn = await page.$('button[type="submit"], button:has-text("Sign In")');
      if (submitBtn) {
        await submitBtn.click();
        console.log('✅ Form submitted');
      } else {
        await passwordField.press('Enter');
        console.log('✅ Enter key pressed');
      }
      
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: `final-result-${Date.now()}.png`
      });
      console.log('📸 Final result screenshot saved');
      
      const finalUrl = page.url();
      console.log(`📍 Final URL: ${finalUrl}`);
      
      if (finalUrl !== 'https://jobright.ai/' && !finalUrl.includes('login')) {
        console.log('🎉 SUCCESS! Login appears to have worked!');
        console.log('🚀 Ready for job automation!');
      } else {
        console.log('⚠️ Check screenshots for login result');
      }
      
    } else {
      console.log('❌ Login form not found');
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    
    if (page) {
      try {
        await page.screenshot({ 
          path: `error-${Date.now()}.png`
        });
        console.log('📸 Error screenshot saved');
      } catch (e) {
        console.log('❌ Could not save error screenshot');
      }
    }
  } finally {
    if (browser) {
      console.log('\n🧹 Closing browser...');
      await browser.close();
    }
  }
}

testJobRight();