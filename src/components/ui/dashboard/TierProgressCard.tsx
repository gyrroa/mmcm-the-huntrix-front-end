'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Award, Diamond, X } from 'lucide-react';

/* -------------------- Types -------------------- */
type TierKey = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

type Tier = {
  key: TierKey;
  minPoints: number;
  maxPoints?: number;
  minNetwork: number;
  maxNetwork?: number;
  perks: { listingsPerMonth: string; bonusPct: number; spotlight?: boolean };
};

export type PointsBreakdownItem = { label: string; value: number; hint?: string };

export interface TierProgressCardProps {
  totalPoints: number;
  networkSize: number;
  breakdown?: PointsBreakdownItem[];
  className?: string;
}

/* -------------------- Constants -------------------- */
const TIERS: Tier[] = [
  { key: 'Bronze', minPoints: 0, maxPoints: 200, minNetwork: 0, maxNetwork: 10, perks: { listingsPerMonth: '0', bonusPct: 0 } },
  { key: 'Silver', minPoints: 201, maxPoints: 500, minNetwork: 11, maxNetwork: 50, perks: { listingsPerMonth: '1', bonusPct: 5 } },
  { key: 'Gold', minPoints: 501, maxPoints: 1000, minNetwork: 51, maxNetwork: 100, perks: { listingsPerMonth: '5', bonusPct: 10 } },
  { key: 'Platinum', minPoints: 1001, maxPoints: 2000, minNetwork: 101, maxNetwork: 200, perks: { listingsPerMonth: '10', bonusPct: 15 } },
  { key: 'Diamond', minPoints: 2001, minNetwork: 201, perks: { listingsPerMonth: 'Unlimited', bonusPct: 20, spotlight: true } },
];

/* -------------------- Tier theming -------------------- */
const TIER_THEME: Record<TierKey, {
  chipBg: string; chipBorder: string; chipText: string;
  gradFrom: string; gradTo: string;
  softBg: string; softBorder: string;
}> = {
  Bronze: { chipBg: '#FFF1E6', chipBorder: '#F8D9C0', chipText: '#965A2C', gradFrom: '#F4B183', gradTo: '#C0814C', softBg: '#FFF7F0', softBorder: '#F3E2D6' },

  Silver: {
    // cool steel gray
    chipBg: '#F3F5F8',
    chipBorder: '#DCE3EC',
    chipText: '#586272',
    gradFrom: '#E4E8EE',
    gradTo: '#B6BEC9',
    softBg: '#F7FAFD',
    softBorder: '#E6ECF3',
  },
  Gold: { chipBg: '#FFF6E0', chipBorder: '#FFE7B8', chipText: '#8C5A00', gradFrom: '#FFD36E', gradTo: '#F4B400', softBg: '#FFF9ED', softBorder: '#FFECC9' },



  Platinum: {
    // classic platinum (near #E5E4E2), neutral-warm
    chipBg: '#F5F4F2',
    chipBorder: '#E5E4E2', // "platinum"
    chipText: '#4F5560',
    gradFrom: '#F1F1EF',
    gradTo: '#CFCFCC',
    softBg: '#FAF9F7',
    softBorder: '#E8E7E2',
  },
  Diamond: { chipBg: '#E7F2FF', chipBorder: '#CFE3FF', chipText: '#0E6BC5', gradFrom: '#71AAF9', gradTo: '#3871C1', softBg: '#F1F7FF', softBorder: '#DCEAFF' },
};

const SHINY: Record<TierKey, boolean> = {
  Bronze: false, Silver: false, Gold: true, Platinum: true, Diamond: true
};

/* -------------------- Utils -------------------- */
const tiersOrder: TierKey[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
const fmt = (n: number) => n.toLocaleString();

// Helpers: index by single dimension
const idxBy = (value: number, key: 'minPoints' | 'minNetwork') =>
  TIERS.reduce((acc, t, i) => (value >= t[key] ? i : acc), 0);

// Points-led tier: display tier by points; track network eligibility separately
function getTierPointsLed(points: number, size: number) {
  const pIdx = idxBy(points, 'minPoints');      // index by points
  const nIdx = idxBy(size, 'minNetwork');     // index by network
  const current = TIERS[pIdx];
  const next = TIERS[pIdx + 1];
  const eligibleForCurrent = size >= current.minNetwork;
  const membersToQualifyCurrent = Math.max(0, current.minNetwork - size);
  const membersToNext = next ? Math.max(0, next.minNetwork - size) : 0;
  const pointsToNext = next ? Math.max(0, next.minPoints - points) : 0;

  return {
    current, next, pIdx, nIdx,
    eligibleForCurrent, membersToQualifyCurrent,
    membersToNext, pointsToNext,
  };
}

/* -------------------- Subcomponents -------------------- */
const TierBadge: React.FC<{
  label: TierKey;
  active?: boolean;
  done?: boolean;
  theme: typeof TIER_THEME[TierKey];
}> = ({ label, active, done, theme }) => {
  // active  -> strong chip color
  // done    -> soft chip color (per tier)
  // default -> grey
  const base =
    'px-3 py-1.5 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5';

  if (active) {
    return (
      <div
        className={base}
        style={{ background: theme.chipBg, color: theme.chipText, borderColor: theme.chipBorder }}
      >
        {label}
      </div>
    );
  }

  if (done) {
    return (
      <div
        className={base}
        style={{ background: theme.softBg, color: theme.chipText, borderColor: theme.softBorder }}
      >
        {label}
      </div>
    );
  }

  // not reached (grey)
  return (
    <div className={`${base} bg-white text-[#5C7188] border-[#E8EEF8]`}>
      {label}
    </div>
  );
};
const CircularProgress: React.FC<{
  percent: number; label: string; valueText: string; gradFrom: string; gradTo: string;
}> = ({ percent, label, valueText, gradFrom, gradTo }) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const angle = clamped * 3.6;
  const ring = `conic-gradient(${gradFrom} 0deg, ${gradTo} ${angle}deg, #E7EEF8 ${angle}deg 360deg)`;
  return (
    <div className="flex flex-col items-center gap-2">{/* added small gap */}
      <div className="w-28 h-28 rounded-full p-[10px] shadow-inner" style={{ background: ring }} role="img" aria-label={`${label} progress ${Math.round(clamped)}%`}>
        <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-[18px] font-bold text-[#002353] leading-none">{Math.round(clamped)}%</span>
          <span className="text-[11px] text-[#5C7188] mt-1">{label}</span>
        </div>
      </div>
      <span className="text-xs text-[#5C7188]">{valueText}</span>
    </div>
  );
};

/* -------------------- Perks Modal (Stable Mobile + 1-row Desktop) -------------------- */
function useEsc(close: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);
}

const TierPerksModal: React.FC<{
  open: boolean; onClose: () => void; current: Tier; next?: Tier;
}> = ({ open, onClose, current, next }) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  useEsc(onClose, open);

  useEffect(() => {
    if (open && closeButtonRef.current) closeButtonRef.current.focus();
  }, [open]);

  const onOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="
            fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm
            flex items-center justify-center
            p-4 sm:p-6
          "
          onClick={onOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tier-perks-title"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="
              w-full max-w-[1320px]
              rounded-xl sm:rounded-2xl bg-white border shadow-xl
              max-h-[85vh] overflow-hidden
              flex flex-col
            "
            style={{ borderColor: '#E8EEF8' }}
            initial={{ y: 12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E8EEF8]">
              <div>
                <h3 id="tier-perks-title" className="text-lg font-semibold text-[#002353]">Tier Perks</h3>
                <p className="text-sm text-[#5C7188]">All tiers at a glance — your current tier is highlighted.</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-[#5C7188] hover:bg[#F5F8FF] focus:outline-none focus:ring-2 focus:ring-[#3871C1]/40"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              {/* Mobile: vertical stack.  Desktop: fixed 5 columns (one row). */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5 sm:gap-6">
                {TIERS.map((t) => {
                  const theme = TIER_THEME[t.key];
                  const isCurrent = t.key === current.key;
                  const isNext = next && t.key === next.key;

                  return (
                    <div
                      key={t.key}
                      className={[
                        'relative rounded-xl border p-4 min-h-[148px] min-w-0',
                        'overflow-hidden transition-shadow',
                        isCurrent
                          ? 'shadow-[0_12px_24px_rgba(0,0,0,0.08)]'
                          : 'hover:shadow-[0_8px_18px_rgba(0,0,0,0.06)]',
                      ].join(' ')}
                      style={{ background: theme.softBg, borderColor: theme.softBorder }}
                    >
                      {/* SHINE OVERLAY */}
                      {SHINY[t.key] && !prefersReducedMotion && (
                        <div aria-hidden className="pointer-events-none absolute inset-0">
                          <motion.span
                            className="absolute inset-y-0 left-0 w-[60%]"
                            style={{
                              background:
                                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%)',
                              opacity: 0.35,
                              willChange: 'transform',
                            }}
                            initial={{ x: '-120%', skewX: -12 }}
                            animate={{ x: '120%', skewX: -12 }}
                            transition={{ duration: 2.2, ease: 'linear', repeat: Infinity }}
                          />
                        </div>
                      )}

                      {/* Header row: title + chips */}
                      <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          {t.key === 'Diamond' ? (
                            <Diamond className="w-4 h-4 text-[#3871C1]" />
                          ) : (
                            <Award className="w-4 h-4 text-[#3871C1]" />
                          )}
                          <div className="font-semibold text-[#002353]">{t.key}</div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {isCurrent && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border"
                              style={{ background: theme.chipBg, color: theme.chipText, borderColor: theme.chipBorder }}
                            >
                              Current
                            </span>
                          )}
                          {isNext && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border border-[#CFE0FF] text-[#3871C1] bg-[#F0F5FF]">
                              Next
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Accent bar */}
                      <div
                        className="mt-3 h-1.5 w-16 rounded-full relative overflow-hidden"
                        style={{ background: `linear-gradient(90deg, ${theme.gradFrom}, ${theme.gradTo})` }}
                      >
                        {SHINY[t.key] && !prefersReducedMotion && (
                          <motion.span
                            aria-hidden
                            className="absolute inset-y-0"
                            style={{
                              width: '60%',
                              background:
                                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%)',
                            }}
                            initial={{ x: '-120%' }}
                            animate={{ x: '120%' }}
                            transition={{ duration: 2.2, ease: 'linear', repeat: Infinity }}
                          />
                        )}
                      </div>

                      {/* Requirements */}
                      <div className="mt-3 text-xs text-[#5C7188]">
                        <div><span className="font-semibold text-[#2A3D52]">Points:</span> {fmt(t.minPoints)}{t.maxPoints ? `–${fmt(t.maxPoints)}` : '+'}</div>
                        <div><span className="font-semibold text-[#2A3D52]">Network:</span> {fmt(t.minNetwork)}{t.maxNetwork ? `–${fmt(t.maxNetwork)}` : '+'}</div>
                      </div>

                      {/* Perks */}
                      <div className="mt-3 text-sm text-[#2A3D52]">
                        <div><b>{t.perks.listingsPerMonth}</b> premium listing(s) / month</div>
                        <div><b>{t.perks.bonusPct}%</b> extra points per transaction</div>
                        {t.perks.spotlight && <div>Includes <b>Spotlight</b> feature</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm rounded-full border bg-white text-[#3871C1] border-[#CFE0FF] hover:bg-[#F5F8FF] focus:outline-none focus:ring-2 focus:ring-[#3871C1]/40"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


/* -------------------- Main Component -------------------- */
const TierProgressCard: React.FC<TierProgressCardProps> = ({
  totalPoints,
  networkSize,
  breakdown = [],
  className,
}) => {
  const {
    current, next,
    eligibleForCurrent, membersToQualifyCurrent,
    membersToNext, pointsToNext,
  } = getTierPointsLed(totalPoints, networkSize);

  const currentTheme = TIER_THEME[current.key];
  const nextTheme = TIER_THEME[next?.key ?? current.key];

  // Progress logic
  const pointsTarget = next ? next.minPoints : totalPoints || 1;
  const pointsPct = next ? Math.min(100, (totalPoints / pointsTarget) * 100) : 100;

  const networkTarget = eligibleForCurrent
    ? (next ? next.minNetwork : networkSize || 1)
    : current.minNetwork;

  const networkPct = Math.min(100, (networkSize / (networkTarget || 1)) * 100);

  const currentIdx = tiersOrder.indexOf(current.key);
  const totalBreakdown = breakdown.reduce((s, b) => s + b.value, 0) || 1;

  const [perksOpen, setPerksOpen] = useState(false);

  return (
    <div
      className={[
        'p-6 sm:p-8 border bg-white rounded-2xl sm:rounded-[30px]',
        'shadow-[4px_10px_30px_0_rgba(0,0,0,0.06)]',
        'xl:col-span-3',
        className || '',
      ].join(' ')}
      style={{ borderColor: currentTheme.softBorder }}
    >
      {/* Top: Current tier pill + subtle gradient bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold"
            style={{ background: currentTheme.chipBg, color: currentTheme.chipText, borderColor: currentTheme.chipBorder }}
          >
            {current.key === 'Diamond' ? <Diamond className="w-4 h-4" /> : <Award className="w-4 h-4" />}
            Current Tier: {current.key}
          </div>
          <div
            className="mt-3 h-1.5 w-28 rounded-full"
            style={{ background: `linear-gradient(90deg, ${currentTheme.gradFrom}, ${currentTheme.gradTo})` }}
            aria-hidden
          />
        </div>

        <div className="text-right">
          <div className="text-xs text-[#5C7188]">Status</div>
          <div className="text-sm font-semibold text-[#002353]">
            {next ? `Progress to ${next.key}` : 'Max tier reached'}
            {!eligibleForCurrent && (
              <span className="ml-2 text-xs font-normal text-[#5C7188]">
                (network eligibility pending)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stepper with colored connectors (full width) */}
      <div className="mt-5">
        <div className="flex items-center overflow-x-auto whitespace-nowrap pb-2">
          {tiersOrder.map((t, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            const theme = TIER_THEME[t];

            return (
              <React.Fragment key={t}>
                <TierBadge label={t} done={done} active={active} theme={theme} />
                {idx !== tiersOrder.length - 1 && (
                  <div
                    className="mx-2 h-[3px] flex-1 rounded-full"
                    style={{
                      background:
                        idx < currentIdx
                          ? `linear-gradient(90deg, ${theme.gradFrom}, ${theme.gradTo})`
                          : '#E8EEF8',
                    }}
                    aria-hidden
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Dual meters (added a bit more gap) */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-8">{/* gap increased from 6 -> 8 */}
        <div className="rounded-2xl border p-4" style={{ background: currentTheme.softBg, borderColor: currentTheme.softBorder }}>
          <CircularProgress
            percent={pointsPct}
            label="Points"
            valueText={`${fmt(totalPoints)} / ${next ? fmt(next.minPoints) : 'Max'}`}
            gradFrom={currentTheme.gradFrom}
            gradTo={currentTheme.gradTo}
          />
          {next ? (
            <div className="mt-3 text-xs text-[#5C7188]">
              <CheckCircle2 className="inline-block w-4 h-4 mr-1" style={{ color: nextTheme.gradTo }} />
              Need <b className="text-[#002353]">{fmt(pointsToNext)}</b> more points for {next.key}.
            </div>
          ) : (
            <div className="mt-3 text-xs text-[#0B8F55]">
              <CheckCircle2 className="inline-block w-4 h-4 mr-1" />
              You’re at the top tier!
            </div>
          )}
        </div>

        <div className="rounded-2xl border p-4" style={{ background: currentTheme.softBg, borderColor: currentTheme.softBorder }}>
          <CircularProgress
            percent={networkPct}
            label="Network"
            valueText={`${fmt(networkSize)} / ${eligibleForCurrent ? (next ? fmt(next.minNetwork) : 'Max') : fmt(current.minNetwork)}`}
            gradFrom={currentTheme.gradFrom}
            gradTo={currentTheme.gradTo}
          />
          {!eligibleForCurrent ? (
            <div className="mt-3 text-xs text-[#5C7188]">
              <CheckCircle2 className="inline-block w-4 h-4 mr-1" style={{ color: nextTheme.gradTo }} />
              Need <b className="text-[#002353]">{fmt(membersToQualifyCurrent)}</b> more members to qualify for {current.key}.
            </div>
          ) : next ? (
            <div className="mt-3 text-xs text-[#5C7188]">
              <CheckCircle2 className="inline-block w-4 h-4 mr-1" style={{ color: nextTheme.gradTo }} />
              Need <b className="text-[#002353]">{fmt(membersToNext)}</b> more members for {next.key}.
            </div>
          ) : (
            <div className="mt-3 text-xs text-[#0B8F55]">
              <CheckCircle2 className="inline-block w-4 h-4 mr-1" />
              Network requirement complete.
            </div>
          )}
        </div>
      </div>

      {/* Next tier perks */}
      <div
        className="mt-6 rounded-xl border p-4"
        style={{
          background: next
            ? `linear-gradient(180deg, ${nextTheme.softBg}, #ffffff)`
            : `linear-gradient(180deg, ${currentTheme.softBg}, #ffffff)`,
          borderColor: next ? nextTheme.softBorder : currentTheme.softBorder,
        }}
      >
        {next ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold text-[#002353] flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: nextTheme.gradTo }}
                />
                Next up: {next.key}
              </div>
              <div className="text-[#5C7188]">
                {next.perks.listingsPerMonth} premium listing(s)/mo · {next.perks.bonusPct}% extra points per transaction
                {next.perks.spotlight && <span className="ml-1">· Spotlight feature</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPerksOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-medium rounded-full px-3 py-1.5 border cursor-pointer"
              style={{ color: nextTheme.gradTo, borderColor: nextTheme.softBorder }}
            >
              View tier perks <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div
              className="text-sm font-medium"
              style={{ color: currentTheme.chipText }}
            >
              You have all perks unlocked. Enjoy {/** reflects current tier */} {current.key} benefits!
            </div>
            <button
              type="button"
              onClick={() => setPerksOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-medium rounded-full px-3 py-1.5 border cursor-pointer"
              style={{ color: currentTheme.gradTo, borderColor: currentTheme.softBorder }}
            >
              View all tiers <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Points breakdown with micro bars (added extra spacing) */}
      {breakdown.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-5">Points Breakdown</h4>
          <ul className="space-y-3 gap-[10px] flex flex-col">{/* was space-y-2 */}
            {breakdown.map((b) => {
              const pct = Math.min(100, Math.round((b.value / totalBreakdown) * 100));
              return (
                <li key={b.label} className="text-sm">
                  <div className="flex items-center justify-between gap-4">{/* add gap between label & value */}
                    <span className="text-[#2A3D52]">
                      {b.label} {b.hint && <span className="text-[#8FA2BC]">· {b.hint}</span>}
                    </span>
                    <span className="font-semibold text-[#002353] whitespace-nowrap">{fmt(b.value)} pts</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-[#ECF1F8] overflow-hidden">{/* was mt-1 */}
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${currentTheme.gradFrom}, ${currentTheme.gradTo})`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Modal mount */}
      <TierPerksModal open={perksOpen} onClose={() => setPerksOpen(false)} current={current} next={next} />
    </div>
  );
};

export default TierProgressCard;
