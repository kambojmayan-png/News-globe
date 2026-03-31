import { AnalyzedArticle, GlobePoint } from '@/types';

/** Generate a unique ID */
function uid(): string {
  return Math.random().toString(36).substring(2, 9);
}

/** Mock analyzed articles for demo mode */
export function getMockArticles(countryCode: string): AnalyzedArticle[] {
  const mockSets: Record<string, AnalyzedArticle[]> = {
    US: [
      {
        id: uid(), title: 'Federal Reserve Signals Potential Rate Adjustment Amid Economic Shifts',
        description: 'The Federal Reserve indicated openness to adjusting interest rates...',
        content: 'Full article content about Fed policy changes...',
        url: 'https://example.com/fed-rates', image: null,
        publishedAt: new Date().toISOString(),
        source: { name: 'Reuters', url: 'https://reuters.com' },
        summary: 'The Federal Reserve has signaled a potential shift in monetary policy, citing evolving economic indicators. Markets responded with moderate volatility as investors reassess portfolios.',
        genre: 'Monetary Policy', reliability_score: 88, sentiment: -0.15,
      },
      {
        id: uid(), title: 'Silicon Valley AI Startup Secures $2B in Series D Funding',
        description: 'A leading AI company has raised substantial funding...',
        content: 'Full content about AI startup funding...',
        url: 'https://example.com/ai-funding', image: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'TechCrunch', url: 'https://techcrunch.com' },
        summary: 'A Silicon Valley AI startup has closed a massive $2B Series D round, signaling continued investor confidence in generative AI. The company plans to expand into enterprise automation.',
        genre: 'DeepTech Venture Capital', reliability_score: 75, sentiment: 0.72,
      },
      {
        id: uid(), title: 'Bipartisan Infrastructure Bill Advances Through Senate Committee',
        description: 'A new infrastructure spending bill gains bipartisan support...',
        content: 'Full content about infrastructure legislation...',
        url: 'https://example.com/infrastructure', image: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'AP News', url: 'https://apnews.com' },
        summary: 'A $450B infrastructure bill has cleared the Senate committee with rare bipartisan support. The legislation focuses on broadband expansion, bridge repair, and EV charging networks.',
        genre: 'Domestic Policy', reliability_score: 92, sentiment: 0.45,
      },
    ],
    GB: [
      {
        id: uid(), title: 'Bank of England Maintains Interest Rate at 5.25%',
        description: 'The BoE holds steady amid inflation concerns...',
        content: 'Full content about BoE decision...',
        url: 'https://example.com/boe', image: null,
        publishedAt: new Date().toISOString(),
        source: { name: 'BBC News', url: 'https://bbc.com' },
        summary: 'The Bank of England held interest rates at 5.25%, citing persistent inflation in the services sector. Governor signaled potential cuts later in the year if data improves.',
        genre: 'Monetary Policy', reliability_score: 94, sentiment: -0.2,
      },
      {
        id: uid(), title: 'London Tech Week Showcases Next-Gen Climate Solutions',
        description: 'Annual tech showcase highlights green innovation...',
        content: 'Full content about London Tech Week...',
        url: 'https://example.com/tech-week', image: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'The Guardian', url: 'https://theguardian.com' },
        summary: 'London Tech Week featured breakthrough climate technologies including direct air capture systems and next-gen battery storage. Over 200 startups presented solutions for net-zero targets.',
        genre: 'Climate Technology', reliability_score: 82, sentiment: 0.68,
      },
    ],
    IN: [
      {
        id: uid(), title: 'India\'s Space Program Achieves Historic Moon Landing Milestone',
        description: 'ISRO successfully completes its latest lunar mission...',
        content: 'Full content about ISRO mission...',
        url: 'https://example.com/isro', image: null,
        publishedAt: new Date().toISOString(),
        source: { name: 'NDTV', url: 'https://ndtv.com' },
        summary: 'ISRO has achieved another historic milestone with its latest lunar mission, successfully deploying a rover near the Moon\'s south pole. The mission aims to study water-ice deposits.',
        genre: 'Space Exploration', reliability_score: 90, sentiment: 0.85,
      },
      {
        id: uid(), title: 'New Delhi Implements Emergency Air Quality Measures',
        description: 'Severe pollution triggers emergency response...',
        content: 'Full content about Delhi air quality...',
        url: 'https://example.com/delhi-air', image: null,
        publishedAt: new Date(Date.now() - 5400000).toISOString(),
        source: { name: 'The Hindu', url: 'https://thehindu.com' },
        summary: 'New Delhi has activated emergency air quality protocols as AQI levels exceeded 400. Schools are closed and construction has been halted as authorities deploy water sprinklers across the capital.',
        genre: 'Environmental Crisis', reliability_score: 86, sentiment: -0.72,
      },
    ],
  };

  // Default mock data for countries without specific mocks
  const defaultMock: AnalyzedArticle[] = [
    {
      id: uid(), title: `Economic Growth Forecasts Updated for ${countryCode}`,
      description: 'International monetary bodies revise growth projections...',
      content: 'Full content about economic forecasts...',
      url: 'https://example.com/growth', image: null,
      publishedAt: new Date().toISOString(),
      source: { name: 'Bloomberg', url: 'https://bloomberg.com' },
      summary: `Economic growth forecasts for ${countryCode} have been revised upward by 0.3%, driven by increased consumer spending and technology sector expansion. Analysts remain cautiously optimistic.`,
      genre: 'Economic Outlook', reliability_score: 79, sentiment: 0.35,
    },
    {
      id: uid(), title: `${countryCode} Announces Major Renewable Energy Initiative`,
      description: 'Government commits to ambitious green energy targets...',
      content: 'Full content about renewable energy plans...',
      url: 'https://example.com/renewables', image: null,
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: { name: 'Al Jazeera', url: 'https://aljazeera.com' },
      summary: `A comprehensive renewable energy initiative has been announced, targeting 60% clean energy by 2035. The plan includes significant investments in solar, wind, and green hydrogen infrastructure.`,
      genre: 'Energy Transition', reliability_score: 73, sentiment: 0.55,
    },
    {
      id: uid(), title: `Diplomatic Talks Progress on Regional Trade Agreement`,
      description: 'Key trade negotiations enter final stages...',
      content: 'Full content about trade negotiations...',
      url: 'https://example.com/trade', image: null,
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      source: { name: 'Financial Times', url: 'https://ft.com' },
      summary: `Diplomatic discussions on a major regional trade agreement have entered final negotiation stages. The deal could reduce tariffs by up to 40% across member states, boosting cross-border commerce.`,
      genre: 'International Trade', reliability_score: 81, sentiment: 0.28,
    },
  ];

  return mockSets[countryCode] || defaultMock;
}

/** Mock breaking news points for globe heatmap */
export const MOCK_BREAKING_NEWS: GlobePoint[] = [
  { lat: 38.9072, lng: -77.0369, intensity: 0.9, label: 'Washington DC', country: 'US' },
  { lat: 51.5074, lng: -0.1278, intensity: 0.85, label: 'London', country: 'GB' },
  { lat: 48.8566, lng: 2.3522, intensity: 0.75, label: 'Paris', country: 'FR' },
  { lat: 35.6762, lng: 139.6503, intensity: 0.82, label: 'Tokyo', country: 'JP' },
  { lat: 28.6139, lng: 77.2090, intensity: 0.88, label: 'New Delhi', country: 'IN' },
  { lat: 39.9042, lng: 116.4074, intensity: 0.78, label: 'Beijing', country: 'CN' },
  { lat: -23.5505, lng: -46.6333, intensity: 0.65, label: 'São Paulo', country: 'BR' },
  { lat: 55.7558, lng: 37.6173, intensity: 0.72, label: 'Moscow', country: 'RU' },
  { lat: 30.0444, lng: 31.2357, intensity: 0.6, label: 'Cairo', country: 'EG' },
  { lat: -33.8688, lng: 151.2093, intensity: 0.55, label: 'Sydney', country: 'AU' },
  { lat: 37.5665, lng: 126.9780, intensity: 0.7, label: 'Seoul', country: 'KR' },
  { lat: 52.5200, lng: 13.4050, intensity: 0.68, label: 'Berlin', country: 'DE' },
];

/** Mock counter-perspective */
export function getMockCounterPerspective(): { region: string; perspective: string; summary: string } {
  const perspectives = [
    {
      region: 'Middle East',
      perspective: 'Regional analysts view this development through the lens of energy market stability and existing geopolitical alliances.',
      summary: 'Gulf state media emphasizes the economic interdependencies at play, noting how this event could shift trade corridor dynamics in the coming quarter.',
    },
    {
      region: 'East Asia',
      perspective: 'Asian markets interpret this event in the context of supply chain resilience and semiconductor trade flows.',
      summary: 'Coverage from East Asian outlets focuses on the downstream effects for manufacturing and technology sectors, with particular attention to rare earth mineral access.',
    },
    {
      region: 'Latin America',
      perspective: 'South American analysts contextualize this within broader commodity price fluctuations and regional cooperation frameworks.',
      summary: 'Latin American media highlights the potential impact on agricultural exports and raw material pricing, drawing parallels to previous economic cycles.',
    },
  ];
  return perspectives[Math.floor(Math.random() * perspectives.length)];
}

/** Mock ripple effect data */
export function getMockRippleEffect(countryCode: string): {
  affectedCountries: { code: string; name: string; lat: number; lng: number; impact: string }[];
} {
  const effects: Record<string, { code: string; name: string; lat: number; lng: number; impact: string }[]> = {
    US: [
      { code: 'CA', name: 'Canada', lat: 56.13, lng: -106.35, impact: 'Trade policy adjustments expected due to economic interdependence' },
      { code: 'MX', name: 'Mexico', lat: 23.63, lng: -102.55, impact: 'Supply chain and labor market effects as a direct neighbor' },
    ],
    GB: [
      { code: 'IE', name: 'Ireland', lat: 53.14, lng: -7.69, impact: 'Cross-border economic effects through shared market ties' },
      { code: 'FR', name: 'France', lat: 46.23, lng: 2.21, impact: 'EU partnership dynamics and Channel corridor impacts' },
    ],
    IN: [
      { code: 'PK', name: 'Pakistan', lat: 30.38, lng: 69.35, impact: 'Regional security calculus shifts with strategic developments' },
      { code: 'BD', name: 'Bangladesh', lat: 23.68, lng: 90.36, impact: 'Shared economic corridors and labor market dependencies' },
    ],
  };

  return {
    affectedCountries: effects[countryCode] || [
      { code: 'US', name: 'United States', lat: 39.83, lng: -98.58, impact: 'Global hegemon monitors all significant geopolitical shifts' },
      { code: 'CN', name: 'China', lat: 35.86, lng: 104.20, impact: 'Strategic interest in expanding sphere of influence in the region' },
    ],
  };
}
