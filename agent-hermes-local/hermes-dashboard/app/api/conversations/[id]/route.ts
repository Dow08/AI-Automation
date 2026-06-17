import { NextRequest, NextResponse } from 'next/server';
import { loadConversation, deleteConversation } from '@/lib/memory';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const conversation = loadConversation(id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 });
    }
    return NextResponse.json({ conversation });
  } catch (err) {
    console.error(`GET /api/conversations/${id} error:`, err);
    return NextResponse.json({ error: 'Erreur de lecture.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const success = deleteConversation(id);
    if (!success) {
      return NextResponse.json({ error: 'Conversation introuvable.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/conversations/${id} error:`, err);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
