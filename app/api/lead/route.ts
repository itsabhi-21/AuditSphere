import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot check — bots fill this, humans don't
    if (body.website) {
      return NextResponse.json({ success: true });
    }

    const { email, companyName, role, auditId } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    // Build insert object — only include audit_id if it's a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validAuditId = auditId && uuidRegex.test(auditId) ? auditId : null;

    const insertData: Record<string, unknown> = {
      email,
      company_name: companyName || null,
      role: role || null,
    };

    if (validAuditId) {
      insertData.audit_id = validAuditId;
    }

    // ✅ Step 1: Save to Supabase
    const { error } = await supabase
      .from('leads')
      .insert([insertData]);

    if (error) {
      console.error('Supabase error:', error.message, error.details);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // ✅ Step 2: Send confirmation email via Resend
    // Note: on free tier, Resend only delivers to your verified email
    try {
      await resend.emails.send({
        from: 'AuditSphere <onboarding@resend.dev>',
        to: email,
        subject: 'Your AI Spend Audit Report — AuditSphere',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 8px;">
              Your AuditSphere Report
            </h1>
            <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
              Thanks for using AuditSphere! We've saved your audit results.
            </p>

            <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="color: #5b21b6; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
                WHAT HAPPENS NEXT
              </p>
              <p style="color: #374151; margin: 0;">
                Our team will review your audit. If your stack shows significant savings opportunities,
                a Credex advisor will reach out with discounted credit options.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              We'll also notify you when new optimization opportunities apply to your AI stack.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              AuditSphere — Free AI Spend Audit · 
              <a href="https://audit-sphere-seven.vercel.app" style="color: #7c3aed;">
                Run another audit
              </a>
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Email send failed (non-fatal):', emailErr);
    }

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Lead save error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}