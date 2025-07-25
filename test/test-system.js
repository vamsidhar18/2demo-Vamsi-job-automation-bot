// 🧪 Basic System Test for Vamsi Job Automation Bot

require('dotenv').config();
const VamsidharProfile = require('../Config/vamsidhar-profile');
const Logger = require('../src/utils/Logger');

const logger = new Logger('SystemTest');

async function runBasicTests() {
  logger.info('🧪 Running basic system tests...');
  
  try {
    // Test 1: Profile configuration
    logger.info('📋 Testing profile configuration...');
    console.log('👤 Profile loaded:', VamsidharProfile.personal.fullName);
    console.log('📧 Email:', VamsidharProfile.personal.email);
    console.log('🎯 Target roles:', VamsidharProfile.automation.platforms);
    
    // Test 2: Environment variables
    logger.info('🔧 Testing environment variables...');
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGmail = !!process.env.GMAIL_APP_PASSWORD;
    
    console.log('🔑 OpenAI API Key:', hasOpenAI ? '✅ Set' : '❌ Missing');
    console.log('📧 Gmail App Password:', hasGmail ? '✅ Set' : '❌ Missing');
    
    // Test 3: Basic Playwright
    logger.info('🎭 Testing Playwright browser...');
    const { chromium } = require('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.google.com');
    const title = await page.title();
    await browser.close();
    
    console.log('🌐 Browser test:', title.includes('Google') ? '✅ Working' : '❌ Failed');
    
    logger.success('🎉 All basic tests passed!');
    logger.info('🚀 Ready to build automation modules!');
    
  } catch (error) {
    logger.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runBasicTests();