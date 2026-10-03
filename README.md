# ShambaPoint Climate — Full-Stack System

## Quick Start

### 1. Initialize & Seed the Database
```powershell
cd backend
node db/init.js
node db/seed.js
```

### 2. Start the Backend API
```powershell
cd backend
npm run dev
# → http://localhost:5000/api/health
```

### 3. Start the Frontend App
```powershell
cd frontend
npm run dev
# → http://localhost:5173
```

---

## Demo Login Credentials

| Role    | Phone           | Password    | Dashboard          |
|---------|-----------------|-------------|---------------------|
| Farmer  | +254711000001   | farmer123   | /farmer/dashboard   |
| Buyer   | +254700100001   | buyer123    | /buyer/dashboard    |
| Admin   | +254700000000   | admin123    | /admin              |

---

## System Architecture

```
Shamba/
├── index.html              ← Marketing landing page (static)
├── frontend/               ← React + Vite SPA
│   ├── src/
│   │   ├── api/client.js   ← Axios API client (all endpoints)
│   │   ├── context/        ← AuthContext (JWT)
│   │   ├── components/     ← Layout, Nav, Sidebar, Spinner
│   │   └── pages/          ← 9 pages (Landing, Login, Register,
│   │                           FarmerDashboard, BuyerDashboard,
│   │                           Admin, Marketplace, Forecast,
│   │                           YieldRegistry, Alerts, Logistics)
└── backend/                ← Node.js + Express REST API
    ├── server.js           ← Entry point
    ├── db/
    │   ├── init.js         ← SQLite schema (13 tables)
    │   ├── seed.js         ← Realistic Kenya sample data
    │   └── connection.js   ← DB singleton
    ├── middleware/auth.js  ← JWT authentication
    └── routes/             ← 9 route files
        ├── auth.js         ← POST /login, /register, GET /me
        ├── farmers.js      ← CRUD + plots
        ├── yields.js       ← Yield registry
        ├── marketplace.js  ← B2B listings + matching
        ├── logistics.js    ← Booking + status + M-Pesa release
        ├── buyers.js       ← Buyer CRUD
        ├── forecasts.js    ← County forecasts + risk map
        ├── alerts.js       ← SMS/USSD/WhatsApp stubs
        ├── dashboard.js    ← Aggregated stats
        └── alerts_pilot.js ← Pilot applications
```

## API Endpoints

| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | /api/health                     | Health check                   |
| POST   | /api/auth/register              | Create account                 |
| POST   | /api/auth/login                 | JWT login                      |
| GET    | /api/forecasts/risk-map         | All-county risk overlay        |
| GET    | /api/forecasts/county/:county   | 7-day county forecast          |
| GET    | /api/marketplace                | Available produce listings     |
| POST   | /api/marketplace/match          | Buyer requests a match         |
| GET    | /api/yields                     | Yield registry                 |
| POST   | /api/yields                     | Register new yield             |
| POST   | /api/logistics                  | Book logistics                 |
| PATCH  | /api/logistics/:id/status       | Update status + release M-Pesa |
| GET    | /api/dashboard/summary          | Platform stats                 |
| POST   | /api/alerts/broadcast           | Send county alert              |
| POST   | /api/pilot                      | Pilot application signup       |

## Production Integrations Required

- **M-Pesa**: Safaricom Daraja API (STK Push + C2B)
- **SMS**: Africa's Talking SMS API
- **USSD**: Africa's Talking USSD API
- **WhatsApp**: Twilio WhatsApp Business API
- **Satellite**: Sentinel Hub (NDVI) or NASA EarthData
- **Weather**: OpenWeatherMap or Tomorrow.io Kenya
- **Database**: PostgreSQL for production (replace better-sqlite3)
- **Auth**: Consider Firebase Auth or Auth0 for scale
