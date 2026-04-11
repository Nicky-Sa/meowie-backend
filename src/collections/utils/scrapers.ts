import axios from 'axios';

/**
 * Scrapes the IMDB Top 250 page to extract IMDB IDs.
 *
 * @returns A promise that resolves to an array of IMDB IDs (e.g., ['tt0111161', ...])
 */

/**
 * Scrapes an IMDB chart page to extract IMDB IDs.
 *
 * @param url The IMDB chart URL to scrape.
 * @param limit
 * @returns A promise that resolves to an array of IMDB IDs.
 */
async function scrapeImdbChart(url: string, limit = 250): Promise<string[]> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      timeout: 10000,
    });

    const html = response.data;
    const imdbIds: string[] = [];

    // Strategy A: JSON-LD (Preferred method for modern IMDB)
    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/s,
    );

    if (jsonLdMatch) {
      try {
        const data = JSON.parse(jsonLdMatch[1]);
        // Handle both single object and array responses from IMDB
        const list =
          data.itemListElement ||
          (Array.isArray(data) ? data[0]?.itemListElement : null);

        if (list && Array.isArray(list)) {
          for (const item of list) {
            const url = item.item?.url || item.url || '';
            const idMatch = url.match(/\/title\/(tt\d+)\//);
            if (idMatch) {
              imdbIds.push(idMatch[1]);
            }
          }
        }
      } catch {
        // Log error and fall through to Strategy B
        console.warn(
          `Failed to parse JSON-LD from IMDB (${url}), falling back to regex.`,
        );
      }
    }

    // Strategy B: Regex Fallback (Scan for title links)
    if (imdbIds.length === 0) {
      const regex = /\/title\/(tt\d+)\//g;
      let match;
      const seen = new Set<string>();

      while ((match = regex.exec(html)) !== null) {
        const id = match[1];
        if (!seen.has(id)) {
          imdbIds.push(id);
          seen.add(id);
        }
        if (imdbIds.length >= limit) break;
      }
    }

    return imdbIds.slice(0, limit);
  } catch (error) {
    console.error(`Scraping IMDB failed (${url}): `, error);
    return [];
  }
}

/**
 * Scrapes the IMDB Top 250 movies page.
 */
export async function scrapeImdbTop250(): Promise<string[]> {
  return scrapeImdbChart('https://www.imdb.com/chart/top/');
}

/**
 * Scrapes the IMDB Top 250 TV shows page.
 */
export async function scrapeImdbTop250Series(): Promise<string[]> {
  return scrapeImdbChart('https://www.imdb.com/chart/toptv/');
}
