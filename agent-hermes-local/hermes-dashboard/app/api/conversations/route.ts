import { NextRequest, NextResponse } from 'next/server';
import { listConversations, deleteAllConversations } from '@/lib/memory';

export async function GET() {
  try {
    const conversations = listConversations();
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('GET /api/conversations error:', err);
    return NextResponse.json({ error: 'Erreur de lecture des conversations.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest) {
  try {
    const count = deleteAllConversations();
    return NextResponse.json({ success: true, deleted: count });
  } catch (err) {
    console.error('DELETE /api/conversations error:', err);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
