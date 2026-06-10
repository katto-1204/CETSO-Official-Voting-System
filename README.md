# CETSO Official Voting System 2026

A secure, scalable, and modern web-based election platform developed for the **College of Engineering and Technology Student Organization (CETSO)**. The system streamlines the election process by providing a reliable voting experience for students and a centralized administrative platform for election management and monitoring.

---

## Overview

The CETSO Official Voting System is designed to facilitate transparent, efficient, and secure student elections. The platform supports real-time voter participation tracking, candidate management, vote validation, and receipt generation while maintaining high standards of performance, usability, and data integrity.

---

## Features

### Student Voter Portal

- Secure student authentication using institutional records
- Candidate directory with profiles, platforms, and biographies
- Guided ballot selection and review process
- One-time vote submission with database-level protection
- Digital voting receipt with verification hash
- Receipt download functionality for voter reference

### Administrative Dashboard

- Real-time voter turnout monitoring
- Candidate management (Create, Read, Update, Delete)
- Student masterlist management
- Election audit logs and activity tracking
- Program-based participation analytics
- Ballot verification and election monitoring tools

---

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite

### UI & Styling

- Tailwind CSS
- CSS Variables
- Lucide React

### State Management & Data Fetching

- TanStack React Query

### Backend & Database

- Supabase
- PostgreSQL
- Row-Level Security (RLS)
- Realtime Subscriptions

### Animations

- Framer Motion

### Utilities

- html2canvas

---

## Project Structure

```text
├── artifacts/
├── public/
├── supabase/
└── src/
    ├── components/
    │   ├── brand/
    │   ├── layout/
    │   └── ui/
    ├── lib/
    │   ├── electionData.ts
    │   ├── queries.ts
    │   ├── supabase.ts
    │   └── voteRecords.ts
    ├── pages/
    │   ├── admin/
    │   ├── student/
    │   ├── LandingPage.tsx
    │   └── LoginPage.tsx
    ├── App.tsx
    ├── index.css
    └── main.tsx
```

---

## Security and Reliability

### Vote Integrity

- Database-enforced unique vote validation per student
- Prevention of duplicate ballot submissions
- Transaction-safe vote recording

### Data Protection

- Supabase Authentication
- PostgreSQL Row-Level Security (RLS)
- Controlled administrative access

### Performance Optimization

- Client-side caching using TanStack React Query
- Realtime synchronization through Supabase Channels
- Optimized database indexing for fast queries and reporting

---

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### 3. Run the Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

---

## Deployment

### Recommended Hosting

- Frontend: Vercel
- Backend & Database: Supabase

### Production Checklist

1. Configure production environment variables.
2. Apply all database migrations.
3. Enable Row-Level Security policies.
4. Verify database indexes and constraints.
5. Upgrade the Supabase plan if high election-day traffic is expected.
6. Configure connection pooling for optimal database performance.
7. Conduct end-to-end election testing before deployment.

---

## Objectives

The CETSO Official Voting System aims to:

- Improve election efficiency and transparency
- Eliminate manual vote counting processes
- Ensure secure and fair elections
- Provide real-time election insights
- Enhance the overall voting experience for students

---

## License

This project was developed for the College of Engineering and Technology Student Organization (CETSO) and is intended for institutional election management and academic use.
