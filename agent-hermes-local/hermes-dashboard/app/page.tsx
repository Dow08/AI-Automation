'use client';

import { useState } from 'react';
import { Zap, Shield, Cpu, Activity } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import AIPanel from '@/components/ai-panel';
import DashboardHome from '@/components/dashboard-widgets';
import ChatPanel from '@/components/chat-panel';
import HistoryPanel from '@/components/history-panel';
import SettingsPanel from '@/components/settings-panel';
import TerminalPanel from '@/components/terminal-panel';
import type { Conversation } from '@/types';

type View = 'dashboard' | 'chat' | 'terminal' | 'history' | 'settings';

export default function Home() {
  const [view, setView]                         = useState<View>('dashboard');
  const [loadedConversation, setLoadedConversation] = useState<Conversation | null>(null);

  function handleLoadConversation(conv: Conversation) {
    setLoadedConversation(conv);
    setView('chat');
  }

  function handleViewChange(v: View) {
    setView(v);
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: '#050508',
        display:    'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Aurora blobs ────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          inset:        0,
          pointerEvents:'none',
          zIndex:       0,
          overflow:     'hidden',
        }}
      >
        {/* Blob 1 — Indigo */}
        <div style={{
          position:    'absolute',
          width:       '50vw',
          height:      '55vh',
          borderRadius:'50%',
          background:  'radial-gradient(circle, rgba(78,70,229,0.16) 0%, transparent 70%)',
          filter:      'blur(90px)',
          top:         '-10%',
          left:        '-5%',
          animation:   'blob-float-a 22s ease-in-out infinite alternate',
        }} />
        {/* Blob 2 — Violet */}
        <div style={{
          position:    'absolute',
          width:       '45vw',
          height:      '50vh',
          borderRadius:'50%',
          background:  'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter:      'blur(100px)',
          bottom:      '-10%',
          right:       '-5%',
          animation:   'blob-float-b 28s ease-in-out infinite alternate',
        }} />
        {/* Blob 3 — Teal */}
        <div style={{
          position:    'absolute',
          width:       '32vw',
          height:      '32vh',
          borderRadius:'50%',
          background:  'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)',
          filter:      'blur(80px)',
          top:         '35%',
          right:       '25%',
          animation:   'blob-float-c 18s ease-in-out infinite alternate',
        }} />
      </div>

      {/* ── Topbar ──────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 relative z-50 flex items-center justify-between px-5"
        style={{
          height:               '52px',
          background:           'rgba(5,5,8,0.85)',
          backdropFilter:       'blur(24px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
          borderBottom:         '1px solid rgba(255,255,255,0.06)',
          boxShadow:            '0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.40)',
        }}
      >
        {/* Left — Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(94,106,210,0.28) 0%, rgba(124,58,237,0.20) 100%)',
              border:     '1px solid rgba(94,106,210,0.38)',
              boxShadow:  '0 0 14px rgba(94,106,210,0.22)',
            }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: '#8B9CF4' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold" style={{ color: '#EDEEF5', fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.03em' }}>
              Jarod Cowork
            </span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
              style={{ color: '#5E6AD2', background: 'rgba(94,106,210,0.12)', border: '1px solid rgba(94,106,210,0.22)', fontFamily: 'var(--font-jakarta)' }}
            >
              AI Dashboard
            </span>
          </div>
        </div>

        {/* Center — Breadcrumb / title */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-[12px] font-semibold capitalize" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>
            {{
              dashboard: "🏠  Vue d'ensemble",
              chat:      '💬  Chat étendu',
              terminal:  '⌨️  Terminal',
              history:   '📚  Historique',
              settings:  '⚙️  Paramètres',
            }[view]}
          </span>
        </div>

        {/* Right — Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.16)' }}>
            <div className="w-1.5 h-1.5 rounded-full status-online" style={{ background: '#10B981' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#34D399', fontFamily: 'var(--font-jakarta)' }}>Actif</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Cpu className="w-3 h-3" style={{ color: '#8B9CF4' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#8B9CF4', fontFamily: 'var(--font-jakarta)' }}>Local</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Shield className="w-3 h-3" style={{ color: '#3D404D' }} />
            <span className="text-[11px] font-medium" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>Docker Isolé</span>
          </div>
        </div>
      </header>

      {/* ── Body: Sidebar + Main + AI Panel ─────────────────────── */}
      <div className="flex flex-1 relative z-10 overflow-hidden">

        {/* Sidebar */}
        <Sidebar activeView={view} onChange={handleViewChange} />

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden p-4">
            {view === 'dashboard' && <DashboardHome />}
            {view === 'chat' && (
              <div className="h-full">
                <ChatPanel initialConversation={loadedConversation} />
              </div>
            )}
            {view === 'terminal' && (
              <div className="h-full">
                <TerminalPanel />
              </div>
            )}
            {view === 'history' && (
              <div className="h-full">
                <HistoryPanel onLoadConversation={handleLoadConversation} />
              </div>
            )}
            {view === 'settings' && (
              <div className="h-full overflow-y-auto pr-2">
                <SettingsPanel />
              </div>
            )}
          </div>
        </main>

        {/* AI Panel (toujours visible) */}
        <AIPanel />
      </div>

      {/* ── Statusbar ───────────────────────────────────────────── */}
      <footer
        className="flex-shrink-0 relative z-50 flex items-center justify-between px-5"
        style={{
          height:     '30px',
          background: 'rgba(5,5,8,0.90)',
          borderTop:  '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Activity className="w-2.5 h-2.5" style={{ color: '#2A2D38' }} />
            <span className="text-[10px] font-mono" style={{ color: '#4B5060', fontFamily: 'var(--font-mono)' }}>
              mistral-small:24b
            </span>
          </div>
          <span className="text-[10px]" style={{ color: '#383B4A', fontFamily: 'var(--font-mono)' }}>latency: 180ms</span>
          <span className="text-[10px]" style={{ color: '#383B4A', fontFamily: 'var(--font-mono)' }}>ctx: 8192</span>
        </div>

        <p className="text-[10px]" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>
          Jarod Cowork · v2 ·{' '}
          <a
            href="https://tryhackme.com/p/seallia81"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4B5060', transition: 'color var(--transition-base)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#8B9CF4')}
            onMouseLeave={e => (e.currentTarget.style.color = '#4B5060')}
          >
            seallia81
          </a>
        </p>
      </footer>
    </div>
  );
}
