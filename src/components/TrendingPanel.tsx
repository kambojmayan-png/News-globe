'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronLeft, ChevronRight, Flame, BarChart3, Globe2, Zap } from 'lucide-react';

const TRENDING_TOPICS = [
  { topic: 'AI Regulation', mentions: 847, change: +12.4, sentiment: 0.15 },
  { topic: 'Interest Rates', mentions: 624, change: -3.2, sentiment: -0.35 },
  { topic: 'Climate Policy', mentions: 531, change: +8.7, sentiment: 0.42 },
  { topic: 'Semiconductor Trade', mentions: 498, change: +22.1, sentiment: -0.12 },
  { topic: 'Space Programs', mentions: 412, change: +5.5, sentiment: 0.78 },
  { topic: 'Cybersecurity', mentions: 389, change: +18.3, sentiment: -0.28 },
  { topic: 'Energy Transition', mentions: 356, change: +6.9, sentiment: 0.55 },
  { topic: 'Digital Currency', mentions: 301, change: -1.4, sentiment: 0.08 },
];

const REGION_ACTIVITY = [
  { region: 'North America', activity: 92, color: '#22d3ee' },
  { region: 'Europe', activity: 87, color: '#06b6d4' },
  { region: 'East Asia', activity: 84, color: '#0891b2' },
  { region: 'Middle East', activity: 76, color: '#f59e0b' },
  { region: 'South Asia', activity: 71, color: '#f97316' },
  { region: 'Latin America', activity: 58, color: '#10b981' },
  { region: 'Africa', activity: 45, color: '#8b5cf6' },
  { region: 'Oceania', activity: 32, color: '#6366f1' },
];

export default function TrendingPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const getSentimentColor = (s: number) => {
    if (s > 0.3) return '#10b981';
    if (s > 0) return '#22d3ee';
    if (s > -0.3) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-20 glass-strong rounded-r-lg flex items-center justify-center border border-l-0 border-cyan-400/10 hover:border-cyan-400/30 transition-colors group"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle Trending Panel"
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-cyan-400/60 group-hover:text-cyan-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-cyan-400/60 group-hover:text-cyan-400" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-16 bottom-12 w-[280px] z-30 glass-strong border-r border-cyan-400/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-cyan-50 tracking-wide">
                  Intelligence Analytics
                </h3>
              </div>
              <p className="text-[0.6rem] font-mono text-slate-500 tracking-wider">
                REAL-TIME SIGNAL MONITORING
              </p>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Trending Topics */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[0.65rem] font-mono tracking-widest text-slate-400 uppercase">
                    Trending Topics
                  </span>
                </div>

                <div className="space-y-2">
                  {TRENDING_TOPICS.map((item, i) => (
                    <motion.div
                      key={item.topic}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <span className="text-[0.6rem] font-mono text-slate-600 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 truncate group-hover:text-cyan-50 transition-colors">
                          {item.topic}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[0.6rem] font-mono text-slate-500">
                            {item.mentions} mentions
                          </span>
                          <span
                            className={`text-[0.6rem] font-mono ${
                              item.change > 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {item.change > 0 ? '↑' : '↓'}
                            {Math.abs(item.change)}%
                          </span>
                        </div>
                      </div>
                      {/* Sentiment dot */}
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: getSentimentColor(item.sentiment) }}
                        title={`Sentiment: ${item.sentiment.toFixed(2)}`}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-4 h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

              {/* Region Activity */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[0.65rem] font-mono tracking-widest text-slate-400 uppercase">
                    Region Activity
                  </span>
                </div>

                <div className="space-y-2.5">
                  {REGION_ACTIVITY.map((item, i) => (
                    <motion.div
                      key={item.region}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[0.65rem] text-slate-400">{item.region}</span>
                        <span className="text-[0.6rem] font-mono text-slate-500">{item.activity}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${item.activity}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-4 h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

              {/* Sentiment Legend */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[0.65rem] font-mono tracking-widest text-slate-400 uppercase">
                    Sentiment Scale
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-slate-400 via-cyan-400 to-emerald-400" />
                </div>
                <div className="flex justify-between text-[0.55rem] font-mono text-slate-500">
                  <span>NEGATIVE</span>
                  <span>NEUTRAL</span>
                  <span>POSITIVE</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
