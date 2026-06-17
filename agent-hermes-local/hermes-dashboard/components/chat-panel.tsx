'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Send, RotateCcw, AlertTriangle, Cpu, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import ModelSelector from './model-selector';
import MessageBubble from './message-bubble';
import SetupWizard from './setup-wizard';
import { DEFAULT_MODEL, CLOUD_MODELS, FALLBACK_LOCAL_MODELS } from '@/lib/models';
import type { Message, Conversation } from '@/types';

interface Props {
  initialConversation?: Conversation | null;
}

export default function ChatPanel({ initialConversation }: Props) {
  const [messages, setMessages]             = useState<Message[]>(initialConversation?.messages.filter(m => m.role !== 'system') || []);
  const [input, setInput]                   = useState('');
  const [selectedModel, setSelectedModel]   = useState(initialConversation?.model || DEFAULT_MODEL);
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(initialConversation?.id || uuidv4());
  const [usedModel, setUsedModel]           = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed]     = useState(false);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialConversation) {
      setMessages(initialConversation.messages.filter(m => m.role !== 'system'));
      setSelectedModel(initialConversation.model);
      setConversationId(initialConversation.id);
    }
  }, [initialConversation]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function handleReset() {
    setMessages([]);
    setConversationId(uuidv4());
    setError(null);
    setUsedModel(null);
    setFallbackUsed(false);
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id:        uuidv4(),
      role:      'user',
      content:   input.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);
    setFallbackUsed(false);

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: updatedMessages, modelId: selectedModel, conversationId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');

      const assistantMsg: Message = {
        id:        uuidv4(),
        role:      'assistant',
        content:   data.reply,
        timestamp: Date.now(),
        type:      data.type,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setConversationId(data.conversationId);
      setUsedModel(data.modelUsed);
      setFallbackUsed(data.fallbackUsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const allModels = [...FALLBACK_LOCAL_MODELS, ...CLOUD_MODELS];
  const modelInfo = allModels.find((m) => m.id === (usedModel || selectedModel));
  const isLocal   = modelInfo?.group === 'local'
    || (usedModel || selectedModel).includes('mistral')
    || (usedModel || selectedModel).includes('mixtral');

  return (
    <div
      className="flex flex-col flex-1 min-h-0 h-full overflow-hidden"
      style={{
        background:           'rgba(255,255,255,0.025)',
        backdropFilter:       'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        border:               '1px solid rgba(255,255,255,0.07)',
        borderRadius:         '20px',
        boxShadow:            'var(--shadow-3)',
      }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} disabled={isLoading} />

          {usedModel && (
            <div className="flex items-center gap-1.5">
              {fallbackUsed && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold"
                  style={{
                    color:       '#FBD34D',
                    borderColor: 'rgba(251,211,77,0.25)',
                    background:  'rgba(251,211,77,0.08)',
                    fontFamily:  'var(--font-sans)',
                  }}
                >
                  Fallback Cloud
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-[10px] font-semibold flex items-center gap-1"
                style={isLocal ? {
                  color:       '#34D399',
                  borderColor: 'rgba(52,211,153,0.25)',
                  background:  'rgba(52,211,153,0.08)',
                  fontFamily:  'var(--font-sans)',
                } : {
                  color:       '#60A5FA',
                  borderColor: 'rgba(96,165,250,0.25)',
                  background:  'rgba(96,165,250,0.08)',
                  fontFamily:  'var(--font-sans)',
                }}
              >
                {isLocal ? <Cpu className="w-2.5 h-2.5" /> : <Cloud className="w-2.5 h-2.5" />}
                {isLocal ? 'Local' : 'Cloud'}
              </Badge>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs gap-1.5 press-effect"
          style={{
            color:      '#4B5060',
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            transition: 'color var(--transition-base)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#8B9CF4')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4B5060')}
        >
          <RotateCcw className="w-3 h-3" />
          Nouvelle session
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(94,106,210,0.12) 0%, rgba(124,58,237,0.08) 100%)',
                border:     '1px solid rgba(94,106,210,0.20)',
                boxShadow:  '0 0 24px rgba(94,106,210,0.10)',
                fontSize:   '26px',
                lineHeight: 1,
              }}
            >
              ⚕️
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium" style={{ color: '#4B5060', fontFamily: 'var(--font-sans)' }}>
                JAROD est prêt
              </p>
              <p className="text-xs max-w-[240px]" style={{ color: '#33363F', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
                Posez votre première question. Il utilise votre mémoire pour personnaliser chaque réponse.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              <MessageBubble message={msg} />
              {msg.type === 'setup' && (
                <div className="w-full max-w-2xl mx-auto mt-4">
                  <SetupWizard onComplete={() => {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === msg.id
                          ? { ...m, type: undefined, content: m.content + '\n\n✅ Configuration terminée et sauvegardée.' }
                          : m
                      )
                    );
                  }} />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-end gap-2.5 message-enter">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ai-thinking"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border:     '1px solid rgba(255,255,255,0.09)',
                  fontSize:   '13px',
                  lineHeight: 1,
                }}
              >
                ⚕️
              </div>
              <div
                style={{
                  background:   'rgba(255,255,255,0.04)',
                  border:       '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px 16px 16px 4px',
                  padding:      '10px 16px',
                  boxShadow:    'var(--shadow-2)',
                }}
              >
                <div className="dot-pulse flex items-center gap-1.5 h-4">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={scrollRef} />
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex-shrink-0 mx-4 mb-2 flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border:     '1px solid rgba(239,68,68,0.20)',
            boxShadow:  '0 0 16px rgba(239,68,68,0.08)',
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#F87171' }} />
          <p className="text-xs" style={{ color: '#FCA5A5', fontFamily: 'var(--font-sans)' }}>{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="flex items-end gap-2 p-2 input-focus"
          style={{
            background:           'rgba(255,255,255,0.04)',
            backdropFilter:       'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border:               '1px solid rgba(255,255,255,0.08)',
            borderRadius:         '14px',
            transition:           'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Envoyez un message… (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none overflow-y-auto px-2 py-1.5"
            style={{
              fontSize:   '0.875rem',
              color:      '#C8CCE0',
              fontFamily: 'var(--font-sans)',
              lineHeight: '1.6',
              minHeight:  '36px',
              maxHeight:  '128px',
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-gradient press-effect flex items-center justify-center shrink-0 disabled:opacity-30"
            style={{
              width:        '36px',
              height:       '36px',
              borderRadius: '10px',
              border:       'none',
              cursor:       input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition:   'filter var(--transition-base), box-shadow var(--transition-base)',
            }}
            aria-label="Envoyer"
          >
            <Send className="w-4 h-4" style={{ color: '#FFFFFF' }} />
          </button>
        </div>
        <p
          className="text-center mt-2 text-[10px]"
          style={{ color: '#252830', fontFamily: 'var(--font-sans)' }}
        >
          Mémoire persistante activée · Données stockées dans E:\Memoire_IA
        </p>
      </div>
    </div>
  );
}
