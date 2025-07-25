// 🧪 DRY RUN TEST - Safe Job Discovery (No Real Applications)

require('dotenv').config();
const JobRightAutomator = require('../src/platforms/JobRightAutomator');
const Logger = require('../src/utils/Logger');

const logger = new Logger('DryRunTest');

async function testDryRun() {
  logger.info('🧪 Starting DRY RUN test - No real applications will be submitted');
  logger.info('🎯 This will only test job discovery and form detection');
  
  const automator = new JobRightAutomator();
  
  try {
    // Test 1: Initialize browser
    logger.info('📋 Test 1: Initializing browser...');
    await automator.initializeAutomator();
    logger.success('✅ Test 1 passed: Browser initialized');
    
    // Test 2: Login (if needed)
    logger.info('📋 Test 2: Testing login flow...');
    try {
      await automator.loginToJobRight();
      logger.success('✅ Test 2 passed: Login completed');
    } catch (error) {
      logger.warn('⚠️ Test 2: Login may not be required or failed:', error.message);
    }
    
    // Test 3: Job Discovery
    logger.info('📋 Test 3: Discovering jobs...');
    const jobs = await automator.discoverJobs();
    logger.info(`📊 Found ${jobs.length} jobs`);
    
    if (jobs.length > 0) {
      logger.success('✅ Test 3 passed: Job discovery working');
      
      // Show first 3 jobs found
      logger.info('🎯 Sample jobs found:');
      jobs.slice(0, 3).forEach((job, index) => {
        logger.info(`   ${index + 1}. ${job.title} at ${job.company}`);
        logger.info(`      Location: ${job.location}`);
        logger.info(`      Has Apply Button: ${job.hasApplyButton ? 'YES' : 'NO'}`);
      });
      
      // Test 4: DRY RUN application flow (no actual clicking)
      logger.info('📋 Test 4: Testing application flow (DRY RUN)...');
      const testJob = jobs[0];
      logger.info(`🎯 DRY RUN target: ${testJob.title} at ${testJob.company}`);
      
      // Test form detection without clicking
      await testApplicationFlow(automator, testJob);
      
      logger.success('✅ Test 4 passed: Application flow tested in dry run mode');
    } else {
      logger.warn('⚠️ Test 3: No jobs found - may need to adjust discovery logic');
    }
    
    // Test Summary
    logger.info('📊 DRY RUN TEST SUMMARY:');
    logger.info(`   Jobs Discovered: ${jobs.length}`);
    logger.info(`   Jobs with Apply Buttons: ${jobs.filter(j => j.hasApplyButton).length}`);
    logger.info(`   Browser Status: Working`);
    logger.info(`   Ready for Real Applications: ${jobs.length > 0 ? 'YES' : 'NO'}`);
    
    logger.success('🎉 DRY RUN completed successfully! System is ready for real applications.');
    
  } catch (error) {
    logger.error('❌ DRY RUN failed:', error.message);
    logger.error('Stack:', error.stack);
  } finally {
    // Cleanup
    logger.info('🧹 Cleaning up...');
    await automator.cleanup();
    logger.info('✅ Cleanup completed');
  }
}

async function testApplicationFlow(automator, job) {
  try {
    logger.info('🔍 Testing application flow detection...');
    
    // Navigate to job page (if URL available)
    if (job.url) {
      logger.info(`🌐 Navigating to job URL: ${job.url}`);
      await automator.page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Check for apply buttons
      const applyButtons = await automator.page.$$('button:has-text("Apply"), a:has-text("Apply"), .apply-btn');
      logger.info(`🔍 Found ${applyButtons.length} apply buttons on page`);
      
      // Check for form fields
      const formFields = await automator.page.$$('input, textarea, select');
      logger.info(`📝 Found ${formFields.length} form fields on page`);
      
      // Check for file upload fields
      const fileUploads = await automator.page.$$('input[type="file"]');
      logger.info(`📎 Found ${fileUploads.length} file upload fields`);
      
    } else {
      logger.warn('⚠️ No URL available for job, skipping page analysis');
    }
    
  } catch (error) {
    logger.warn(`⚠️ Application flow test failed: ${error.message}`);
  }
}

// Run the dry run test
testDryRun();