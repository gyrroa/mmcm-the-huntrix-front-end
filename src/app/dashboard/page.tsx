'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import {
    Coins, Users2, Award, Diamond, Star, LucideIcon,
} from 'lucide-react';
import TransactionsSection from '@/components/dashboardSection/transactionSection';
import TierProgressCard from '@/components/ui/dashboard/TierProgressCard';
import PointsHistoryCard from '@/components/ui/dashboard/PointsHistoryCard';

// ---------- Types ----------
type TransactionType = 'buy' | 'rent' | 'sell';

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

interface Transaction {
    id: string;
    type: TransactionType;
    property: { name: string; address: string; image: string };
    amount: number; // in PHP (sale value or rental CONTRACT value)
    date: string;
    status: 'completed' | 'pending' | 'cancelled';
}

type TierKey = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

// ---------- Point rules (from spec) ----------
const RULES = {
    salePer: 10_000, // 1 pt per ₱10,000 sale value
    rentPer: 10_000, // 1 pt per ₱10,000 rental contract value
    directReferral: 5,
    secondLevelReferral: 2,
    thirdToFifthReferral: 1,
    positiveReview: 1,
    premiumListingCost: 50, // pts
};

// ---------- Tier matrix (from spec) ----------
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

// ---------- Mock data (replace with real) ----------
const pointsData = [
    { month: 'Jan', points: 120 }, { month: 'Feb', points: 180 }, { month: 'Mar', points: 210 },
    { month: 'Apr', points: 195 }, { month: 'May', points: 140 }, { month: 'Jun', points: 180 },
    { month: 'Jul', points: 220 }, { month: 'Aug', points: 195 }, { month: 'Sep', points: 240 },
    { month: 'Oct', points: 185 }, { month: 'Nov', points: 220 }, { month: 'Dec', points: 365 },
];

const transactions: Transaction[] = [
    { id: '1', type: 'buy', property: { name: 'Modern Downtown Condo', address: '123 Main St', image: '/api/placeholder/80/60' }, amount: 450_000, date: '2024-01-15', status: 'completed' },
    { id: '2', type: 'rent', property: { name: 'Cozy Garden Apartment', address: '456 Oak Ave', image: '/api/placeholder/80/60' }, amount: 120_000, date: '2024-01-10', status: 'completed' }, // example: 1-year contract
    { id: '3', type: 'sell', property: { name: 'Family Villa', address: '789 Pine Rd', image: '/api/placeholder/80/60' }, amount: 675_000, date: '2024-01-08', status: 'pending' },
    { id: '4', type: 'rent', property: { name: 'Studio Loft', address: '321 Elm St', image: '/api/placeholder/80/60' }, amount: 180_000, date: '2024-01-05', status: 'completed' },
    { id: '5', type: 'buy', property: { name: 'Luxury Penthouse', address: '555 High St', image: '/api/placeholder/80/60' }, amount: 890_000, date: '2024-01-03', status: 'cancelled' },
];

// Network composition (replace with real)
const network = {
    direct: 38,          // people you invited
    secondLevel: 72,     // invited by your invitees
    thirdToFifth: 95,    // aggregated 3rd–5th levels
};
const positiveReviews = 12; // reviews received on your listings

function calcPointsFromTransactions(list: Transaction[]) {
    const completed = list.filter((t) => t.status === 'completed');

    const salePts = completed
        .filter((t) => t.type === 'buy' || t.type === 'sell')
        .reduce((sum, t) => sum + Math.floor(t.amount / RULES.salePer), 0);

    const rentPts = completed
        .filter((t) => t.type === 'rent')
        .reduce((sum, t) => sum + Math.floor(t.amount / RULES.rentPer), 0);

    return { salePts, rentPts, txCount: completed.length };
}

function calcReferralPoints(n = network) {
    return {
        directPts: n.direct * RULES.directReferral,
        secondPts: n.secondLevel * RULES.secondLevelReferral,
        thirdToFifthPts: n.thirdToFifth * RULES.thirdToFifthReferral,
        size: n.direct + n.secondLevel + n.thirdToFifth,
    };
}

function getTierByPoints(points: number) {
    // show the highest tier your POINTS qualify for (ignore network here)
    return [...TIERS].reverse().find(t => points >= t.minPoints) ?? TIERS[0];
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

            {/* shimmer like the accent bar */}
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

            {/* content */}
            <div className="relative z-[1]">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className={`text-sm font-medium ${gradient ? 'text-white/90' : 'text-[#3871C1]'}`}>{title}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <h3 className={`text-3xl font-bold ${gradient ? 'text-white' : 'text-[#002353]'}`}>{value}</h3>
                            {trend && (
                                <span className={`text-sm font-semibold ${trend.isPositive ? (gradient ? 'text-white/90' : 'text-[#0B8F55]') : (gradient ? 'text-white' : 'text-[#D12B2B]')
                                    }`}>
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

const TIER_CARD_UI: Record<TierKey, {
    from: string; to: string; icon: LucideIcon;
}> = {
    Bronze: { from: '#F0A25A', to: '#B97A3A', icon: Award },   // warm bronze
    Silver: { from: '#B6BEC9', to: '#7E8898', icon: Award },   // cool steel-gray
    Gold: { from: '#FFD36E', to: '#F4B400', icon: Award },   // rich gold
    Platinum: { from: '#BFBFBA', to: '#8F8F8A', icon: Award },   // deep platinum (white text readable)
    Diamond: { from: '#71AAF9', to: '#3871C1', icon: Diamond }, // icy diamond
};

// ---------- Main ----------
const Dashboard: React.FC = () => {
    // Derived numbers from rules
    const { salePts, rentPts } = useMemo(
        () => calcPointsFromTransactions(transactions),
        []
    );
    const { directPts, secondPts, thirdToFifthPts, size: networkSize } = useMemo(
        () => calcReferralPoints(network),
        []
    );
    const reviewPts = positiveReviews * RULES.positiveReview;

    const totalPoints = salePts + rentPts + directPts + secondPts + thirdToFifthPts + reviewPts + 2000;
    const currentTier = getTierByPoints(totalPoints);

    const breakdown = [
        { label: 'Property Sale', value: salePts, hint: `1 pt / ₱${RULES.salePer.toLocaleString()} sale` },
        { label: 'Property Rental', value: rentPts, hint: `1 pt / ₱${RULES.rentPer.toLocaleString()} contract` },
        { label: 'Direct Referrals', value: directPts, hint: `+${RULES.directReferral} pts each` },
        { label: 'Indirect Referrals (2nd level)', value: secondPts, hint: `+${RULES.secondLevelReferral} pts each` },
        { label: 'Indirect Referrals (3rd–5th)', value: thirdToFifthPts, hint: `+${RULES.thirdToFifthReferral} pt each` },
        { label: 'Positive Reviews', value: reviewPts, hint: `+${RULES.positiveReview} pt each` },
    ];

    const ui = TIER_CARD_UI[currentTier.key];

    return (
        <div className="min-h-screen text-[#002353] bg-gradient-to-b from-white to-[#D2E4FF]">

            {/* Main */}
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
                                    Track your points, tier, and transactions
                                </p>
                            </div>

                            {/* optional actions area (hide on small screens) */}
                            <div className="hidden sm:flex items-center gap-2">
                                {/* e.g., filters, export, settings */}
                                {/* <button className="rounded-lg border border-[#E8EEF8] px-3 py-2 text-sm text-[#002353] hover:bg-[#F6F9FF]">Export</button> */}
                            </div>
                        </div>
                    </div>
                </header>
                {/* Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10 mt-5">
                    {/* Current Tier — diamond gets its own UI */}
                    <StatsCard
                        title="Current Tier"
                        value={
                            <span className="inline-flex items-center gap-2">
                                {currentTier.key}
                                {currentTier.key === 'Diamond'
                                    ? <Diamond className="w-5 h-5" />
                                    : <Award className="w-5 h-5 text-white/90" /> /* looks good on gradient */
                                }
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
                        value={totalPoints.toLocaleString()}
                        subtitle="Earned to date"
                        icon={Coins}
                        trend={{ value: 12.5, isPositive: true }}
                    />
                    <StatsCard
                        title="Network Size"
                        value={networkSize.toLocaleString()}
                        subtitle="Total people in your network."
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
                    {/* Points History */}
                    <PointsHistoryCard
                        className="xl:col-span-2"
                        data={pointsData}               // [{ month: 'Jan', points: 120 }, ...]
                        title="Points History"
                        subtitle="Growth over the past year"
                        height={220}
                    />

                    {/* Tier progress + breakdown */}
                    <TierProgressCard
                        totalPoints={totalPoints}
                        networkSize={networkSize}
                        breakdown={breakdown}  // optional
                    />
                </motion.div>
            </section>
            {/* Transactions */}
            <TransactionsSection />
        </div>
    );
};

export default Dashboard;
