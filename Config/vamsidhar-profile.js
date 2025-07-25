// 👤 VAMSIDHAR REDDY M - COMPLETE PROFILE CONFIGURATION
// Software Engineer seeking H1B sponsorship

module.exports = {
  personal: {
    firstName: "Vamsidhar Reddy",
    lastName: "M", 
    fullName: "Vamsidhar Reddy M",
    email: "vdr1800@gmail.com",
    phone: "+1-669-292-8219",
    location: "Mountain House, CA",
    linkedinUrl: "https://www.linkedin.com/in/vamsim16/",
    resumeUrl: "https://docs.google.com/document/d/18BRqyLDkty6tEnYyd0YwlwqMY4MsFhHHgqFRsrEtb-I/edit?usp=sharing"
  },

  professional: {
    currentTitle: "Software Engineer",
    currentCompany: "Genpact Global INC", 
    experience: "3+ years",
    salaryExpectation: "$90,000 - $140,000",
    workAuthorization: "Will require H1B sponsorship",
    availability: "2 weeks notice",
    
    skills: [
      "Java", "Python", "JavaScript", "SQL", "TypeScript",
      "Spring Boot", "Django", "FastAPI", "Node.js", "RESTful APIs",
      "AWS", "GCP", "PostgreSQL", "MongoDB", "Redis", "Docker",
      "Apache Kafka", "Microservices", "System Design",
      "LLM API Integration", "OpenAI/GPT-4", "AI/ML"
    ],

    accomplishments: [
      {
        title: "Microservices Architecture Optimization",
        description: "Designed and implemented microservices architecture reducing API response time by 40% and improving system scalability for 50K+ concurrent users",
        metrics: "40% performance improvement, 50K+ concurrent users, 99.9% uptime"
      },
      {
        title: "AI/LLM Integration Platform", 
        description: "Built enterprise LLM integration platform using OpenAI APIs, reducing manual processing time by 65% and improving accuracy",
        metrics: "65% time reduction, 95% accuracy improvement, $200K annual savings"
      },
      {
        title: "Real-time Data Pipeline",
        description: "Developed Apache Kafka-based real-time data pipeline processing 1M+ events daily with 99.9% reliability",
        metrics: "1M+ daily events, 99.9% reliability, 50% faster data processing"
      }
    ]
  },

  automation: {
    maxApplicationsPerDay: 30,
    platforms: ['jobright', 'linkedin', 'workday'],
    runSchedule: '0 9,13,17,21 * * *',
    minATSScore: 70
  },

  credentials: {
    jobright: {
      email: "vdr1800@gmail.com",
      password: process.env.JOBRIGHT_PASSWORD
    },
    linkedin: {
      email: "vdr1800@gmail.com", 
      password: process.env.LINKEDIN_PASSWORD
    },
    workday: {
      email: "vdr1800@gmail.com",
      password: process.env.WORKDAY_PASSWORD
    },
    gmail: {
      email: "vdr1800@gmail.com",
      appPassword: process.env.GMAIL_APP_PASSWORD
    }
  }
};