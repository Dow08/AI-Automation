'use client';

import {
  LayoutDashboard, MessageSquare, History,
  Settings, Zap, ChevronRight, TerminalSquare,
} from 'lucide-react';

type View = 'dashboard' | 'chat' | 'terminal' | 'history' | 'settings';

interface Props {
  activeView: View;
  onChange: (v: View) => void;
}

const NAV_ITEMS: { view: View; icon: React.ElementType; label: string }[] = [
  { view: 'dashboard', icon: LayoutDashboard,  label: 'Dashboard'  },
  { view: 'chat',      icon: MessageSquare,    label: 'Chat'       },
  { view: 'terminal',  icon: TerminalSquare,   label: 'Terminal'   },
  { view: 'history',   icon: History,          label: 'Historique' },
  { view: 'settings',  icon: Settings,         label: 'Paramètres' },
];

export default function Sidebar({ activeView, onChange }: Props) {
  return (
    <aside
      className="flex flex-col h-full py-4 relative z-10"
      style={{
        width:                '56px',
        background:           'rgba(5,5,8,0.70)',
        backdropFilter:       'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight:          '1px solid rgba(255,255,255,0.06)',
        flexShrink:           0,
      }}
    >
      {/* Logo */}
      <div className="flex justify-center mb-6 px-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(94,106,210,0.28) 0%, rgba(124,58,237,0.20) 100%)',
            border:     '1px solid rgba(94,106,210,0.35)',
            boxShadow:  '0 0 14px rgba(94,106,210,0.22)',
          }}
        >
          <Zap className="w-4 h-4" style={{ color: '#8B9CF4' }} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '12px' }} />

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {NAV_ITEMS.map(({ view, icon: Icon, label }) => {
          const isActive = activeView === view;
          return (
            <button
              type="button"
              key={view}
              onClick={() => onChange(view)}
              title={label}
              className="press-effect group relative flex items-center justify-center"
              style={{
                width:        '100%',
                height:       '40px',
                borderRadius: '10px',
                border:       isActive
                  ? '1px solid rgba(94,106,210,0.32)'
                  : '1px solid transparent',
                background:   isActive
                  ? 'linear-gradient(135deg, rgba(94,106,210,0.20) 0%, rgba(124,58,237,0.14) 100%)'
                  : 'transparent',
                boxShadow:    isActive ? '0 0 12px rgba(94,106,210,0.15)' : 'none',
                cursor:       'pointer',
                transition:   'all var(--transition-base)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.border = '1px solid transparent';
                }
              }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: isActive ? '#8B9CF4' : '#3D404D' }}
              />
              <span
                className="absolute left-[calc(100%+10px)] pointer-events-none opacity-0 group-hover:opacity-100 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-semibold z-50"
                style={{
                  background: 'rgba(15,15,26,0.95)',
                  border:     '1px solid rgba(255,255,255,0.10)',
                  color:      '#C8CCE0',
                  fontFamily: 'var(--font-jakarta)',
                  boxShadow:  'var(--shadow-3)',
                  transition: 'opacity var(--transition-fast)',
                }}
              >
                {label}
                <ChevronRight className="inline-block w-3 h-3 ml-1 opacity-40" />
              </span>
            </button>
          );
        })}
      </nav>

      {/* Active indicator bar */}
      <div
        style={{
          position:     'absolute',
          left:         0,
          top:          0,
          bottom:       0,
          width:        '2px',
          background:   'linear-gradient(180deg, transparent 0%, #5E6AD2 40%, #7C3AED 60%, transparent 100%)',
          opacity:      0.6,
          borderRadius: '0 2px 2px 0',
        }}
      />
    </aside>
  );
}
