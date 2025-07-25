// 🧪 Test Login Fix for JobRight.ai
// File: test-login-fix.js

require('dotenv').config();
const JobRightAutomator = require('./src/platforms/JobRightAutomator');

// 🔐 FIXED LOGIN METHOD - Based on actual JobRight.ai UI
// Replace the loginToJobRight() method in your JobRightAutomator.js

// Exported function version for standalone usage or testing
async function loginToJobRight() {
  try {
    this.logger.info('🔐 Logging into JobRight.ai...');

    // Wait for page to fully load
    await this.page.waitForTimeout(3000);

    // UPDATED SELECTORS based on your screenshot
    const signInSelectors = [
      'button:has-text("SIGN IN")',           // From your screenshot
      'a:has-text("SIGN IN")',               // Alternative
      'button:has-text("Sign In")',           // Case variation
      'a:has-text("Sign In")',               // Case variation
      '[href*="signin"]',                    // URL-based
      '[href*="login"]',                     // URL-based
      '.signin-btn',                         // Class-based
      '.login-btn'                           // Class-based
    ];

    let signInButton = null;
    this.logger.info('🔍 Looking for SIGN IN button...');
    
    for (const selector of signInSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        signInButton = await this.page.$(selector);
        if (signInButton) {
          this.logger.info(`✅ Found SIGN IN button with selector: ${selector}`);
          break;
        }
      } catch (error) {
        this.logger.debug(`❌ Selector failed: ${selector}`);
      }
    }

    if (signInButton) {
      await signInButton.click();
      this.logger.info('✅ SIGN IN button clicked');
      await this.page.waitForTimeout(3000);
      
      // Take screenshot after clicking sign in
      await this.page.screenshot({ 
        path: `debug-signin-clicked-${Date.now()}.png`,
        fullPage: true 
      });
    } else {
      this.logger.warn('⚠️ No SIGN IN button found, checking if already on login form...');
    }

    // Now fill the login form with better selectors
    this.logger.info('📧 Looking for email field...');
    
    // Enhanced email field selectors
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="Email" i]',
      'input[id*="email" i]',
      'input[id="email"]',
      '#email',
      '[data-testid="email"]',
      'input[autocomplete="email"]',
      'form input[type="email"]',
      'form input:first-of-type'  // Often the first input is email
    ];

    let emailFilled = false;
    for (const selector of emailSelectors) {
      try {
        const emailField = await this.page.waitForSelector(selector, { timeout: 3000 });
        if (emailField) {
          // Clear any existing content first
          await emailField.click({ clickCount: 3 }); // Select all
          await emailField.fill(this.jobRightConfig.email);
          await this.page.waitForTimeout(1000);
          this.logger.info(`✅ Email filled using selector: ${selector}`);
          emailFilled = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!emailFilled) {
      // Try to find ANY input field and assume it's email
      const anyInput = await this.page.$('input[type="text"], input:not([type])');
      if (anyInput) {
        await anyInput.fill(this.jobRightConfig.email);
        this.logger.info('✅ Email filled in generic input field');
        emailFilled = true;
      }
    }

    if (!emailFilled) {
      throw new Error('Could not find email field');
    }

    // Enhanced password field selectors
    this.logger.info('🔒 Looking for password field...');
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password" i]',
      'input[placeholder*="Password" i]',
      'input[id*="password" i]',
      'input[id="password"]',
      '#password',
      '[data-testid="password"]',
      'input[autocomplete="current-password"]',
      'form input[type="password"]'
    ];

    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        const passwordField = await this.page.waitForSelector(selector, { timeout: 3000 });
        if (passwordField) {
          await passwordField.click({ clickCount: 3 }); // Select all
          await passwordField.fill(this.jobRightConfig.password);
          await this.page.waitForTimeout(1000);
          this.logger.info(`✅ Password filled using selector: ${selector}`);
          passwordFilled = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!passwordFilled) {
      throw new Error('Could not find password field');
    }

    // Take screenshot before submitting
    await this.page.screenshot({ 
      path: `debug-before-submit-${Date.now()}.png`,
      fullPage: true 
    });

    // Enhanced submit button selectors
    this.logger.info('🚀 Looking for submit button...');
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("SIGN IN")',
      'button:has-text("Log In")',
      'button:has-text("LOGIN")',
      'button:has-text("Login")',
      'input[type="submit"]',
      'form button',
      '[data-testid="login-submit"]',
      '.login-submit',
      '.signin-submit',
      'button[class*="submit"]',
      'button[class*="login"]'
    ];

    let loginSubmitted = false;
    for (const selector of submitSelectors) {
      try {
        const submitBtn = await this.page.waitForSelector(selector, { timeout: 3000 });
        if (submitBtn) {
          await submitBtn.click();
          this.logger.info(`✅ Submit button clicked: ${selector}`);
          loginSubmitted = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!loginSubmitted) {
      // Fallback: Press Enter on the password field
      this.logger.info('🔄 Trying Enter key as fallback...');
      await this.page.keyboard.press('Enter');
    }

    // Wait for login to complete
    await this.page.waitForTimeout(5000);
    
    // Take screenshot after login attempt
    await this.page.screenshot({ 
      path: `debug-after-login-${Date.now()}.png`,
      fullPage: true 
    });

    // Enhanced success detection
    const currentUrl = this.page.url();
    this.logger.info(`📍 Current URL after login: ${currentUrl}`);
    
    // Check for success indicators
    const successIndicators = [
      '.logout',
      '.profile',
      '.dashboard', 
      '.user-menu',
      'button:has-text("Logout")',
      'a:has-text("Profile")',
      '.jobs-nav',
      '[data-testid="user-avatar"]'
    ];

    let isLoggedIn = false;
    
    // Check URL changes
    if (currentUrl.includes('dashboard') || 
        currentUrl.includes('jobs') || 
        currentUrl.includes('profile') ||
        !currentUrl.includes('login') && !currentUrl.includes('signin')) {
      isLoggedIn = true;
    }

    // Check for UI elements that indicate login success
    if (!isLoggedIn) {
      for (const indicator of successIndicators) {
        try {
          const element = await this.page.waitForSelector(indicator, { timeout: 2000 });
          if (element) {
            isLoggedIn = true;
            this.logger.info(`✅ Found success indicator: ${indicator}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }
    }

    if (isLoggedIn) {
      this.logger.success('🎉 Successfully logged into JobRight.ai!');
      return true;
    } else {
      // Check if there are any error messages
      const errorSelectors = [
        '.error',
        '.alert',
        '[class*="error"]',
        '.invalid',
        '.warning'
      ];

      for (const selector of errorSelectors) {
        try {
          const errorElement = await this.page.waitForSelector(selector, { timeout: 1000 });
          if (errorElement) {
            const errorText = await errorElement.textContent();
            throw new Error(`Login error: ${errorText}`);
          }
        } catch (error) {
          continue;
        }
      }

      throw new Error('Login appears to have failed - no success indicators found');
    }

  } catch (error) {
    this.logger.error(`❌ Login failed: ${error.message}`);
    
    // Take error screenshot for debugging
    await this.page.screenshot({ 
      path: `debug-login-error-${Date.now()}.png`,
      fullPage: true 
    });
    
    throw error;
  }
}    
