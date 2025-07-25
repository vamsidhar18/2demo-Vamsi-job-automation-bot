// Simple debug test
require('dotenv').config();
const { chromium } = require('playwright');

async function simpleDebug() {
  console.log('🔧 Simple Debug Test...');
  
  // Check environment
  console.log('Password exists:', !!process.env.JOBRIGHT_PASSWORD);
  
  if (!process.env.JOBRIGHT_PASSWORD) {
    console.log('❌ No password found in .env file');
    return;
  }
  
  // Test browser
  try {
    console.log('🎭 Testing browser...');
    const browser = await chromium.launch({ headless: true });
    console.log('✅ Browser works!');
    await browser.close();
  } catch (error) {
    console.log('❌ Browser failed:', error.message);
  }
}

simpleDebug();