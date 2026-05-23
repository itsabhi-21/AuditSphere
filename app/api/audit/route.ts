import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tools, teamSize, useCase, totalMonthlySavings, totalAnnualSavings } = body;

    const { data, error } = await supabase
      .from('audits')
      .insert([{
        tools,
        team_size: parseInt(teamSize) || null,
        use_case: useCase,
        total_monthly_savings: totalMonthlySavings,
        total_annual_savings: totalAnnualSavings,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, auditId: data.id });
  } catch (err) {
    console.error('Audit save error:', err);
    return NextResponse.json({ success: false, error: 'Failed to save audit' }, { status: 500 });
  }
}