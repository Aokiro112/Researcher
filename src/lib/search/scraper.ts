import * as cheerio from 'cheerio';

export interface ExtractedPage {
  url: string;
  title: string;
  text: string;
  snippet?: string;
}

export async function scrapeUrl(url: string, timeoutMs = 4000): Promise<ExtractedPage | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise
    $('script, style, noscript, nav, header, footer, svg, iframe, form, button').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim() || url;
    
    // Extract main text
    let text = $('main, article, #content, .content, body').first().text();
    text = text.replace(/\s+/g, ' ').trim();

    // Limit to first 2500 characters per page for efficient LLM context
    const cleanText = text.slice(0, 2500);

    return {
      url,
      title,
      text: cleanText,
      snippet: cleanText.slice(0, 200),
    };
  } catch (err) {
    // Graceful fallback on scrape failure
    return null;
  }
}
