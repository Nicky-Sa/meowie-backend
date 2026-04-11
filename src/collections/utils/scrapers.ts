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

/**
 * Scrapes a Letterboxd list to extract film titles and years.
 *
 * @param baseUrl The Letterboxd list URL.
 * @param limit Total number of films to fetch.
 * @returns A promise that resolves to an array of { title, year } objects.
 */
export async function scrapeLetterboxdList(
  baseUrl: string,
  limit = 250,
): Promise<{ title: string; year: number }[]> {
  const items: { title: string; year: number }[] = [];
  const filmsPerPage = 100;
  const totalPages = Math.ceil(limit / filmsPerPage);

  try {
    const seen = new Set<string>();
    for (let page = 1; page <= totalPages; page++) {
      const url =
        page === 1 ? baseUrl : `${baseUrl.replace(/\/$/, '')}/page/${page}/`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const html = response.data;
      // Regex to find data-item-name="Title (Year)"
      const regex = /data-item-name="([^"]+)\s\((\d{4})\)"/g;
      let match;

      while ((match = regex.exec(html)) !== null) {
        const title = match[1]
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');

        const yearStr = match[2];
        const uniqueKey = `${title} (${yearStr})`;

        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          items.push({
            title,
            year: parseInt(yearStr, 10),
          });
        }
        if (items.length >= limit) break;
      }

      if (items.length >= limit) break;

      if (page < totalPages) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return items;
  } catch (error) {
    console.error(`Scraping Letterboxd failed (${baseUrl}):`, error.message);
    return items;
  }
}
