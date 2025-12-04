# 🤖 Shopify WhatsApp Automation

AI-powered WhatsApp sales automation system with multi-AI support, admin panel, and zero-budget deployment.

## 🌟 Features

### WhatsApp Automation
- ✅ Multi-account support
- ✅ QR code authentication
- ✅ Session persistence
- ✅ Anti-ban protection with intelligent rate limiting
- ✅ Media handling (screenshots, images)
- ✅ Typing indicators & human-like behavior

### AI-Powered Conversations
- ✅ Multi-AI provider support (Claude, Gemini, Groq, Cohere)
- ✅ Automatic AI rotation (maximize free tiers)
- ✅ Conversation context management
- ✅ Multi-language support (auto-detection)
- ✅ Customizable prompts
- ✅ AI performance monitoring

### Payment Processing
- ✅ Multiple payment methods (EasyPaisa, JazzCash, Bank Transfer)
- ✅ Automatic payment requests
- ✅ Screenshot collection & verification
- ✅ QR code support

### Admin Dashboard
- ✅ Real-time conversation monitoring
- ✅ Customer management
- ✅ Order tracking
- ✅ AI management & configuration
- ✅ Analytics & reports
- ✅ Package management
- ✅ Template management
- ✅ Safety monitoring

### Analytics
- ✅ Conversation analytics
- ✅ Sales performance
- ✅ AI performance metrics
- ✅ Customer insights
- ✅ Export reports (PDF, Excel, CSV)

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- PostgreSQL (Neon)
- WhatsApp Web.js
- Socket.io (real-time)
- Multiple AI APIs

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Socket.io Client

### Deployment
- Backend: Render (Free Tier)
- Frontend: Vercel/Render (Free Tier)
- Database: Neon PostgreSQL (Free Tier)
- Media: Cloudinary (Free Tier)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL account (free)
- Cloudinary account (free)
- AI API keys (free tiers available)
- WhatsApp Business account

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/shopify-wa-automation.git
cd shopify-wa-automation
2. Install Dependencies
npm run install-all
3. Setup Environment Variables
# Copy .env.example to .env in both backend and frontend
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your credentials
4. Setup Database
# Run migrations
npm run migrate

# Seed initial data
npm run seed
5. Start Development
# Start both backend and frontend
npm run dev

# Or start separately
npm run dev:backend
npm run dev:frontend
6. Access Application
Frontend: http://localhost:3000
Backend: http://localhost:5000
Admin Login: admin@example.com / admin123
📦 Deployment
Deploy to Render (Backend)
Push code to GitHub
Create new Web Service on Render
Connect GitHub repository
Use render.yaml for configuration
Add environment variables
Deploy!
Deploy to Vercel (Frontend)
Push code to GitHub
Import project on Vercel
Set root directory to frontend
Add environment variables
Deploy!
📖 Documentation
Setup Guide
Deployment Guide
API Documentation
Architecture
Troubleshooting
🔑 Environment Variables
Required
DATABASE_URL - Neon PostgreSQL connection string
JWT_SECRET - JWT secret key
CLOUDINARY_* - Cloudinary credentials
Optional (AI Providers)
CLAUDE_API_KEY - Anthropic Claude API
GEMINI_API_KEY - Google Gemini API
GROQ_API_KEY - Groq API
COHERE_API_KEY - Cohere API
🎯 Usage
1. Connect WhatsApp
Go to Dashboard → WhatsApp
Scan QR code with WhatsApp
Wait for connection confirmation
2. Configure AI
Go to AI Management
Add API keys for AI providers
Customize prompts
Enable preferred providers
3. Setup Payment Methods
Go to Payment Settings
Add EasyPaisa/JazzCash/Bank details
Upload QR codes (optional)
4. Create Packages
Go to Packages
Create service packages
Set pricing & features
5. Start Selling!
Customers message WhatsApp
AI handles conversations
Orders tracked in dashboard
Payment screenshots collected
🔒 Security
JWT authentication
Encrypted API keys
CSRF protection
Rate limiting
Input sanitization
Helmet.js security headers
🐛 Troubleshooting
WhatsApp Disconnects
Check internet connection
Rescan QR code
Check session backup
AI Not Responding
Verify API keys
Check rate limits
Review error logs
Database Connection Issues
Verify DATABASE_URL
Check Neon dashboard
Ensure SSL is enabled
📝 License
MIT License - feel free to use for personal/commercial projects
🤝 Contributing
Contributions welcome! Please read CONTRIBUTING.md first.
📧 Support
For issues and questions:
GitHub Issues
Email: support@example.com
🙏 Credits
Built with:
WhatsApp Web.js
Anthropic Claude
Google Gemini
Groq
Neon Database
Cloudinary
Made with ❤️ by [Your Name]
---

**Ye first 7 files complete hain! ✅**

**Next batch ke liye "next" type karo!** 🚀
