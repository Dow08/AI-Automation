'use client';

import { CLOUD_MODELS, FALLBACK_LOCAL_MODELS, DEFAULT_MODEL } from '@/lib/models';
import { Cpu, Cloud, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { ModelOption } from '@/types';

interface Props {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [localModels, setLocalModels] = useState<ModelOption[]>(FALLBACK_LOCAL_MODELS);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/models');
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          const fetchedLocal: ModelOption[] = data.models.map((m: any) => ({
            id: m.name,
            name: m.name,
            group: 'local',
            provider: 'ollama',
          }));
          setLocalModels(fetchedLocal);
        }
      } catch (err) {
        console.error('Failed to load local models:', err);
      }
    }
    fetchModels();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const allModels = [...localModels, ...CLOUD_MODELS];
  const selectedModel = allModels.find((m) => m.id === value) || allModels[0] || { id: DEFAULT_MODEL, name: DEFAULT_MODEL, group: 'local', provider: 'ollama' };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/10 text-sm text-white/80 hover:text-white hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedModel.group === 'local' ? (
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Cloud className="w-3.5 h-3.5 text-blue-400" />
        )}
        <span className="font-medium max-w-[150px] truncate">{selectedModel.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 glass-strong rounded-xl border border-white/10 z-50 overflow-hidden shadow-2xl shadow-black/50">
          {/* Local group */}
          <div className="px-3 pt-2 pb-1 max-h-48 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-1.5 mb-1 sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 py-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-widest">Local (Ollama)</span>
            </div>
            {localModels.map((model) => (
              <button
                key={model.id}
                onClick={() => { onChange(model.id); setOpen(false); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors truncate ${
                  model.id === value
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title={model.name}
              >
                {model.name}
              </button>
            ))}
          </div>

          <div className="h-px bg-white/5 mx-3" />

          {/* Cloud group */}
          <div className="px-3 pb-2 pt-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Cloud className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-semibold text-blue-400/70 uppercase tracking-widest">Cloud API</span>
            </div>
            {CLOUD_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => { onChange(model.id); setOpen(false); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  model.id === value
                    ? 'bg-blue-500/15 text-blue-300'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {model.name}
                <span className="text-[10px] text-white/30 ml-1.5">{model.provider}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
