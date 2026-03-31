'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

const BREAKING_NEWS = [
  {
    id: 1,
    headline: 'URGENT: Major cybersecurity breach reported across European banking infrastructure',
    region: 'EUROPE',
    severity: 'critical',
  },
  {
    id: 2,
    headline: 'BREAKING: G7 announces coordinated response to semiconductor supply constraints',
    region: 'GLOBAL',
    severity: 'high',
  },
  {
    id: 3,
    headline: 'ALERT: Unprecedented solar storm activity detected — communications impact expected',
    region: 'GLOBAL',
    severity: 'critical',
  },
  {
    id: 4,
    headline: 'DEVELOPING: Major trade agreement reached between Pacific Rim nations',
    region: 'ASIA-PACIFIC',
    severity: 'medium',
  },
];

export default function BreakingNewsBanner() {
  const [currentAlert, setCurrentAlert] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show breaking news banner after a delay
  useEffect(() => {
    if (dismissed) return;
    
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 8000); // Show after 8 seconds

    return () => clearTimeout(showTimer);
  }, [dismissed]);

  // Cycle through alerts
  useEffect(() => {
    if (!visible || dismissed) return;

    const cycleTimer = setInterval(() => {
      setCurrentAlert((prev) => (prev + 1) % BREAKING_NEWS.length);
    }, 6000);

    return () => clearInterval(cycleTimer);
  }, [visible, dismissed]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setVisible(false);
  }, []);

  const alert = BREAKING_NEWS[currentAlert];
  const severityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    critical: {
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#fca5a5',
      glow: 'rgba(239, 68, 68, 0.15)',
    },
    high: {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#fcd34d',
      glow: 'rgba(245, 158, 11, 0.15)',
    },
    medium: {
      bg: 'rgba(34, 211, 238, 0.08)',
      border: 'rgba(34, 211, 238, 0.3)',
      text: '#67e8f9',
      glow: 'rgba(34, 211, 238, 0.15)',
    },
  };

  const colors = severityColors[alert.severity] || severityColors.medium;

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-[52px] left-1/2 -translate-x-1/2 z-35 w-full max-w-2xl px-4"
        >
          <div
            className="relative rounded-lg overflow-hidden backdrop-blur-xl"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 0 30px ${colors.glow}, inset 0 0 30px ${colors.glow}`,
            }}
          >
            {/* Animated top border */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: colors.border }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            <div className="flex items-center gap-3 px-4 py-2.5">
              {/* Alert icon */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle
                  className="w-4 h-4 shrink-0"
                  style={{ color: colors.text }}
                />
              </motion.div>

              {/* Region badge */}
              <span
                className="text-[0.55rem] font-mono font-bold tracking-widest shrink-0 px-1.5 py-0.5 rounded"
                style={{
                  color: colors.text,
                  background: `${colors.bg}`,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {alert.region}
              </span>

              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-medium flex-1 truncate"
                  style={{ color: colors.text }}
                >
                  {alert.headline}
                </motion.p>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="flex gap-1 shrink-0">
                {BREAKING_NEWS.map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: i === currentAlert ? colors.text : `${colors.border}`,
                    }}
                  />
                ))}
              </div>

              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                className="p-1 rounded hover:bg-white/5 transition-colors shrink-0 pointer-events-auto"
              >
                <X className="w-3.5 h-3.5" style={{ color: colors.text }} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
