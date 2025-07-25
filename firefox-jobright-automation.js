// 🔧 Modal-Aware JobRight Automation - Handles hidden/animated forms
require('dotenv').config();
const { firefox } = require('playwright');

async function modalAwareAutomation() {
  console.log('🔧 Modal-Aware Automation - Handling hidden login forms...\n');
  
  let browser = null;
  let page = null;
  
  try {
    console.log('🔧 Environment Check:');
    console.log(`✅ Password: ${process.env.JOBRIGHT_PASSWORD ? 'Set' : 'Missing'}`);

    console.log('\n🦊 Launching Firefox...');
    browser = await firefox.launch({
      headless: false,
      slowMo: 2000,
      timeout: 60000
    });
    
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('✅ Firefox ready');

    console.log('\n🌐 Loading JobRight.ai...');
    await page.goto('https://jobright.ai', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ JobRight.ai loaded');

    await page.waitForTimeout(3000);

    console.log('\n🔍 Finding and clicking SIGN IN...');
    const signInElement = await page.waitForSelector('text="SIGN IN"', { timeout: 10000 });
    
    if (signInElement) {
      await signInElement.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await signInElement.click();
      console.log('✅ SIGN IN clicked');
    }

    console.log('\n⏳ Waiting for login modal/form to appear...');
    
    // Wait longer for form animation to complete
    await page.waitForTimeout(8000);
    
    console.log('\n📸 Taking screenshot after waiting...');
    await page.screenshot({ 
      path: `modal-after-wait-${Date.now()}.png`,
      fullPage: true 
    });

    console.log('\n🔍 Analyzing form visibility...');
    
    // Check for modal containers first
    const modalSelectors = [
      '.modal',
      '.popup',
      '.dialog',
      '.overlay',
      '[role="dialog"]',
      '.login-modal',
      '.signin-modal'
    ];
    
    console.log('🔍 Looking for modal containers...');
    for (const selector of modalSelectors) {
      try {
        const modal = await page.$(selector);
        if (modal) {
          const isVisible = await modal.isVisible();
          console.log(`   📦 Found modal: ${selector}, Visible: ${isVisible}`);
          
          if (isVisible) {
            console.log('   ✅ Modal is visible, looking for form fields inside...');
            
            // Look for form fields inside the modal
            const emailInModal = await modal.$('input[type="email"], input[name="email"]');
            const passwordInModal = await modal.$('input[type="password"]');
            
            if (emailInModal && passwordInModal) {
              console.log('   ✅ Found form fields inside modal!');
              
              console.log('\n📝 Filling modal form...');
              
              // Fill email
              await emailInModal.scrollIntoViewIfNeeded();
              await emailInModal.click();
              await emailInModal.fill('vdr1800@gmail.com');
              console.log('   ✅ Email filled in modal');
              
              // Fill password
              await passwordInModal.scrollIntoViewIfNeeded();
              await passwordInModal.click();
              await passwordInModal.fill(process.env.JOBRIGHT_PASSWORD);
              console.log('   ✅ Password filled in modal');
              
              await page.screenshot({ 
                path: `modal-form-filled-${Date.now()}.png`,
                fullPage: true 
              });
              
              // Submit form
              console.log('\n🚀 Submitting modal form...');
              
              // Look for submit button in modal
              const submitInModal = await modal.$('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
              if (submitInModal) {
                await submitInModal.click();
                console.log('   ✅ Modal form submitted');
              } else {
                await passwordInModal.press('Enter');
                console.log('   ✅ Enter pressed in modal');
              }
              
              // Wait for response
              await page.waitForTimeout(8000);
              
              await page.screenshot({ 
                path: `modal-final-result-${Date.now()}.png`,
                fullPage: true 
              });
              
              const finalUrl = page.url();
              console.log(`📍 Final URL: ${finalUrl}`);
              
              if (finalUrl !== 'https://jobright.ai/' && !finalUrl.includes('login')) {
                console.log('\n🎉 SUCCESS! Modal login completed!');
                console.log('✅ Phase 1 COMPLETED with modal handling!');
                return; // Success!
              }
              
              break; // Exit modal loop
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ Modal selector failed: ${selector}`);
      }
    }
    
    console.log('\n🔍 No visible modal found, trying force visibility approach...');
    
    // Alternative: Try to make hidden fields visible
    const allInputs = await page.$$('input');
    console.log(`📋 Found ${allInputs.length} input elements total`);
    
    let emailField = null;
    let passwordField = null;
    
    // Find the email and password fields (even if hidden)
    for (const input of allInputs) {
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      
      if (type === 'email' || name === 'email' || (placeholder && placeholder.toLowerCase().includes('email'))) {
        emailField = input;
        console.log('📧 Found email field (possibly hidden)');
      }
      
      if (type === 'password') {
        passwordField = input;
        console.log('🔒 Found password field (possibly hidden)');
      }
    }
    
    if (emailField && passwordField) {
      console.log('\n🔧 Attempting to force visibility and fill fields...');
      
      try {
        // Try to scroll fields into view and make them visible
        await emailField.scrollIntoViewIfNeeded();
        await passwordField.scrollIntoViewIfNeeded();
        
        // Force focus and fill
        await emailField.focus();
        await emailField.fill('vdr1800@gmail.com');
        console.log('📧 Email force-filled');
        
        await passwordField.focus();
        await passwordField.fill(process.env.JOBRIGHT_PASSWORD);
        console.log('🔒 Password force-filled');
        
        await page.screenshot({ 
          path: `force-filled-${Date.now()}.png`,
          fullPage: true 
        });
        
        // Try to submit
        await passwordField.press('Enter');
        console.log('🚀 Enter pressed for submission');
        
        await page.waitForTimeout(8000);
        
        await page.screenshot({ 
          path: `force-final-${Date.now()}.png`,
          fullPage: true 
        });
        
        const finalUrl = page.url();
        console.log(`📍 Final URL after force fill: ${finalUrl}`);
        
        if (finalUrl !== 'https://jobright.ai/' && !finalUrl.includes('login')) {
          console.log('\n🎉 SUCCESS! Force fill method worked!');
          console.log('✅ Phase 1 COMPLETED with force visibility!');
        } else {
          console.log('\n⚠️ Force fill didn\'t change URL - check screenshots');
        }
        
      } catch (forceError) {
        console.log('❌ Force fill failed:', forceError.message);
      }
    }
    
    console.log('\n📸 All screenshots saved for analysis');
    console.log('📋 Check these files:');
    console.log('   - modal-after-wait-*.png (page after waiting)');
    console.log('   - modal-form-filled-*.png (if modal found)');
    console.log('   - force-filled-*.png (if force method used)');
    console.log('   - *-final-*.png (final results)');

    console.log('\n⏳ Keeping browser open for inspection...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\n💥 Modal automation failed:', error.message);
    
    if (page) {
      try {
        await page.screenshot({ 
          path: `modal-error-${Date.now()}.png`,
          fullPage: true 
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

modalAwareAutomation()
  .then(() => {
    console.log('\n✅ Modal automation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Modal automation failed:', error.message);
    process.exit(1);
  });