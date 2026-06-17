'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trash2, MessageSquare, RefreshCw, AlertTriangle, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Conversation, ConversationSummary } from '@/types';

interface Props {
  onLoadConversation: (conv: Conversation) => void;
}

export default function HistoryPanel({ onLoadConversation }: Props) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {
      toast.error('Impossible de charger les conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  async function handleLoad(id: string) {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();
      if (data.conversation) {
        onLoadConversation(data.conversation);
        toast.success('Conversation chargée dans le chat.');
      }
    } catch {
      toast.error('Erreur lors du chargement.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      toast.success('Conversation supprimée.');
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
    setDeleteTarget(null);
  }

  async function handleDeleteAll() {
    try {
      await fetch('/api/conversations', { method: 'DELETE' });
      setConversations([]);
      toast.success('Toutes les conversations ont été supprimées.');
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
    setDeleteAllOpen(false);
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="glass rounded-2xl border border-white/8 flex flex-col flex-1 min-h-0 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/80">Historique des sessions</span>
          <Badge variant="outline" className="text-[10px] text-white/40 border-white/10">
            {conversations.length} session{conversations.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchConversations}
            className="text-white/40 hover:text-white/70 h-8 px-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          {conversations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteAllOpen(true)}
              className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10 h-8 text-xs gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Tout effacer
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="dot-pulse flex gap-1.5">
              <span /><span /><span />
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <MessageSquare className="w-10 h-10 text-white/10" />
            <p className="text-sm text-white/25">Aucune conversation sauvegardée.</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="glass rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white/80 truncate">{conv.title}</h3>
                    <p className="text-xs text-white/35 mt-1 line-clamp-2">{conv.preview}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[10px] text-white/25">
                        <Calendar className="w-3 h-3" />
                        {formatDate(conv.createdAt)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-white/25">
                        <Hash className="w-3 h-3" />
                        {conv.messageCount} messages
                      </div>
                      <Badge variant="outline" className="text-[10px] text-indigo-400/60 border-indigo-400/20 px-1.5 py-0">
                        {conv.model}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLoad(conv.id)}
                      className="h-7 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    >
                      Charger
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(conv.id)}
                      className="h-7 px-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Delete one dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="glass-strong border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Supprimer la conversation ?
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Cette action est irréversible. La conversation sera définitivement supprimée de E:\Memoire_IA.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="text-white/60">
              Annuler
            </Button>
            <Button
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete all dialog */}
      <Dialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <DialogContent className="glass-strong border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Effacer tout l&apos;historique ?
            </DialogTitle>
            <DialogDescription className="text-white/50">
              {conversations.length} conversation(s) seront définitivement supprimées de E:\Memoire_IA. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteAllOpen(false)} className="text-white/60">
              Annuler
            </Button>
            <Button onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-500 text-white">
              Tout supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
