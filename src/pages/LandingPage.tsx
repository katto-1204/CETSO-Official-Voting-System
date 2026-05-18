import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'


const ModelViewer = (props: React.HTMLAttributes<HTMLElement> & {
  src?: string
  alt?: string
  'auto-rotate'?: string
  'camera-controls'?: string
  'shadow-intensity'?: string
  'environment-image'?: string
  exposure?: string
  'interaction-prompt'?: string
  'auto-rotate-delay'?: string
  'rotation-per-second'?: string
}) => React.createElement('model-viewer', props)

const PROGRAMS = [
  { code: 'BSIT',  label: 'Information Technology' },
  { code: 'BSCpE', label: 'Computer Engineering' },
  { code: 'BSECE', label: 'Electronics Engineering' },
  { code: 'BLIS',  label: 'Library & Info Science' },
]

const INTER = 'Inter, system-ui, -apple-system, sans-serif'

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden flex flex-col"
      style={{
        backgroundImage: 'url(/cetsobg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        color: '#eaeaf2',
      }}
    >
      {/* ── DARK SCRIM ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(4,2,1,0.75) 0%, rgba(6,3,1,0.60) 45%, rgba(4,2,1,0.85) 100%)',
        }}
      />

      {/* ── AMBIENT GRID ───────────────────────────────────── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,122,24,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,122,24,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)',
        }}
      />

      {/* ── CENTRE GLOW ────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none z-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 'min(700px, 120vw)',
          height: 'min(700px, 120vw)',
          borderRadius: '50%',
          filter: 'blur(140px)',
          opacity: 0.12,
          background: 'radial-gradient(circle, #ff7a18 0%, transparent 70%)',
        }}
      />

      {/* ══════════════════════════════════════════════════════
          HEADER — centered dual logos
      ══════════════════════════════════════════════════════ */}
      <header className="relative z-30 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-center gap-4 sm:gap-6">
        {/* CET Logotype */}
        <img
          src="/Copy of CET Logotype (White).png"
          alt="CET Logotype"
          className="h-16 sm:h-24 lg:h-28 w-auto object-contain drop-shadow-[0_4px_16px_rgba(255,255,255,0.12)]"
        />

        {/* Divider */}
        <span className="h-12 sm:h-16 lg:h-20 w-px bg-white/15 flex-shrink-0" />

        {/* CETSO Media Team Logo */}
        <img
          src="/cetsomediateam.png"
          alt="CETSO Media Team"
          className="h-16 sm:h-24 lg:h-28 w-auto object-contain drop-shadow-[0_4px_16px_rgba(255,255,255,0.12)]"
        />
      </header>

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <main className="relative z-10 flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 flex flex-col items-center justify-center text-center py-6 sm:py-10">

        {/* Institution badge */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 sm:px-5 py-1.5 sm:py-2 mb-6 sm:mb-8"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', fontFamily: INTER }}
        >
          <Zap className="h-3 w-3 flex-shrink-0 text-[#ff7a18]" />
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] sm:tracking-[0.28em] text-white/80">
            College of Engineering and Technology
          </span>
        </motion.div>

        {/* ── HEADLINE + 3D LOGO ──────────────────────────── */}
        <div className="relative w-full max-w-5xl select-none flex flex-col items-center justify-center">

          {/* CETSO */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="uppercase font-black tracking-tighter leading-none text-white z-10"
            style={{
              fontFamily: '"Raider Crusader Straight", "Anton", sans-serif',
              fontSize: 'clamp(64px, 16vw, 240px)',
              letterSpacing: '-0.03em',
              textShadow: '0 8px 30px rgba(0,0,0,0.7), 0 0 80px rgba(255,122,24,0.15)',
            }}
          >
            CETSO
          </motion.h1>

          {/* ELECTIONS */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="uppercase font-black tracking-tighter leading-none text-white mt-1 sm:mt-2 z-10"
            style={{
              fontFamily: '"Raider Crusader Straight", "Anton", sans-serif',
              fontSize: 'clamp(50px, 12.5vw, 192px)',
              letterSpacing: '-0.03em',
              textShadow: '0 8px 30px rgba(0,0,0,0.7), 0 0 80px rgba(255,122,24,0.15)',
            }}
          >
            ELECTIONS
          </motion.h1>

          {/* 3D Model — scales with viewport, stays centred */}
          <div
            className="absolute z-20 pointer-events-auto"
            style={{
              width: 'clamp(180px, 38vw, 360px)',
              height: 'clamp(180px, 38vw, 360px)',
              top: '52%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65 }}
              className="w-full h-full cursor-grab active:cursor-grabbing drop-shadow-[0_20px_50px_rgba(255,122,24,0.35)]"
            >
              <ModelViewer
                src="/CETSO_Elections_2026_3D_Logo.glb"
                alt="CETSO Elections 2026 3D Logo"
                auto-rotate="true"
                camera-controls="true"
                shadow-intensity="2"
                environment-image="neutral"
                exposure="1.4"
                interaction-prompt="none"
                auto-rotate-delay="0"
                rotation-per-second="28deg"
                style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
              />
            </motion.div>
          </div>
        </div>

        {/* Sub-caption */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-8 sm:mt-10 mb-5 sm:mb-7 text-xs sm:text-sm font-medium tracking-wide text-white/50 max-w-xs sm:max-w-md leading-relaxed px-2"
          style={{ fontFamily: INTER }}
        >
          Choose the next student leaders for Academic Year&nbsp;2026–2027
        </motion.p>

        {/* ── PROGRAM CHIPS — single scrollable row ──────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.38 }}
          className="flex flex-nowrap items-center justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 w-full overflow-x-auto px-3 sm:px-4"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {PROGRAMS.map((p, i) => (
            <motion.div
              key={p.code}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.42 + i * 0.07 }}
              className="group flex-shrink-0 flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm cursor-default select-none transition-all duration-300 hover:border-[#ff7a18]/60 hover:bg-[#ff7a18]/[0.08] hover:shadow-[0_0_14px_rgba(255,122,24,0.2)]"
              style={{ fontFamily: INTER }}
            >
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ff7a18] group-hover:scale-125 transition-transform duration-300" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#ff9f43] uppercase tracking-widest whitespace-nowrap">
                {p.code}
              </span>
              <span className="h-3 sm:h-3.5 w-px bg-white/15 flex-shrink-0" />
              {/* Full label hidden on xs, shown sm+ */}
              <span className="hidden sm:inline text-[11px] font-medium text-white/60 tracking-wide whitespace-nowrap">
                {p.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── CTA BUTTON ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="w-full max-w-[18rem] sm:max-w-xs pb-10 sm:pb-14 px-4 sm:px-0"
        >
          <Link to="/login" className="w-full">
            <button
              className="group w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 sm:py-4 text-[12px] sm:text-[13px] font-semibold uppercase tracking-widest border-2 border-transparent transition-all duration-300 hover:brightness-110 hover:shadow-[0_8px_30px_rgba(255,122,24,0.45)] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #ff7a18, #ff9f43)',
                color: '#ffffff',
                fontFamily: INTER,
                letterSpacing: '0.13em',
              }}
            >
              Cast Your Votes
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
