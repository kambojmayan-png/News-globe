import { GoogleGenAI } from '@google/genai';

/** Get Gemini client singleton */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Enhanced AI analysis per Integration.md spec:
 * - TL;DR summary
 * - Veracity Check: [VERIFIED], [UNVERIFIED], or [SENSATIONALIST]
 * - Reliability Score: 0-100%
 * - Precise Genre categorization
 * - Sentiment analysis
 */
export interface AIAnalysis {
  summary: string;
  veracity: 'VERIFIED' | 'UNVERIFIED' | 'SENSATIONALIST';
  genre: string;
  reliability_score: number;
  sentiment: number;
}

export async function analyzeArticles(
  articles: { title: string; description: string; content: string; source: { name: string } }[]
): Promise<AIAnalysis[]> {
  const client = getGeminiClient();
  if (!client) return [];

  const prompt = `You are an elite news intelligence analyst performing verification and analysis on breaking news. For each article, perform a thorough assessment.

Return a JSON array with one object per article. Each object MUST have:

- "summary": A concise 2-sentence executive TL;DR of the article's key claims
- "veracity": Assess the article's truthfulness. Cross-reference the headline and claims against your knowledge. Return one of:
  - "VERIFIED" — if the claim is factually supported and the source is reputable
  - "UNVERIFIED" — if the claim cannot be confirmed or lacks corroboration
  - "SENSATIONALIST" — if the headline uses exaggerated or misleading language
- "genre": A precise, specific category (e.g., "Agricultural Policy", "Local Infrastructure", "Semiconductor Trade", "Monetary Policy", "State-Level Tech", "Climate Regulation", "Geopolitical Tension", "DeepTech R&D", "Public Health")
- "reliability_score": A number 0-100 based on:
  • Source reputation (well-known outlets score higher)
  • Linguistic neutrality (less bias = higher score)
  • Claim specificity (concrete facts over vague statements)
- "sentiment": A number from -1 (very negative) to 1 (very positive)

Articles to analyze:
${articles.map((a, i) => `[${i}] Title: ${a.title}\nSource: ${a.source.name}\nDescription: ${a.description || 'N/A'}\nContent: ${a.content?.substring(0, 500) || 'N/A'}`).join('\n\n')}

Respond ONLY with a valid JSON array. No markdown, no code fences, just the JSON array.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '[]';
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return [];
  }
}

/**
 * Analyze trending topics for a country/state using AI
 * Returns top trending themes and sentiment breakdown
 */
export interface TrendingInsight {
  topic: string;
  mentions: number;
  sentiment: number;
  veracity_mix: string; // e.g. "70% Verified, 20% Unverified, 10% Sensationalist"
  summary: string;
}

export async function getTrendingInsights(
  articles: { title: string; description: string; source: { name: string } }[],
  location: string
): Promise<TrendingInsight[]> {
  const client = getGeminiClient();
  if (!client) return [];

  const prompt = `You are a news intelligence analyst. Analyze these articles from ${location} and identify the top 5 trending themes/topics.

Articles:
${articles.map((a, i) => `[${i}] "${a.title}" — ${a.source.name}: ${a.description || 'N/A'}`).join('\n')}

Return a JSON array of 5 objects, each with:
- "topic": Concise topic name (2-4 words)
- "mentions": Estimated mention count across global media (realistic number)
- "sentiment": Average sentiment -1 to 1
- "veracity_mix": Estimated breakdown like "70% Verified, 20% Unverified, 10% Sensationalist"
- "summary": One sentence describing why this topic is trending in ${location}

Respond ONLY with a valid JSON array. No markdown, no code fences.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '[]';
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini trending error:', error);
    return [];
  }
}

/** Get geopolitical ripple effects via Gemini */
export async function getRippleEffects(
  articleTitle: string,
  articleSummary: string,
  countryName: string
): Promise<{ code: string; name: string; impact: string }[]> {
  const client = getGeminiClient();
  if (!client) return [];

  const prompt = `You are a geopolitical analyst. Given this news story from ${countryName}:
Title: ${articleTitle}
Summary: ${articleSummary}

Identify exactly 2 neighboring or closely related countries that would be most affected by this story. Return a JSON array with objects containing:
- "code": ISO 3166-1 alpha-2 country code
- "name": Country name
- "impact": One sentence describing the geopolitical impact

Respond ONLY with a valid JSON array. No markdown, no code fences.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '[]';
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini ripple error:', error);
    return [];
  }
}

/** Get counter-perspective analysis via Gemini */
export async function getCounterPerspective(
  articleTitle: string,
  articleSummary: string,
  sourceCountry: string
): Promise<{ region: string; perspective: string; summary: string }> {
  const client = getGeminiClient();
  if (!client) {
    return { region: 'N/A', perspective: 'AI analysis unavailable', summary: 'No API key configured' };
  }

  const prompt = `You are a global media analyst. Given this story from ${sourceCountry}:
Title: ${articleTitle}
Summary: ${articleSummary}

Provide a counter-perspective from a different global region. Return a JSON object with:
- "region": The region providing the alternative perspective (e.g., "East Asia", "Middle East", "Latin America")
- "perspective": 1-2 sentences on how that region's media frames the same event differently
- "summary": 2-sentence summary of the alternative viewpoint

Respond ONLY with a valid JSON object. No markdown, no code fences.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '{}';
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini counter-perspective error:', error);
    return { region: 'Error', perspective: 'Analysis failed', summary: 'Unable to generate counter-perspective' };
  }
}
