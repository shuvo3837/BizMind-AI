# BizMind AI - Production-Ready SaaS Business Intelligence Platform

BizMind AI is an AI-powered Business Intelligence Platform designed for business owners to upload CSV, Excel, PDF, or Image files, visualize real-time analytics dashboards, receive AI-driven actionable business insights, chat with an AI business consultant, and generate automated performance reports.

---

## 🏗️ Architecture & Project Structure

The repository is organized following clean architecture principles for maximum scalability and maintainability:

```text
BizMind-AI/
├── bizmind-client/          # React.js Frontend Application
│   ├── public/             # Static Assets
│   └── src/                # Source Code
│       ├── assets/         # Images, Icons, and Media
│       ├── components/     # Reusable UI Components
│       │   ├── common/     # Generic Buttons, Modals, Cards, Inputs
│       │   ├── dashboard/  # Dashboard-specific Cards & Widgets
│       │   ├── upload/     # Dropzones & Progress Indicators
│       │   ├── charts/     # Recharts Wrappers & Data Visualizers
│       │   ├── ai/         # AI Chat Bubbles & Prompt Suggestions
│       │   └── layout/     # Navbar, Sidebar, Footer, Header
│       ├── pages/          # Application Pages
│       │   ├── Landing/    # Product Showcase & Landing Page
│       │   ├── Auth/       # Login & Registration Pages
│       │   ├── Dashboard/  # Core Overview Dashboard
│       │   ├── Upload/     # Data File Upload & Parsing Center
│       │   ├── Analytics/  # Advanced Business Visualizations
│       │   ├── AIChat/     # AI Consultant Interactive Chat
│       │   ├── Reports/    # Report Generation & History
│       │   └── Settings/   # Business & User Profile Management
│       ├── routes/         # Router Configurations & Protected Routes
│       ├── hooks/          # Custom React Hooks
│       ├── services/       # Axios API Service Modules
│       ├── context/        # React Context API (Auth, Business)
│       ├── utils/          # Helpers, Formatters, Constants
│       ├── layouts/        # Layout Wrappers (Dashboard, Auth, Main)
│       ├── styles/         # Tailwind CSS Styles
│       ├── App.jsx         # Root React Component
│       └── main.jsx        # Frontend Entrypoint
│   ├── package.json
│   └── vite.config.js
│
├── bizmind-server/          # Node.js + Express.js Backend API
│   ├── config/             # DB & App Configurations
│   ├── controllers/        # Request Handlers
│   ├── middleware/         # Auth JWT, Multer, Error Handlers
│   ├── models/             # Mongoose Schemas (10 Collections)
│   ├── routes/             # Express API Routes
│   ├── services/           # Gemini AI & Business Logic Services
│   ├── utils/              # Async Handlers & Response Helpers
│   ├── uploads/            # Temporary File Storage Directory
│   ├── validators/         # Request Input Sanitizers
│   ├── database/           # MongoDB Connection Setup
│   ├── app.js              # Express App Configuration
│   ├── server.js           # Server Entrypoint
│   ├── package.json
│   └── .env.example
│
└── package.json            # Monorepo / Combined Dev Script
```

---

## 🗄️ Database Collections (MongoDB)

1. **`users`**: User authentication, roles, and profile settings.
2. **`businesses`**: Business profile, industry, revenue targets, currency.
3. **`uploads`**: Uploaded CSV/Excel/PDF file metadata and status.
4. **`sales`**: Processed transaction records and revenue metrics.
5. **`products`**: Product catalog, prices, and performance stats.
6. **`expenses`**: Operating expenses and cost categorizations.
7. **`inventory`**: Stock levels, reorder points, SKU metrics.
8. **`analytics`**: Calculated KPIs, growth trends, predictions.
9. **`reports`**: Generated AI summaries, PDF reports, exports.
10. **`chat_history`**: Persistent AI Assistant conversation logs.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, JavaScript (ES6+), Vite, Tailwind CSS, React Router DOM v6, Axios, Recharts, Lucide React, React Hook Form
- **Backend**: Node.js, Express.js, MongoDB Atlas / Mongoose, JWT Auth, Multer, Bcrypt.js, CORS, Dotenv
- **AI**: Google Gemini API (`@google/genai`) with Groq API readiness

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Connection String (Local or MongoDB Atlas)
- Google Gemini API Key

### Installation

```bash
# Install root & application dependencies
npm install

# Start full-stack development server
npm run dev
```

Visit `http://localhost:3000` in your browser.
