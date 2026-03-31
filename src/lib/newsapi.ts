/**
 * NewsAPI.org client — multi-level news fetching (Global, Country, State/Region)
 * Uses the /top-headlines and /everything endpoints per Integration.md spec
 */

const NEWSAPI_BASE = 'https://newsapi.org/v2';

interface NewsAPISource {
  id: string | null;
  name: string;
}

export interface NewsAPIArticle {
  source: NewsAPISource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

function getApiKey(): string | null {
  return process.env.NEWS_API_KEY || null;
}

/**
 * GLOBAL TIER: Fetch top headlines with no country filter
 */
export async function fetchGlobalHeadlines(
  category?: string,
  pageSize: number = 10
): Promise<NewsAPIResponse> {
  const apiKey = getApiKey();
  if (!apiKey) return { status: 'error', totalResults: 0, articles: [] };

  const params = new URLSearchParams({
    apiKey,
    language: 'en',
    pageSize: String(pageSize),
  });
  if (category) params.set('category', category);

  const url = `${NEWSAPI_BASE}/top-headlines?${params.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.error(`NewsAPI global error: ${res.status} ${res.statusText}`);
      return { status: 'error', totalResults: 0, articles: [] };
    }
    const data: NewsAPIResponse = await res.json();
    // Filter out "[Removed]" placeholder articles
    data.articles = data.articles.filter(
      (a) => a.title !== '[Removed]' && a.description !== '[Removed]'
    );
    return data;
  } catch (error) {
    console.error('NewsAPI global fetch error:', error);
    return { status: 'error', totalResults: 0, articles: [] };
  }
}

/**
 * COUNTRY TIER: Fetch top headlines by ISO 2-letter country code
 */
export async function fetchCountryHeadlines(
  countryCode: string,
  category?: string,
  pageSize: number = 10
): Promise<NewsAPIResponse> {
  const apiKey = getApiKey();
  if (!apiKey) return { status: 'error', totalResults: 0, articles: [] };

  const params = new URLSearchParams({
    apiKey,
    country: countryCode.toLowerCase(),
    pageSize: String(pageSize),
  });
  if (category) params.set('category', category);

  const url = `${NEWSAPI_BASE}/top-headlines?${params.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.error(`NewsAPI country error: ${res.status} ${res.statusText}`);
      return { status: 'error', totalResults: 0, articles: [] };
    }
    const data: NewsAPIResponse = await res.json();
    data.articles = data.articles.filter(
      (a) => a.title !== '[Removed]' && a.description !== '[Removed]'
    );
    return data;
  } catch (error) {
    console.error('NewsAPI country fetch error:', error);
    return { status: 'error', totalResults: 0, articles: [] };
  }
}

/**
 * STATE/REGION TIER: Use /everything endpoint with query = "{State} {Country}"
 * Since NewsAPI has no native state parameter, this uses search.
 */
export async function fetchStateNews(
  stateName: string,
  countryName: string,
  sortBy: 'publishedAt' | 'popularity' | 'relevancy' = 'publishedAt',
  pageSize: number = 10
): Promise<NewsAPIResponse> {
  const apiKey = getApiKey();
  if (!apiKey) return { status: 'error', totalResults: 0, articles: [] };

  const query = `${stateName} ${countryName}`;
  const params = new URLSearchParams({
    apiKey,
    q: query,
    sortBy,
    language: 'en',
    pageSize: String(pageSize),
  });

  const url = `${NEWSAPI_BASE}/everything?${params.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.error(`NewsAPI state error: ${res.status} ${res.statusText}`);
      return { status: 'error', totalResults: 0, articles: [] };
    }
    const data: NewsAPIResponse = await res.json();
    data.articles = data.articles.filter(
      (a) => a.title !== '[Removed]' && a.description !== '[Removed]'
    );
    return data;
  } catch (error) {
    console.error('NewsAPI state fetch error:', error);
    return { status: 'error', totalResults: 0, articles: [] };
  }
}
