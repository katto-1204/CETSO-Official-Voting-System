import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock, ChevronRight } from 'lucide-react'
import Footer from '../components/layout/Footer'

function formatCountdown(ms: number) {
  const clamped = Math.max(0, ms)
  const s = Math.floor(clamped / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

const MARQUEE_ITEMS = [
  'LEADERSHIP', 'TECHNOLOGY', 'FAITH AND SERVICE',
  'BRIDGING FAITH AND INNOVATION',
  'COMPUTER ENGINEERING TECHNOLOGY STUDENT ORGANIZATION',
  'CETSO', 'INNOVATION', 'LEADERSHIP', 'TECHNOLOGY',
  'FAITH AND SERVICE', 'BRIDGING FAITH AND INNOVATION',
  'COMPUTER ENGINEERING TECHNOLOGY STUDENT ORGANIZATION',
  'CETSO', 'INNOVATION',
]

const TABS = ['Faith', 'Code', 'Action'] as const
type Tab = typeof TABS[number]

const TAB_CONTENT: Record<Tab, { headline: string[]; sub: string }> = {
  Faith: {
    headline: ['GUIDED BY', 'PURPOSE.'],
    sub: 'Rooted in values and service to the CET community.',
  },
  Code: {
    headline: ['BUILT WITH', 'TECH.'],
    sub: 'Leveraging technology for transparent and secure elections.',
  },
  Action: {
    headline: ['DRIVEN TO', 'LEAD.'],
    sub: 'Bold decisions, real results, and accountable governance.',
  },
}

export default function LandingPage() {
  const [now, setNow] = useState(() => Date.now())
  const [activeTab, setActiveTab] = useState<Tab>('Faith')

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const opensAt = useMemo(() => Date.now() + 1000 * 60 * 60 * 24 * 3, [])
  const { days, hours, minutes, seconds } = formatCountdown(opensAt - now)

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: '#0d0800', color: 'rgba(234,234,242,0.94)' }}
    >
      {/* Ambient radial glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 900px 600px at 0% 0%, rgba(180,60,0,0.35), transparent 60%),
            radial-gradient(ellipse 700px 500px at 100% 30%, rgba(140,45,0,0.22), transparent 60%),
            radial-gradient(ellipse 600px 400px at 50% 100%, rgba(100,30,0,0.15), transparent 55%)
          `,
        }}
      />

      {/* Ghost "C" watermark */}
      <div
        className="pointer-events-none fixed right-[-8vw] top-[10vh] z-0 select-none"
        style={{
          fontFamily: 'var(--font-h1)',
          fontSize: 'clamp(260px, 35vw, 520px)',
          color: 'rgba(255,122,24,0.05)',
          lineHeight: 1,
          userSelect: 'none',
        }}
        aria-hidden
      >
        C
      </div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-4 pt-10 sm:px-10 sm:pt-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">

          {/* Left column */}
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5"
              style={{
                borderColor: 'rgba(255,122,24,0.35)',
                background: 'rgba(255,122,24,0.08)',
              }}
            >
              <div
                className="grid h-5 w-5 place-items-center rounded-md text-[10px] font-black"
                style={{ background: 'rgba(255,122,24,0.85)', color: 'white' }}
              >
                C
              </div>
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,178,74,0.90)', fontFamily: 'var(--font-h2)' }}
              >
                Official Student Organization
              </span>
            </motion.div>

            {/* H1 – Raider Crusader */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              style={{
                fontFamily: 'var(--font-h1)',
                fontSize: 'clamp(88px, 14vw, 160px)',
                lineHeight: 0.92,
                letterSpacing: '0.01em',
                color: 'white',
                marginTop: '16px',
              }}
            >
              CETSO
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="mt-4 max-w-sm text-sm font-medium leading-relaxed"
              style={{ color: 'rgba(234,234,242,0.60)', fontFamily: 'var(--font-h2)' }}
            >
              Empowering students through technology, innovation, and service.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.40, delay: 0.26 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <Link to="/login">
                <button
                  className="group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-widest transition hover:brightness-110 active:scale-95"
                  style={{
                    background: 'var(--cetso-orange)',
                    color: 'white',
                    fontFamily: 'var(--font-h2)',
                    boxShadow: '0 0 30px rgba(255,122,24,0.35)',
                  }}
                >
                  Explore CETSO
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link to="/register">
                <button
                  className="rounded-full border px-6 py-3 text-sm font-bold uppercase tracking-widest transition hover:border-white hover:text-white"
                  style={{
                    borderColor: 'rgba(255,255,255,0.22)',
                    color: 'rgba(234,234,242,0.75)',
                    fontFamily: 'var(--font-h2)',
                  }}
                >
                  Register Now
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right column – feature card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="w-full lg:max-w-[380px] shrink-0"
          >
            <div
              className="relative overflow-hidden rounded-[28px] p-6"
              style={{
                background: 'rgba(30,14,2,0.88)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* Card label */}
              <div className="flex items-center justify-between mb-5">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(234,234,242,0.45)', fontFamily: 'var(--font-h2)' }}
                >
                  Student Tech
                </span>
                <div
                  className="h-1 w-10 rounded-full"
                  style={{ background: 'var(--cetso-orange)', boxShadow: '0 0 10px rgba(255,122,24,0.50)' }}
                />
              </div>

              {/* Animated H2 headline */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28 }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-h2)',
                      fontSize: 'clamp(32px, 5vw, 42px)',
                      fontWeight: 700,
                      lineHeight: 1.10,
                      color: 'white',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {TAB_CONTENT[activeTab].headline.map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </h2>
                  <p
                    className="mt-3 text-sm font-medium leading-relaxed"
                    style={{ color: 'rgba(234,234,242,0.55)', fontFamily: 'var(--font-h2)' }}
                  >
                    {TAB_CONTENT[activeTab].sub}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Countdown */}
              <div
                className="mt-6 rounded-2xl p-4"
                style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="h-3.5 w-3.5" style={{ color: 'var(--cetso-orange)' }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'rgba(255,178,74,0.80)', fontFamily: 'var(--font-h2)' }}
                  >
                    Voting Opens In
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { v: days, l: 'D' },
                    { v: hours, l: 'H' },
                    { v: minutes, l: 'M' },
                    { v: seconds, l: 'S' },
                  ].map(({ v, l }, i) => (
                    <div key={l} className="flex items-center gap-2">
                      <div
                        className="flex flex-col items-center rounded-xl px-2.5 py-2"
                        style={{ background: 'rgba(255,255,255,0.06)', minWidth: 42 }}
                      >
                        <span className="text-xl font-black text-white tabular-nums leading-none">
                          {String(v).padStart(2, '0')}
                        </span>
                        <span
                          className="mt-1 text-[9px] font-bold uppercase tracking-widest"
                          style={{ color: 'rgba(234,234,242,0.42)', fontFamily: 'var(--font-h2)' }}
                        >
                          {l}
                        </span>
                      </div>
                      {i < 3 && (
                        <span className="text-lg font-black" style={{ color: 'rgba(255,255,255,0.25)' }}>:</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-5 flex items-center gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest transition"
                    style={{
                      fontFamily: 'var(--font-h2)',
                      background: activeTab === tab
                        ? 'rgba(255,122,24,0.16)'
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${activeTab === tab ? 'rgba(255,122,24,0.40)' : 'rgba(255,255,255,0.08)'}`,
                      color: activeTab === tab ? 'rgba(255,178,74,0.95)' : 'rgba(234,234,242,0.45)',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Vote CTA */}
              <Link to="/login" className="mt-5 block">
                <button
                  className="group w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold uppercase tracking-wider transition hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,122,24,0.90), rgba(255,178,74,0.80))',
                    color: 'white',
                    fontFamily: 'var(--font-h2)',
                    boxShadow: '0 0 24px rgba(255,122,24,0.30)',
                  }}
                >
                  Login to Vote
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ── MARQUEE ──────────────────────────────────────── */}
      <div
        className="relative z-10 mt-10 overflow-hidden border-y py-3"
        style={{
          borderColor: 'rgba(255,122,24,0.20)',
          background: 'rgba(255,122,24,0.05)',
        }}
      >
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-4 px-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap"
              style={{ color: 'rgba(255,178,74,0.65)', fontFamily: 'var(--font-h2)' }}
            >
              {item}
              <span style={{ color: 'rgba(255,122,24,0.55)', fontSize: 10 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── SECTIONS ─────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* About CETSO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-2"
          >
            <div
              className="relative overflow-hidden rounded-[28px] p-7 h-full"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 500px 280px at 0% 0%, rgba(255,122,24,0.12), transparent 60%)' }}
              />
              <div className="relative">
                <div
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(234,234,242,0.42)', fontFamily: 'var(--font-h2)' }}
                >
                  About
                </div>
                <h2
                  className="mt-2"
                  style={{
                    fontFamily: 'var(--font-h2)',
                    fontSize: 'clamp(22px, 3vw, 30px)',
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Bridging Faith & Innovation
                </h2>
                <p
                  className="mt-3 max-w-md text-sm font-medium leading-relaxed"
                  style={{ color: 'rgba(234,234,242,0.55)', fontFamily: 'var(--font-h2)' }}
                >
                  CETSO is the official student organization of the College of Engineering and Technology. We unite students across BSIT, BLIS, BSCpE, and BSECE through leadership, technology, and service.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    { num: '4', label: 'Programs' },
                    { num: '100%', label: 'CET-Verified' },
                    { num: '2026', label: 'Elections' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl p-4"
                      style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-h1)',
                          fontSize: 28,
                          color: 'white',
                          lineHeight: 1,
                        }}
                      >
                        {stat.num}
                      </div>
                      <div
                        className="mt-1.5 text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: 'rgba(255,178,74,0.70)', fontFamily: 'var(--font-h2)' }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Election rule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <div
              className="relative overflow-hidden rounded-[28px] p-7 h-full"
              style={{
                background: 'rgba(255,122,24,0.06)',
                border: '1px solid rgba(255,122,24,0.22)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,178,74,0.65)', fontFamily: 'var(--font-h2)' }}
              >
                Voting Rule
              </div>
              <h2
                className="mt-2"
                style={{
                  fontFamily: 'var(--font-h2)',
                  fontSize: 'clamp(20px, 2.5vw, 26px)',
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.2,
                }}
              >
                25% per program weighting
              </h2>
              <p
                className="mt-3 text-sm font-medium leading-relaxed"
                style={{ color: 'rgba(234,234,242,0.55)', fontFamily: 'var(--font-h2)' }}
              >
                Results are weighted equally across BSIT, BLIS, BSCpE, and BSECE. Your vote matters, regardless of program size.
              </p>
              <div className="mt-6 space-y-2.5">
                {['BSIT', 'BLIS', 'BSCpE', 'BSECE'].map((prog, i) => (
                  <div key={prog} className="flex items-center gap-3">
                    <div
                      className="text-xs font-bold w-16 shrink-0"
                      style={{ color: 'rgba(255,178,74,0.80)', fontFamily: 'var(--font-h2)' }}
                    >
                      {prog}
                    </div>
                    <div
                      className="h-1.5 flex-1 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #ff7a18, #ffb24a)' }}
                        initial={{ width: '0%' }}
                        whileInView={{ width: '25%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                    <div
                      className="text-xs font-bold shrink-0"
                      style={{ color: 'rgba(255,178,74,0.70)', fontFamily: 'var(--font-h2)' }}
                    >
                      25%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* How it works */}
        <div className="mt-6">
          <div
            className="text-[10px] font-bold uppercase tracking-widest mb-4"
            style={{ color: 'rgba(234,234,242,0.38)', fontFamily: 'var(--font-h2)' }}
          >
            How It Works
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { n: '01', title: 'Register', desc: 'Create your voter profile with your CET student ID.', color: 'rgba(255,122,24,0.90)' },
              { n: '02', title: 'Vote', desc: 'One guided ballot per position. Secure and private.', color: 'rgba(255,178,74,0.85)' },
              { n: '03', title: 'Verify', desc: 'Download your official PDF receipt with a QR code.', color: 'rgba(255,122,24,0.70)' },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.40, delay: i * 0.08 }}
                className="relative overflow-hidden rounded-[24px] p-6"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-h1)',
                    fontSize: 56,
                    color: step.color,
                    lineHeight: 1,
                    opacity: 0.15,
                    position: 'absolute',
                    right: 16,
                    top: 12,
                  }}
                >
                  {step.n}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-h1)',
                    fontSize: 22,
                    color: step.color,
                    lineHeight: 1,
                    letterSpacing: '0.01em',
                  }}
                >
                  {step.n}
                </div>
                <h2
                  className="mt-2"
                  style={{
                    fontFamily: 'var(--font-h2)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {step.title}
                </h2>
                <p
                  className="mt-2 text-sm font-medium leading-relaxed"
                  style={{ color: 'rgba(234,234,242,0.55)', fontFamily: 'var(--font-h2)' }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer variant="full" />
    </div>
  )
}
