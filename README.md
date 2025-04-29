# AlmaLink

> The Future of Campus Connectivity - Bridging Students and Alumni through AI-Powered Networking

---

## 🚀 Overview

AlmaLink is an intelligent ecosystem that transforms how students and alumni interact, support, and grow together. By leveraging AI, automation, real-time collaboration, and community-driven features, AlmaLink redefines campus connectivity and empowers users across roles.

## 🔐 Key Features

### Smart Authentication & Role Management
- **Signup with Resume Upload**: Alumni and students upload resumes for instant profile creation using an AI-powered parser (SpaCy + Regex).
- **Intelligent Role Assignment**:
  - 🧑‍🎓 **Student**: Post ideas, participate in Q&A, and apply for jobs.
  - 🎓 **Alumni**: Fund ideas, answer questions, and post job opportunities.
  - 🛡️ **Admin**: Manage college-specific content and oversight.
  - 👑 **Superadmin**: Root-level control and admin creation.
- **Security**:
  - JWT authentication with NextAuth.js
  - Bcrypt password hashing
  - Automatic session expiration and management
  - XSS/CSRF protection and rate limiting

### Dynamic Homepage
- Personalized role-based navigation
- Dark/Light mode toggle
- Smart sidebar with real-time info, profile picture upload, and resume-extracted data
- Alumni Success Stories showcase
- Built-in AI Assistant (Reyn)

### Multi-Level Dashboards
- **Student Dashboard**: Submission tracking, response monitoring, engagement analytics
- **Alumni Dashboard**: Q&A activity metrics, funded ideas tracking, session management
- **Admin Dashboard**: User control panel, event approvals, analytics reports
- **Superadmin Dashboard**: Institution oversight, admin management, system controls

### Core Modules

#### IdeaHub
- Student idea submissions with detailed project showcases
- Alumni funding and tag-based filtering

#### Question Forum
- ML-categorized questions (Real-time classification via FastAPI)
- Skill-based routing and smart answer matching
- Topic organization and tag generation

#### Job & Internship Portal
- Alumni job postings
- Student applications with skill matching algorithm
- Application tracking and notifications

#### Events Hub
- Event creation and RSVPs
- Alumni meet coordination
- Calendar integration

#### Live Webinars
- Real-time webinars (future Socket.IO integration)
- Interactive Q&A and recording capabilities
- Session analytics dashboard

#### Connections & Chat
- Auto-college linking and mentorship matching
- **Planned real-time chat via Socket.IO**

#### Donation Portal
- Idea funding, event sponsorship, and scholarship programs
- Transaction tracking and reporting

## 🧠 AI & ML Integration

- **APIs & Deployment**:
  - ML models are exposed as FastAPI endpoints and deployed on Render.
  - Resume-extractor API: https://github.com/sr4jan/resume-extractor-api
  - Question-classifier API: https://github.com/sr4jan/question-classifier-backend

- **Resume Parser**: SpaCy + Regex for extraction of name, email, phone, GitHub, LinkedIn, skills
- **Skill Classifier**: Scikit-learn model trained on multi-class technical dataset (~400 questions/category)
- **Question Categorizer**: FastAPI-based real-time classification and routing

## 💻 Technical Architecture

### Frontend
```javascript
// Tech Stack
const frontend = {
  framework: "Next.js v15",
  core: "React v19",
  language: "TypeScript/JavaScript ES6+",
  auth: "NextAuth.js with JWT",
  state: ["Context API", "Headless UI"],
  styling: "CSS Modules with animations",
  networking: "Axios",
  parsers: ["pdf-parse", "pdf2json", "mammoth"],
  realtime: "(planned) Socket.IO",
  storage: "(planned) Cloudinary"
};
```

### Backend
```python
# Tech Configuration
backend = {
    "framework": "FastAPI",
    "server": "Uvicorn",
    "ml_stack": [
        "scikit-learn",
        "pandas",
        "numpy",
        "spaCy",
        "nltk"
    ],
    "deployment": "Render",
    "apis": [
        "Resume Parsing",
        "Skill Prediction",
        "Question Classification"
    ]
}
```

### Database
```javascript
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

### Security Implementation
- Bcrypt password encryption
- JWT-based session management
- Role-Based Access Control (RBAC)
- Protected API routes
- Data encryption at rest and in transit
- XSS and CSRF prevention
- Rate limiting and audit logging

## 📁 Project Structure

```
almalink/
├── components/      # Reusable React components
├── pages/           # Next.js page routes
├── public/          # Static assets
├── styles/          # CSS modules & animations
├── lib/             # Utility functions and API clients
├── models/          # Mongoose schemas
└── ml/              # Machine learning modules and models
```

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory with the following:
```
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
ML_API_URL=https://your-render-app-url.com
```

## 🚧 Future Enhancements
- Real-time chat integration with Socket.IO
- Media storage via Cloudinary

## 📄 License & Legal

> **PROPRIETARY SOFTWARE - ALL RIGHTS RESERVED**

This software and its source code are proprietary and confidential. Unauthorized copying, transferring, or reproduction of this software, via any medium is strictly prohibited. This software is owned by **Srajan Soni** and protected by copyright and trade secret laws.

Last Updated: 2025-04-29 17:42:45 UTC

For permission requests, contact the owner at:

- **Email**: srajansoni2004@gmail.com

© 2025 Srajan Soni. All rights reserved.

