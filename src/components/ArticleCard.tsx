'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowRightLeft, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { AnalyzedArticle, CounterPerspective } from '@/types';
import TruthMeter from './TruthMeter';

interface ArticleCardProps {
  article: AnalyzedArticle;
  index: number;
  onRippleSelect: (article: AnalyzedArticle) => void;
  selectedCountry: string;
}

export default function ArticleCard({
  article,
  index,
  onRippleSelect,
  selectedCountry,
}: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [counterPerspective, setCounterPerspective] = useState<CounterPerspective | null>(null);
  const [loadingCP, setLoadingCP] = useState(false);
  const [showCP, setShowCP] = useState(false);

  const getSentimentColor = (s: number) => {
    if (s > 0.3) return '#10b981';
    if (s > 0) return '#22d3ee';
    if (s > -0.3) return '#f59e0b';
    return '#ef4444';
  };

  const getSentimentLabel = (s: number) => {
    if (s > 0.3) return 'Positive';
    if (s > 0) return 'Lean Positive';
    if (s > -0.3) return 'Lean Negative';
    return 'Negative';
  };

  const getVeracityColor = (v?: string) => {
    switch (v) {
      case 'VERIFIED': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      case 'SENSATIONALIST': return 'text-rose-400 border-rose-400/30 bg-rose-400/10';
      case 'UNVERIFIED':
      default: return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const fetchCounterPerspective = async () => {
    if (counterPerspective) {
      setShowCP(!showCP);
      return;
    }

    setLoadingCP(true);
    setShowCP(true);
    try {
      const res = await fetch('/api/counter-perspective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: article.title,
          articleSummary: article.summary,
          sourceCountry: selectedCountry,
        }),
      });
      const data = await res.json();
      setCounterPerspective(data);
    } catch {
      setCounterPerspective({
        region: 'Error',
        perspective: 'Failed to load counter-perspective',
        summary: 'Please try again later',
      });
    } finally {
      setLoadingCP(false);
    }
  };

  const isHighReliability = article.reliability_score >= 80;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`relative rounded-lg glass overflow-hidden transition-all duration-300 hover:border-cyan-400/30 ${
        isHighReliability ? 'glow-box-cyan' : ''
      }`}
    >
      {/* Sentiment color bar on left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ background: getSentimentColor(article.sentiment) }}
      />

      <div className="p-4 pl-5">
        {/* Top row: title + truth meter */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Genre tag + Veracity + time */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="genre-tag">{article.genre}</span>
              {article.veracity && (
                <span className={`px-1.5 py-0.5 rounded border text-[0.6rem] font-mono tracking-wider font-semibold ${getVeracityColor(article.veracity)}`}>
                  [{article.veracity}]
                </span>
              )}
              <span className="flex items-center gap-1 text-[0.65rem] text-slate-500">
                <Clock className="w-3 h-3" />
                {formatTime(article.publishedAt)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-100 leading-snug mb-1.5 line-clamp-2">
              {article.title}
            </h3>

            {/* Source */}
            <p className="text-xs text-slate-500 font-mono">
              {article.source.name}
            </p>
          </div>

          {/* Truth Meter */}
          <div className="shrink-0">
            <TruthMeter score={article.reliability_score} size={56} showLabel={false} />
          </div>
        </div>

        {/* Summary */}
        <motion.div className="mt-3" layout>
          <p className="text-xs text-slate-400 leading-relaxed">
            {article.summary}
          </p>
        </motion.div>

        {/* Sentiment + Actions row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
          <div className="flex items-center gap-3">
            {/* Sentiment badge */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: getSentimentColor(article.sentiment) }}
              />
              <span
                className="text-[0.65rem] font-mono tracking-wider"
                style={{ color: getSentimentColor(article.sentiment) }}
              >
                {getSentimentLabel(article.sentiment)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Counter-Perspective toggle */}
            <button
              onClick={fetchCounterPerspective}
              className="btn-cyber flex items-center gap-1.5"
              title="View Counter-Perspective"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Echo</span>
            </button>

            {/* Ripple button */}
            <button
              onClick={() => onRippleSelect(article)}
              className="btn-cyber flex items-center gap-1.5"
              title="Show Geopolitical Ripple"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="7" opacity="0.5" />
                <circle cx="12" cy="12" r="11" opacity="0.25" />
              </svg>
              <span className="hidden sm:inline">Ripple</span>
            </button>

            {/* Expand / External link */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn-cyber p-1.5"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyber p-1.5"
              title="Open Source"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-slate-800/50">
                {article.description && (
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-[0.65rem] text-slate-500 font-mono">
                  <span>Reliability: {article.reliability_score}/100</span>
                  <span>Sentiment: {article.sentiment.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Counter-Perspective Panel */}
        <AnimatePresence>
          {showCP && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 counter-perspective p-3">
                {loadingCP ? (
                  <div className="flex items-center gap-2 text-xs text-amber-400/60">
                    <div className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="font-mono tracking-wider">Analyzing media echo...</span>
                  </div>
                ) : counterPerspective ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase">
                        {counterPerspective.region} Perspective
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/70 leading-relaxed mb-1">
                      {counterPerspective.perspective}
                    </p>
                    <p className="text-[0.65rem] text-slate-500 leading-relaxed">
                      {counterPerspective.summary}
                    </p>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* High-reliability pulse indicator */}
      {isHighReliability && (
        <div className="absolute top-2 right-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
        </div>
      )}
    </motion.div>
  );
}
