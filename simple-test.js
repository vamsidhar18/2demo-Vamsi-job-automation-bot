// 🚀 SIMPLE JOBRIGHT TEST - After browser installation
// File: simple-test.js

require('dotenv').config();
const { chromium } = require('playwright');

async function simpleTest() {
  console.log('🚀 Simple JobRight.ai Test...\n');
  
  let browser = null;
  let page = null;
  
  try {
    console.log('🔧 Environment Check:');
    console.log(`✅ Password: ${process.env.JOBRIGHT_PASSWORD ? 'Set' : 'Missing'}`);
    
    if (!process.env.JOBRIGHT_PASSWORD) {
      console.log('❌ Please set JOBRIGHT_PASSWORD in .env file');
      return;
    }

    console.log('\n🎭 Launching browser...');
    browser = await chromium.launch({
      headless: false,  // Show browser window
      slowMo: 2000      // Slow down for visibility
    });
    
    page = await browser.newPage();
    console.log('✅ Browser ready');

    console.log('\n🌐 Loading JobRight.ai...');
    await page.goto('https://jobright.ai', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    console.log('✅ Page loaded');

    // Wait for page to settle
    await page.waitForTimeout(3000);

    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'simple-test.png', fullPage: true });
    console.log('✅ Screenshot saved as simple-test.png');

    console.log('\n🔍 Looking for SIGN IN...');
    
    // Try to find SIGN IN button
    try {
      const signInButton = await page.waitForSelector('text="SIGN IN"', { timeout: 5000 });
      if (signInButton) {
        console.log('✅ Found SIGN IN button!');
        
        await signInButton.click();
        console.log('✅ Clicked SIGN IN');
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'after-signin-click.png' });
        console.log('📸 Screenshot after click saved');
        
        // Look for email field
        const emailField = await page.$('input[type="email"]');
        if (emailField) {
          console.log('✅ Found email field');
          await emailField.fill('vdr1800@gmail.com');
          console.log('✅ Email filled');
          
          // Look for password field
          const passwordField = await page.$('input[type="password"]');
          if (passwordField) {
            console.log('✅ Found password field');
            await passwordField.fill(process.env.JOBRIGHT_PASSWORD);
            console.log('✅ Password filled');
            
            await page.screenshot({ path: 'form-filled.png' });
            console.log('📸 Form filled screenshot saved');
            
            // Try to submit
            try {
              const submitButton = await page.$('button[type="submit"]');
              if (submitButton) {
                await submitButton.click();
                console.log('✅ Form submitted');
                
                await page.waitForTimeout(5000);
                await page.screenshot({ path: 'after-submit.png' });
                console.log('📸 After submit screenshot saved');
                
                const finalUrl = page.url();
                console.log(`📍 Final URL: ${finalUrl}`);
                
                if (finalUrl !== 'https://jobright.ai/') {
                  console.log('🎉 SUCCESS! URL changed - login likely worked!');
                } else {
                  console.log('⚠️ URL unchanged - check screenshots for errors');
                }
              }
            } catch (error) {
              console.log('⚠️ Submit button not found, trying Enter key...');
              await passwordField.press('Enter');
              await page.waitForTimeout(5000);
              await page.screenshot({ path: 'after-enter.png' });
            }
          }
        }
      }
    } catch (error) {
      console.log('❌ SIGN IN button not found');
      console.log('Let me check what buttons are available...');
      
      const buttons = await page.$$eval('button, a', elements => 
        elements.map(el => el.textContent?.trim()).filter(text => text && text.length < 50)
      );
      
      console.log('Available buttons/links:');
      buttons.slice(0, 10).forEach((text, i) => {
        console.log(`  ${i+1}. "${text}"`);
      });
    }

    console.log('\n🎉 Test completed!');
    console.log('📸 Check the screenshots to see what happened:');
    console.log('  - simple-test.png (initial page)');
    console.log('  - after-signin-click.png (after clicking sign in)');
    console.log('  - form-filled.png (form with data)');
    console.log('  - after-submit.png (final result)');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (page) {
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('📸 Error screenshot saved');
    }
  } finally {
    if (browser) {
      console.log('\n🧹 Closing browser...');
      await browser.close();
    }
  }
}

simpleTest();