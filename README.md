# Affiliate Tracking Portal

Automated affiliate tracking system that replaces manual Google Sheets processes with a modern, scalable, and efficient portal.

## 🎯 Primary Goal

Develop a comprehensive tracking portal for sub-affiliates that automates data collection and reporting, making processes more accessible and efficient for users and the company.

## 🚀 Local Installation and Setup

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Installation

```bash
# 1. Clone the repository
git clone <your-repository>
cd affiliate-portal

# 2. Start all services
docker-compose up --build

# 3. Access applications
# - Web Portal: http://localhost:5173
# - API Docs: http://localhost:3000/docs
# - Prisma Studio: http://localhost:5555 (optional)
```

### Local Development (Alternative)

#### Backend (API)
```bash
cd api
npm install
npm run db:generate
npm run db:migrate
npm run start:dev
# API available at: http://localhost:3000/docs
```

#### Frontend (Web)
```bash
cd web
npm install
npm run dev
# Portal available at: http://localhost:5173
```

## ✅ Implemented Features

### 🔄 **Data Automation**
- **Automatic CSV processing**: Replaces manual Google Sheets uploads
- **Intelligent deduplication**: Automatically eliminates duplicate conversions
- **API synchronization**: Connectors for affiliate networks (Impact, CJ Affiliate)
- **Real-time processing**: Automatically updated data

### 📊 **Dashboard and Reports**
- **Modern dashboard**: Intuitive interface with Material-UI
- **Real-time KPIs**: Clicks, conversions, CTR, CVR, EPC, Revenue
- **Advanced filters**: By network, sub-affiliate, dates
- **CSV export**: Download customized reports
- **Data visualization**: Interactive tables and key metrics

### 🏗️ **Technical Architecture**
- **Modern REST API**: NestJS with TypeScript
- **Optimized database**: SQLite with Prisma ORM
- **Reactive frontend**: React with Material-UI
- **Containerization**: Docker for development and production
- **Automated CI/CD**: GitHub Actions with build and deploy

### 🔧 **Development Tools**
- **Hot reload**: Real-time changes during development
- **Prisma Studio**: Visual interface for database
- **Swagger/OpenAPI**: Automatic API documentation
- **Linting and testing**: Automated code quality

## 🎯 Upcoming Implementations

### 📈 **Phase 1: Scalability and Performance (2-3 weeks)**
- [ ] **PostgreSQL migration**: Robust database for production
- [ ] **Redis cache**: Optimization of frequent queries
- [ ] **Pagination**: Efficient handling of large data volumes
- [ ] **Database indexes**: Optimization of complex queries

### 🔐 **Phase 2: Authentication and Security (1-2 weeks)**
- [ ] **JWT authentication system**: Secure login for sub-affiliates
- [ ] **Roles and permissions**: Admin, Sub-affiliate, Read-only
- [ ] **Rate limiting**: Protection against API abuse
- [ ] **Data validation**: Robust sanitization and validation

### 📊 **Phase 3: Advanced Reports (2-3 weeks)**
- [ ] **Interactive charts**: Charts.js or D3.js for visualizations
- [ ] **Scheduled reports**: Automatic email delivery
- [ ] **Customizable dashboards**: Configurable widgets per user
- [ ] **Temporal comparisons**: Trend analysis and growth

### 🔌 **Phase 4: Integrations (3-4 weeks)**
- [ ] **More affiliate networks**: Amazon Associates, ShareASale, etc.
- [ ] **Webhooks**: Real-time notifications
- [ ] **Public API**: Endpoints for external integrations
- [ ] **Bidirectional synchronization**: Automatic updates from sources

### 📱 **Phase 5: User Experience (2-3 weeks)**
- [ ] **Responsive design**: Optimization for mobile and tablets
- [ ] **Push notifications**: Performance alerts
- [ ] **Dark mode**: User preferences
- [ ] **Internationalization**: Multi-language support

### 🚀 **Phase 6: Production and Monitoring (1-2 weeks)**
- [ ] **Centralized logging**: Error and performance monitoring
- [ ] **Business metrics**: System usage KPIs
- [ ] **Automated backup**: Critical data protection
- [ ] **Health checks**: System health monitoring

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (NestJS)      │◄──►│   (SQLite)      │
│   Port: 5173    │    │   Port: 3000    │    │   File: dev.db  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Material-UI   │    │   Prisma ORM    │    │   Data Models   │
│   Dashboard     │    │   Controllers   │    │   Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
affiliate-portal/
├── api/                          # Backend NestJS
│   ├── src/
│   │   ├── ingest/              # CSV data processing
│   │   ├── reports/             # Report endpoints
│   │   ├── connectors/          # Affiliate network connectors
│   │   └── prisma/              # Database configuration
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   └── Dockerfile               # API Docker image
├── web/                          # Frontend React
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   └── Dashboard.tsx    # Main dashboard
│   │   └── api/                 # API client
│   └── Dockerfile               # Frontend Docker image
├── data/                         # Example CSV files
├── db/                          # SQLite database
├── docker-compose.yml           # Service orchestration
└── .github/workflows/           # CI/CD Pipeline
    └── ci-cd.yml               # GitHub Actions
```

## 🎯 Success Criteria Achieved

### ✅ **Elimination of Manual Processes**
- **Before**: Manual upload to Google Sheets
- **Now**: Automatic CSV and API processing

### ✅ **Real-time Updates**
- **Before**: Static data in spreadsheets
- **Now**: Dynamic dashboard with updated data

### ✅ **Reduced Management Time**
- **Before**: "Very long and complicated process"
- **Now**: Complete data flow automation

### ✅ **Improved Data Accuracy**
- **Before**: Errors from manual entry
- **Now**: Automatic validation and deduplication

### ✅ **Affiliate Program Scalability**
- **Before**: Limited by manual processes
- **Now**: Architecture prepared for growth

## 🛠️ Technologies Used

### Backend
- **NestJS**: Scalable Node.js framework
- **TypeScript**: Static typing for greater robustness
- **Prisma**: Modern ORM for database
- **SQLite**: Lightweight database for development

### Frontend
- **React**: Modern UI library
- **Material-UI**: Professional design components
- **Vite**: Fast and efficient build tool
- **Axios**: HTTP client for API communication

### DevOps
- **Docker**: Containerization for consistency
- **GitHub Actions**: Automated CI/CD
- **GitHub Container Registry**: Image storage

## 📞 Support and Contribution

To report bugs, request features, or contribute to the project, please:

1. Create an issue on GitHub
2. Follow contribution guidelines
3. Keep code clean and documented

---

**Developed with ❤️ to automate and optimize affiliate tracking**