'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Eye, EyeOff, Save, Cpu, Settings, Bell, Upload, FileJson, X, CheckCircle2, Key,
} from 'lucide-react';

interface Config {
  provider: string;
  model: string;
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  GEMINI_API_KEY: string;
  DISCORD_WEBHOOK_URL: string;
  tool_progress: string;
  streaming: boolean;
  show_reasoning: boolean;
}

const MASKED = '••••••••';

export default function SettingsPanel() {
  const [config, setConfig] = useState<Config>({
    provider: 'ollama',
    model: 'mistral-small:24b',
    ANTHROPIC_API_KEY: '',
    OPENAI_API_KEY: '',
    GEMINI_API_KEY: '',
    DISCORD_WEBHOOK_URL: '',
    tool_progress: 'all',
    streaming: true,
    show_reasoning: false,
  });

  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [showKeys,  setShowKeys]  = useState<Record<string, boolean>>({});
  const [importFile,  setImportFile]  = useState<File | null>(null);
  const [importType,  setImportType]  = useState<'auto' | 'profile' | 'conversations'>('auto');
  const [importing,   setImporting]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res  = await fetch('/api/config');
        const data = await res.json();
        if (res.ok) setConfig(prev => ({ ...prev, ...data }));
      } catch {
        toast.error('Impossible de charger la configuration.');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res  = await fetch('/api/config', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Configuration sauvegardée.', {
          description: 'Paramètres écrits dans config.yaml et .env',
        });
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde.');
      }
    } catch {
      toast.error('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  }

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', importFile);
      fd.append('type', importType);
      const res  = await fetch('/api/memory/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Import réussi.');
        setImportFile(null);
      } else {
        toast.error(data.error || "Erreur lors de l'import.");
      }
    } catch {
      toast.error("Erreur réseau lors de l'import.");
    } finally {
      setImporting(false);
    }
  }

  function toggleKey(field: string) {
    setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
  }

  function isSet(val: string) {
    return val && val !== MASKED;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="dot-pulse flex gap-1.5"><span /><span /><span /></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">Configuration de JAROD</h1>
        <p className="text-sm text-white/50">Gérez le comportement, les modèles et les clés API de l'agent.</p>
      </div>

      {/* Moteur IA & Provider */}
      <Card className="glass border-white/8 p-6 rounded-2xl bg-transparent">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Modèle par défaut</h2>
            <p className="text-[11px] text-white/40">Fournisseur et modèle utilisé au démarrage.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Fournisseur</label>
            <select
              value={config.provider}
              onChange={(e) => setConfig(c => ({ ...c, provider: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-indigo-500/50"
            >
              <option value="ollama">Ollama (Local)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT)</option>
              <option value="google">Google (Gemini)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Modèle</label>
            <Input
              value={config.model}
              onChange={(e) => setConfig(c => ({ ...c, model: e.target.value }))}
              placeholder={
                config.provider === 'ollama'     ? 'Ex: mistral-small:24b'
                : config.provider === 'anthropic' ? 'Ex: claude-sonnet-4-6'
                : config.provider === 'openai'    ? 'Ex: gpt-4o'
                : 'Ex: gemini-1.5-pro'
              }
              className="bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-indigo-500/50"
            />
          </div>
        </div>
      </Card>

      {/* Clés API */}
      <Card className="glass border-white/8 p-6 rounded-2xl bg-transparent">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Clés API</h2>
            <p className="text-[11px] text-white/40">Sauvegardées dans <code className="text-white/30">E:/Hermes/.env</code> — une clé suffit pour activer le fournisseur correspondant.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Anthropic */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/50 font-medium uppercase tracking-wider flex-1">
                Anthropic — Claude
              </label>
              {config.ANTHROPIC_API_KEY === MASKED && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ configurée</span>
              )}
            </div>
            <div className="relative">
              <Input
                type={showKeys['anthropic'] ? 'text' : 'password'}
                value={config.ANTHROPIC_API_KEY}
                onChange={e => setConfig(c => ({ ...c, ANTHROPIC_API_KEY: e.target.value }))}
                placeholder={config.ANTHROPIC_API_KEY === MASKED ? '••••••••  (déjà configurée)' : 'sk-ant-…'}
                className="bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-amber-500/40 pr-10"
              />
              <button
                type="button"
                onClick={() => toggleKey('anthropic')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showKeys['anthropic'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Separator className="bg-white/5" />

          {/* OpenAI */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/50 font-medium uppercase tracking-wider flex-1">
                OpenAI — GPT
              </label>
              {config.OPENAI_API_KEY === MASKED && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ configurée</span>
              )}
            </div>
            <div className="relative">
              <Input
                type={showKeys['openai'] ? 'text' : 'password'}
                value={config.OPENAI_API_KEY}
                onChange={e => setConfig(c => ({ ...c, OPENAI_API_KEY: e.target.value }))}
                placeholder={config.OPENAI_API_KEY === MASKED ? '••••••••  (déjà configurée)' : 'sk-…'}
                className="bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-amber-500/40 pr-10"
              />
              <button
                type="button"
                onClick={() => toggleKey('openai')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showKeys['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Separator className="bg-white/5" />

          {/* Google Gemini */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/50 font-medium uppercase tracking-wider flex-1">
                Google — Gemini
              </label>
              {config.GEMINI_API_KEY === MASKED && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ configurée</span>
              )}
            </div>
            <div className="relative">
              <Input
                type={showKeys['gemini'] ? 'text' : 'password'}
                value={config.GEMINI_API_KEY}
                onChange={e => setConfig(c => ({ ...c, GEMINI_API_KEY: e.target.value }))}
                placeholder={config.GEMINI_API_KEY === MASKED ? '••••••••  (déjà configurée)' : 'AIza…'}
                className="bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-amber-500/40 pr-10"
              />
              <button
                type="button"
                onClick={() => toggleKey('gemini')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showKeys['gemini'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Comportement Système */}
      <Card className="glass border-white/8 p-6 rounded-2xl bg-transparent">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <Settings className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Comportement Système</h2>
            <p className="text-[11px] text-white/40">Paramètres internes de l'agent (config.yaml)</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Afficher le Raisonnement</h3>
              <p className="text-xs text-white/40">Affiche le processus CoT de l'IA avant la réponse.</p>
            </div>
            <Switch
              checked={config.show_reasoning}
              onCheckedChange={(v) => setConfig(c => ({ ...c, show_reasoning: v }))}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          <Separator className="bg-white/5" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Streaming des Réponses</h3>
              <p className="text-xs text-white/40">Affiche les mots au fur et à mesure.</p>
            </div>
            <Switch
              checked={config.streaming}
              onCheckedChange={(v) => setConfig(c => ({ ...c, streaming: v }))}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-white">Progression des Outils</h3>
              <p className="text-xs text-white/40">Niveau de détail quand l'agent utilise ses outils.</p>
            </div>
            <div className="flex gap-3">
              {['all', 'new', 'verbose', 'none'].map((level) => (
                <button
                  key={level}
                  onClick={() => setConfig(c => ({ ...c, tool_progress: level }))}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    config.tool_progress === level
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications Discord */}
      <Card className="glass border-white/8 p-6 rounded-2xl bg-transparent">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Bell className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Notifications Discord</h2>
            <p className="text-[11px] text-white/40">Webhook pour les alertes de l'agent</p>
          </div>
        </div>
        <Input
          value={config.DISCORD_WEBHOOK_URL}
          onChange={(e) => setConfig(c => ({ ...c, DISCORD_WEBHOOK_URL: e.target.value }))}
          placeholder="https://discord.com/api/webhooks/..."
          className="bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-indigo-500/50"
        />
      </Card>

      {/* Import Mémoire */}
      <Card className="glass border-white/8 p-6 rounded-2xl bg-transparent">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
            <Upload className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Importer une Mémoire</h2>
            <p className="text-[11px] text-white/40">Restaurez un profil ou des conversations exportées (JSON)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            {[
              { key: 'auto',          label: 'Auto-détection'   },
              { key: 'profile',       label: 'Profil utilisateur' },
              { key: 'conversations', label: 'Conversations'    },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setImportType(key as typeof importType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  importType === key
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                    : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f && f.name.endsWith('.json')) setImportFile(f);
              else toast.error('Seuls les fichiers .json sont acceptés.');
            }}
            className="border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-xl p-6 text-center cursor-pointer transition-colors group"
          >
            {importFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileJson className="w-6 h-6 text-amber-400" />
                <div className="text-left">
                  <p className="text-sm text-white font-medium">{importFile.name}</p>
                  <p className="text-xs text-white/40">{(importFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setImportFile(null); }}
                  className="ml-2 text-white/30 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-white/20 group-hover:text-amber-400/60 mx-auto transition-colors" />
                <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                  Glissez un fichier .json ou cliquez pour parcourir
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setImportFile(f);
              e.target.value = '';
            }}
          />

          <Button
            onClick={handleImport}
            disabled={!importFile || importing}
            className="w-full bg-amber-600/80 hover:bg-amber-500 text-white rounded-xl h-10 text-sm font-medium gap-2 transition-all disabled:opacity-40"
          >
            {importing ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Import en cours...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" />Lancer l'importation</>
            )}
          </Button>
        </div>
      </Card>

      {/* Save button */}
      <div className="sticky bottom-4 z-10 pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 text-sm font-medium gap-2 glow-indigo transition-all disabled:opacity-50 shadow-xl"
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sauvegarde...</>
          ) : (
            <><Save className="w-4 h-4" />Sauvegarder la configuration de JAROD</>
          )}
        </Button>
      </div>
    </div>
  );
}
