'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { TerminalSquare, Trash2, ChevronRight, HelpCircle, X } from 'lucide-react';

interface TerminalLine {
  id:      string;
  type:    'input' | 'output' | 'error' | 'info';
  content: string;
}

const DEFAULT_CWD = '/mnt/e/Hermes/hermes-dashboard';

const WELCOME: TerminalLine[] = [
  { id: 'w1', type: 'info', content: '┌──────────────────────────────────────────┐' },
  { id: 'w2', type: 'info', content: '│  Jarod Terminal  ·  WSL2 → Windows       │' },
  { id: 'w3', type: 'info', content: '│  Shell actif ✓  ·  /mnt/e/ monté         │' },
  { id: 'w4', type: 'info', content: '└──────────────────────────────────────────┘' },
  { id: 'w5', type: 'info', content: "Commande shell ou '?' pour l'aide Hermes." },
  { id: 'w6', type: 'info', content: '' },
];

const CHEAT_SECTIONS = [
  {
    title: '🖥️ Système',
    color: '#7C9CF4',
    cmds: [
      { cmd: 'ls',       desc: 'Lister les fichiers'    },
      { cmd: 'pwd',      desc: 'Répertoire courant'     },
      { cmd: 'df -h',    desc: 'Espace disque'          },
      { cmd: 'free -h',  desc: 'RAM disponible'         },
      { cmd: 'top',      desc: 'Processus en temps réel'},
      { cmd: 'htop',     desc: 'Moniteur interactif'    },
      { cmd: 'uname -a', desc: 'Infos WSL2 / kernel'   },
      { cmd: 'uptime',   desc: 'Temps de fonctionnement'},
    ],
  },
  {
    title: '⚙️ Processus',
    color: '#F4A27C',
    cmds: [
      { cmd: 'ps aux',          desc: 'Tous les processus'   },
      { cmd: 'kill <PID>',      desc: 'Tuer un PID'          },
      { cmd: 'pkill <nom>',     desc: 'Tuer par nom'         },
      { cmd: 'jobs',            desc: 'Tâches en arrière-plan'},
    ],
  },
  {
    title: '🌐 Réseau',
    color: '#7CF4C2',
    cmds: [
      { cmd: 'ip a',              desc: 'Interfaces réseau'  },
      { cmd: 'curl <url>',        desc: 'Requête HTTP'       },
      { cmd: 'ping <host>',       desc: 'Ping un hôte'      },
      { cmd: 'netstat -tlnp',     desc: 'Ports en écoute'   },
      { cmd: 'ss -tlnp',          desc: 'Sockets TCP'       },
    ],
  },
  {
    title: '📂 Fichiers',
    color: '#F4E27C',
    cmds: [
      { cmd: 'cat <fichier>',                desc: 'Afficher un fichier'    },
      { cmd: 'tail -f <fichier>',            desc: 'Suivre en temps réel'  },
      { cmd: 'grep <pattern> <fichier>',     desc: 'Chercher dans fichier' },
      { cmd: 'find . -name <fichier>',       desc: 'Trouver un fichier'    },
      { cmd: 'chmod +x <fichier>',           desc: 'Rendre exécutable'     },
    ],
  },
  {
    title: '📁 Hermès / Config',
    color: '#C27CF4',
    cmds: [
      { cmd: 'cd /mnt/e/Hermes/hermes-dashboard', desc: 'Aller dans Hermès' },
      { cmd: 'npm run dev',                        desc: 'Démarrer le dashboard' },
      { cmd: 'npm run build',                      desc: 'Builder le dashboard'  },
      { cmd: 'git status',                         desc: 'État du repo git'       },
      { cmd: 'git log --oneline -10',              desc: '10 derniers commits'    },
      { cmd: 'pm2 status',                         desc: 'État des process PM2'   },
      { cmd: 'pm2 restart hermes-dashboard',       desc: 'Redémarrer Hermès'      },
    ],
  },
  {
    title: '🦙 Ollama',
    color: '#F47C7C',
    cmds: [
      { cmd: 'ollama list',            desc: 'Modèles installés'         },
      { cmd: 'ollama run mistral',     desc: 'Lancer Mistral interactif' },
      { cmd: 'ollama ps',              desc: "Modèles en cours d'exéc."  },
      { cmd: 'ollama pull <modèle>',   desc: 'Télécharger un modèle'     },
      { cmd: 'systemctl status ollama',desc: 'État du service Ollama'    },
    ],
  },
  {
    title: '🔧 Diagnostic',
    color: '#7CF4F4',
    cmds: [
      { cmd: 'journalctl -u ollama -n 50',             desc: 'Logs Ollama (50 lignes)'  },
      { cmd: 'curl http://localhost:11434/api/tags',   desc: 'API Ollama locale'        },
      { cmd: 'node -v',                                desc: 'Version Node.js'          },
      { cmd: 'npm -v',                                 desc: 'Version npm'              },
    ],
  },
];

/** Shorten a path for display in the prompt. */
function shortenPath(p: string): string {
  if (p === DEFAULT_CWD) return '~/hermes-dashboard';
  if (p.startsWith('/mnt/e/Hermes/')) return '~/' + p.slice('/mnt/e/Hermes/'.length);
  if (p.startsWith('/mnt/e/')) return 'E:/' + p.slice('/mnt/e/'.length);
  return p;
}

export default function TerminalPanel() {
  const [lines,    setLines]    = useState<TerminalLine[]>(WELCOME);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [history,  setHistory]  = useState<string[]>([]);
  const [histIdx,  setHistIdx]  = useState(-1);
  const [showHelp, setShowHelp] = useState(false);
  const [cwd,      setCwd]      = useState<string>(DEFAULT_CWD);
  const inputRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    setLines(prev => [...prev, { id: crypto.randomUUID(), type, content }]);
  }, []);

  async function runCommand(cmd: string) {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    if (trimmed === '?') {
      setShowHelp(true);
      setInput('');
      return;
    }

    addLine('input', `${shortenPath(cwd)} $ ${cmd}`);
    setHistory(prev => [cmd, ...prev.slice(0, 49)]);
    setHistIdx(-1);
    setInput('');
    setLoading(true);

    // ── Handle `cd` specially to track directory state ───────────────────
    const cdMatch = trimmed.match(/^cd\s*(.*)?$/);
    if (cdMatch) {
      const target = (cdMatch[1] ?? '').trim() || '/mnt/e/Hermes/hermes-dashboard';
      // Ask the server to resolve the new absolute path
      const resolveCmd = `cd ${JSON.stringify(target)} && pwd`;
      try {
        const res  = await fetch('/api/terminal', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ command: resolveCmd, cwd }),
        });
        const data = await res.json() as { stdout?: string; stderr?: string };
        const newPath = data.stdout?.trim();
        if (newPath && newPath.startsWith('/')) {
          setCwd(newPath);
          addLine('output', newPath);
        } else {
          addLine('error', data.stderr || `cd: ${target}: No such file or directory`);
        }
      } catch {
        addLine('error', 'Erreur : impossible de contacter le terminal API.');
      } finally {
        setLoading(false);
        addLine('info', '');
      }
      return;
    }

    // ── Normal command ────────────────────────────────────────────────────
    try {
      const res  = await fetch('/api/terminal', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ command: cmd, cwd }),
      });
      const data = await res.json() as { stdout?: string; stderr?: string };

      if (data.stdout) {
        data.stdout.split('\n').forEach((line: string) => addLine('output', line));
      }
      if (data.stderr) {
        data.stderr.split('\n').filter(Boolean).forEach((line: string) => addLine('error', line));
      }
      if (!data.stdout && !data.stderr) {
        addLine('output', '(pas de sortie)');
      }
    } catch {
      addLine('error', 'Erreur : impossible de contacter le terminal API.');
    } finally {
      setLoading(false);
      addLine('info', '');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : history[idx]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  function getLineColor(type: TerminalLine['type']) {
    switch (type) {
      case 'input':  return '#8B9CF4';
      case 'output': return '#C8CCE0';
      case 'error':  return '#F87171';
      case 'info':   return '#4B5060';
    }
  }

  function insertCmd(cmd: string) {
    setInput(cmd);
    setShowHelp(false);
    setTimeout(() => {
      inputRef.current?.focus();
      const match = cmd.match(/<[^>]+>/);
      if (match && match.index !== undefined) {
        inputRef.current?.setSelectionRange(match.index, match.index + match[0].length);
      }
    }, 50);
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden relative"
      style={{
        background:           'rgba(5,5,8,0.92)',
        backdropFilter:       'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        border:               '1px solid rgba(255,255,255,0.07)',
        borderRadius:         '16px',
        boxShadow:            'var(--shadow-3)',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <TerminalSquare className="w-3.5 h-3.5" style={{ color: '#8B9CF4' }} />
          <span className="text-xs font-semibold" style={{ color: '#C8CCE0', fontFamily: 'var(--font-mono)' }}>
            Terminal
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(94,106,210,0.12)', color: '#5E6AD2', border: '1px solid rgba(94,106,210,0.22)' }}
          >
            WSL2
          </span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
            <span className="text-[9px]" style={{ color: '#10B981', fontFamily: 'var(--font-mono)' }}>connecté</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-[8px] truncate max-w-[120px]"
            style={{ color: '#4B5060', fontFamily: 'var(--font-mono)' }}
            title={cwd}
          >
            {shortenPath(cwd)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowHelp(v => !v); }}
            title="Aide & commandes"
            className="press-effect"
            style={{ color: showHelp ? '#8B9CF4' : '#4B5060', transition: 'color var(--transition-base)' }}
            onMouseEnter={e => { if (!showHelp) (e.currentTarget as HTMLElement).style.color = '#8B9CF4'; }}
            onMouseLeave={e => { if (!showHelp) (e.currentTarget as HTMLElement).style.color = '#4B5060'; }}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLines([]); }}
            title="Effacer"
            className="press-effect"
            style={{ color: '#4B5060', transition: 'color var(--transition-base)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#F87171'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#4B5060'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Help bubble ───────────────────────────────────────── */}
      {showHelp && (
        <div
          className="absolute z-20"
          style={{ bottom: '44px', right: '8px', width: '306px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background:   'rgba(8,8,14,0.98)',
              border:       '1px solid rgba(255,255,255,0.10)',
              borderRadius: '12px',
              boxShadow:    '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,156,244,0.06)',
            }}
          >
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-1.5">
                <TerminalSquare className="w-3 h-3" style={{ color: '#8B9CF4' }} />
                <span className="text-[10px] font-bold" style={{ color: '#C8CCE0', fontFamily: 'var(--font-mono)' }}>
                  Commandes
                </span>
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(94,106,210,0.12)', color: '#5E6AD2', border: '1px solid rgba(94,106,210,0.22)' }}
                >
                  clic → insérer
                </span>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                style={{ color: '#4B5060', transition: 'color 0.12s ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#C8CCE0'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#4B5060'}
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div
              className="overflow-y-auto custom-scrollbar"
              style={{ maxHeight: '268px', padding: '8px 10px 6px' }}
            >
              <div className="space-y-2.5">
                {CHEAT_SECTIONS.map(section => (
                  <div key={section.title}>
                    <div className="flex items-center gap-1.5 mb-1 px-0.5">
                      <div className="h-px flex-1 opacity-20" style={{ background: section.color }} />
                      <p
                        className="text-[8px] font-semibold uppercase tracking-widest shrink-0"
                        style={{ color: section.color, fontFamily: 'var(--font-jakarta)' }}
                      >
                        {section.title}
                      </p>
                      <div className="h-px flex-1 opacity-20" style={{ background: section.color }} />
                    </div>
                    <div className="grid grid-cols-1 gap-0.5">
                      {section.cmds.map((item) => (
                        <button
                          key={item.cmd}
                          onClick={() => insertCmd(item.cmd)}
                          className="text-left flex items-center justify-between px-1.5 py-0.5 rounded press-effect"
                          style={{ color: '#7B8094', transition: 'background 0.1s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <span className="font-mono text-[9px]" style={{ color: section.color }}>{item.cmd}</span>
                          <span className="text-[8px] truncate ml-2" style={{ color: '#4B5060' }}>{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Terminal output ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
        {lines.map((line) => (
          <div
            key={line.id}
            className="text-xs leading-5 whitespace-pre-wrap break-all"
            style={{ color: getLineColor(line.type) }}
          >
            {line.content}
          </div>
        ))}
        {loading && (
          <div className="text-xs animate-pulse" style={{ color: '#5E6AD2', fontFamily: 'var(--font-mono)' }}>
            ▌
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ─────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        onClick={e => e.stopPropagation()}
      >
        <span className="text-[9px] flex-shrink-0" style={{ color: '#5E6AD2', fontFamily: 'var(--font-mono)' }}>
          {shortenPath(cwd)}
        </span>
        <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: '#5E6AD2' }} />
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder={loading ? 'Exécution...' : 'Entrez une commande...'}
          className="flex-1 bg-transparent outline-none text-xs"
          style={{ color: '#C8CCE0', fontFamily: 'var(--font-mono)' }}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
