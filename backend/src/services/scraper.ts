import { isValidUrl, formatUrl } from '../utils';

export interface ScrapeResult {
  success: boolean;
  url: string;
  title?: string;
  description?: string;
  content?: string;
  errorMessage?: string;
}

export async function scrapeBusinessUrl(rawUrl: string): Promise<ScrapeResult> {
  const url = formatUrl(rawUrl);

  if (!isValidUrl(url)) {
    return {
      success: false,
      url,
      errorMessage: 'Please enter a valid URL like https://example.com',
    };
  }

  const firecrawlKey = process.env.FIRECRAWL_API_KEY;

  if (firecrawlKey && firecrawlKey.trim() !== '') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firecrawlKey.trim()}`,
        },
        body: JSON.stringify({
          url,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const content = data.data?.markdown || data.data?.content || data.data?.text;
        const title = data.data?.metadata?.title || '';
        const description = data.data?.metadata?.description || '';

        if (content && content.trim().length > 20) {
          return {
            success: true,
            url,
            title,
            description,
            content: content.slice(0, 5000),
          };
        }
      }
    } catch (error) {
      console.warn('Firecrawl API request failed, falling back to direct fetch:', error);
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        url,
        errorMessage: "We couldn't fetch details from this URL. Please try again or enter details manually.",
      };
    }

    const html = await response.text();
    if (!html || html.trim().length < 50) {
      return {
        success: false,
        url,
        errorMessage: "We couldn't find readable content at this URL. Please enter details manually.",
      };
    }

    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const metaTitleMatch = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

    const extractedTitle = ogTitleMatch?.[1] || metaTitleMatch?.[1] || titleTagMatch?.[1] || h1Match?.[1] || '';

    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const twDescMatch = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i);
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);

    const extractedDesc = ogDescMatch?.[1] || metaDescMatch?.[1] || twDescMatch?.[1] || '';
    const keywords = keywordsMatch?.[1] || '';

    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);

    const fullContent = [
      keywords ? `Keywords: ${keywords}` : '',
      extractedDesc ? `Description: ${extractedDesc}` : '',
      cleanText,
    ].filter(Boolean).join('\n\n');

    return {
      success: true,
      url,
      title: extractedTitle.trim(),
      description: extractedDesc.trim(),
      content: fullContent,
    };
  } catch (error: any) {
    console.error('Scraping error:', error);
    return {
      success: false,
      url,
      errorMessage: "We couldn't fetch details from this URL. Please try again or enter details manually.",
    };
  }
}
