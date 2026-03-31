'use client';

import { useState, useCallback, useEffect } from 'react';
import Header from '@/components/Header';
import GlobeView from '@/components/GlobeView';
import NewsSidebar from '@/components/NewsSidebar';
import BootSequence from '@/components/BootSequence';
import BottomStatusBar from '@/components/BottomStatusBar';
import SearchOverlay from '@/components/SearchOverlay';
import TrendingPanel from '@/components/TrendingPanel';
import HUD from '@/components/HUD';
import BreakingNewsBanner from '@/components/BreakingNewsBanner';
import { AnalyzedArticle, GlobeArc } from '@/types';
import { COUNTRIES } from '@/data/countries';

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [articles, setArticles] = useState<AnalyzedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);
  const [rippleArcs, setRippleArcs] = useState<GlobeArc[]>([]);
  const [booted, setBooted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const averageSentiment =
    articles.length > 0
      ? articles.reduce((sum, a) => sum + a.sentiment, 0) / articles.length
      : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to toggle search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      // Escape to close search
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
      // Skip boot sequence on any key press
      if (!booted) {
        setBooted(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [booted]);

  const fetchNews = async (countryCode: string, stateName?: string | null) => {
    setIsLoading(true);
    setRippleArcs([]);
    try {
      let url = `/api/news?country=${countryCode}`;
      if (stateName) {
        url += `&state=${encodeURIComponent(stateName)}`;
      }
      
      const newsRes = await fetch(url);
      const newsData = await newsRes.json();

      if (newsData.source === 'mock') {
        setArticles(newsData.articles);
        setAiPowered(false);
      } else {
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articles: newsData.articles }),
        });
        const analyzeData = await analyzeRes.json();
        setArticles(analyzeData.articles);
        setAiPowered(analyzeData.aiPowered || false);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryClick = useCallback(async (countryCode: string, countryName: string) => {
    setSelectedCountry(countryCode);
    setSelectedCountryName(countryName);
    setSelectedState(null); // Clear any previously selected state
    setSidebarOpen(true);
    
    await fetchNews(countryCode);
  }, []);

  const handleStateClick = useCallback(async (stateName: string, countryCode: string, countryName: string) => {
    setSelectedCountry(countryCode);
    setSelectedCountryName(countryName);
    setSelectedState(stateName);
    setSidebarOpen(true);

    await fetchNews(countryCode, stateName);
  }, []);

  const handleRippleSelect = useCallback(
    async (article: AnalyzedArticle) => {
      if (!selectedCountry) return;

      try {
        const res = await fetch('/api/ripple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: selectedCountry,
            articleTitle: article.title,
            articleSummary: article.summary,
          }),
        });
        const data = await res.json();

        if (data.affectedCountries) {
          const sourceCountry = COUNTRIES[selectedCountry];
          if (!sourceCountry) return;

          const arcs: GlobeArc[] = data.affectedCountries.map(
            (c: { lat: number; lng: number; name: string; impact: string }) => ({
              startLat: sourceCountry.lat,
              startLng: sourceCountry.lng,
              endLat: c.lat,
              endLng: c.lng,
              color: ['rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0.3)'],
              label: `${c.name}: ${c.impact}`,
            })
          );

          setRippleArcs(arcs);
          setTimeout(() => setRippleArcs([]), 10000);
        }
      } catch (error) {
        console.error('Error fetching ripple:', error);
      }
    },
    [selectedCountry]
  );

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  const handleSearchSelectCountry = useCallback(
    (countryCode: string, countryName: string) => {
      handleCountryClick(countryCode, countryName);
    },
    [handleCountryClick]
  );

  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const locationDisplayName = selectedState ? `${selectedState}, ${selectedCountryName}` : selectedCountryName;

  return (
    <>
      {/* Boot Sequence */}
      {!booted && <BootSequence onComplete={handleBootComplete} />}

      <main className="relative w-full h-screen bg-[#020617] cyber-grid overflow-hidden">
        {/* Header */}
        <Header
          averageSentiment={averageSentiment}
          isLoading={isLoading}
          selectedCountry={locationDisplayName || null}
          articleCount={articles.length}
          aiPowered={aiPowered}
          onSearchOpen={handleOpenSearch}
        />

        {/* Breaking News Banner */}
        <BreakingNewsBanner />

        {/* Globe takes full screen */}
        <div className="absolute inset-0">
          <GlobeView
            onCountryClick={handleCountryClick}
            onStateClick={handleStateClick}
            averageSentiment={averageSentiment}
            rippleArcs={rippleArcs}
            selectedCountry={selectedCountry}
          />
        </div>

        {/* HUD Overlay */}
        <HUD
          selectedCountry={selectedCountry}
          selectedCountryName={locationDisplayName}
          isLoading={isLoading}
          articleCount={articles.length}
          averageSentiment={averageSentiment}
        />

        {/* News Sidebar */}
        <NewsSidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          countryName={locationDisplayName}
          countryCode={selectedCountry || ''}
          articles={articles}
          isLoading={isLoading}
          onRippleSelect={handleRippleSelect}
          aiPowered={aiPowered}
        />

        {/* Trending Panel (left side) */}
        <TrendingPanel />

        {/* Search Overlay */}
        <SearchOverlay
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelectCountry={handleSearchSelectCountry}
        />

        {/* Bottom Status Bar */}
        <BottomStatusBar
          aiPowered={aiPowered}
          isLoading={isLoading}
          articleCount={articles.length}
        />

        {/* Search hint - shown when no country selected */}
        {!selectedCountry && booted && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 pointer-events-none z-20">
            <div className="flex items-center gap-2 text-[0.65rem] font-mono text-slate-600">
              <span className="px-1.5 py-0.5 rounded border border-slate-700/50 bg-slate-800/30 text-slate-500">
                Ctrl+K
              </span>
              <span>to search countries</span>
            </div>
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none opacity-30 z-10">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L30 0 L30 2 L2 2 L2 30 L0 30 Z" fill="#22d3ee" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-30 rotate-90 z-10">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L30 0 L30 2 L2 2 L2 30 L0 30 Z" fill="#22d3ee" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none opacity-30 -rotate-90 z-10">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L30 0 L30 2 L2 2 L2 30 L0 30 Z" fill="#22d3ee" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none opacity-30 rotate-180 z-10">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L30 0 L30 2 L2 2 L2 30 L0 30 Z" fill="#22d3ee" opacity="0.5" />
          </svg>
        </div>
      </main>
    </>
  );
}
