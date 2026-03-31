'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Newspaper, TrendingUp, MapPin } from 'lucide-react';
import { AnalyzedArticle } from '@/types';
import ArticleCard from './ArticleCard';
import { SidebarSkeleton } from './LoadingStates';

interface NewsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  countryName: string;
  countryCode: string;
  articles: AnalyzedArticle[];
  isLoading: boolean;
  onRippleSelect: (article: AnalyzedArticle) => void;
  aiPowered: boolean;
}

export default function NewsSidebar({
  isOpen,
  onClose,
  countryName,
  countryCode,
  articles,
  isLoading,
  onRippleSelect,
  aiPowered,
}: NewsSidebarProps) {
  const avgSentiment =
    articles.length > 0
      ? articles.reduce((sum, a) => sum + a.sentiment, 0) / articles.length
      : 0;

  const avgReliability =
    articles.length > 0
      ? Math.round(articles.reduce((sum, a) => sum + a.reliability_score, 0) / articles.length)
      : 0;

  const getSentimentColor = (s: number) => {
    if (s > 0.3) return '#10b981';
    if (s > 0) return '#22d3ee';
    if (s > -0.3) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          id="news-sidebar"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] md:w-[460px] z-40 glass-strong flex flex-col scan-overlay"
        >
          {/* Header */}
          <div className="flex-shrink-0 p-5 border-b border-slate-800/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg glass flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-cyan-50 tracking-wide">
                    {countryName}
                  </h2>
                  <p className="text-xs font-mono text-slate-500 tracking-wider">
                    {countryCode} · {articles.length} INTEL REPORTS
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-slate-200"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats bar */}
            {articles.length > 0 && (
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Avg reliability */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/50 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-400">Avg Trust:</span>
                  <span className={`font-mono font-semibold ${
                    avgReliability >= 67 ? 'text-cyan-400' :
                    avgReliability >= 34 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {avgReliability}
                  </span>
                </div>

                {/* Avg sentiment */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/50 text-xs">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: getSentimentColor(avgSentiment) }}
                  />
                  <span className="text-slate-400">Mood:</span>
                  <span
                    className="font-mono font-semibold"
                    style={{ color: getSentimentColor(avgSentiment) }}
                  >
                    {avgSentiment > 0 ? '+' : ''}{avgSentiment.toFixed(2)}
                  </span>
                </div>

                {/* AI badge */}
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[0.6rem] font-mono tracking-wider ${
                  aiPowered
                    ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                    : 'text-slate-500 bg-slate-800/50 border border-slate-700/50'
                }`}>
                  <Newspaper className="w-3 h-3" />
                  {aiPowered ? 'AI' : 'DEMO'}
                </div>
              </motion.div>
            )}
          </div>

          {/* Scrollable article list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <SidebarSkeleton />
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <Newspaper className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-500 text-sm mb-1">No intelligence reports found</p>
                <p className="text-slate-600 text-xs">
                  Click a country on the globe to load news
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {articles.map((article, i) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    index={i}
                    onRippleSelect={onRippleSelect}
                    selectedCountry={countryCode}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer gradient */}
          <div className="flex-shrink-0 h-6 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
