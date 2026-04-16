# PrimeTrade AI
**Live Instance:** [primetradeai.atttrack.online](https://primetradeai.atttrack.online/)

A full-stack, containerized crypto signal tracking platform. Designed to filter out global market noise by allowing users to build personalized tracking dashboards based on admin-curated signals.

⚡ **Infrastructure Note:** This entire stack is fully containerized with Docker and actively hosted on a dedicated **AWS EC2** instance. ⚡

---

<!-- ## 📸 Interface Preview

*(Uncomment and add your image paths here)*
--- -->

## 🏗️ Architecture & Stack

**Frontend**
* Next.js 15 (App Router)
* Tailwind CSS

**Backend**
* Node.js & Express.js
* Prisma ORM (v6)
* JWT Stateless Authentication

**Infrastructure**
* AWS EC2 (Amazon Linux)
* Docker & Docker Compose
* TiDB / Cloud PostgreSQL

---

## 🔐 Access & Roles

The system enforces strict RBAC (Role-Based Access Control) using secure HttpOnly cookies.

### Admin
Responsible for global market data management.
* **Credentials:** `admin@example.com` / `SecurePassword123`
* **Permissions:** Full CRUD access to global signals. Can broadcast new trade setups or close active ones.

### User
Responsible for their own portfolio tracking.
* **Credentials:** `user@example.com` / `SecurePassword123`
* **Permissions:** Can add/remove assets to a personal watchlist. The dashboard automatically filters the global signal feed to only show updates for tracked assets.

---

## 📡 API Reference

### Auth
```text
POST /api/v1/auth/register - Create account
POST /api/v1/auth/login    - Authenticate and set JWT
GET  /api/v1/auth/me       - Verify session
POST /api/v1/auth/logout   - Destroy session
```

### Market Signals
```text
GET    /api/v1/signal              - Fetch global feed (Admin)
GET    /api/v1/signal/my-watchlist - Fetch personalized feed (User)
POST   /api/v1/signal              - Broadcast new signal (Admin)
PUT    /api/v1/signal/:id          - Update signal state (Admin)
DELETE /api/v1/signal/:id          - Delete signal (Admin)
```

### Watchlist
```text
GET    /api/v1/watchlist     - View tracked assets
POST   /api/v1/watchlist     - Start tracking an asset
DELETE /api/v1/watchlist/:id - Stop tracking an asset
```

---

## 🚀 Deployment / Local Setup

**1. Clone & Frontend Setup**
```bash
git clone [https://github.com/AnnonymousBanda/primetradeai-assignment.git](https://github.com/AnnonymousBanda/primetradeai-assignment.git)
cd frontend
npm install
npm run dev
```

**2. Backend Setup (Local)**
```bash
cd backend
npm install
npx prisma generate
npm run dev
```
*(Requires `.env` with `DATABASE_URL` and `JWT_SECRET`)*

**3. Production Build (Docker on AWS EC2)**
```bash
cd backend
sudo docker-compose up --build -d
```
