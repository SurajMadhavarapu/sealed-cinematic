# 🔐 SEALED

> *Some things are too important to say right now. Say them for later.*

SEALED is a private, end-to-end encrypted web app where couples and families write time-locked letters, confessions, promises, and messages — delivered only when the moment is right.

---

## ✨ What Makes SEALED Different

- **Zero-knowledge encryption** — Even we can't read your letters
- **Time-locked delivery** — Letters unlock on a date, event, or milestone you choose
- **Equal ownership** — No single admin. Every major action requires group consensus
- **No ads. No data selling. Ever.**

---

## 🎬 Design

SEALED features a **cinematic, dramatic** visual experience with:
- Rich jewel tones — deep purples, emerald, burgundy
- Bold reveal animations and scroll-triggered effects
- Staggered animations and theatrical transitions
- Immersive letter reading experience

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 |
| Styling | Tailwind CSS |
| Animations | Framer Motion + GSAP |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Encryption | AES-256 |

---

## 📁 Project Structure

```
sealed-cinematic/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities & API
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
│
└── server/                 # Express backend
    ├── config/            # Database & config
    ├── controllers/       # Business logic
    ├── middleware/        # Auth & error handling
    ├── routes/            # API endpoints
    ├── services/          # AI & scheduler
    └── utils/             # Encryption helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 16+
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/sealed-cinematic.git
cd sealed-cinematic
```

**2. Setup backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
```

**3. Setup frontend**
```bash
cd ../client
npm install
cp .env.example .env.local
# Edit .env.local if needed
```

**4. Setup database**
```bash
psql -U postgres -d sealed_db -f server/config/schema.sql
```

### Running the App

**Backend:**
```bash
cd server && npm run dev
```

**Frontend:**
```bash
cd client && npm run dev
```

- App: `http://localhost:3000`
- API: `http://localhost:5000`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Vaults
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/vaults | Create a vault |
| GET | /api/vaults | Get my vaults |
| GET | /api/vaults/:id | Get vault details |
| POST | /api/vaults/:id/invite | Generate invite code |
| POST | /api/vaults/join | Join with invite code |

### Letters
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/vaults/:id/letters | Write a sealed letter |
| GET | /api/vaults/:id/letters | Get all letters |
| GET | /api/vaults/:id/letters/:letterId | Read letter (if unlocked) |
| PATCH | /api/vaults/:id/letters/:letterId/unlock | Manual unlock |

### Votes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/.../votes | Cast a vote |
| GET | /api/.../votes | Get votes |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/prompts | Get writing prompts |

---

## 📜 License

Private — All rights reserved.
