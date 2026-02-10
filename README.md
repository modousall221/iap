# Predika - Islamic & Conventional Crowdfunding Platform

A hybrid web/mobile responsive platform for participatory financing (crowdfunding) in the UEMOA region. Predika connects investors (individuals, businesses, institutions) with project owners offering both Islamic (Mudarabah, Musharaka, Sukuk) and conventional financing options.

## 🎯 MVP Overview

- **Timeline**: 6-7 weeks (small team)
- **Stack**: React (Frontend) + Node.js/Express (Backend)
- **Database**: PostgreSQL
- **Deployment**: Heroku

## 📦 Project Structure

```
predika/
├── frontend/          # React SPA (Vite + TypeScript)
├── backend/           # Express API (Monolithe)
├── docker-compose.yml # Local development
├── package.json       # Root monorepo config
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- Docker & Docker Compose

### Setup Local Development

```bash
# Install dependencies
npm install

# Start backend + database
cd backend
docker-compose up
npm run migrate

# In another terminal, start frontend
cd frontend
npm install
npm run dev

# Or run both simultaneously from root
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `STRIPE_API_KEY` - Stripe test API key
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - AWS S3 credentials
- `AWS_S3_BUCKET` - S3 bucket name

## 📋 Development Plan

### Week 0 - Foundation
- [ ] Monorepo setup
- [ ] Backend scaffolding (Express + TypeScript)
- [ ] Frontend scaffolding (React + Vite)
- [ ] Docker setup

### Week 1 - Authentication
- [ ] JWT authentication
- [ ] Login/Register endpoints
- [ ] Frontend auth pages
- [ ] Protected routes

### Week 2 - KYC/AML
- [ ] KYC document upload
- [ ] Admin approval queue
- [ ] S3 storage integration

### Week 3 - Projects
- [ ] Project CRUD operations
- [ ] Project listing with filters
- [ ] Project creation form (frontend)

### Week 4 - Investments & Payments
- [ ] Investment model & routes
- [ ] Stripe integration
- [ ] Payment flow (4 steps)
- [ ] Webhooks

### Week 5 - Contracts
- [ ] PDF generation
- [ ] Contract storage
- [ ] Contract signing workflow

### Week 6 - Deployment
- [ ] Bug fixes
- [ ] Heroku setup
- [ ] GitHub Actions CI/CD

### Week 7 - Beta Launch
- [ ] Beta testing
- [ ] Feedback collection
- [ ] Hotfixes

## 🔗 API Documentation

API docs available at `/api-docs` (Swagger/OpenAPI)

## 🧪 Testing

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## 🔒 Security

- JWT-based authentication
- HTTPS/TLS for all communications
- Password hashing with bcrypt
- CORS configuration
- Input validation with Joi
- SQL injection prevention via ORM

## 📱 Supported Features (MVP)

✅ User registration & authentication
✅ KYC verification (manual review)
✅ Project creation & listing
✅ Investment system
✅ Stripe payment integration
✅ Contract generation
✅ Admin dashboards
✅ Responsive design (mobile-first)

## 🎯 Phase 2+ Features (Roadmap)

- Microservices architecture
- Advanced Sharia compliance engine
- Onfido KYC automation
- DocuSign e-signature
- Elasticsearch search
- Mobile native apps
- Email/SMS notifications
- Banking integrations (SICA/STAR)

## 📞 Support

For questions or issues, contact: support@predika.com

## 📄 License

Proprietary - UEMOA/BCEAO compliant

## 👥 Team

- Project Lead: [Your Name]
- Backend: [Developer]
- Frontend: [Developer]
- DevOps: [Engineer]

## 📚 References

- [BCEAO Regulations](https://www.beceao.org)
- [Islamic Finance Standards](https://www.aaoifi.com)
- [OWASP Security Guidelines](https://owasp.org)

---

**Status**: MVP Development (Week 0)
**Last Updated**: February 10, 2025