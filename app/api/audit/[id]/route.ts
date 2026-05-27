import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('id, tools, total_monthly_savings, total_annual_savings, use_case, team_size, created_at')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ audit: null }, { status: 404 });
    }

    // Strip any identifying info — only return public fields
    return NextResponse.json({ audit: data });

  } catch (err) {
    return NextResponse.json({ audit: null }, { status: 500 });
  }
}