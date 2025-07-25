// 🧪 Test REAL Job Application

require('dotenv').config();
const JobRightAutomator = require('../src/platforms/JobRightAutomator');
const Logger = require('../src/utils/Logger');

const logger = new Logger('RealApplicationTest');

async function testRealApplication() {
  logger.info('🎯 Testing REAL job application...');
  
  const automator = new JobRightAutomator();
  
  try {
    // Initialize
    await automator.initializeAutomator();
    
    // Login to JobRight.ai
    await automator.loginToJobRight();
    
    // Find ONE job to test
    const jobs = await automator.discoverJobs();
    
    if (jobs.length > 0) {
      const testJob = jobs[0];
      logger.info(`🎯 Applying to: ${testJob.title} at ${testJob.company}`);
      
      // APPLY TO THE JOB
      const result = await automator.applyToSingleJob(testJob);
      
      if (result) {
        logger.success('✅ APPLICATION SUBMITTED SUCCESSFULLY!');
      } else {
        logger.error('❌ Application failed');
      }
    } else {
      logger.warn('⚠️ No jobs found to apply to');
    }
    
  } catch (error) {
    logger.error('❌ Application test failed:', error.message);
  } finally {
    await automator.cleanup();
  }
}

testRealApplication();