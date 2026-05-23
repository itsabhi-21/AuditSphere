import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, companyName, role, teamSize, auditId } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('leads')
      .insert([{
        audit_id: auditId || null,
        email,
        company_name: companyName || null,
        role: role || null,
        team_size: parseInt(teamSize) || null,
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Lead save error:', err);
    return NextResponse.json({ success: false, error: 'Failed to save lead' }, { status: 500 });
  }
}