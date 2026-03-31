import { NextRequest, NextResponse } from 'next/server';
import { fetchGlobalHeadlines, fetchCountryHeadlines, fetchStateNews } from '@/lib/newsapi';
import { getMockArticles } from '@/lib/mock-data';
import { COUNTRIES } from '@/data/countries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country')?.toUpperCase();
  const state = searchParams.get('state');

  try {
    let result;
    let countryName = '';

    if (country) {
      countryName = COUNTRIES[country]?.name || country;
    }

    if (state && country) {
      // Tier 3: State/Region
      result = await fetchStateNews(state, countryName);
    } else if (country) {
      // Tier 2: Country Top Headlines
      result = await fetchCountryHeadlines(country);
    } else {
      // Tier 1: Global
      result = await fetchGlobalHeadlines();
    }

    if (result.articles && result.articles.length > 0) {
      // Map NewsAPI structure to our generic format
      const mappedArticles = result.articles.map((a) => ({
        title: a.title,
        description: a.description || '',
        content: a.content || '',
        url: a.url,
        image: a.urlToImage,
        publishedAt: a.publishedAt,
        source: {
          name: a.source.name,
          url: a.url,
        },
      }));

      return NextResponse.json({
        country: country || 'GLOBAL',
        state: state || null,
        countryName: countryName || 'Global',
        articles: mappedArticles,
        source: 'newsapi',
      });
    }

    // Fallback to mock data if no articles or on error
    const mockArticles = country ? getMockArticles(country) : getMockArticles('US');
    return NextResponse.json({
      country: country || 'GLOBAL',
      state: state || null,
      countryName: countryName || 'Global',
      articles: mockArticles,
      source: 'mock',
    });
  } catch (error) {
    console.error('API /news format error:', error);
    return NextResponse.json({ error: 'News API failed' }, { status: 500 });
  }
}
