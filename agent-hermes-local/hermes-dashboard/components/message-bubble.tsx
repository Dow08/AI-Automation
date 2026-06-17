'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User } from 'lucide-react';
import type { Message } from '@/types';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-2.5 message-enter ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* ── Avatar ────────────────────────────────────────────────── */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 self-end mb-0.5"
        style={isUser ? {
          background: 'linear-gradient(135deg, rgba(94,106,210,0.30) 0%, rgba(124,58,237,0.22) 100%)',
          border: '1px solid rgba(94,106,210,0.35)',
          boxShadow: '0 0 10px rgba(94,106,210,0.15)',
        } : {
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        {isUser
          ? <User className="w-3.5 h-3.5" style={{ color: '#8B9CF4' }} />
          : <span style={{ fontSize: '13px', lineHeight: 1 }}>⚕️</span>
        }
      </div>

      {/* ── Bubble ────────────────────────────────────────────────── */}
      <div
        className="max-w-[78%] text-sm leading-relaxed"
        style={{
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '10px 14px',
          fontFamily: 'var(--font-sans)',
          ...(isUser ? {
            background: 'linear-gradient(135deg, rgba(94,106,210,0.22) 0%, rgba(124,58,237,0.16) 100%)',
            border: '1px solid rgba(94,106,210,0.28)',
            color: '#D4D8F5',
            boxShadow: '0 2px 12px rgba(94,106,210,0.10)',
          } : {
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#C8CCE0',
            boxShadow: 'var(--shadow-2)',
          }),
        }}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap" style={{ color: '#D4D8F5', fontSize: '0.875rem' }}>
            {message.content}
          </p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none
            prose-p:leading-relaxed prose-p:my-1
            prose-headings:font-semibold
            prose-code:rounded prose-code:px-1 prose-code:py-0.5
            prose-pre:rounded-xl prose-pre:border
            prose-a:no-underline
            prose-ul:my-1 prose-li:my-0.5"
            style={{
              '--tw-prose-body':        '#C8CCE0',
              '--tw-prose-headings':    '#EDEEF5',
              '--tw-prose-code':        '#A5B4FC',
              '--tw-prose-pre-bg':      'rgba(0,0,0,0.35)',
              '--tw-prose-pre-code':    '#C8CCE0',
              '--tw-prose-links':       '#8B9CF4',
              '--tw-prose-bold':        '#EDEEF5',
              '--tw-prose-bullets':     '#4B5060',
              '--tw-prose-counters':    '#4B5060',
            } as React.CSSProperties}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp */}
        <p
          className="text-[10px] mt-1.5 font-medium"
          style={{
            color: isUser ? 'rgba(139,156,244,0.40)' : 'rgba(255,255,255,0.20)',
            textAlign: isUser ? 'right' : 'left',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.02em',
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
