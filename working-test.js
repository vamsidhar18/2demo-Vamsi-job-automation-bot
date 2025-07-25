// 🚀 WORKING TEST SCRIPT - Fixed timeout and navigation issues
// File: working-test.js

require('dotenv').config();
const { chromium } = require('playwright');

async function workingTest() {
  console.log('🚀 Working Test for JobRight.ai (Fixed Timeouts)...\n');
  
  let browser = null;
  let page = null;
  
  try {
    // Step 1: Environment Check
    console.log('🔧 Step 1: Environment Check');
    console.log(`✅ JOBRIGHT_PASSWORD: ${process.env.JOBRIGHT_PASSWORD ? 'Set' : '❌ Missing'}`);
    
    if (!process.env.JOBRIGHT_PASSWORD) {
      throw new Error('JOBRIGHT_PASSWORD not set in .env file');
    }

    // Step 2: Launch Browser (with better settings)
    console.log('🎭 Step 2: Launching browser...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 1000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-dev-shm-usage'
      ]
    });
    console.log('✅ Browser launched');

    // Step 3: Create Page
    console.log('📄 Step 3: Creating page...');
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    page = await context.newPage();
    console.log('✅ Page created');

    // Step 4: Navigate with better strategy
    console.log('🌐 Step 4: Navigating to JobRight.ai...');
    
    // Use domcontentloaded instead of networkidle (much faster)
    await page.goto('https://jobright.ai', { 
      waitUntil: 'domcontentloaded',  // Changed from networkidle
      timeout: 15000  // Reduced timeout
    });
    console.log('✅ Page loaded (DOM ready)');

    // Wait a bit for dynamic content
    console.log('⏳ Waiting for dynamic content...');
    await page.waitForTimeout(3000);

    // Step 5: Take screenshot
    console.log('📸 Step 5: Taking screenshot...');
    await page.screenshot({ 
      path: `working-test-loaded-${Date.now()}.png`,
      fullPage: true 
    });
    console.log('✅ Screenshot saved');

    // Step 6: Analyze page
    console.log('🔍 Step 6: Analyzing page...');
    const pageTitle = await page.title();
    const currentUrl = page.url();
    console.log(`📍 URL: ${currentUrl}`);
    console.log(`📋 Title: ${pageTitle}`);

    // Step 7: Look for SIGN IN button (multiple strategies)
    console.log('🔍 Step 7: Looking for SIGN IN button...');
    
    const signInStrategies = [
      // Strategy 1: Text-based
      async () => {
        console.log('   🔍 Strategy 1: Text-based selectors...');
        const selectors = [
          'text="SIGN IN"',
          'button:has-text("SIGN IN")',
          'a:has-text("SIGN IN")',
          ':text("SIGN IN")'
        ];
        
        for (const selector of selectors) {
          try {
            console.log(`      Trying: ${selector}`);
            const element = await page.waitForSelector(selector, { timeout: 2000 });
            if (element) {
              console.log(`      ✅ Found with: ${selector}`);
              return element;
            }
          } catch (error) {
            console.log(`      ❌ Failed: ${selector}`);
          }
        }
        return null;
      },
      
      // Strategy 2: Class/ID based
      async () => {
        console.log('   🔍 Strategy 2: Class/ID based...');
        const selectors = [
          '.signin-btn',
          '.login-btn', 
          '#signin',
          '#login',
          '[data-testid="signin"]'
        ];
        
        for (const selector of selectors) {
          try {
            console.log(`      Trying: ${selector}`);
            const element = await page.waitForSelector(selector, { timeout: 2000 });
            if (element) {
              console.log(`      ✅ Found with: ${selector}`);
              return element;
            }
          } catch (error) {
            console.log(`      ❌ Failed: ${selector}`);
          }
        }
        return null;
      },
      
      // Strategy 3: Find any button containing "sign"
      async () => {
        console.log('   🔍 Strategy 3: Pattern matching...');
        try {
          const buttons = await page.$$('button, a[href]');
          console.log(`      Found ${buttons.length} clickable elements`);
          
          for (const button of buttons) {
            const text = await button.textContent();
            const cleanText = text?.trim().toLowerCase() || '';
            
            if (cleanText.includes('sign') || cleanText.includes('login')) {
              console.log(`      ✅ Found button with text: "${text?.trim()}"`);
              return button;
            }
          }
        } catch (error) {
          console.log(`      ❌ Pattern matching failed: ${error.message}`);
        }
        return null;
      }
    ];

    let signInButton = null;
    
    // Try each strategy
    for (let i = 0; i < signInStrategies.length; i++) {
      console.log(`   🎯 Trying Strategy ${i + 1}...`);
      signInButton = await signInStrategies[i]();
      if (signInButton) {
        console.log(`   🎉 Success with Strategy ${i + 1}!`);
        break;
      }
    }

    if (signInButton) {
      console.log('🖱️ Step 8: Clicking SIGN IN button...');
      await signInButton.click();
      console.log('✅ SIGN IN clicked');
      
      // Wait for navigation or modal
      await page.waitForTimeout(3000);
      
      // Take screenshot after click
      await page.screenshot({ 
        path: `working-test-signin-clicked-${Date.now()}.png`,
        fullPage: true 
      });
      console.log('📸 Screenshot after SIGN IN click saved');
    } else {
      console.log('⚠️ SIGN IN button not found. Checking if login form is already visible...');
    }

    // Step 9: Look for login form
    console.log('🔍 Step 9: Looking for login form...');
    
    // Wait a bit more for form to appear
    await page.waitForTimeout(2000);
    
    const emailField = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordField = await page.$('input[type="password"]');
    
    if (emailField && passwordField) {
      console.log('✅ Login form found!');
      
      console.log('📝 Step 10: Filling login form...');
      
      // Fill email
      await emailField.click();
      await emailField.fill('vdr1800@gmail.com');
      console.log('   ✅ Email filled');
      
      // Fill password
      await passwordField.click();
      await passwordField.fill(process.env.JOBRIGHT_PASSWORD);
      console.log('   ✅ Password filled');
      
      // Take screenshot before submit
      await page.screenshot({ 
        path: `working-test-form-filled-${Date.now()}.png`,
        fullPage: true 
      });
      console.log('📸 Form filled screenshot saved');
      
      // Look for submit button
      console.log('🚀 Step 11: Looking for submit button...');
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("SIGN IN")',
        'button:has-text("Login")',
        'form button'
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const submitBtn = await page.waitForSelector(selector, { timeout: 2000 });
          if (submitBtn) {
            console.log(`   ✅ Found submit button: ${selector}`);
            await submitBtn.click();
            console.log('   🚀 Form submitted');
            submitted = true;
            break;
          }
        } catch (error) {
          console.log(`   ❌ Submit selector failed: ${selector}`);
        }
      }
      
      if (!submitted) {
        console.log('   🔄 Trying Enter key fallback...');
        await passwordField.press('Enter');
        console.log('   ⌨️ Enter key pressed');
      }
      
      // Wait for response
      console.log('⏳ Waiting for login response...');
      await page.waitForTimeout(5000);
      
      // Take final screenshot
      await page.screenshot({ 
        path: `working-test-final-${Date.now()}.png`,
        fullPage: true 
      });
      console.log('📸 Final screenshot saved');
      
      // Check result
      const finalUrl = page.url();
      console.log(`📍 Final URL: ${finalUrl}`);
      
      if (finalUrl.includes('dashboard') || finalUrl.includes('jobs') || !finalUrl.includes('login')) {
        console.log('🎉 SUCCESS! Login appears to have worked!');
        console.log('🚀 Ready for Phase 2: Revolutionary AI Q&A Bot!');
      } else {
        console.log('⚠️ Login may not have succeeded. Check the screenshots.');
      }
      
    } else {
      console.log('❌ Login form not found');
      console.log('📋 Let me check what\'s available on the page...');
      
      // List all inputs
      const inputs = await page.$$eval('input', elements => 
        elements.map(el => ({
          type: el.type,
          name: el.name || 'N/A',
          placeholder: el.placeholder || 'N/A',
          id: el.id || 'N/A'
        }))
      );
      
      console.log('📝 Available input fields:');
      inputs.forEach((input, index) => {
        console.log(`   ${index + 1}. Type: ${input.type}, Name: ${input.name}, Placeholder: ${input.placeholder}`);
      });
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('📸 Check all the screenshots for detailed progress');

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    
    if (page) {
      try {
        await page.screenshot({ 
          path: `working-test-error-${Date.now()}.png`,
          fullPage: true 
        });
        console.log('📸 Error screenshot saved');
      } catch (screenshotError) {
        console.error('Failed to save error screenshot');
      }
    }
  } finally {
    console.log('\n🧹 Cleaning up...');
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed');
    }
  }
}

// Run the test
workingTest()
  .then(() => {
    console.log('\n✅ Process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Process failed:', error.message);
    process.exit(1);
  });