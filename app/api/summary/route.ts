import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tools, totalMonthlySavings, totalAnnualSavings, useCase, teamSize } = body;

    const toolSummary = tools
      .map((t: { toolName: string; recommendedAction: string; estimatedSavings: number }) =>
        `- ${t.toolName}: ${t.recommendedAction} (save $${t.estimatedSavings}/mo)`
      )
      .join('\n');

    const prompt = `You are a financial advisor specializing in AI tool spend optimization for startups.

A user has just completed an AI spend audit. Here are their results:

Team size: ${teamSize || 'unknown'}
Primary use case: ${useCase || 'mixed'}
Total potential monthly savings: $${totalMonthlySavings}
Total potential annual savings: $${totalAnnualSavings}

Tool-by-tool breakdown:
${toolSummary}

Write a personalized 80-100 word summary paragraph for this specific user. Be direct and specific with the numbers. Mention their biggest savings opportunity by name. End with one actionable next step. Do not use bullet points. Do not start with "I". Sound like a trusted advisor, not a sales pitch.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ success: true, summary });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Summary generation failed:', message);
    return NextResponse.json({ success: false, summary: null });
  }
}