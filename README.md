# 🏋️‍♂️ EquipQR – Smart Sports Equipment Management System

> **EquipQR** is a full-stack web application designed to simplify how colleges manage their sports equipment.  
> It enables **students to book equipment** seamlessly and **admins to track, issue, and collect** items using QR codes.

---

## 🚀 Features

### 👨‍🎓 **Student Dashboard**
- Browse all available sports equipment.
- Book items instantly (sign-up limited to `@thapar.edu` emails).
- Check your booking status (`Pending`, `Approved`, `Returned`).
- Show a unique QR code for each booking at the counter for issue/return.

### 🧑‍💼 **Admin Panel**
- View and manage all bookings.
- Approve or reject requests instantly.
- Scan QR codes to verify returns or issues.
- Auto-delete pending requests after 2 minutes.
- One-click status update (with protection against multiple clicks).

### 🔐 **Authentication & Access**
- Secure JWT-based login system.
- Separate access levels for Admins and Students.
- Protected backend APIs: admin-only routes are enforced on the server, and students can only see their own bookings.

### 🧾 **Smart Booking Rules**
- One active booking per user, from one sport at a time.
- Only one of each item per booking (validated on the server too).
- Stock is reserved atomically when booking (no overbooking, even with simultaneous requests) and restored on rejection, return or expiry.

### 🧠 **System Intelligence**
- Automatically removes unapproved requests after 2 minutes.
- Prevents duplicate or spam bookings.
- Prevents stock duplication on repeated admin clicks (atomic status transitions: pending → approved/rejected, approved → returned).

---

## 🏗️ Tech Stack

| Layer | Technology Used |
|-------|------------------|
| **Frontend** | React.js, CSS3, `@yudiel/react-qr-scanner` |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Authentication** | JWT (JSON Web Token) |
| **QR Generation** | `qrcode` NPM package |
| **Scheduling** | `node-cron` (auto-expiry safety net) |
| **Deployment** | Vercel (Frontend) & Render / Railway (Backend) |

---

## 📱 Screenshots

| Login Page | Student Dashboard | Admin Panel |
|-------------|------------------|--------------|
| ![Login](assets/login.png) | ![Dashboard](assets/student.png) | ![Admin](assets/admin.png) |

---

## 📁 Project Structure

```
EquipQR/
├── backend/                  Node.js + Express REST API
│   ├── config/db.js          MongoDB connection
│   ├── jobs/autoCleanup.js   Cron job: expires unapproved bookings
│   ├── middleware/           JWT auth (protect) + adminOnly
│   ├── models/               Mongoose schemas: User, Item, Booking, Turf
│   ├── routes/               bookings, items, users, turfs, quick-access
│   ├── utils/stock.js        Atomic stock reserve / release / expiry
│   ├── scripts/              seedItems, seedTurfs, makeAdmin
│   └── server.js             App entry point
└── frontend/                 React app
    ├── public/
    └── src/
        ├── components/       Admin, Auth, Bookings, Cart, Common, Items, Layout, Turfs
        ├── hooks/useAuth.js  Login state
        ├── services/api.js   All API calls
        └── App.jsx           Views + cart logic
```

---

## ⚙️ Run Locally

**Needs:** Node.js 18+ and a MongoDB database (local MongoDB or a free MongoDB Atlas cluster).

> On macOS, port 5000 is used by AirPlay Receiver, so the backend runs on **5070**.

**1. Backend** (terminal 1)
```bash
cd backend
cp .env.example .env        # then put your MONGO_URI and a JWT_SECRET in .env
npm install
npm run seed:items          # sample equipment for every sport
npm run seed:turfs          # sample courts/turfs
npm run dev                 # http://localhost:5070
```

**2. Frontend** (terminal 2)
```bash
cd frontend
cp .env.example .env        # REACT_APP_BACKENDURL=http://localhost:5070
npm install
npm start                   # opens http://localhost:3000
```

**3. Make yourself an admin.** Register in the app with an `@thapar.edu` email, then:
```bash
cd backend
npm run make-admin -- your.name@thapar.edu
```
Log out and back in, and the **Admin Panel** tab appears.
