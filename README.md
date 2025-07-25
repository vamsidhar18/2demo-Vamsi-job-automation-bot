# 🤖 Vamsi Job Automation Bot

AI-powered job application automation system for **Vamsidhar Reddy M** - H1B Software Engineer

## 🎯 Features

- 🎯 **Multi-platform automation** (JobRight.ai, LinkedIn Easy Apply, Workday)
- 🧠 **AI Q&A bot** that learns from every application
- 📄 **Dynamic resume customization** for each job
- 📧 **Automatic email verification** handling
- 📊 **Real-time dashboard** with analytics
- 🎪 **Interview preparation system**

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/vamsidhar18/Vamsi-job-automation-bot.git
cd Vamsi-job-automation-bot

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Install browser engines
npx playwright install chromium

# Start automation system
npm start

# Access dashboard
open http://localhost:3001


src/platforms/
├── JobRightAutomator.js     ← Separate (easier to debug)
├── LinkedInAutomator.js     ← Separate (different workflows)  
├── WorkdayAutomator.js      ← Separate (complex forms)
└── PlatformBase.js          ← Shared utilities

src/automation/
└── JobAutomationMaster.js   ← Controls all platforms