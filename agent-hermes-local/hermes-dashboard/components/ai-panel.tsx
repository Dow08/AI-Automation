'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Send, RotateCcw, Cpu, Cloud, Sparkles } from 'lucide-react';

import MessageBubble from './message-bubble';
import { DEFAULT_MODEL, CLOUD_MODELS, FALLBACK_LOCAL_MODELS } from '@/lib/models';
import type { Message } from '@/types';

export default function AIPanel() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [convId, setConvId]         = useState(() => uuidv4());
  const [usedModel, setUsedModel]   = useState<string | null>(null);
  const [model]                     = useState(DEFAULT_MODEL);
  const scrollRef                   = useRef<HTMLDivElement>(null);
  const textareaRef                 = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function handleReset() {
    setMessages([]);
    setConvId(uuidv4());
    setError(null);
    setUsedModel(null);
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id:        uuidv4(),
      role:      'user',
      content:   input.trim(),
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
    }

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: updated, modelId: model, conversationId: convId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');

      setMessages(prev => [...prev, {
        id:        uuidv4(),
        role:      'assistant',
        content:   data.reply,
        timestamp: Date.now(),
        type:      data.type,
      }]);
      setConvId(data.conversationId);
      setUsedModel(data.modelUsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const allModels = [...FALLBACK_LOCAL_MODELS, ...CLOUD_MODELS];
  const info      = allModels.find(m => m.id === (usedModel || model));
  const isLocal   = info?.group === 'local'
    || (usedModel || model).includes('mistral')
    || (usedModel || model).includes('mixtral');

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width:                '340px',
        flexShrink:           0,
        background:           'rgba(5,5,8,0.65)',
        backdropFilter:       'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderLeft:           '1px solid rgba(255,255,255,0.06)',
        boxShadow:            '-4px 0 32px rgba(0,0,0,0.30)',
      }}
    >
      {/* ── Panel Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(94,106,210,0.22) 0%, rgba(124,58,237,0.16) 100%)',
              border:     '1px solid rgba(94,106,210,0.30)',
              fontSize:   '14px',
              lineHeight: 1,
            }}
          >
            ⚕️
          </div>
          <div>
            <h3 className="text-[12px] font-bold leading-none" style={{ color: '#EDEEF5', fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.02em' }}>
              JAROD
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full status-online" style={{ background: '#10B981' }} />
              <span className="text-[10px] font-medium" style={{ color: '#10B981', fontFamily: 'var(--font-jakarta)' }}>
                {isLoading ? 'Réflexion...' : 'Prêt'}
              </span>
              {usedModel && (
                <div className="flex items-center gap-0.5 ml-1">
                  {isLocal
                    ? <Cpu className="w-2.5 h-2.5" style={{ color: '#34D399' }} />
                    : <Cloud className="w-2.5 h-2.5" style={{ color: '#60A5FA' }} />
                  }
                  <span className="text-[9px] font-semibold" style={{ color: isLocal ? '#34D399' : '#60A5FA', fontFamily: 'var(--font-jakarta)' }}>
                    {isLocal ? 'Local' : 'Cloud'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="press-effect w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background:  'rgba(255,255,255,0.03)',
            border:      '1px solid rgba(255,255,255,0.07)',
            color:       '#3D404D',
            cursor:      'pointer',
            transition:  'all var(--transition-base)',
          }}
          title="Nouvelle conversation"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#8B9CF4'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#3D404D'; }}
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 py-10">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(94,106,210,0.10) 0%, rgba(124,58,237,0.07) 100%)',
                border:     '1px solid rgba(94,106,210,0.16)',
                fontSize:   '18px',
                lineHeight: 1,
              }}
            >
              ⚕️
            </div>
            <p className="text-[11px] text-center px-4 leading-relaxed" style={{ color: '#2A2D38', fontFamily: 'var(--font-jakarta)', maxWidth: '200px' }}>
              Posez une question à JAROD. Il utilise votre mémoire pour personnaliser chaque réponse.
            </p>

            {/* Quick actions */}
            <div className="w-full space-y-1.5 px-1">
              {[
                'Résume ma journée',
                'Analyse mes dernières tâches',
                'Quels collaborateurs contacter ?',
              ].map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                  className="press-effect w-full text-left px-3 py-2 rounded-xl text-[11px] font-medium"
                  style={{
                    background:  'rgba(255,255,255,0.025)',
                    border:      '1px solid rgba(255,255,255,0.06)',
                    color:       '#3D404D',
                    fontFamily:  'var(--font-jakarta)',
                    cursor:      'pointer',
                    transition:  'all var(--transition-base)',
                    display:     'flex',
                    alignItems:  'center',
                    gap:         '8px',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(94,106,210,0.08)';
                    (e.currentTarget as HTMLElement).style.color = '#8B9CF4';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(94,106,210,0.20)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)';
                    (e.currentTarget as HTMLElement).style.color = '#3D404D';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-end gap-2 message-enter">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center ai-thinking flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', lineHeight: 1 }}
              >
                ⚕️
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px 12px 12px 3px', padding: '8px 12px', boxShadow: 'var(--shadow-2)' }}>
                <div className="dot-pulse flex items-center gap-1 h-3.5"><span /><span /><span /></div>
              </div>
            </div>
          )}
        </div>
        <div ref={scrollRef} />
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div className="flex-shrink-0 mx-3 mb-2 px-3 py-2 rounded-xl text-[11px]" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#FCA5A5', fontFamily: 'var(--font-jakarta)' }}>
          {error}
        </div>
      )}

      {/* ── Input ────────────────────────────────────────────────── */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="flex items-end gap-2 p-1.5 input-focus"
          style={{
            background:           'rgba(255,255,255,0.035)',
            border:               '1px solid rgba(255,255,255,0.07)',
            borderRadius:         '12px',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Message à JAROD…"
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none overflow-y-auto px-2 py-1"
            style={{
              fontSize:   '0.8rem',
              color:      '#A0A4B8',
              fontFamily: 'var(--font-jakarta)',
              lineHeight: '1.5',
              minHeight:  '32px',
              maxHeight:  '96px',
            }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-gradient press-effect flex items-center justify-center flex-shrink-0 disabled:opacity-30"
            style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed' }}
            aria-label="Envoyer"
          >
            <Send className="w-3.5 h-3.5" style={{ color: '#fff' }} />
          </button>
        </div>
        <p className="text-center mt-1.5 text-[9px]" style={{ color: '#1E2028', fontFamily: 'var(--font-jakarta)' }}>
          Mémoire persistante · E:\Memoire_IA
        </p>
      </div>
    </div>
  );
}
