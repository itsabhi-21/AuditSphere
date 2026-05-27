import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // fetch audit logic here

  return NextResponse.json({
    audit: {
      id,
      tools: [],
      total_monthly_savings: 0,
      total_annual_savings: 0,
      use_case: '',
      team_size: 0,
      created_at: new Date().toISOString(),
    },
  });
}