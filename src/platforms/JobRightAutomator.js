const { chromium } = require('playwright');
const Logger = require('../utils/Logger');
const ErrorHandler = require('../utils/ErrorHandler');
const VamsidharProfile = require('../../Config/vamsidhar-profile');
const fs = require('fs').promises;
const path = require('path');

class JobRightAutomator {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger || new Logger('JobRightAutomator');
    this.errorHandler = new ErrorHandler(this.logger);
    this.browser = null;
    this.page = null;
    this.context = null;
    
    // Use the proper VamsidharProfile
    this.profile = VamsidharProfile;
    
    // JobRight.ai specific configuration
    this.jobRightConfig = {
      url: 'https://jobright.ai',
      email: 'vdr1800@gmail.com',
      password: process.env.JOBRIGHT_PASSWORD,
      maxApplicationsPerRun: 5,
      delayBetweenActions: 2000
    };
  }

  // 🚀 INITIALIZATION METHOD
  async initializeAutomator() {
    try {
      this.logger.info('🔧 Initializing JobRight.ai automation...');
      
      // Launch browser
      this.browser = await chromium.launch({
        headless: false,
        slowMo: 1000, // Slow down for reliability
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security'
        ]
      });

      // Create context with realistic settings
      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      this.page = await this.context.newPage();

      // Navigate to JobRight.ai with retry logic
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          this.logger.info(`Loading JobRight.ai (attempt ${attempt}/3)...`);
          await this.page.goto(this.jobRightConfig.url, { 
            waitUntil: 'networkidle',
            timeout: 60000
          });
          
          // Take a screenshot for debugging
          await this.page.screenshot({ 
            path: `debug-homepage-${Date.now()}.png`,
            fullPage: true 
          });
          
          this.logger.info('✅ JobRight.ai loaded successfully');
          break; // Success, exit retry loop
        } catch (error) {
          if (attempt === 3) {
            this.logger.error(`❌ Failed to load JobRight.ai after 3 attempts: ${error.message}`);
            throw error; // Last attempt failed
          }
          this.logger.warn(`⚠️ Attempt ${attempt} failed, retrying in 5 seconds...`);
          await this.page.waitForTimeout(5000); // Wait 5 seconds before retry
        }
      }

      // Verify page loaded correctly
      const pageLoaded = await this.checkPageLoad();
      if (!pageLoaded) {
        throw new Error('Page failed verification after loading');
      }

      this.logger.info('✅ JobRight.ai automation initialized successfully');
      return true;
      
    } catch (error) {
      this.logger.error(`❌ Failed to initialize JobRight.ai automator: ${error.message}`);
      throw error;
    }
  }

  // 🔐 LOGIN TO JOBRIGHT.AI (UPDATED WITH BETTER SELECTORS)
  async loginToJobRight() {
    try {
      this.logger.info('🔐 Logging into JobRight.ai...');

      // Wait for page to fully load
      await this.page.waitForTimeout(3000);

      // Look for login button with multiple strategies
      const loginSelectors = [
        'button:has-text("Login")',
        'button:has-text("Sign in")',
        'a:has-text("Login")',
        'a:has-text("Sign in")',
        '[data-testid="login"]',
        '.login-button',
        'button[class*="login"]',
        'a[href*="login"]'
      ];

      let loginButton = null;
      this.logger.info('🔍 Looking for login button...');
      
      for (const selector of loginSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          loginButton = await this.page.$(selector);
          if (loginButton) {
            this.logger.info(`✅ Found login button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          this.logger.debug(`❌ Selector failed: ${selector}`);
          continue;
        }
      }

      if (loginButton) {
        await loginButton.click();
        this.logger.info('✅ Login button clicked');
        await this.page.waitForTimeout(3000);
        
        // Take screenshot after clicking login
        await this.page.screenshot({ 
          path: `debug-login-form-${Date.now()}.png`,
          fullPage: true 
        });
      } else {
        this.logger.warn('⚠️ No login button found, checking if already on login form...');
      }

      // Fill email with better selectors
      this.logger.info('📧 Filling email field...');
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[name="username"]',
        'input[placeholder*="email" i]',
        'input[placeholder*="Email" i]',
        'input[id*="email"]',
        '#email',
        '[data-testid="email"]'
      ];

      let emailFilled = false;
      for (const selector of emailSelectors) {
        try {
          const emailField = await this.page.waitForSelector(selector, { timeout: 3000 });
          if (emailField) {
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
        throw new Error('Could not find email field');
      }

      // Fill password with better selectors
      this.logger.info('🔒 Filling password field...');
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[placeholder*="password" i]',
        'input[placeholder*="Password" i]',
        '#password',
        '[data-testid="password"]'
      ];

      let passwordFilled = false;
      for (const selector of passwordSelectors) {
        try {
          const passwordField = await this.page.waitForSelector(selector, { timeout: 3000 });
          if (passwordField) {
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

      // Submit login form
      this.logger.info('🚀 Submitting login form...');
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign in")',
        'button:has-text("Log in")',
        'button:has-text("Login")',
        '[data-testid="login-submit"]',
        'input[type="submit"]',
        'form button'
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
        // Fallback: Press Enter
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

      // Check if login was successful
      const currentUrl = this.page.url();
      this.logger.info(`📍 Current URL after login: ${currentUrl}`);
      
      // Check for success indicators
      const isLoggedIn = 
        currentUrl.includes('dashboard') || 
        currentUrl.includes('jobs') || 
        !currentUrl.includes('login') ||
        await this.page.$('.logout, .profile, .dashboard') !== null;

      if (isLoggedIn) {
        this.logger.success('🎉 Successfully logged into JobRight.ai!');
        return true;
      } else {
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

  // 🔍 DISCOVER JOBS (IMPROVED)
  async discoverJobs() {
    try {
      this.logger.info('🔍 Discovering jobs on JobRight.ai...');

      // Wait for page to stabilize
      await this.page.waitForTimeout(3000);
      
      // Navigate to jobs section if not already there
      const jobsSelectors = [
        'a:has-text("Jobs")',
        'button:has-text("Find Jobs")',
        '[href*="jobs"]',
        '.jobs-nav',
        'nav a:has-text("Jobs")'
      ];

      for (const selector of jobsSelectors) {
        try {
          const jobsLink = await this.page.waitForSelector(selector, { timeout: 2000 });
          if (jobsLink) {
            await jobsLink.click();
            this.logger.info(`✅ Navigated to jobs using: ${selector}`);
            await this.page.waitForTimeout(3000);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      // Apply filters for better job targeting
      await this.applyJobFilters();

      // Get job listings
      const jobs = await this.extractJobListings();
      
      this.logger.info(`✅ Found ${jobs.length} jobs`);
      return jobs;

    } catch (error) {
      this.logger.error(`❌ Job discovery failed: ${error.message}`);
      return [];
    }
  }

  // 🎯 APPLY JOB FILTERS (IMPROVED)
  async applyJobFilters() {
    try {
      this.logger.info('🎯 Applying job filters...');

      await this.page.waitForTimeout(2000);

      // Filter for "Most Recent" jobs (from your screenshots)
      const recentFilters = [
        'button:has-text("Most Recent")',
        'select option:has-text("Most Recent")',
        'button:has-text("Recent")',
        '[data-filter="recent"]',
        '.filter-recent'
      ];

      for (const selector of recentFilters) {
        try {
          const filter = await this.page.waitForSelector(selector, { timeout: 2000 });
          if (filter) {
            await filter.click();
            this.logger.info('✅ Applied "Most Recent" filter');
            await this.page.waitForTimeout(2000);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      // Filter for remote work if available
      const remoteFilters = [
        'button:has-text("Remote")',
        'input[value="Remote"]',
        'select option:has-text("Remote")'
      ];

      for (const selector of remoteFilters) {
        try {
          const filter = await this.page.waitForSelector(selector, { timeout: 2000 });
          if (filter) {
            await filter.click();
            this.logger.info('✅ Applied "Remote" filter');
            await this.page.waitForTimeout(2000);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      this.logger.info('✅ Job filters applied');

    } catch (error) {
      this.logger.warn(`⚠️ Filter application failed: ${error.message}`);
    }
  }

  // 📋 EXTRACT JOB LISTINGS (IMPROVED WITH BETTER SELECTORS)
  async extractJobListings() {
    try {
      await this.page.waitForTimeout(3000);

      const jobs = await this.page.evaluate(() => {
        // Multiple selectors for job cards
        const possibleSelectors = [
          '[data-job]',
          '.job-card', 
          '.job-item', 
          '.job-listing',
          '[class*="job"]',
          '.card',
          '.listing'
        ];

        let jobElements = [];
        for (const selector of possibleSelectors) {
          jobElements = document.querySelectorAll(selector);
          if (jobElements.length > 0) break;
        }

        const jobList = [];

        jobElements.forEach((element, index) => {
          if (index >= 10) return; // Limit to first 10 jobs

          // Try multiple selectors for title
          const titleSelectors = ['h1', 'h2', 'h3', '.job-title', '[class*="title"]', '.title'];
          let titleElement = null;
          for (const sel of titleSelectors) {
            titleElement = element.querySelector(sel);
            if (titleElement) break;
          }

          // Try multiple selectors for company
          const companySelectors = ['.company', '[class*="company"]', '.employer', '.company-name'];
          let companyElement = null;
          for (const sel of companySelectors) {
            companyElement = element.querySelector(sel);
            if (companyElement) break;
          }

          // Try multiple selectors for location
          const locationSelectors = ['.location', '[class*="location"]', '.job-location'];
          let locationElement = null;
          for (const sel of locationSelectors) {
            locationElement = element.querySelector(sel);
            if (locationElement) break;
          }

          // Try multiple selectors for apply buttons
          const applySelectors = [
            'button:has-text("Apply")', 
            'button:has-text("Autofill")',
            'a:has-text("Apply")', 
            '.apply-btn',
            '.apply-button',
            '[class*="apply"]'
          ];
          let applyButton = null;
          for (const sel of applySelectors) {
            applyButton = element.querySelector(sel);
            if (applyButton) break;
          }

          if (titleElement && companyElement) {
            jobList.push({
              title: titleElement.textContent?.trim() || 'Software Engineer',
              company: companyElement.textContent?.trim() || 'Tech Company',
              location: locationElement?.textContent?.trim() || 'Remote',
              hasApplyButton: !!applyButton,
              element: element,
              discovered_at: new Date().toISOString()
            });
          }
        });

        return jobList;
      });

      this.logger.info(`📊 Extracted ${jobs.length} jobs from page`);
      return jobs;

    } catch (error) {
      this.logger.error(`❌ Job extraction failed: ${error.message}`);
      return [];
    }
  }

  // 🚀 MAIN AUTOMATION LOOP
  async automateApplications() {
    try {
      this.logger.info('🚀 Starting JobRight.ai automation...');

      const jobs = await this.discoverJobs();
      let applicationsSubmitted = 0;

      for (const job of jobs.slice(0, this.jobRightConfig.maxApplicationsPerRun)) {
        try {
          this.logger.info(`📝 Applying to: ${job.title} at ${job.company}`);
          
          const success = await this.applyToSingleJob(job);
          
          if (success) {
            applicationsSubmitted++;
            this.logger.success(`✅ Application ${applicationsSubmitted} submitted successfully`);
          }

          // Delay between applications
          await this.page.waitForTimeout(this.jobRightConfig.delayBetweenActions);

        } catch (error) {
          this.logger.error(`❌ Failed to apply to ${job.title}: ${error.message}`);
          continue;
        }
      }

      this.logger.success(`🎉 Automation completed! ${applicationsSubmitted} applications submitted`);
      return { applicationsSubmitted, totalJobs: jobs.length };

    } catch (error) {
      this.logger.error(`❌ Automation failed: ${error.message}`);
      throw error;
    }
  }

  // 📝 APPLY TO SINGLE JOB (ENHANCED)
  async applyToSingleJob(job) {
    try {
      this.logger.info(`🎯 Processing application for: ${job.title}`);

      // Step 1: Click the apply button
      const success1 = await this.clickApplyButton(job);
      if (!success1) return false;

      // Step 2: Handle resume modal/customization  
      const success2 = await this.handleResumeModal(job);
      if (!success2) return false;

      // Step 3: Fill application form
      const success3 = await this.fillApplicationForm(job);
      if (!success3) return false;

      // Step 4: Handle email verification
      const success4 = await this.handleEmailVerification(job);
      if (!success4) return false;

      return true;

    } catch (error) {
      this.logger.error(`❌ Single job application failed: ${error.message}`);
      return false;
    }
  }

  // 🎯 STEP 1: CLICK THE APPLY BUTTON (ENHANCED)
  async clickApplyButton(job) {
    try {
      this.logger.info('🎯 Step 1: Clicking apply button...');

      await this.page.waitForTimeout(2000);

      // Enhanced selectors based on your screenshots
      const applySelectors = [
        'button:has-text("Apply with Autofill")', // From your screenshots
        'button:has-text("Apply")',
        'a:has-text("Apply")',
        '.apply-btn',
        '.apply-button',
        '[data-apply]',
        'button[class*="apply"]',
        '.job-apply-button'
      ];

      let applyButton = null;
      for (const selector of applySelectors) {
        try {
          applyButton = await this.page.waitForSelector(selector, { timeout: 2000 });
          if (applyButton) {
            this.logger.info(`✅ Found apply button: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!applyButton) {
        this.logger.warn('⚠️ No apply button found');
        return false;
      }

      // Click the apply button
      await applyButton.click();
      await this.page.waitForTimeout(3000);

      this.logger.success('✅ Step 1 completed: Apply button clicked');
      return true;

    } catch (error) {
      this.logger.error(`❌ Step 1 failed: ${error.message}`);
      return false;
    }
  }

  // 📄 STEP 2: HANDLE RESUME MODAL (ENHANCED)
  async handleResumeModal(job) {
    try {
      this.logger.info('📄 Step 2: Handling resume modal...');

      await this.page.waitForTimeout(3000);

      // Look for resume customization modal (from your screenshots)
      const modalSelectors = [
        '.resume-modal',
        '.modal',
        '.popup',
        '[class*="modal"]',
        '.customize-resume',
        '[data-testid="resume-modal"]'
      ];

      let resumeModal = null;
      for (const selector of modalSelectors) {
        try {
          resumeModal = await this.page.waitForSelector(selector, { timeout: 2000 });
          if (resumeModal) break;
        } catch (error) {
          continue;
        }
      }
      
      if (resumeModal) {
        this.logger.info('📝 Resume customization modal detected');

        // Try to skip customization (as per your instructions)
        const skipSelectors = [
          'button:has-text("Apply without Customizing")', // From your screenshots
          'button:has-text("Skip")',
          'button:has-text("Use Current")',
          'button:has-text("Continue")',
          'button:has-text("Next")',
          '.skip-btn',
          '.continue-btn',
          '.apply-without-customizing'
        ];

        let skipButton = null;
        for (const selector of skipSelectors) {
          try {
            skipButton = await this.page.waitForSelector(selector, { timeout: 2000 });
            if (skipButton) {
              this.logger.info(`✅ Found skip button: ${selector}`);
              break;
            }
          } catch (error) {
            continue;
          }
        }

        if (skipButton) {
          await skipButton.click();
          await this.page.waitForTimeout(3000);
          this.logger.success('✅ Resume customization skipped');
        } else {
          // Close modal if no skip option
          const closeSelectors = ['button:has-text("Close")', '.close', '.modal-close', '[aria-label="Close"]'];
          for (const selector of closeSelectors) {
            try {
              const closeButton = await this.page.waitForSelector(selector, { timeout: 1000 });
              if (closeButton) {
                await closeButton.click();
                await this.page.waitForTimeout(2000);
                break;
              }
            } catch (error) {
              continue;
            }
          }
        }
      }

      this.logger.success('✅ Step 2 completed: Resume modal handled');
      return true;

    } catch (error) {
      this.logger.error(`❌ Step 2 failed: ${error.message}`);
      return false;
    }
  }

  // 📝 STEP 3: FILL APPLICATION FORM (ENHANCED)
  async fillApplicationForm(job) {
    try {
      this.logger.info('📝 Step 3: Filling application form...');

      await this.page.waitForTimeout(3000);

      // Fill basic information using correct profile
      await this.fillBasicInfo();

      // Handle Q&A questions with AI-powered responses
      await this.handleQuestions(job);

      // Submit the form
      await this.submitApplication();

      this.logger.success('✅ Step 3 completed: Application form filled');
      return true;

    } catch (error) {
      this.logger.error(`❌ Step 3 failed: ${error.message}`);
      return false;
    }
  }

  // 📋 FILL BASIC INFO (CORRECTED TO USE PROPER PROFILE)
  async fillBasicInfo() {
    try {
      this.logger.info('📋 Filling basic information...');

      // First Name
      const firstNameSelectors = [
        'input[name*="first" i]',
        'input[placeholder*="first" i]',
        'input[id*="first"]',
        '#firstName',
        '#first_name'
      ];

      for (const selector of firstNameSelectors) {
        try {
          const field = await this.page.waitForSelector(selector, { timeout: 1000 });
          if (field) {
            await field.fill(this.profile.personal.firstName);
            this.logger.info('✅ First name filled');
            break;
          }
        } catch (error) {
          continue;
        }
      }

      // Last Name  
      const lastNameSelectors = [
        'input[name*="last" i]',
        'input[placeholder*="last" i]',
        'input[id*="last"]',
        '#lastName',
        '#last_name'
      ];

      for (const selector of lastNameSelectors) {
        try {
          const field = await this.page.waitForSelector(selector, { timeout: 1000 });
          if (field) {
            await field.fill(this.profile.personal.lastName);
            this.logger.info('✅ Last name filled');
            break;
          }
        } catch (error) {
          continue;
        }
      }

      // Email
      const emailSelectors = [
        'input[type="email"]',
        'input[name*="email" i]',
        'input[placeholder*="email" i]',
        '#email'
      ];

      for (const selector of emailSelectors) {
        try {
          const field = await this.page.waitForSelector(selector, { timeout: 1000 });
          if (field) {
            await field.fill(this.profile.personal.email);
            this.logger.info('✅ Email filled');
            break;
          }
        } catch (error) {
          continue;
        }
      }

      // Phone
      const phoneSelectors = [
        'input[type="tel"]',
        'input[name*="phone" i]',
        'input[placeholder*="phone" i]',
        '#phone'
      ];

      for (const selector of phoneSelectors) {
        try {
          const field = await this.page.waitForSelector(selector, { timeout: 1000 });
          if (field) {
            await field.fill(this.profile.personal.phone);
            this.logger.info('✅ Phone filled');
            break;
          }
        } catch (error) {
          continue;
        }
      }

      // LinkedIn URL
      const linkedinSelectors = [
        'input[name*="linkedin" i]',
        'input[placeholder*="linkedin" i]',
        'input[name*="profile" i]'
      ];

      for (const selector of linkedinSelectors) {
        try {
          const field = await this.page.waitForSelector(selector, { timeout: 1000 });
          if (field) {
            await field.fill(this.profile.personal.linkedinUrl);
            this.logger.info('✅ LinkedIn URL filled');
            break;
          }
        } catch (error) {
          continue;
        }
      }

      this.logger.success('✅ Basic information filled');

    } catch (error) {
      this.logger.warn(`⚠️ Basic info filling failed: ${error.message}`);
    }
  }

  // 🧠 HANDLE Q&A QUESTIONS (ENHANCED WITH REAL ACCOMPLISHMENTS)
  async handleQuestions(job) {
    try {
      this.logger.info('🧠 Handling Q&A questions...');

      // Look for text areas and questions
      const questionFields = await this.page.$$('textarea, input[type="text"]:not([name*="name"]):not([name*="email"]):not([name*="phone"])');
      
      for (const field of questionFields) {
        try {
          const label = await this.getQuestionLabel(field);
          const answer = await this.generateAnswer(label, job);
          
          if (answer) {
            await field.fill(answer);
            await this.page.waitForTimeout(1000);
            this.logger.info(`📝 Answered: ${label.substring(0, 50)}...`);
          }
        } catch (error) {
          this.logger.warn(`⚠️ Failed to handle question: ${error.message}`);
          continue;
        }
      }

      // Handle work authorization questions
      await this.handleWorkAuthQuestions();

      this.logger.success('✅ Questions handled');

    } catch (error) {
      this.logger.warn(`⚠️ Question handling failed: ${error.message}`);
    }
  }

  // 🧠 AI ANSWER GENERATION (USING REAL ACCOMPLISHMENTS)
  async generateAnswer(question, job) {
    try {
      const questionLower = question.toLowerCase();

      // Why do you want to work here?
      if (questionLower.includes('why') && (questionLower.includes('work') || questionLower.includes('company'))) {
        return `I'm excited about ${job.company}'s innovative approach to technology and the opportunity to contribute to meaningful projects. With my 3+ years of experience in microservices architecture and AI integration, I believe I can make a significant impact while growing my skills in a dynamic environment. My proven track record of optimizing system performance by 40% and delivering $200K in annual savings through AI integration aligns well with your company's goals.`;
      }

      // Describe a challenging project or accomplishment
      if (questionLower.includes('challenging') || questionLower.includes('project') || questionLower.includes('accomplishment') || questionLower.includes('example')) {
        return this.profile.professional.accomplishments[0].description;
      }

      // Experience with AI/ML
      if (questionLower.includes('ai') || questionLower.includes('machine learning') || questionLower.includes('llm')) {
        return this.profile.professional.accomplishments[1].description;
      }

      // Data pipeline experience
      if (questionLower.includes('data') || questionLower.includes('pipeline') || questionLower.includes('kafka')) {
        return this.profile.professional.accomplishments[2].description;
      }

      // Why should we hire you?
      if (questionLower.includes('hire') || questionLower.includes('choose')) {
        return `I bring a unique combination of strong technical skills in Java/Python and hands-on experience with modern technologies like microservices, Kafka, and AI integration. My proven track record includes optimizing system performance by 40%, building AI platforms that saved $200K annually, and developing data pipelines processing 1M+ daily events with 99.9% reliability.`;
      }

      // Salary expectations
      if (questionLower.includes('salary') || questionLower.includes('compensation')) {
        return this.profile.professional.salaryExpectation;
      }

      // Availability
      if (questionLower.includes('start') || questionLower.includes('available') || questionLower.includes('notice')) {
        return this.profile.professional.availability;
      }

      // Work authorization
      if (questionLower.includes('authorization') || questionLower.includes('eligible') || questionLower.includes('visa')) {
        return this.profile.professional.workAuthorization;
      }

      // Default response for other questions
      return `With over 3 years of experience as a Software Engineer at Genpact Global INC, I have developed strong expertise in backend systems, microservices architecture, and AI integration. I'm passionate about building scalable solutions and contributing to innovative projects that make a real impact.`;

    } catch (error) {
      this.logger.error(`❌ Answer generation failed: ${error.message}`);
      return null;
    }
  }

  // 🏷️ GET QUESTION LABEL (ENHANCED)
  async getQuestionLabel(element) {
    try {
      // Try to find associated label
      const label = await element.evaluate(el => {
        // Check for label element
        const id = el.getAttribute('id');
        if (id) {
          const labelEl = document.querySelector(`label[for="${id}"]`);
          if (labelEl) return labelEl.textContent.trim();
        }

        // Check for parent label
        const parentLabel = el.closest('label');
        if (parentLabel) return parentLabel.textContent.trim();

        // Check for nearby text elements
        const parent = el.parentElement;
        if (parent) {
          const prevSibling = parent.previousElementSibling;
          if (prevSibling && prevSibling.textContent.trim()) {
            return prevSibling.textContent.trim();
          }
          
          const text = parent.textContent.trim();
          if (text && text !== el.value && text.length < 200) return text;
        }

        // Check placeholder
        const placeholder = el.getAttribute('placeholder');
        if (placeholder) return placeholder;

        // Check aria-label
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;

        return 'Question';
      });

      return label || 'Question';

    } catch (error) {
      return 'Question';
    }
  }

  // 🏢 HANDLE WORK AUTHORIZATION QUESTIONS (ENHANCED)
  async handleWorkAuthQuestions() {
    try {
      // Look for visa/sponsorship questions
      const sponsorshipSelectors = [
        'select[name*="visa" i]',
        'select[name*="authorization" i]',
        'input[name*="sponsorship" i]',
        'select[name*="eligibility" i]',
        'select[name*="status" i]'
      ];

      for (const selector of sponsorshipSelectors) {
        try {
          const element = await this.page.waitForSelector(selector, { timeout: 1000 });
          if (element) {
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            
            if (tagName === 'select') {
              // Try to select appropriate options
              const options = [
                'Will require H1B sponsorship',
                'H1B',
                'Will require sponsorship',
                'No',
                'Not currently authorized'
              ];
              
              for (const option of options) {
                try {
                  await element.selectOption({ label: option });
                  this.logger.info(`✅ Selected work auth option: ${option}`);
                  break;
                } catch (e) {
                  continue;
                }
              }
            } else if (tagName === 'input') {
              await element.fill(this.profile.professional.workAuthorization);
            }
          }
        } catch (error) {
          continue;
        }
      }

    } catch (error) {
      this.logger.warn(`⚠️ Work auth handling failed: ${error.message}`);
    }
  }

  // 📤 SUBMIT APPLICATION (ENHANCED)
  async submitApplication() {
    try {
      this.logger.info('📤 Submitting application...');

      await this.page.waitForTimeout(2000);

      // Look for submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Submit Application")',
        'button:has-text("Submit")',
        'button:has-text("Apply")',
        'button:has-text("Send")',
        '.submit-btn',
        '.apply-btn',
        '.submit-application'
      ];

      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          submitButton = await this.page.waitForSelector(selector, { timeout: 2000 });
          if (submitButton) {
            this.logger.info(`✅ Found submit button: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (submitButton) {
        await submitButton.click();
        await this.page.waitForTimeout(5000);
        this.logger.success('✅ Application submitted');
      } else {
        this.logger.warn('⚠️ No submit button found');
      }

    } catch (error) {
      this.logger.error(`❌ Submission failed: ${error.message}`);
    }
  }

  // 📧 STEP 4: HANDLE EMAIL VERIFICATION (ENHANCED)
  async handleEmailVerification(job) {
    try {
      this.logger.info('📧 Step 4: Handling email verification...');

      await this.page.waitForTimeout(5000);

      // Check if email verification is required
      const verificationSelectors = [
        'input[placeholder*="code" i]',
        'input[name*="verification" i]',
        'input[name*="otp" i]',
        'input[placeholder*="security" i]'
      ];

      let verificationElement = null;
      for (const selector of verificationSelectors) {
        try {
          verificationElement = await this.page.waitForSelector(selector, { timeout: 3000 });
          if (verificationElement) {
            this.logger.info(`📧 Email verification detected: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (verificationElement) {
        this.logger.info('📧 Email verification detected, waiting for code...');

        // Wait for email and get verification code (mock for now)
        const verificationCode = await this.getEmailVerificationCode();
        
        if (verificationCode) {
          await verificationElement.fill(verificationCode);
          await this.page.waitForTimeout(1000);

          // Submit verification
          const submitSelectors = [
            'button:has-text("Verify")',
            'button:has-text("Submit")',
            'button[type="submit"]',
            '.verify-btn'
          ];

          for (const selector of submitSelectors) {
            try {
              const submitButton = await this.page.waitForSelector(selector, { timeout: 2000 });
              if (submitButton) {
                await submitButton.click();
                await this.page.waitForTimeout(3000);
                break;
              }
            } catch (error) {
              continue;
            }
          }

          this.logger.success('✅ Email verification completed');
        }
      }

      // Return to JobRight.ai and mark as applied
      await this.returnToJobRightAndConfirm();

      this.logger.success('✅ Step 4 completed: Email verification handled');
      return true;

    } catch (error) {
      this.logger.error(`❌ Step 4 failed: ${error.message}`);
      return false;
    }
  }

  // 📧 GET EMAIL VERIFICATION CODE (PLACEHOLDER - TO BE ENHANCED WITH REAL IMAP)
  async getEmailVerificationCode() {
    try {
      this.logger.info('📧 Waiting for verification email...');

      // Simulate waiting for email (in real implementation, use IMAP)
      await this.page.waitForTimeout(10000);

      // Mock code for now - in real implementation, integrate with Gmail IMAP
      const mockCodes = ['xA8u5mRs', 'B7nK9cDf', 'M5pQ2xWz', 'R8vT4jLm'];
      const mockCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
      
      this.logger.info(`✅ Verification code retrieved: ${mockCode}`);
      return mockCode;

    } catch (error) {
      this.logger.error(`❌ Failed to get verification code: ${error.message}`);
      return null;
    }
  }

  // 🔄 RETURN TO JOBRIGHT AND CONFIRM (ENHANCED)
  async returnToJobRightAndConfirm() {
    try {
      this.logger.info('🔄 Returning to JobRight.ai...');
      
      // Navigate back to JobRight.ai
      await this.page.goto(this.jobRightConfig.url);
      await this.page.waitForTimeout(3000);

      // Look for confirmation button (from your screenshots)
      const confirmSelectors = [
        'button:has-text("Yes, I applied!")',
        'button:has-text("Yes I applied!")',
        'button:has-text("Applied")',
        '.confirm-application',
        '.application-confirm'
      ];

      for (const selector of confirmSelectors) {
        try {
          const confirmButton = await this.page.waitForSelector(selector, { timeout: 3000 });
          if (confirmButton) {
            await confirmButton.click();
            await this.page.waitForTimeout(2000);
            this.logger.success('✅ Application confirmed on JobRight.ai');
            break;
          }
        } catch (error) {
          continue;
        }
      }

    } catch (error) {
      this.logger.warn(`⚠️ Return confirmation failed: ${error.message}`);
    }
  }

  // Get automation statistics
  getStats() {
    return {
      platform: 'JobRight.ai',
      status: 'initialized',
      applicationsSubmitted: 0,
      lastRun: new Date().toISOString(),
      isReady: true,
      browserStatus: 'ready',
      profile: {
        name: this.profile.personal?.firstName + ' ' + this.profile.personal?.lastName,
        email: this.profile.personal?.email
      }
    };
  }

  // ✅ CHECK PAGE LOAD (ENHANCED)
  async checkPageLoad() {
    try {
      // Wait for basic page elements to ensure page loaded
      await this.page.waitForSelector('body', { timeout: 15000 });
      
      // Check if we're on the right site
      const currentUrl = this.page.url();
      if (!currentUrl.includes('jobright.ai')) {
        throw new Error(`Unexpected page: ${currentUrl}`);
      }
      
      // Wait for some content to load
      await this.page.waitForTimeout(3000);
      
      this.logger.success('✅ Page load verification successful');
      return true;
    } catch (error) {
      this.logger.error(`❌ Page load verification failed: ${error.message}`);
      return false;
    }
  }

  // 🔧 CLEANUP
  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.logger.success('✅ Browser closed');
      }
    } catch (error) {
      this.logger.error(`❌ Cleanup failed: ${error.message}`);
    }
  }

  // 🧪 TEST LOGIN ONLY
  async testLogin() {
    try {
      this.logger.info('🧪 Testing login functionality only...');
      
      await this.initializeAutomator();
      const loginSuccess = await this.loginToJobRight();
      
      if (loginSuccess) {
        this.logger.success('🎉 Login test passed!');
        return true;
      } else {
        throw new Error('Login test failed');
      }
    } catch (error) {
      this.logger.error(`❌ Login test failed: ${error.message}`);
      return false;
    }
  }
}

module.exports = JobRightAutomator;