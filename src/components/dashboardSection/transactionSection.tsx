'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/dashboard/Card';
import { Badge } from '@/components/ui/dashboard/Badge';
import {
  Building2,
  Home,
  Key,
  MapPin,
  Calendar,
  LucideIcon,
} from 'lucide-react';

// ⬇️ adjust these to where you placed the API hooks
import { useMyPurchases } from '@/features/buy/hooks';
import { useMyBuyListings } from '@/features/buy/hooks';
import { useMyRentals } from '@/features/rent/hooks';
import { useMyRentListings } from '@/features/rent/hooks';

// --- Types ---
export type TransactionType = 'buy' | 'rent' | 'sell';
type UnknownRecord = Record<string, unknown>;

const FILTERS = [
  { key: 'all' as const, label: 'All Activity' },
  { key: 'buy' as const, label: 'My Purchases', icon: Building2 },
  { key: 'rent' as const, label: 'My Rentals', icon: Home },
  { key: 'sell' as const, label: 'My Listings', icon: Key },
];

export interface Transaction {
  id: string;
  type: TransactionType;
  property: {
    name: string;
    address: string;
    image?: string;
  };
  amount: number;
  date: string; // YYYY-MM-DD (local)
  status: 'completed' | 'pending' | 'cancelled';
}

type Props = {
  /** Optional: provide prebuilt transactions to override API */
  transactions?: Transaction[];
  title?: string;
  subtitle?: string;
  id?: string;
};

// --- Helpers (colors/icons aligned with your palette) ---
const getTypeIcon = (type: TransactionType) => {
  const Icon: LucideIcon =
    type === 'buy' ? Building2 : type === 'rent' ? Home : Key;
  return <Icon className="h-5 w-5" />;
};

const typeChip = (type: TransactionType) => {
  switch (type) {
    case 'buy':
      return 'bg-[#E7F0FF] text-[#3871C1] border-[#CFE0FF]';
    case 'rent':
      return 'bg-[#EDF4FF] text-[#003175] border-[#CFE0FF]';
    case 'sell':
      return 'bg-[#E6F8F0] text-[#0B8F55] border-[#AEE5C9]';
  }
};

const typeAccent = (type: TransactionType) => {
  switch (type) {
    case 'buy':
      return { bg: 'bg-[#E7F0FF]', fg: 'text-[#3871C1]' };
    case 'rent':
      return { bg: 'bg-[#EDF4FF]', fg: 'text-[#003175]' };
    case 'sell':
      return { bg: 'bg-[#E6F8F0]', fg: 'text-[#0B8F55]' };
  }
};

const statusChip = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-[#E6F8F0] text-[#0B8F55] border-[#AEE5C9]';
    case 'pending':
      return 'bg-[#FFF7E6] text-[#C77800] border-[#FFD58A]';
    case 'cancelled':
      return 'bg-[#FFE9E9] text-[#D12B2B] border-[#FFB3B3]';
    default:
      return 'bg-[#ECF1F8] text-[#5C7188] border-[#E0E8F5]';
  }
};

// --- Date/Currency utils ---
const pad = (n: number) => String(n).padStart(2, '0');
const toLocalYMD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseLocalDate = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parseLocalDate(isoDate));

const formatCurrencyPHP = (amount: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);

// --- Image helpers (support string | {url} shapes) ---
const firstImageUrl = (images?: unknown[]): string | undefined => {
  if (!Array.isArray(images) || images.length === 0) return undefined;
  const first = images[0];
  if (!first) return undefined;
  if (typeof first === 'string') return first;
  if (typeof (first as { url?: unknown }).url === 'string') {
    return (first as { url: string }).url;
  }
  if (typeof first === 'object' && first !== null && 'image' in first) {
    const img = (first as { image?: { url?: unknown } }).image;
    if (typeof img?.url === 'string') return img.url;
  }
  return undefined;
};

// --- Build transactions from API data ---
const makeTransactionsFromApi = ({
  purchases,
  rentals,
  buyListings,
  rentListings,
}: {
  purchases: UnknownRecord[];
  rentals: UnknownRecord[];
  buyListings: UnknownRecord[];
  rentListings: UnknownRecord[];
}): Transaction[] => {
  const rows: Transaction[] = [];

  // Purchases (BUY)
  for (const p of purchases) {
    const rec = p as { id?: string; slug?: string; name: string; address: string; images?: unknown[]; price?: number; created_at?: string };
    rows.push({
      id: `buy_${rec.slug ?? rec.id}`,
      type: 'buy',
      property: {
        name: rec.name,
        address: rec.address,
        image: firstImageUrl(rec.images),
      },
      amount: Number(rec.price ?? 0),
      date: rec.created_at ? toLocalYMD(new Date(rec.created_at)) : toLocalYMD(new Date()),
      status: 'completed',
    });
  }

  // Rentals (RENT)
  for (const r of rentals) {
    const rec = r as { id?: string; slug?: string; name: string; address: string; images?: unknown[]; price?: number; created_at?: string };
    rows.push({
      id: `rent_${rec.slug ?? rec.id}`,
      type: 'rent',
      property: {
        name: rec.name,
        address: rec.address,
        image: firstImageUrl(rec.images),
      },
      amount: Number(rec.price ?? 0),
      date: rec.created_at ? toLocalYMD(new Date(rec.created_at)) : toLocalYMD(new Date()),
      status: 'completed',
    });
  }

  // My Listings (SELL) — combine buy + rent listings
  for (const b of buyListings) {
    const rec = b as { id?: string; slug?: string; name: string; address: string; images?: unknown[]; price?: number; created_at?: string; buyer_id?: unknown };
    rows.push({
      id: `sell_buy_${rec.slug ?? rec.id}`,
      type: 'sell',
      property: {
        name: rec.name,
        address: rec.address,
        image: firstImageUrl(rec.images),
      },
      amount: Number(rec.price ?? 0),
      date: rec.created_at ? toLocalYMD(new Date(rec.created_at)) : toLocalYMD(new Date()),
      status: rec.buyer_id ? 'completed' : 'pending',
    });
  }

  for (const rl of rentListings) {
    const rec = rl as { id?: string; slug?: string; name: string; address: string; images?: unknown[]; price?: number; created_at?: string };
    rows.push({
      id: `sell_rent_${rec.slug ?? rec.id}`,
      type: 'sell',
      property: {
        name: rec.name,
        address: rec.address,
        image: firstImageUrl(rec.images),
      },
      amount: Number(rec.price ?? 0),
      date: rec.created_at ? toLocalYMD(new Date(rec.created_at)) : toLocalYMD(new Date()),
      status: 'pending',
    });
  }

  return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
};

// stable empty array to avoid new [] references
const EMPTY_TRANSACTIONS: Transaction[] = [];

// --- Component ---
const PAGE_SIZE = 4;

const TransactionsSection: React.FC<Props> = ({
  transactions,
  title = 'Transaction History',
  subtitle = 'Your property transactions and commissions',
  id = 'transactionsSection',
}) => {
  // fetch from API
  const {
    data: purchases = [],
    isLoading: loadingPurchases,
    isError: errorPurchases,
  } = useMyPurchases();

  const {
    data: rentals = [],
    isLoading: loadingRentals,
    isError: errorRentals,
  } = useMyRentals();

  const {
    data: buyListings = [],
    isLoading: loadingBuyListings,
    isError: errorBuyListings,
  } = useMyBuyListings();

  const {
    data: rentListings = [],
    isLoading: loadingRentListings,
    isError: errorRentListings,
  } = useMyRentListings();

  const derivedTransactions = useMemo(() => {
    try {
      return makeTransactionsFromApi({
        purchases,
        rentals,
        buyListings,
        rentListings,
      });
    } catch {
      return [];
    }
  }, [purchases, rentals, buyListings, rentListings]);

  const baseData = useMemo<Transaction[]>(() => {
    if (transactions) return transactions;
    if (derivedTransactions?.length) return derivedTransactions;
    return EMPTY_TRANSACTIONS; // stable reference
  }, [transactions, derivedTransactions]);

  const [active, setActive] = useState<TransactionType | 'all'>('all');

  const filtered = useMemo(() => {
    return active === 'all' ? baseData : baseData.filter((t) => t.type === active);
  }, [baseData, active]);

  // --- Pagination state ---
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Reset to page 1 when the filter changes
  useEffect(() => {
    setPage(1);
  }, [active]);

  // Clamp page when the filtered data size changes
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [filtered.length, totalPages]);

  const clampedPage = Math.min(page, totalPages);
  const startIdx = (clampedPage - 1) * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  const pageItems = filtered.slice(startIdx, endIdx);

  const isLoadingAny =
    loadingPurchases || loadingRentals || loadingBuyListings || loadingRentListings;
  const isErrorAny =
    errorPurchases || errorRentals || errorBuyListings || errorRentListings;

  return (
    <motion.section
      id={id}
      className="text-[#002353] w-full bg-white pt-12 md:pt-[144px] pb-16 md:pb-20"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[70px]">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <p className="text-sm md:text-base text-[#5C7188] mt-1">{subtitle}</p>
        </div>

        <Card className="p-6 sm:p-8 border border-[#E8EEF8] bg-white rounded-2xl sm:rounded-[30px] shadow-[4px_10px_30px_0_rgba(0,0,0,0.06)]">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTERS.map(({ key, label, icon: Icon }) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(key)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3871C1] ${isActive
                    ? 'bg-[#3871C1] text-white border-[#3871C1] shadow-[0_8px_20px_rgba(56,113,193,0.3)]'
                    : 'bg-white text-[#3871C1] border-[#CFE0FF] hover:bg-[#F5F8FF]'
                    }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Loading / Error */}
          {isLoadingAny && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-16 rounded-2xl bg-[#F5F8FF] border border-[#E8EEF8] animate-pulse"
                />
              ))}
            </div>
          )}

          {isErrorAny && !isLoadingAny && (
            <div className="text-center py-10">
              <Key className="h-12 w-12 text-[#D12B2B] mx-auto mb-2" />
              <p className="text-[#D12B2B]">We couldn’t load your transactions. Please retry.</p>
            </div>
          )}

          {/* List */}
          {!isLoadingAny && !isErrorAny && (
            <>
              <div className="space-y-4">
                {pageItems.map((t, i) => {
                  const accent = typeAccent(t.type);
                  return (
                    <div
                      key={t.id}
                      className="border border-[#E8EEF8] bg-white rounded-2xl p-4 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Preview: image or icon */}
                        <div
                          className={`w-16 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-[#E8EEF8] ${t.property.image ? '' : accent.bg
                            }`}
                        >
                          {t.property.image ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={t.property.image}
                                alt={t.property.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                                priority={i < 4}
                              />
                            </div>
                          ) : (
                            <div className={`flex items-center justify-center ${accent.fg}`}>
                              {getTypeIcon(t.type)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{t.property.name}</h4>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3.5 w-3.5 text-[#5C7188]" />
                                <p className="text-sm text-[#5C7188] truncate">
                                  {t.property.address}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant="outline"
                                  className={`${typeChip(t.type)} border rounded-md`}
                                >
                                  <span className="inline-flex items-center gap-1">
                                    {getTypeIcon(t.type)}
                                    <span className="capitalize">{t.type}</span>
                                  </span>
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`${statusChip(t.status)} border rounded-md`}
                                >
                                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                                </Badge>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-1 justify-end">
                                <span className="font-semibold">
                                  {formatCurrencyPHP(t.amount)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1 justify-end">
                                <Calendar className="h-3.5 w-3.5 text-[#5C7188]" />
                                <time className="text-xs text-[#5C7188]" dateTime={t.date}>
                                  {formatDate(t.date)}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="text-center py-10">
                  <Building2 className="h-12 w-12 text-[#5C7188] mx-auto mb-2" />
                  <p className="text-[#5C7188]">No transactions found for the selected filter.</p>
                </div>
              )}

              {/* Pagination controls */}
              {filtered.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8EEF8] pt-4">
                  <p className="text-sm text-[#5C7188]">
                    Showing{' '}
                    <span className="font-medium">
                      {filtered.length === 0 ? 0 : startIdx + 1}
                    </span>
                    –
                    <span className="font-medium">{Math.min(endIdx, filtered.length)}</span> of{' '}
                    <span className="font-medium">{filtered.length}</span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={clampedPage === 1}
                      className={`px-3 py-2 text-sm rounded-full border transition ${clampedPage === 1
                        ? 'bg-[#F5F8FF] text-[#9CB6D6] border-[#E0E8F5] cursor-not-allowed'
                        : 'bg-white text-[#3871C1] border-[#CFE0FF] hover:bg-[#F5F8FF]'
                        }`}
                      aria-label="Previous page"
                    >
                      Prev
                    </button>

                    <span className="text-sm text-[#5C7188]">
                      Page <span className="font-medium">{clampedPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={clampedPage === totalPages}
                      className={`px-3 py-2 text-sm rounded-full border transition ${clampedPage === totalPages
                        ? 'bg-[#F5F8FF] text-[#9CB6D6] border-[#E0E8F5] cursor-not-allowed'
                        : 'bg-white text-[#3871C1] border-[#CFE0FF] hover:bg-[#F5F8Ff]'
                        }`}
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </motion.section>
  );
};

export default TransactionsSection;
