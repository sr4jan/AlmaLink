# AlmaLink

> The Future of Campus Connectivity - Bridging Students and Alumni through AI-Powered Networking

🔗 **Live Site**: [https://alma-link.vercel.app/](https://alma-link.vercel.app/)  

## 🚫 Important Notice

**PROPRIETARY SOFTWARE - ALL RIGHTS RESERVED**

This software and its source code are proprietary and confidential. Unauthorized copying, transferring, or reproduction of this software, via any medium is strictly prohibited. This software is owned by Srajan Soni and protected by copyright law and trade secret law.

Last Updated: 2025-04-29 17:42:45 UTC

## 🌐 Overview

AlmaLink is an intelligent ecosystem transforming how students and alumni interact, support, and grow together. By leveraging AI, automation, real-time collaboration, and community-driven features, AlmaLink redefines campus connectivity.

## ✨ Key Features

### 🔐 Smart Authentication & Role Management

- **Signup with Resume Upload**: 
  - Upload resume for instant profile creation
  - AI-powered parser extracts key information
  - Auto-fills user profile with precision

- **Intelligent Role Assignment**:
  - 🧑‍🎓 **Student**: Access to idea posting, Q&A, job applications
  - 🎓 **Alumni**: Fund ideas, answer questions, post jobs
  - 🛡️ **Admin**: College-specific management
  - 👑 **Superadmin**: Root-level access, admin creation

- **Security**:
  - JWT authentication
  - Bcrypt password encryption
  - Automatic session management

### 🏠 Dynamic Homepage

- Personalized role-based navigation
- Dark/Light mode toggle
- Smart sidebar with:
  - Profile picture upload
  - Real-time info sync
  - Resume-extracted data
- Alumni Success Stories section
- Built-in AI Assistant

### 📊 Multi-Level Dashboards

- 📈 **Student Dashboard**
  - Submission tracking
  - Response monitoring
  - Engagement analytics

- 🎓 **Alumni Dashboard**
  - Q&A activity metrics
  - Funded ideas tracking
  - Session management

- 🛡️ **Admin Dashboard**
  - User control panel
  - Event approvals
  - Analytics reports

- 🚀 **Superadmin Dashboard**
  - Institution oversight
  - Admin management
  - System controls

### 🚀 Core Features

#### 💡 IdeaHub – Innovation Meets Funding
- Student idea submissions
- Alumni funding platform
- Detailed project showcases
- Tag-based filtering

#### ❓ Question Forum – Knowledge Matching Engine
- ML-categorized questions
- Skill-based routing
- Smart answer matching
- Topic organization

#### 💼 Job & Internship Portal
- Alumni job postings
- Student applications
- Skill matching algorithm
- Application tracking

#### 🎓 Events Hub
- College event management
- Alumni meet coordination
- RSVP system
- Calendar integration

#### 📺 Live Webinars
- Real-time sessions
- Interactive Q&A
- Recording capabilities
- Session analytics

#### 🔗 Connections
- Auto-college linking
- Real-time chat *(coming soon)*
- Profile cards
- Mentorship matching

#### 💬 Chatbox
- *(Planned: Socket.IO integration for messaging)*
- Encrypted messaging *(coming soon)*
- File sharing *(coming soon)*

#### 💰 Donation Portal
- Idea funding
- Event sponsorship
- Scholarship programs
- Transaction tracking

## 🧠 AI + ML Integration

### 🧾 Resume Parser
- SpaCy + Regex extraction
- Multi-format support
- Accuracy validation
- Data structuring
- 🔗 [GitHub Repo](https://github.com/sr4jan/resume-extractor-api)

### 🎯 Skill Classifier
- ML-based prediction
- Training data integration
- Continuous learning
- Accuracy metrics

### ❓ Question Categorizer
- Instant classification
- Topic modeling
- Tag generation
- Routing logic
- 🔗 [GitHub Repo](https://github.com/sr4jan/question-classifier-backend)

### ⚙️ Model Deployment
- FastAPI endpoints
- Hosted on Render
- Load balancing
- Error handling

## 💻 Technical Architecture

### 🚀 Frontend
```typescript
const frontend = {
  framework: "Next.js v15",
  core: "React v19",
  language: "TypeScript/JavaScript ES6+",
  auth: "NextAuth.js with JWT",
  state: ["Context API", "Headless UI"],
  styling: "CSS Modules with animations",
  networking: "Axios",
  parsers: ["pdf-parse", "pdf2json", "mammoth"]
};
```

### ⚙️ Backend
```js
const backend = {
  framework: "FastAPI",
  server: "Uvicorn",
  ml_stack: [
    "scikit-learn",
    "pandas",
    "numpy",
    "spaCy",
    "nltk"
  ],
  deployment: "Render",
  apis: [
    "Resume Parsing",
    "Skill Prediction",
    "Question Classification"
  ]
};
```

### 🗄️ Database
```js
const database = {
  platform: "MongoDB Atlas",
  odm: "Mongoose",
  collections: [
    "users",
    "profiles",
    "questions",
    "ideas",
    "events",
    "chats",
    "donations"
  ]
};
```

### 🔒 Security Implementation
- Password Encryption (Bcrypt)
- JWT Session Management
- Role-Based Access Control
- Protected API Routes
- Data Encryption
- XSS Protection
- CSRF Prevention
- Rate Limiting

## 🌟 Unique Value Proposition
✅ AI-Powered Onboarding  
✅ Smart Role Management  
✅ Intelligent Q&A Routing  
✅ Direct Fundraising Platform  
✅ Automated College Ecosystem  
✅ Enterprise-Grade Security

## 👤 Author & Rights
**Srajan Soni**  
3rd Year, B.Tech in Computer Science & Engineering  
Lakshmi Narain College of Technology, Bhopal  
[GitHub](https://github.com/sr4jan)  
[LinkedIn](https://linkedin.com/in/sr4jan)

## ⚖️ Legal
CONFIDENTIAL & PROPRIETARY

© 2025 Srajan Soni. All Rights Reserved.

This software is proprietary and confidential. No part of this software may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the owner, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.

For permission requests, write to the owner at the e-mail address below:  
srajansoni2004@gmail.com

MONGODB_URI=your_mongodb_uri  
NEXTAUTH_SECRET=your_secret  
ML_API_URL=your_ml_api_url

## 🗂️ Folder Structure
```
almalink/
├── components/      # React components
├── pages/           # Next.js pages
├── public/          # Static assets
├── styles/          # CSS modules with animations
├── lib/             # Utility functions
├── models/          # MongoDB schemas
└── ml/              # Machine learning modules
```

*Future enhancements: Cloudinary integration, real-time chat via Socket.IO, OpenAI API integration in chatbot*

