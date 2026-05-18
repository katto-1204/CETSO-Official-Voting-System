# 🗳️ CETSO Official Voting System 2026

An ultra-premium, secure, and highly scalable student voting application developed for the **College of Engineering and Technology Student Organization (CETSO)** Elections. Built with a stunning cybernetic dark-mode aesthetic, micro-animations, and ironclad transaction security, this platform is designed to handle thousands of concurrent student voters with sub-millisecond response times.

---

## 🌟 Visual Identity & UX Aesthetics
The system strictly adheres to the premium CETSO cybernetic branding guidelines:
* **Dark Cybernetic Palette**: A deep backdrop (`#07070c`) accentuated by glowing orange highlights (`#ff7a18`, `#ff9f43`) representing technological advancement and engineers' precision.
* **Interactive Display Cards**: Candidates are showcased on dynamically styled, skewed-skewless cards that tilt responsively on hover, utilizing harmonized color schemes mapped to each candidate's index.
* **Holographic Scanners & Micro-animations**: Fully custom Framer-Motion loading overlays, secure cryptographic hashes visualizer, and particle explosions (confetti) upon successful ballot submission.

---

## 🛠️ Technology Stack
* **Frontend**: React 19 + TypeScript + Vite (highly optimized client bundles)
* **Styling**: Tailwind CSS + CSS Variables (harmonious HSL design system)
* **Caching & Queries**: TanStack React-Query (robust local data caching + state invalidation)
* **Database & Auth**: Supabase (PostgreSQL database, Row-Level Security, and Realtime Subscriptions)
* **Animation**: Framer Motion (superfluid UX transitions and holographic loaders)
* **Icons & Exporting**: Lucide React + `html2canvas` (for digital receipt downloads)

---

## ⚡ Key Core Features

### 🗳️ 1. Student Voter Portal
* **One-Click Secure Authentication**: Automatic authentication tied to verified institutional records in the Supabase students master table.
* **Fluid Candidate Directory**: A categorized, clean directory with responsive cards that show candidate profiles without clutter. Includes biography and platform modals.
* **Secure Voting Trail**: Students can see their live voting selections track along an animated side ledger bar, making selection reviews effortless.
* **Digital Ballot Receipt**: After voting, the application generates a unique receipt featuring a tamper-proof verification hash and option to **Download Receipt as PNG** directly to the student's device.

### 👑 2. Administrative Control Center
* **Live Turnout Monitoring**: Real-time polling counters and progress bars showing active voter turnout categorized by program code (BSIT, BSCpE, BSECE, BLIS).
* **Candidate Management**: Simple CRUD controls for adding, editing, and deleting candidate files, including dynamic form validation and image upload handling.
* **Voter Masterlist Sync**: Allows administrators to register student IDs, clear ballots for audits, delete students, or verify sync status in a unified control grid.
* **Immutable Audit Trail**: Live logging of administrative actions (e.g. adding candidates, modifying student lists) saved directly to the database.

---

## 📐 Project Directory Structure

```text
├── artifacts/              # High-concurrency reports and planning walkthroughs
├── public/                 # Static branding assets and 3D GLB model logo
├── supabase/               # SQL migrations, database seed files, and schemas
└── src/
    ├── components/
    │   ├── brand/          # CETSO logo and branding assets
    │   ├── layout/         # AppShell, AdminLayout, and Navigation menus
    │   └── ui/             # Reusable UI controls (Buttons, Modals, Inputs)
    ├── lib/
    │   ├── electionData.ts # Mock candidate fallback assets and seeding logic
    │   ├── queries.ts      # React-Query hooks for CRUD (Supabase bindings)
    │   ├── supabase.ts     # Initialized Supabase client instance
    │   └── voteRecords.ts  # Crytographic verification code/ballot generator
    ├── pages/
    │   ├── admin/          # Admin Dashboard, Live Turnout, results, audit logs
    │   ├── student/        # Voting page, receipt, candidate list, profile settings
    │   ├── LandingPage.tsx # Hero landing page featuring an interactive 3D Logo
    │   └── LoginPage.tsx   # Login page
    ├── App.tsx             # Application routing (Animated routes)
    ├── index.css           # Global custom theme styling and variables
    └── main.tsx            # Application entry point
```

---

## 🔒 Security & Concurrency Ready

The application is engineered to handle extreme traffic on election day without lag or data race conditions:

1. **Race-Condition Immunity**: The database `votes` table utilizes a strict **`UNIQUE` database constraint on `student_id`**. PostgreSQL guarantees that no two votes can ever be inserted for a single student, rendering double-voting impossible.
2. **Caching & DB Shielding**: TanStack React-Query acts as a buffer layer. It caches the candidate list in the client's memory for 5 minutes (`staleTime: 5mins`) and keeps it up-to-date using Supabase Realtime Channels. This keeps database load to a absolute minimum.
3. **Optimized Database Indexes**: Includes precise relational indexes (e.g. `idx_candidates_position_code` and `idx_votes_program_code`) to ensure aggregation charts and searches load instantly at O(1) performance.

---

## 🚀 Local Development Setup

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file in the root directory and add your Supabase project credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### 3. Run the development server
```bash
npm run dev
```

### 4. Build for production
To build optimized bundles ready for deployment:
```bash
npm run build
```

---

## 📋 Production Deployment Guide

1. **Frontend Hosting**: Deploy on **Vercel** for automatic edge CDN caching.
2. **Upgrade Supabase Tier**: Before election day, upgrade your project to **Supabase Pro Tier ($25/mo)** to increase RAM, CPU limits, and accommodate concurrent connections.
3. **Database Connection Pooler**: Ensure your environment variables point to the **PgBouncer Connection Pooler URL** (Port `6543` in Transaction Mode) instead of the direct database port (`5432`).
4. **SQL Migrations**: Ensure all migrations inside the `supabase/` folder are applied to your live Supabase database before opening the polls.
