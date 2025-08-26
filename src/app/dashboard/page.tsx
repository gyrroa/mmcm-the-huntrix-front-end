'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import {
  Coins, Users2, Award, Diamond, Star, LucideIcon,
} from 'lucide-react';
import TransactionsSection from '@/components/dashboardSection/transactionSection';
import TierProgressCard from '@/components/ui/dashboard/TierProgressCard';
import PointsHistoryCard from '@/components/ui/dashboard/PointsHistoryCard';
import { useMe } from '@/features/auth/hooks';

// ---------- Types ----------

interface StatsCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  gradient?: boolean;
  gradientColors?: { from: string; to: string };
  badge?: string;
}

type TierKey = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

// ---------- Point rules (static) ----------
const RULES = {
  salePer: 10_000,
  rentPer: 10_000,
  directReferral: 5,
  secondLevelReferral: 2,
  thirdToFifthReferral: 1,
  positiveReview: 1,
  premiumListingCost: 50,
};

// ---------- Tier matrix (static) ----------
const TIERS: {
  key: TierKey;
  minPoints: number;
  maxPoints?: number;
  minNetwork: number;
  maxNetwork?: number;
  perks: { listingsPerMonth: string; bonusPct: number; spotlight?: boolean };
}[] = [
    { key: 'Bronze', minPoints: 0, maxPoints: 200, minNetwork: 0, maxNetwork: 10, perks: { listingsPerMonth: '0', bonusPct: 0 } },
    { key: 'Silver', minPoints: 201, maxPoints: 500, minNetwork: 11, maxNetwork: 50, perks: { listingsPerMonth: '1', bonusPct: 5 } },
    { key: 'Gold', minPoints: 501, maxPoints: 1000, minNetwork: 51, maxNetwork: 100, perks: { listingsPerMonth: '5', bonusPct: 10 } },
    { key: 'Platinum', minPoints: 1001, maxPoints: 2000, minNetwork: 101, maxNetwork: 200, perks: { listingsPerMonth: '10', bonusPct: 15 } },
    { key: 'Diamond', minPoints: 2001, minNetwork: 201, perks: { listingsPerMonth: 'Unlimited', bonusPct: 20, spotlight: true } },
  ];

// ---------- Keep your mock chart + tx for now ----------
const pointsData = [
  { month: 'Jan', points: 120 }, { month: 'Feb', points: 180 }, { month: 'Mar', points: 210 },
  { month: 'Apr', points: 195 }, { month: 'May', points: 140 }, { month: 'Jun', points: 180 },
  { month: 'Jul', points: 220 }, { month: 'Aug', points: 195 }, { month: 'Sep', points: 240 },
  { month: 'Oct', points: 185 }, { month: 'Nov', points: 220 }, { month: 'Dec', points: 365 },
];

// ---------- Helpers ----------
function getTierByPoints(points: number) {
  return [...TIERS].reverse().find(t => points >= t.minPoints) ?? TIERS[0];
}

function toTierKey(s?: string): TierKey | undefined {
  if (!s) return;
  const key = (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) as TierKey;
  return ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].includes(key) ? key : undefined;
}

// ---------- UI pieces ----------
const StatsCard: React.FC<StatsCardProps> = ({
  title, value, subtitle, icon: Icon, trend,
  gradient = false,
  gradientColors,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const from = gradientColors?.from ?? '#3871C1';
  const to = gradientColors?.to ?? '#71AAF9';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl sm:rounded-[30px] p-5 sm:p-6 ${gradient
        ? 'text-white'
        : 'bg-white shadow-[4px_10px_30px_0_rgba(0,0,0,0.06)] border border-[#E8EEF8]'
        } transition-all duration-300 hover:scale-[1.01]`}
      style={gradient ? { background: `linear-gradient(135deg, ${from}, ${to})` } : undefined}
    >
      {gradient && !prefersReducedMotion && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <motion.span
            className="absolute inset-y-0 left-0 w-[60%]"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%)',
              opacity: 0.25,
              willChange: 'transform',
            }}
            initial={{ x: '-120%', skewX: -12 }}
            animate={{ x: '120%', skewX: -12 }}
            transition={{ duration: 2.2, ease: 'linear', repeat: Infinity }}
          />
        </div>
      )}

      <div className="relative z-[1]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${gradient ? 'text-white/90' : 'text-[#3871C1]'}`}>{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className={`text-3xl font-bold ${gradient ? 'text-white' : 'text-[#002353]'}`}>{value}</h3>
              {trend && (
                <span className={`text-sm font-semibold ${trend.isPositive ? (gradient ? 'text-white/90' : 'text-[#0B8F55]') : (gradient ? 'text-white' : 'text-[#D12B2B]')}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className={`mt-1 text-sm ${gradient ? 'text-white/80' : 'text-[#5C7188]'}`}>{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${gradient ? 'bg-white/20' : 'bg-[#ECF1F8]'}`}>
            <Icon className={`h-6 w-6 ${gradient ? 'text-white' : 'text-[#3871C1]'}`} />
          </div>
        </div>

        {gradient && (
          <div className="absolute -bottom-1 -right-1 opacity-15">
            <Icon className="h-20 w-20" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TIER_CARD_UI: Record<TierKey, { from: string; to: string; icon: LucideIcon; }> = {
  Bronze: { from: '#F0A25A', to: '#B97A3A', icon: Award },
  Silver: { from: '#B6BEC9', to: '#7E8898', icon: Award },
  Gold: { from: '#FFD36E', to: '#F4B400', icon: Award },
  Platinum: { from: '#BFBFBA', to: '#8F8F8A', icon: Award },
  Diamond: { from: '#71AAF9', to: '#3871C1', icon: Diamond },
};

// ---------- Main ----------
const Dashboard: React.FC = () => {
  // Load current user
  const { data: me, isLoading, error } = useMe(); // redirects to /auth?login on 401/403

  // Call hooks BEFORE any early return
  const breakdown = useMemo(() => {
    const directCount = me?.direct_referrals ?? 0;
    const secondaryCount = me?.secondary_referrals ?? 0;
    const tertiaryCount = me?.tertiary_referrals ?? 0;
    const positiveCount = me?.positive_reviews ?? 0;

    return [
      {
        label: 'Direct Referrals',
        value: directCount * RULES.directReferral,
        hint: `+${RULES.directReferral} pts each (${directCount})`,
      },
      {
        label: 'Indirect Referrals (2nd level)',
        value: secondaryCount * RULES.secondLevelReferral,
        hint: `+${RULES.secondLevelReferral} pts each (${secondaryCount})`,
      },
      {
        label: 'Indirect Referrals (3rd–5th)',
        value: tertiaryCount * RULES.thirdToFifthReferral,
        hint: `+${RULES.thirdToFifthReferral} pt each (${tertiaryCount})`,
      },
      {
        label: 'Positive Reviews',
        value: positiveCount * RULES.positiveReview,
        hint: `+${RULES.positiveReview} pt each (${positiveCount})`,
      },
    ];
  }, [
    me?.direct_referrals,
    me?.secondary_referrals,
    me?.tertiary_referrals,
    me?.positive_reviews,
  ]);

  // Early returns are fine AFTER all hooks have been called
  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-b from-white to-[#D2E4FF] text-[#002353]">
        <span className="animate-pulse text-sm text-[#5C7188]">Loading your dashboard…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-b from-white to-[#D2E4FF] text-[#002353]">
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }
  if (!me) return null;

  // Derive tier + UI from API (fallback to points-based if API tier unknown)
  const apiTierKey = toTierKey(me.tier);
  const currentTier = apiTierKey
    ? TIERS.find(t => t.key === apiTierKey)!
    : getTierByPoints(me.points);

  const ui = TIER_CARD_UI[currentTier.key];

  // Network size: prefer server-provided total, else sum levels
  const networkSize =
    typeof me.referrals_count === 'number' && me.referrals_count > 0
      ? me.referrals_count
      : (me.direct_referrals ?? 0) + (me.secondary_referrals ?? 0) + (me.tertiary_referrals ?? 0);

  return (
    <div className="min-h-screen text-[#002353] bg-gradient-to-b from-white to-[#D2E4FF]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[70px] lg:py-8">
        {/* Header */}
        <header className="top-0 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 border-b border-[#E8EEF8]">
          <div className="max-w-7xl mx-auto py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold leading-tight tracking-tight text-[#0B1F3A] truncate">
                  Property Dashboard
                </h1>
                <p className="mt-0.5 text-sm sm:text-base text-[#5C7188]">
                  Welcome back, {me.first_name}! Track your points, tier, and transactions
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2" />
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10 mt-5">
          {/* Current Tier */}
          <StatsCard
            title="Current Tier"
            value={
              <span className="inline-flex items-center gap-2">
                {currentTier.key}
                {currentTier.key === 'Diamond'
                  ? <Diamond className="w-5 h-5" />
                  : <Award className="w-5 h-5 text-white/90" />}
              </span>
            }
            subtitle={
              currentTier.key === 'Diamond'
                ? 'Top tier unlocked · Spotlight enabled'
                : `${currentTier.perks.bonusPct}% extra points on future transactions`
            }
            icon={ui.icon}
            gradient
            gradientColors={{ from: ui.from, to: ui.to }}
          />

          <StatsCard
            title="Total Points"
            value={me.points.toLocaleString()}
            subtitle="Earned to date"
            icon={Coins}
            trend={{ value: 12.5, isPositive: true }}
          />

          <StatsCard
            title="Network Size"
            value={networkSize.toLocaleString()}
            subtitle="Total people in your network"
            icon={Users2}
          />

          <StatsCard
            title="Premium Listings / mo."
            value={currentTier.perks.listingsPerMonth}
            subtitle={`Cost: ${RULES.premiumListingCost} pts each`}
            icon={Star}
          />
        </div>

        {/* Chart + Tier Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="flex flex-col w-full gap-6 mb-10"
        >
          <PointsHistoryCard
            className="xl:col-span-2"
            data={pointsData}
            title="Points History"
            subtitle="Growth over the past year"
            height={220}
          />

          <TierProgressCard
            totalPoints={me.points}
            networkSize={networkSize}
            breakdown={breakdown}
          />
        </motion.div>
      </section>

      {/* Transactions (still mock until you hook an API) */}
      <TransactionsSection />
    </div>
  );
};

export default Dashboard;
