'use client';

import { useState, useEffect } from 'react';
import {
  Brain, Mail, TrendingUp, Zap, Calendar,
  HardDrive, ChevronRight, ArrowUpRight,
  Clock, ExternalLink, RefreshCw, Wifi, WifiOff,
  FileText, FileCode, File, Activity, Link2, Settings,
} from 'lucide-react';

/* ── Helpers ───────────────────────────────────────────────────────── */
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60)    return 'à l\'instant';
  if (diff < 3600)  return `il y a ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

function formatEventDate(dateStr: string, allDay: boolean): string {
  const date = new Date(dateStr);
  if (allDay) {
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  return (
    date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' +
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
}

function getCategoryStyle(cat: string) {
  const map: Record<string, { color: string; label: string }> = {
    network:    { color: '#5E6AD2', label: 'Réseau'  },
    jobs:       { color: '#10B981', label: 'Emploi'  },
    finance:    { color: '#F59E0B', label: 'Finance' },
    social:     { color: '#EC4899', label: 'Social'  },
    newsletter: { color: '#8B5CF6', label: 'News'    },
    promo:      { color: '#3D404D', label: 'Promo'   },
  };
  return map[cat] || { color: '#3D404D', label: cat };
}

function getFileIcon(ext: string) {
  if (['docx', 'doc', 'pdf'].includes(ext)) return FileText;
  if (['md', 'txt', 'json'].includes(ext))  return FileCode;
  if (['ps1', 'sh', 'py', 'ts'].includes(ext)) return FileCode;
  return File;
}

function getFileColor(ext: string) {
  if (['docx', 'doc'].includes(ext)) return '#3B82F6';
  if (['pdf'].includes(ext))         return '#EF4444';
  if (['md', 'txt'].includes(ext))   return '#10B981';
  if (['ps1', 'sh'].includes(ext))   return '#8B5CF6';
  return '#5E6AD2';
}

/* ── WidgetCard ────────────────────────────────────────────────────── */
function WidgetCard({
  children, className = '', style = {}, accentColor = '#5E6AD2', delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  accentColor?: string;
  delay?: number;
}) {
  return (
    <div
      className={`card-reveal flex flex-col ${className}`}
      style={{
        background:           'rgba(255,255,255,0.028)',
        backdropFilter:       'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border:               '1px solid rgba(255,255,255,0.07)',
        borderRadius:         '18px',
        boxShadow:            `var(--shadow-2), 0 0 0 1px rgba(${hexToRgb(accentColor)},0.04)`,
        overflow:             'hidden',
        animationDelay:       `${delay}s`,
        transition:           'border-color var(--transition-base), box-shadow var(--transition-base)',
        ...style,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `rgba(${hexToRgb(accentColor)},0.20)`;
        (e.currentTarget as HTMLElement).style.boxShadow = `var(--shadow-3), 0 0 32px rgba(${hexToRgb(accentColor)},0.08)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLElement).style.boxShadow = `var(--shadow-2), 0 0 0 1px rgba(${hexToRgb(accentColor)},0.04)`;
      }}
    >
      <div style={{ height: '2px', background: `linear-gradient(90deg, ${accentColor}60 0%, transparent 100%)` }} />
      <div className="flex flex-col flex-1 p-4">
        {children}
      </div>
    </div>
  );
}

function WidgetHeader({
  icon: Icon, title, subtitle, accentColor, liveTag, onRefresh, loading, stale,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accentColor: string;
  liveTag?: string;
  onRefresh?: () => void;
  loading?: boolean;
  stale?: boolean;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: `rgba(${hexToRgb(accentColor)},0.12)`,
            border:     `1px solid rgba(${hexToRgb(accentColor)},0.22)`,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-bold leading-tight" style={{ color: '#EDEEF5', fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.01em' }}>
              {title}
            </h3>
            {liveTag && (
              stale ? (
                <span
                  className="text-[8px] font-bold px-1 py-0.5 rounded"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.30)', color: '#F59E0B', fontFamily: 'var(--font-jakarta)' }}
                  title="Données en cache - synchronisation automatique toutes les 30 min"
                >
                  STALE
                </span>
              ) : (
                <span
                  className="text-[8px] font-bold px-1 py-0.5 rounded"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontFamily: 'var(--font-jakarta)' }}
                >
                  LIVE
                </span>
              )
            )}
          </div>
          <p className="text-[10px] mt-0.5" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="press-effect w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} style={{ color: '#3D404D' }} />
          </button>
        )}
        <button
          type="button"
          className="press-effect w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ChevronRight className="w-3 h-3" style={{ color: '#3D404D' }} />
        </button>
      </div>
    </div>
  );
}

function SkeletonLine({ w = '100%', h = '10px' }: { w?: string; h?: string }) {
  return (
    <div style={{ width: w, height: h, borderRadius: '4px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
  );
}

/* ── Widget 1 — AI Contextual Brief ────────────────────────────────── */
interface MemStats {
  count: number;
  sizeMB: number;
  percent: number;
  exists: boolean;
}

export function AIBriefWidget() {
  const now      = new Date();
  const hour     = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const [memStats, setMemStats] = useState<MemStats | null>(null);
  const [calEvents, setCalEvents] = useState<{ summary: string; start: string; allDay: boolean }[]>([]);

  useEffect(() => {
    // Real memory disk stats
    fetch('/api/memory/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMemStats(d); })
      .catch(() => {});

    // Pull upcoming events from calendar cache for task list
    fetch('/api/calendar')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.events) setCalEvents(d.events.slice(0, 3)); })
      .catch(() => {});
  }, []);

  const priorityColors = ['#F87171', '#FBD34D', '#34D399'];
  const eventIcons     = ['🎉', '🎓', '📅'];

  return (
    <WidgetCard accentColor="#5E6AD2" delay={0.04}>
      <WidgetHeader icon={Brain} title="AI Contextual Brief" subtitle="Résumé intelligent · JAROD" accentColor="#5E6AD2" />

      <p className="text-[13px] font-semibold mb-3" style={{ color: '#8B9CF4', fontFamily: 'var(--font-jakarta)' }}>
        {greeting}, Dorian —{' '}
        <span style={{ color: '#3D404D', fontWeight: 400 }}>
          {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </p>

      {/* Real memory disk stats */}
      <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#3D404D' }}>
              Mémoire JAROD · Disque
            </span>
            <span className="text-[11px] font-bold" style={{ color: '#8B9CF4' }}>
              {memStats
                ? `${memStats.count} conv · ${memStats.sizeMB} MB`
                : 'E:\\Memoire_IA'}
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width:      `${memStats?.percent ?? 72}%`,
                background: 'linear-gradient(90deg, #5E6AD2, #7C3AED)',
                transition: 'width 1s var(--ease-expo)',
              }}
            />
          </div>
          {memStats && (
            <p className="text-[9px] mt-1" style={{ color: '#2A2D38', fontFamily: 'var(--font-jakarta)' }}>
              {memStats.percent}% utilisé · max 500 MB · E:\Memoire_IA\data
            </p>
          )}
        </div>
      </div>

      {/* Upcoming events from real calendar */}
      <div className="space-y-1.5">
        {calEvents.length > 0 ? (
          calEvents.map((ev, i) => {
            const date = new Date(ev.start);
            const label = ev.allDay
              ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              : date.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            return (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg press-effect" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                <span style={{ fontSize: '11px' }}>{eventIcons[i] || '📅'}</span>
                <span className="flex-1 text-[11px] truncate" style={{ color: '#A0A4B8', fontFamily: 'var(--font-jakarta)' }}>{ev.summary}</span>
                <span className="text-[9px] flex-shrink-0 font-semibold" style={{ color: priorityColors[i] || '#3D404D', fontFamily: 'var(--font-mono)' }}>{label}</span>
              </div>
            );
          })
        ) : (
          // Fallback while loading
          [
            { label: 'Répondre aux mails LinkedIn', icon: '📨', color: '#F87171' },
            { label: 'Baby Shower chez Audrey',     icon: '🎉', color: '#FBD34D' },
            { label: 'Masterclass sur le domaine',  icon: '🎓', color: '#FBD34D' },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '11px' }}>{t.icon}</span>
              <span className="flex-1 text-[11px] truncate" style={{ color: '#4B5060', fontFamily: 'var(--font-jakarta)' }}>{t.label}</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
            </div>
          ))
        )}
      </div>
    </WidgetCard>
  );
}

/* ── Widget 2 — Inbox Gmail ─────────────────────────────────────────── */
interface GmailThread {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  snippet: string;
  date: string;
  category: string;
  read: boolean;
}

export function InboxWidget({ stale }: { stale?: boolean }) {
  const [threads, setThreads]     = useState<GmailThread[]>([]);
  const [loading, setLoading]     = useState(true);
  const [cachedAt, setCachedAt]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch('/api/gmail');
      const data = await res.json();
      setThreads(data.threads || []);
      setCachedAt(data.cachedAt || null);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const unread = threads.filter(t => !t.read).length;

  return (
    <WidgetCard accentColor="#7C3AED" delay={0.08}>
      <WidgetHeader
        icon={Mail}
        title="Inbox Gmail"
        subtitle={cachedAt ? `Sync ${timeAgo(cachedAt)}` : 'Chargement…'}
        accentColor="#7C3AED"
        liveTag="LIVE"
        stale={stale}
        onRefresh={load}
        loading={loading}
      />

      {!loading && unread > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.16)' }}>
          <div className="w-1.5 h-1.5 rounded-full status-online" style={{ background: '#A78BFA' }} />
          <span className="text-[11px] font-semibold" style={{ color: '#A78BFA', fontFamily: 'var(--font-jakarta)' }}>
            {unread} non lu{unread > 1 ? 's' : ''}
          </span>
          <a
            href="https://mail.google.com/mail/u/0/#inbox"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto press-effect"
          >
            <ExternalLink className="w-3 h-3" style={{ color: '#6D5FAD' }} />
          </a>
        </div>
      )}

      <div className="space-y-2 flex-1">
        {loading ? (
          <>
            {[0, 1, 2].map(i => (
              <div key={i} className="p-2.5 rounded-xl space-y-1.5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <SkeletonLine w="60%" h="9px" />
                <SkeletonLine w="90%" h="8px" />
              </div>
            ))}
          </>
        ) : (
          threads.slice(0, 4).map((t) => {
            const cat = getCategoryStyle(t.category);
            return (
              <a
                key={t.id}
                href="https://mail.google.com/mail/u/0/#inbox"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 p-2.5 rounded-xl press-effect"
                style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid rgba(255,255,255,${t.read ? '0.04' : '0.07'})`, textDecoration: 'none', display: 'flex' }}
              >
                <div className="mt-1.5 flex-shrink-0">
                  {!t.read
                    ? <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#A78BFA', boxShadow: '0 0 5px #A78BFA' }} />
                    : <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-semibold truncate" style={{ color: t.read ? '#4B5060' : '#C8CCE0', fontFamily: 'var(--font-jakarta)' }}>
                      {t.sender}
                    </span>
                    <span
                      className="text-[8px] font-bold px-1 py-0.5 rounded flex-shrink-0"
                      style={{ color: cat.color, background: `rgba(${hexToRgb(cat.color)},0.12)`, border: `1px solid rgba(${hexToRgb(cat.color)},0.22)`, fontFamily: 'var(--font-jakarta)' }}
                    >
                      {cat.label}
                    </span>
                    <span className="text-[9px] ml-auto flex-shrink-0" style={{ color: '#2A2D38', fontFamily: 'var(--font-mono)' }}>
                      {timeAgo(t.date)}
                    </span>
                  </div>
                  <p className="text-[11px] truncate" style={{ color: t.read ? '#2A2D38' : '#8B8FA8', fontFamily: 'var(--font-jakarta)' }}>
                    {t.subject}
                  </p>
                </div>
              </a>
            );
          })
        )}
      </div>
    </WidgetCard>
  );
}

/* ── Widget 3 — Productivity Score (real data from E:\Memoire_IA) ───── */
interface ProdStats {
  score: number;
  dailyCounts: number[];
  dayLabels: string[];
  totalMessages: number;
  count: number;
}

export function ProductivityWidget() {
  const [stats, setStats]     = useState<ProdStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/memory/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const score  = stats?.score        ?? 0;
  const days   = stats?.dayLabels    ?? ['L','M','M','J','V','S','D'];
  const values = stats?.dailyCounts  ?? [0,0,0,0,0,0,0];
  const max    = Math.max(...values, 1);

  // Find peak day for insight text
  const peakIdx   = values.indexOf(Math.max(...values));
  const peakNames = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
  const peakDay   = peakNames[peakIdx] ?? 'jeudi';
  const todayIdx  = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <WidgetCard accentColor="#0EA5E9" delay={0.12}>
      <WidgetHeader
        icon={TrendingUp}
        title="Productivity Score"
        subtitle={stats ? `${stats.totalMessages} msgs · ${stats.count} conv` : '14 derniers jours'}
        accentColor="#0EA5E9"
        liveTag="LIVE"
      />

      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${loading ? 2 * Math.PI * 26 : 2 * Math.PI * 26 * (1 - score / 100)}`}
              style={{ transition: 'stroke-dashoffset 1.2s var(--ease-expo)' }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {loading
              ? <span className="text-[11px]" style={{ color: '#3D404D' }}>…</span>
              : <>
                  <span className="text-[15px] font-extrabold leading-none" style={{ color: '#EDEEF5', fontFamily: 'var(--font-jakarta)' }}>{score}</span>
                  <span className="text-[8px] font-semibold" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>/ 100</span>
                </>
            }
          </div>
        </div>
        <div className="flex-1">
          {loading ? (
            <div className="space-y-1.5">
              <SkeletonLine w="80%" h="9px" />
              <SkeletonLine w="100%" h="8px" />
            </div>
          ) : score > 0 ? (
            <>
              <div className="flex items-center gap-1 mb-1">
                <ArrowUpRight className="w-3 h-3" style={{ color: '#34D399' }} />
                <span className="text-[11px] font-semibold" style={{ color: '#34D399', fontFamily: 'var(--font-jakarta)' }}>
                  {stats?.totalMessages ?? 0} messages échangés
                </span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>
                Pic d&apos;activité le {peakDay}. Basé sur E:\Memoire_IA.
              </p>
            </>
          ) : (
            <p className="text-[10px] leading-relaxed" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>
              Aucune activité récente dans E:\Memoire_IA.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-end gap-1 h-10">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-sm"
              style={{
                height:     `${(v / max) * 36}px`,
                background: i === todayIdx
                  ? 'linear-gradient(180deg, #0EA5E9, #34D399)'
                  : i === peakIdx
                    ? 'rgba(14,165,233,0.35)'
                    : 'rgba(255,255,255,0.08)',
                transition: 'height 0.8s var(--ease-expo)',
              }}
            />
            <span className="text-[9px]" style={{
              color:      i === todayIdx ? '#0EA5E9' : i === peakIdx ? '#0EA5E9' : '#2A2D38',
              fontFamily: 'var(--font-jakarta)',
              fontWeight: i === todayIdx || i === peakIdx ? 700 : 400,
            }}>{days[i]}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ── Widget 4 — Resource Allocator (Ollama + Cloud API keys) ────────── */
interface CloudProvider {
  id: string; name: string; icon: string; color: string; hasKey: boolean; keyLabel: string;
}
interface OllamaStatus {
  online: boolean; url: string; runningModels: string[]; availableModels: string[];
}
interface OllamaData {
  cloudProviders: CloudProvider[];
  ollama: OllamaStatus;
}

export function ResourceWidget({ stale }: { stale?: boolean }) {
  const [data, setData]       = useState<OllamaData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/ollama');
      const d   = await res.json();
      setData(d);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <WidgetCard accentColor="#10B981" delay={0.16}>
      <WidgetHeader
        icon={Zap}
        title="Resource Allocator"
        subtitle="Clés API · Modèles IA actifs"
        accentColor="#10B981"
        liveTag="LIVE"
        stale={stale}
        onRefresh={load}
        loading={loading}
      />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="space-y-1.5">
              <SkeletonLine w="70%" h="9px" />
              <SkeletonLine w="100%" h="6px" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="space-y-2.5">
          {/* Ollama row */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.22)' }}
            >
              {data.ollama.online
                ? <Wifi    className="w-3 h-3" style={{ color: '#34D399' }} />
                : <WifiOff className="w-3 h-3" style={{ color: '#F87171' }} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold" style={{ color: '#C8CCE0', fontFamily: 'var(--font-jakarta)' }}>Ollama Local</span>
              <p className="text-[9px]" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>
                {data.ollama.online
                  ? (data.ollama.runningModels.length > 0
                    ? `${data.ollama.runningModels[0].split(':')[0]} actif · ${data.ollama.availableModels.length} dispo`
                    : `${data.ollama.availableModels.length} modèles disponibles`)
                  : 'Hors ligne'}
              </p>
            </div>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{
                color:      data.ollama.online ? '#34D399' : '#F87171',
                background: data.ollama.online ? 'rgba(52,211,153,0.10)' : 'rgba(248,113,113,0.10)',
                border:     `1px solid ${data.ollama.online ? 'rgba(52,211,153,0.22)' : 'rgba(248,113,113,0.22)'}`,
                fontFamily: 'var(--font-jakarta)',
              }}
            >
              {data.ollama.online ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Cloud providers */}
          {data.cloudProviders.map((p) => (
            <div key={p.id} className="flex items-center gap-2.5">
              <span style={{ fontSize: '13px', flexShrink: 0 }}>{p.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold truncate" style={{ color: '#A0A4B8', fontFamily: 'var(--font-jakarta)' }}>{p.name}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 flex-shrink-0"
                    style={{
                      color:      p.hasKey ? '#34D399' : '#F87171',
                      background: p.hasKey ? 'rgba(52,211,153,0.10)' : 'rgba(248,113,113,0.10)',
                      border:     `1px solid ${p.hasKey ? 'rgba(52,211,153,0.22)' : 'rgba(248,113,113,0.22)'}`,
                      fontFamily: 'var(--font-jakarta)',
                    }}
                  >
                    {p.hasKey ? '✓ OK' : '✗ Manquante'}
                  </span>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:      p.hasKey ? '100%' : '0%',
                      background: p.hasKey ? `linear-gradient(90deg, ${p.color}80, ${p.color})` : 'transparent',
                      transition: 'width 1s var(--ease-expo)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px]" style={{ color: '#3D404D' }}>Impossible de charger les ressources.</p>
      )}
    </WidgetCard>
  );
}

/* Widget 5 - Agenda Google Calendar */
interface CalEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
  htmlLink: string;
}

export function AgendaWidget({ stale }: { stale?: boolean }) {
  const [events, setEvents]     = useState<CalEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch('/api/calendar');
      const data = await res.json();
      setEvents(data.events || []);
      setCachedAt(data.cachedAt || null);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <WidgetCard accentColor="#F59E0B" delay={0.20}>
      <WidgetHeader
        icon={Calendar}
        title="Agenda"
        subtitle={cachedAt ? `Google Calendar` : 'Google Calendar'}
        accentColor="#F59E0B"
        liveTag="LIVE"
        stale={stale}
        onRefresh={load}
        loading={loading}
      />
      <div className="space-y-2 flex-1">
        {loading ? (
          <>
            {[0, 1, 2].map(i => (
              <div key={i} className="p-2 rounded-xl space-y-1.5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <SkeletonLine w="50%" h="9px" />
                <SkeletonLine w="80%" h="8px" />
              </div>
            ))}
          </>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <Calendar className="w-6 h-6" style={{ color: '#2A2D38' }} />
            <p className="text-[11px]" style={{ color: '#2A2D38', fontFamily: 'var(--font-jakarta)' }}>Aucun événement</p>
          </div>
        ) : (
          events.map((ev) => (
            <a
              key={ev.id}
              href={ev.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 press-effect p-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', display: 'flex' }}
            >
              <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ background: ev.color, minHeight: '28px' }} />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-semibold truncate block" style={{ color: '#C8CCE0', fontFamily: 'var(--font-jakarta)' }}>
                  {ev.summary}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#F59E0B' }} />
                  <span className="text-[10px]" style={{ color: '#3D404D', fontFamily: 'var(--font-mono)' }}>
                    {formatEventDate(ev.start, ev.allDay)}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: '#2A2D38' }} />
            </a>
          ))
        )}
      </div>
    </WidgetCard>
  );
}

/* Widget 6 - Google Drive */
interface DriveFile {
  id: string;
  title: string;
  mimeType: string;
  fileExtension: string;
  modifiedTime: string;
  folder: string;
  viewUrl: string;
  icon: string;
}

export function DriveWidget({ stale }: { stale?: boolean }) {
  const [files, setFiles]       = useState<DriveFile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch('/api/drive');
      const data = await res.json();
      setFiles(data.files || []);
      setCachedAt(data.cachedAt || null);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <WidgetCard accentColor="#3B82F6" delay={0.24}>
      <WidgetHeader
        icon={HardDrive}
        title="Google Drive"
        subtitle={cachedAt ? `Sync ${timeAgo(cachedAt)}` : 'Fichiers récents'}
        accentColor="#3B82F6"
        liveTag="LIVE"
        stale={stale}
        onRefresh={load}
        loading={loading}
      />
      <a
        href="https://drive.google.com/drive/my-drive"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 press-effect"
        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.16)', textDecoration: 'none' }}
      >
        <HardDrive className="w-3 h-3 flex-shrink-0" style={{ color: '#60A5FA' }} />
        <span className="text-[11px] font-semibold flex-1" style={{ color: '#60A5FA', fontFamily: 'var(--font-jakarta)' }}>
          Ouvrir My Drive
        </span>
        <ExternalLink className="w-3 h-3" style={{ color: '#3B5FAD' }} />
      </a>
      <div className="space-y-2 flex-1">
        {loading ? (
          <>
            {[0, 1, 2].map(i => (
              <div key={i} className="p-2.5 rounded-xl space-y-1.5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <SkeletonLine w="75%" h="9px" />
                <SkeletonLine w="45%" h="8px" />
              </div>
            ))}
          </>
        ) : (
          files.map((f) => {
            const FileIcon  = getFileIcon(f.fileExtension);
            const fileColor = getFileColor(f.fileExtension);
            return (
              <a
                key={f.id}
                href={f.viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl press-effect"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', display: 'flex' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `rgba(${hexToRgb(fileColor)},0.12)`, border: `1px solid rgba(${hexToRgb(fileColor)},0.22)` }}
                >
                  <FileIcon className="w-3.5 h-3.5" style={{ color: fileColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate" style={{ color: '#C8CCE0', fontFamily: 'var(--font-jakarta)' }}>
                    {f.title}
                  </p>
                  <p className="text-[9px]" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>
                    {f.folder} - {timeAgo(f.modifiedTime)}
                  </p>
                </div>
                <span
                  className="text-[8px] font-bold px-1 py-0.5 rounded flex-shrink-0 uppercase"
                  style={{ color: fileColor, background: `rgba(${hexToRgb(fileColor)},0.12)`, border: `1px solid rgba(${hexToRgb(fileColor)},0.22)`, fontFamily: 'var(--font-jakarta)' }}
                >
                  {f.fileExtension}
                </span>
              </a>
            );
          })
        )}
      </div>
    </WidgetCard>
  );
}


/* ── Helpers monitoring ─────────────────────────────────────────────── */
function formatSpeed(b: number): string {
  if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB/s`;
  if (b >= 1024)    return `${(b / 1024).toFixed(0)} KB/s`;
  return `${b} B/s`;
}

function formatGB(bytes: number): string {
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

function loadColor(pct: number): string {
  if (pct >= 80) return '#F87171';
  if (pct >= 60) return '#FBD34D';
  return '#34D399';
}

function MetricBar({
  label, value, pct, color, sub,
}: {
  label: string; value: string; pct: number; color: string; sub?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>
          {label}
        </span>
        <span className="text-[11px] font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width:      `${Math.min(pct, 100)}%`,
            background: `linear-gradient(90deg, ${color}70, ${color})`,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
      {sub && (
        <p className="text-[9px] mt-0.5" style={{ color: '#2A2D38', fontFamily: 'var(--font-jakarta)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Widget 7 — System Monitor ─────────────────────────────────────── */
interface SysStats {
  cpu: { load: number };
  ram: { used: number; total: number; percent: number };
  gpu: { name: string; utilizationGpu: number | null; memUsed: number | null; memTotal: number | null } | null;
  network: { rx_sec: number; tx_sec: number };
}

export function SystemMonitorWidget() {
  const [stats, setStats]     = useState<SysStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      const res = await fetch('/api/system/stats');
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 3000);
    return () => clearInterval(id);
  }, []);

  const cpuPct = stats?.cpu.load        ?? 0;
  const ramPct = stats?.ram.percent     ?? 0;
  const gpuPct = stats?.gpu?.utilizationGpu ?? null;
  const rx     = stats?.network.rx_sec  ?? 0;
  const tx     = stats?.network.tx_sec  ?? 0;

  return (
    <WidgetCard accentColor="#0EA5E9" delay={0.28}>
      <WidgetHeader
        icon={Activity}
        title="Monitoring Systeme"
        subtitle="Temps reel 3s"
        accentColor="#0EA5E9"
        liveTag="LIVE"
        stale={false}
      />

      {loading ? (
        <div className="space-y-3">
          {[0,1,2,3].map(i => (
            <div key={i} className="space-y-1">
              <SkeletonLine w="55%" h="9px" />
              <SkeletonLine w="100%" h="6px" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <MetricBar
            label="CPU"
            value={`${cpuPct}%`}
            pct={cpuPct}
            color={loadColor(cpuPct)}
          />
          <MetricBar
            label="RAM"
            value={`${formatGB(stats?.ram.used ?? 0)} / ${formatGB(stats?.ram.total ?? 0)}`}
            pct={ramPct}
            color={loadColor(ramPct)}
            sub={`${ramPct}% utilise`}
          />
          {gpuPct !== null ? (
            <MetricBar
              label={`GPU ${stats?.gpu?.name?.split(' ').slice(-2).join(' ') ?? ''}`}
              value={`${gpuPct}%`}
              pct={gpuPct}
              color={loadColor(gpuPct)}
              sub={
                stats?.gpu?.memUsed != null && stats?.gpu?.memTotal != null
                  ? `VRAM ${stats.gpu.memUsed} MB / ${stats.gpu.memTotal} MB`
                  : undefined
              }
            />
          ) : (
            <div className="py-1">
              <span className="text-[10px]" style={{ color: '#2A2D38', fontFamily: 'var(--font-jakarta)' }}>
                GPU - donnees non disponibles
              </span>
            </div>
          )}

          {/* Reseau */}
          <div
            className="flex items-center gap-3 pt-2 mt-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex-1 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#34D399' }} />
              <div>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>Upload</p>
                <p className="text-[12px] font-bold" style={{ color: '#34D399', fontFamily: 'var(--font-mono)' }}>{formatSpeed(tx)}</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0 rotate-180" style={{ color: '#60A5FA' }} />
              <div>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>Download</p>
                <p className="text-[12px] font-bold" style={{ color: '#60A5FA', fontFamily: 'var(--font-mono)' }}>{formatSpeed(rx)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

/* ── Widget 8 — Connecteurs Hermes ─────────────────────────────────── */
interface ConnDef {
  id: string; name: string; emoji: string; color: string;
  endpoint: string;
  configUrl: string;   // '__refresh__' = action interne, URL = lien externe, '' = info seule
  envKey?: string;
  hint: string;
}

const CONN_DEFS: ConnDef[] = [
  {
    id: 'gmail', name: 'Gmail', emoji: 'EMAIL', color: '#EA4335',
    endpoint: 'OAuth Cowork',
    configUrl: '__refresh__',
    hint: 'Cache expire — cliquez pour relancer la synchronisation Cowork',
  },
  {
    id: 'calendar', name: 'Google Calendar', emoji: 'CAL', color: '#4285F4',
    endpoint: 'OAuth Cowork',
    configUrl: '__refresh__',
    hint: 'Cache expire — cliquez pour relancer la synchronisation Cowork',
  },
  {
    id: 'drive', name: 'Google Drive', emoji: 'DRV', color: '#34A853',
    endpoint: 'OAuth Cowork',
    configUrl: '__refresh__',
    hint: 'Cache expire — cliquez pour relancer la synchronisation Cowork',
  },
  {
    id: 'ollama', name: 'Ollama Local', emoji: 'LLM', color: '#10B981',
    endpoint: 'localhost:11434',
    configUrl: 'https://ollama.ai/download',
    hint: 'Ollama hors ligne — cliquez pour telecharger et installer Ollama',
  },
  {
    id: 'anthropic', name: 'Anthropic', emoji: 'AI', color: '#D97757',
    endpoint: 'api.anthropic.com',
    configUrl: 'https://console.anthropic.com/settings/keys',
    envKey: 'ANTHROPIC_API_KEY',
    hint: 'Cle manquante — obtenez-la sur console.anthropic.com puis ajoutez ANTHROPIC_API_KEY dans E:\\Hermes\\.env',
  },
  {
    id: 'openai', name: 'OpenAI GPT', emoji: 'AI', color: '#10B981',
    endpoint: 'api.openai.com',
    configUrl: 'https://platform.openai.com/api-keys',
    envKey: 'OPENAI_API_KEY',
    hint: 'Cle manquante — obtenez-la sur platform.openai.com puis ajoutez OPENAI_API_KEY dans E:\\Hermes\\.env',
  },
  {
    id: 'google', name: 'Google Gemini', emoji: 'GEM', color: '#3B82F6',
    endpoint: 'generativelanguage.googleapis.com',
    configUrl: 'https://aistudio.google.com/app/apikey',
    envKey: 'GEMINI_API_KEY',
    hint: 'Cle manquante — obtenez-la sur aistudio.google.com puis ajoutez GEMINI_API_KEY dans E:\\Hermes\\.env',
  },
  {
    id: 'discord', name: 'Discord Webhook', emoji: 'DSC', color: '#5865F2',
    endpoint: 'discord.com/api/webhooks',
    configUrl: 'https://discord.com/developers/applications',
    envKey: 'DISCORD_WEBHOOK_URL',
    hint: 'Webhook manquant — creez-le sur discord.com/developers puis ajoutez DISCORD_WEBHOOK_URL dans E:\\Hermes\\.env',
  },
];

const CONN_ICON: Record<string, string> = {
  EMAIL: '\u{1F4E7}', CAL: '\u{1F4C5}', DRV: '\u{1F4BE}',
  LLM: '\u{1F999}', AI: '\u{1F916}', GEM: '✨', DSC: '\u{1F4AC}',
};

type ConnStatus = 'connected' | 'stale' | 'missing';

const STATUS_STYLE: Record<ConnStatus, { color: string; bg: string; label: string }> = {
  connected: { color: '#34D399', bg: 'rgba(52,211,153,0.12)',  label: 'Actif'    },
  stale:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  label: 'Expire'   },
  missing:   { color: '#F87171', bg: 'rgba(248,113,113,0.12)', label: 'Manquant' },
};

export function ConnectorsWidget() {
  const [status, setStatus]       = useState<Record<string, ConnStatus>>({});
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  function loadStatus() {
    return Promise.all([
      fetch('/api/refresh').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/ollama').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([refresh, ollama]) => {
      const s: Record<string, ConnStatus> = {};
      for (const id of ['gmail', 'calendar', 'drive']) {
        const info = refresh?.[id];
        if (!info?.exists)    s[id] = 'missing';
        else if (info?.stale) s[id] = 'stale';
        else                  s[id] = 'connected';
      }
      s['ollama'] = ollama?.ollama?.online ? 'connected' : 'missing';
      for (const p of (ollama?.cloudProviders ?? [])) {
        s[p.id] = p.hasKey ? 'connected' : 'missing';
      }
      setStatus(s);
    });
  }

  useEffect(() => {
    loadStatus().finally(() => setLoading(false));
  }, []);

  async function handleRefresh(id: string) {
    setRefreshing(id);
    try {
      await fetch('/api/refresh');
      await loadStatus();
    } finally {
      setRefreshing(null);
    }
  }

  const connected = Object.values(status).filter(v => v === 'connected').length;
  const total     = CONN_DEFS.length;

  return (
    <WidgetCard accentColor="#8B5CF6" delay={0.32}>
      <WidgetHeader
        icon={Link2}
        title="Connecteurs Hermes"
        subtitle={loading ? 'Verification...' : `${connected} / ${total} actifs`}
        accentColor="#8B5CF6"
        liveTag="LIVE"
        stale={false}
      />

      {loading ? (
        <div className="space-y-2">
          {[0,1,2,3,4].map(i => <SkeletonLine key={i} w="100%" h="24px" />)}
        </div>
      ) : (
        <div className="space-y-1.5">
          {CONN_DEFS.map((c) => {
            const st  = status[c.id] ?? 'missing';
            const sty = STATUS_STYLE[st];
            const isRefreshing = refreshing === c.id;

            return (
              <div
                key={c.id}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border:     `1px solid rgba(255,255,255,${st === 'connected' ? '0.05' : '0.08'})`,
                }}
              >
                <span className="text-[12px] flex-shrink-0">{CONN_ICON[c.emoji] ?? '\u{1F50C}'}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-semibold truncate" style={{ color: '#C8CCE0', fontFamily: 'var(--font-jakarta)' }}>
                      {c.name}
                    </span>
                    <span
                      className="text-[8px] font-bold px-1 py-0.5 rounded flex-shrink-0"
                      style={{ color: sty.color, background: sty.bg, border: `1px solid ${sty.color}40`, fontFamily: 'var(--font-jakarta)' }}
                    >
                      {sty.label}
                    </span>
                  </div>
                  <p className="text-[9px] truncate" style={{ color: '#2A2D38', fontFamily: 'var(--font-mono)' }}>
                    {c.endpoint}{c.envKey ? ` · ${c.envKey}` : ''}
                  </p>
                </div>

                {/* Bouton action selon statut */}
                {st === 'connected' ? (
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(52,211,153,0.08)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34D399', boxShadow: '0 0 5px #34D399' }} />
                  </div>
                ) : c.configUrl === '__refresh__' ? (
                  /* Google services expires : bouton refresh cache */
                  <button
                    type="button"
                    onClick={() => handleRefresh(c.id)}
                    title={c.hint}
                    className="press-effect w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `rgba(${hexToRgb(c.color)},0.12)`, border: `1px solid rgba(${hexToRgb(c.color)},0.22)` }}
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`}
                      style={{ color: c.color }}
                    />
                  </button>
                ) : (
                  /* API keys / Ollama : lien vers la page de configuration */
                  <a
                    href={c.configUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={c.hint}
                    className="press-effect w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `rgba(${hexToRgb(c.color)},0.12)`, border: `1px solid rgba(${hexToRgb(c.color)},0.22)` }}
                  >
                    <ExternalLink className="w-3 h-3" style={{ color: c.color }} />
                  </a>
                )}
              </div>
            );
          })}

          <p className="text-[9px] text-center pt-1.5" style={{ color: '#2A2D38', fontFamily: 'var(--font-jakarta)' }}>
            Cles API : E:\Hermes\.env
          </p>
        </div>
      )}
    </WidgetCard>
  );
}

/* Dashboard Home Grid */
interface StaleMap {
  gmail:    boolean;
  calendar: boolean;
  drive:    boolean;
}

export default function DashboardHome() {
  const [staleMap, setStaleMap] = useState<StaleMap>({ gmail: false, calendar: false, drive: false });

  useEffect(() => {
    fetch('/api/refresh')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setStaleMap({
          gmail:    d.gmail?.stale    ?? false,
          calendar: d.calendar?.stale ?? false,
          drive:    d.drive?.stale    ?? false,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="h-full overflow-y-auto px-1 py-1 pr-2">
      <div className="mb-5 card-reveal">
        <h2 className="text-lg font-extrabold tracking-tight" style={{ color: '#EDEEF5', fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.03em' }}>
          Tableau de bord <span style={{ color: '#5E6AD2' }}>IA</span>
        </h2>
        <p className="text-[12px] mt-0.5" style={{ color: '#3D404D', fontFamily: 'var(--font-jakarta)' }}>
          Jarod Cowork - Intelligence active - {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <AIBriefWidget />
        <InboxWidget stale={staleMap.gmail} />
      </div>
      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <ProductivityWidget />
        <ResourceWidget stale={false} />
        <AgendaWidget stale={staleMap.calendar} />
      </div>
      <div className="grid gap-3 mb-3">
        <DriveWidget stale={staleMap.drive} />
      </div>
      <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <SystemMonitorWidget />
        <ConnectorsWidget />
      </div>
    </div>
  );
}
