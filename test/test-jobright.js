// 🧪 Test JobRight.ai Automation Module

require('dotenv').config();
const JobRightAutomator = require('../src/platforms/JobRightAutomator');
const Logger = require('../src/utils/Logger');

const logger = new Logger('JobRightTest');

async function testJobRightAutomator() {
  logger.info('🧪 Testing JobRight.ai Automation Module...');
  
  const automator = new JobRightAutomator();
  
  try {
    // Test 1: Initialize (will test browser and login)
    logger.info('📋 Test 1: Initializing automator...');
    await automator.initializeAutomator();
    
    // Test 2: Get stats
    logger.info('📊 Test 2: Getting stats...');
    const stats = automator.getStats();
    console.log('📊 Automator Stats:', stats);
    
    // Test 3: Run a single automation cycle (comment out for now)
    // logger.info('🎯 Test 3: Running automation cycle...');
    // await automator.runAutomationCycle();
    
    logger.success('✅ JobRight.ai automation test passed!');
    
  } catch (error) {
    logger.error('❌ JobRight.ai automation test failed:', error.message);
  } finally {
    // Cleanup
    await automator.cleanup();
  }
}

testJobRightAutomator();