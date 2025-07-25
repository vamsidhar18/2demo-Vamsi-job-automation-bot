// 🔧 ENHANCED DEBUG TEST - Better error handling and logging
// File: debug-test.js

require('dotenv').config();
const { chromium } = require('playwright');

async function debugTest() {
  console.log('🚀 Enhanced Debug Test for JobRight.ai...\n');
  
  let browser = null;
  let page = null;
  
  try {
    // Step 1: Environment Check
    console.log('🔧 Step 1: Environment Check');
    console.log(`✅ JOBRIGHT_PASSWORD: ${process.env.JOBRIGHT_PASSWORD ? 'Set' : '❌ Missing'}`);
    console.log(`✅ Email: vdr1800@gmail.com`);
    
    if (!process.env.JOBRIGHT_PASSWORD) {
      throw new Error('JOBRIGHT_PASSWORD not set in .env file');
    }
    console.log('');

    // Step 2: Launch Browser
    console.log('🎭 Step 2: Launching browser...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 2000, // Very slow for debugging
      timeout: 60000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    console.log('✅ Browser launched successfully');

    // Step 3: Create Page
    console.log('📄 Step 3: Creating new page...');
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    page = await context.newPage();
    console.log('✅ Page created successfully');

    // Step 4: Navigate to JobRight.ai
    console.log('🌐 Step 4: Navigating to JobRight.ai...');
    await page.goto('https://jobright.ai', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ Page loaded successfully');

    // Step 5: Take screenshot
    console.log('📸 Step 5: Taking screenshot...');
    await page.screenshot({ 
      path: `debug-page-loaded-${Date.now()}.png`,
      fullPage: true 
    });
    console.log('✅ Screenshot saved');

    // Step 6: Check page content
    console.log('🔍 Step 6: Analyzing page content...');
    const pageTitle = await page.title();
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    console.log(`📋 Page Title: ${pageTitle}`);

    // Step 7: Look for SIGN IN button
    console.log('🔍 Step 7: Looking for SIGN IN button...');
    
    // Wait a bit for page to fully load
    await page.waitForTimeout(3000);
    
    const signInSelectors = [
      'text="SIGN IN"',
      'button:has-text("SIGN IN")',
      'a:has-text("SIGN IN")',
      '[data-testid="signin"]',
      '.signin-btn'
    ];

    let signInFound = false;
    for (const selector of signInSelectors) {
      try {
        console.log(`   🔍 Trying selector: ${selector}`);
        const element = await page.waitForSelector(selector, { timeout: 3000 });
        if (element) {
          console.log(`   ✅ Found SIGN IN with: ${selector}`);
          signInFound = true;
          
          // Click the SIGN IN button
          console.log('   🖱️ Clicking SIGN IN button...');
          await element.click();
          await page.waitForTimeout(3000);
          
          // Take screenshot after click
          await page.screenshot({ 
            path: `debug-signin-clicked-${Date.now()}.png`,
            fullPage: true 
          });
          console.log('   ✅ SIGN IN clicked and screenshot saved');
          break;
        }
      } catch (error) {
        console.log(`   ❌ Selector failed: ${selector}`);
        continue;
      }
    }

    if (!signInFound) {
      console.log('⚠️ SIGN IN button not found. Let me check what buttons are available...');
      
      // List all buttons on the page
      const buttons = await page.$$eval('button, a[href]', elements => 
        elements.map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          href: el.href || 'N/A',
          className: el.className
        })).filter(btn => btn.text)
      );
      
      console.log('📋 Available buttons/links:');
      buttons.slice(0, 10).forEach((btn, index) => {
        console.log(`   ${index + 1}. ${btn.tag}: "${btn.text}" (${btn.className})`);
      });
    }

    // Step 8: Look for login form
    console.log('🔍 Step 8: Looking for login form...');
    const emailInputs = await page.$$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInputs = await page.$$('input[type="password"]');
    
    console.log(`📧 Found ${emailInputs.length} email fields`);
    console.log(`🔒 Found ${passwordInputs.length} password fields`);

    if (emailInputs.length > 0 && passwordInputs.length > 0) {
      console.log('✅ Login form detected!');
      
      // Fill the form
      console.log('📝 Step 9: Filling login form...');
      await emailInputs[0].fill('vdr1800@gmail.com');
      console.log('   ✅ Email filled');
      
      await passwordInputs[0].fill(process.env.JOBRIGHT_PASSWORD);
      console.log('   ✅ Password filled');
      
      // Look for submit button
      const submitButtons = await page.$$('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
      if (submitButtons.length > 0) {
        console.log('🚀 Found submit button, clicking...');
        await submitButtons[0].click();
        await page.waitForTimeout(5000);
        
        // Take final screenshot
        await page.screenshot({ 
          path: `debug-after-submit-${Date.now()}.png`,
          fullPage: true 
        });
        console.log('✅ Form submitted and screenshot saved');
        
        // Check if login was successful
        const newUrl = page.url();
        console.log(`📍 URL after login: ${newUrl}`);
        
        if (newUrl !== currentUrl) {
          console.log('🎉 SUCCESS! URL changed - likely logged in');
        } else {
          console.log('⚠️ URL unchanged - check for errors on page');
        }
      } else {
        console.log('❌ No submit button found');
      }
    } else {
      console.log('⚠️ Login form not found on current page');
    }

    console.log('\n🎉 Debug test completed!');
    console.log('📸 Check the debug screenshots for visual confirmation');

  } catch (error) {
    console.error('\n💥 Debug test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Take error screenshot if page exists
    if (page) {
      try {
        await page.screenshot({ 
          path: `debug-error-${Date.now()}.png`,
          fullPage: true 
        });
        console.log('📸 Error screenshot saved');
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError.message);
      }
    }
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    if (browser) {
      try {
        await browser.close();
        console.log('✅ Browser closed');
      } catch (error) {
        console.error('Error closing browser:', error.message);
      }
    }
    console.log('✅ Cleanup completed');
  }
}

// Add timeout for the entire process
const timeoutMs = 120000; // 2 minutes
console.log(`⏱️ Setting ${timeoutMs/1000}s timeout for entire process`);

const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Test timed out after 2 minutes')), timeoutMs);
});

Promise.race([debugTest(), timeoutPromise])
  .then(() => {
    console.log('\n✅ Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Process failed:', error.message);
    process.exit(1);
  });