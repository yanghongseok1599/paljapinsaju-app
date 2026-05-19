import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { userId, amount, readingId } = await req.json();

  if (!userId || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // C4: Atomic deduct — single UPDATE with balance >= amount guard.
  // Returns new balance, or null if balance was insufficient (race-condition-safe).
  const { data: newBalance, error } = await supabase.rpc('atomic_deduct_stars', {
    p_user_id: user.id,
    p_amount: amount,
  });

  if (error || newBalance === null || newBalance === undefined) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
  }

  // 거래 이력 기록
  await supabase.from('star_transactions').insert({
    user_id: userId,
    amount: -amount,
    balance_after: newBalance,
    type: 'report',
    reading_id: readingId || null,
  });

  return NextResponse.json({ balance: newBalance });
}
