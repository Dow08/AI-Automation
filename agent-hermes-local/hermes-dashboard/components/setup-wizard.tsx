'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Cpu, Globe, Check, ArrowRight, ArrowLeft, Save, Lock } from 'lucide-react';

interface Props {
  onComplete?: () => void;
}

const PROVIDERS = [
  { key: 'ollama',    label: 'Ollama (Local)',        icon: Cpu,   desc: 'Puissance locale & Privé',   color: 'emerald' },
  { key: 'anthropic', label: 'Anthropic (Claude)',     icon: Globe, desc: 'Claude 4.6 Sonnet / Opus',  color: 'violet'  },
  { key: 'openai',    label: 'OpenAI (GPT)',           icon: Globe, desc: 'GPT-4o / GPT-4o Mini',       color: 'blue'    },
  { key: 'google',    label: 'Google (Gemini)',        icon: Globe, desc: 'Gemini 1.5 Pro / 2.0 Flash', color: 'amber'   },
];

const DEFAULT_MODELS: Record<string, string> = {
  ollama:    'mistral-small:24b',
  anthropic: 'claude-4.6-sonnet',
  openai:    'gpt-4o',
  google:    'gemini-2.0-flash',
};

export default function SetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    provider: 'ollama',
    model: 'mistral-small:24b',
    API_KEY: '',
    tool_progress: 'all',
    streaming: true,
    show_reasoning: false,
  });
  const [saving, setSaving] = useState(false);

  // Load existing config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => setConfig((prev) => ({ ...prev, ...data, API_KEY: '' })))
      .catch(() => {});
  }, []);

  function selectProvider(key: string) {
    setConfig((c) => ({ ...c, provider: key, model: DEFAULT_MODELS[key] || '' }));
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Configuration JAROD enregistrée !', {
          description: 'Paramètres sauvegardés dans config.yaml et .env',
        });
        if (onComplete) onComplete();
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde.');
      }
    } catch {
      toast.error('Erreur réseau lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="my-4 border-indigo-500/30 bg-indigo-500/5 p-6 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-lg">{step}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Assistant JAROD /setup</h3>
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">Étape {step} sur 3</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1 w-8 rounded-full transition-all ${i <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      <div className="min-h-[240px] flex flex-col justify-center">
        {/* ── Step 1 : Provider ───────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2 mb-4">
              <h4 className="text-lg text-white font-medium">Comment JAROD doit-il réfléchir ?</h4>
              <p className="text-sm text-white/50">Choisissez votre moteur d'intelligence artificielle.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PROVIDERS.map(({ key, label, icon: Icon, desc }) => (
                <button
                  key={key}
                  onClick={() => selectProvider(key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    config.provider === key
                      ? 'bg-indigo-500/20 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                  }`}
                >
                  <Icon className="w-7 h-7" />
                  <span className="text-sm font-bold tracking-tight">{label}</span>
                  <span className="text-[10px] opacity-60 text-center">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2 : Model + API Key ─────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-1 mb-2">
              <h4 className="text-lg text-white font-medium">Configuration du modèle</h4>
              <p className="text-sm text-white/50">Précisez le modèle et, si nécessaire, la clé API.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/30 uppercase font-black">Nom du modèle</label>
              <Input
                value={config.model}
                onChange={(e) => setConfig((c) => ({ ...c, model: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11"
                placeholder={DEFAULT_MODELS[config.provider] || 'Ex: mistral-small:24b'}
              />
            </div>

            {config.provider !== 'ollama' && (
              <div className="space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-black">
                  Clé API {config.provider}
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    value={config.API_KEY}
                    onChange={(e) => setConfig((c) => ({ ...c, API_KEY: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white h-11 pr-10"
                    placeholder="Laissez vide pour utiliser la clé existante"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                </div>
                <p className="text-[11px] text-white/30">
                  Laissez vide pour conserver la clé déjà configurée dans le .env
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3 : Behavior ────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-1 mb-2">
              <h4 className="text-lg text-white font-medium">Touches finales</h4>
              <p className="text-sm text-white/50">Ajustez le comportement de l'agent.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <p className="text-sm text-white/80 font-medium">Afficher le raisonnement (CoT)</p>
                  <p className="text-[11px] text-white/30">Visible dans les réponses de l'agent</p>
                </div>
                <button
                  onClick={() => setConfig((c) => ({ ...c, show_reasoning: !c.show_reasoning }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${config.show_reasoning ? 'bg-indigo-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config.show_reasoning ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <p className="text-sm text-white/80 font-medium">Streaming (Temps réel)</p>
                  <p className="text-[11px] text-white/30">Affiche les tokens au fur et à mesure</p>
                </div>
                <button
                  onClick={() => setConfig((c) => ({ ...c, streaming: !c.streaming }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${config.streaming ? 'bg-indigo-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config.streaming ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-white/3 border border-white/5">
                <p className="text-sm text-white/80 font-medium mb-2">Progression des outils</p>
                <div className="flex gap-2">
                  {['all', 'new', 'verbose', 'none'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setConfig((c) => ({ ...c, tool_progress: lvl }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        config.tool_progress === lvl
                          ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                      }`}
                    >
                      {lvl.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-[11px] text-emerald-400/80 leading-tight">
                Prêt à sauvegarder — les paramètres seront écrits dans{' '}
                <code className="font-mono">config.yaml</code> et <code className="font-mono">.env</code>.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6 pt-5 border-t border-white/5">
        {step > 1 && (
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 text-white/40 hover:text-white hover:bg-white/5 h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
        )}

        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white h-12 shadow-lg shadow-indigo-600/20"
          >
            Continuer <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            id="setup-finish-btn"
            onClick={handleFinish}
            disabled={saving}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-12 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Terminer la configuration
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
