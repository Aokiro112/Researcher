import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const query = (body.query || '').trim().toLowerCase();

  const presets = [
    'What is quantum computing?',
    'How does CRISPR gene editing work?',
    'Latest discoveries from James Webb Space Telescope',
    'Compare Next.js 15 vs Remix for web applications',
    'Explain Model Context Protocol (MCP) in simple terms',
    'How to build an autonomous agent with Playwright',
    'Best practices for Retrieval Augmented Generation (RAG)',
    'Differences between Supervised and Unsupervised Learning',
    'What is the Transformer architecture in deep learning?',
    'Current progress in room-temperature superconductors',
  ];

  const suggestions = query
    ? presets.filter((p) => p.toLowerCase().includes(query))
    : presets.slice(0, 5);

  return NextResponse.json({
    query,
    suggestions: suggestions.map((text, idx) => ({
      id: `sug_${idx}`,
      text,
      highlight: query,
    })),
  });
}
