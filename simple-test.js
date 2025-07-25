// 🧪 VERIFY PLAYWRIGHT INSTALLATION
// File: verify-installation.js
// Run this after the complete reinstall

const { chromium, firefox, webkit } = require('playwright');

async function verifyInstallation() {
  console.log('🧪 Verifying Playwright Installation...\n');
  
  const browsers = [
    { name: 'Chromium', launcher: chromium },
    { name: 'Firefox', launcher: firefox },
    { name: 'WebKit', launcher: webkit }
  ];
  
  let allWorking = true;
  
  for (const { name, launcher } of browsers) {
    try {
      console.log(`🎭 Testing ${name}...`);
      
      const browser = await launcher.launch({ 
        headless: true,
        timeout: 10000 
      });
      
      const page = await browser.newPage();
      await page.goto('https://example.com', { timeout: 10000 });
      const title = await page.title();
      
      await browser.close();
      
      console.log(`✅ ${name} working! (Page title: "${title}")`);
      
    } catch (error) {
      console.log(`❌ ${name} failed: ${error.message}`);
      allWorking = false;
      
      if (error.message.includes("Executable doesn't exist")) {
        console.log(`   🔧 Fix: npx playwright install ${name.toLowerCase()}`);
      }
    }
  }
  
  console.log('\n📊 Installation Summary:');
  
  if (allWorking) {
    console.log('🎉 ALL BROWSERS WORKING PERFECTLY!');
    console.log('🚀 Ready to run your JobRight.ai automation!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Make sure your .env file has: JOBRIGHT_PASSWORD=your_password');
    console.log('2. Run: node simple-test.js');
  } else {
    console.log('⚠️ Some browsers need fixes (see above)');
    console.log('🔧 Try: npx playwright install');
  }
}

// Run verification
verifyInstallation()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  });