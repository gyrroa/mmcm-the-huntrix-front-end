// ./src/components/dashboardSection/pendingApprovalsSection.tsx
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Handshake,
  // User, // removed: unused
  Clock,
  MapPin,
  CheckCircle2,
  Building2,
  Home,
} from 'lucide-react';

import { useMyRentListings, usePendingRentals, useConfirmRental } from '@/features/rent/hooks';
import { rentKeys } from '@/features/rent/keys';
import { useMyBuyListings, usePendingSales, useConfirmSale } from '@/features/buy/hooks';
import { buyKeys } from '@/features/buy/keys';

// Strong types from your domain
import type { Rent, PendingRental } from '@/features/rent/types';
import type { Buy, PendingSale } from '@/features/buy/types';

// Reusable image-like type
type ImageLike = string | { url?: string };

// Only the fields the rail cares about
type RentCard = Pick<Rent, 'id' | 'name' | 'address' | 'images'>;
type BuyCard  = Pick<Buy,  'id' | 'name' | 'address' | 'images'>;

const img0 = (arr?: ImageLike[]) => {
  if (!Array.isArray(arr) || !arr.length) return '/logo.svg';
  const v = arr[0];
  if (typeof v === 'string') return v || '/logo.svg';
  if (v && typeof v === 'object' && typeof v.url === 'string') return v.url || '/logo.svg';
  return '/logo.svg';
};

function RailHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/70 text-[#3871C1] border border-[#E0E8F5]">
          {icon}
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-[#002353]">{title}</h3>
      </div>
      {subtitle ? <p className="text-xs text-[#5C7188]">{subtitle}</p> : null}
    </div>
  );
}

const statusChipClass = (s?: string) => {
  const v = (s ?? 'Pending').toLowerCase();
  if (v === 'completed' || v === 'approved') return 'bg-[#E6F8F0] text-[#0B8F55] border-[#AEE5C9]';
  if (v === 'rejected') return 'bg-[#FFE9E9] text-[#D12B2B] border-[#FFB3B3]';
  return 'bg-[#FFF7E6] text-[#C77800] border-[#FFD58A]';
};

const isFinalStatus = (s?: string) => /^(completed|approved)$/i.test(String(s ?? '').trim());

function RentRail({ listing }: { listing: RentCard }) {
  const qc = useQueryClient();
  const { data: pendings = [], isLoading, isError } = usePendingRentals(listing.id);
  const confirm = useConfirmRental();
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white border border-[#E1EAF7] shadow-[0_6px_24px_rgba(8,32,84,0.06)] before:content-[''] before:absolute before:inset-y-0 before:left-0 before:w-2 sm:before:w-2.5 before:bg-gradient-to-b before:from-[#5AA6FF] before:via-[#3871C1] before:to-[#2D3E8B] before:opacity-95 group-hover:before:opacity-100 before:transition-opacity">
      <div className="p-4 sm:p-5">
        <RailHeader icon={<Home className="w-4 h-4" />} title={listing.name} subtitle="Rent • Pending requests" />
        <div className="mt-2 flex items-center gap-2 text-xs text-[#5C7188]">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{listing.address}</span>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-[#F5F8FF] border border-[#E8EEF8] animate-pulse" />
            ))}
          </div>
        )}

        {isError && <div className="text-sm text-red-600">Failed to load pending requests.</div>}

        {!isLoading && !isError && pendings.length === 0 && (
          <div className="text-sm text-[#5C7188]">No pending requests for this listing.</div>
        )}

        {pendings.length > 0 && (
          <ul className="space-y-3">
            {pendings.map((p: PendingRental) => (
              <li
                key={p.id}
                className="group relative grid grid-cols-[56px_1fr_auto] gap-3 rounded-xl border border-[#E8EEF8] bg-[#F9FBFE] p-3 hover:bg-white transition"
              >
                {/* thumb */}
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#E8EEF8]">
                  <Image src={img0(listing.images as ImageLike[])} alt={listing.name} fill className="object-cover" />
                </div>

                {/* content */}
                <div className="min-w-0">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-[#002353]">
                      <strong className="font-medium">{p.tenant_name ?? p.tenant_id}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#5C7188]">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(p.created_at ?? Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#5C7188] line-clamp-2">
                    {p.message || <em>No message provided.</em>}
                  </p>
                </div>

                {/* actions */}
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusChipClass(p.status)}`}>
                    {p.status ?? 'Pending'}
                  </span>

                  {!isFinalStatus(p.status) && (
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#3871C1] text-white text-sm font-semibold hover:bg-[#2f62a7] disabled:opacity-50"
                      disabled={busyId === p.id || confirm.isPending}
                      onClick={() => {
                        setBusyId(p.id);
                        confirm.mutate(p.id, {
                          onSuccess: () => {
                            qc.invalidateQueries({ queryKey: rentKeys.pending(listing.id) });
                            qc.invalidateQueries({ queryKey: rentKeys.myListings() });
                          },
                          onSettled: () => setBusyId(null),
                        });
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {busyId === p.id && confirm.isPending ? 'Confirming…' : 'Confirm'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BuyRail({ listing }: { listing: BuyCard }) {
  const qc = useQueryClient();
  const { data: pendings = [], isLoading, isError } = usePendingSales(listing.id);
  const confirm = useConfirmSale();
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white border border-[#E1EAF7] shadow-[0_6px_24px_rgba(8,32,84,0.06)] before:content-[''] before:absolute before:inset-y-0 before:left-0 before:w-2 sm:before:w-2.5 before:bg-gradient-to-b before:from-[#7FD3B8] before:via-[#0B8F55] before:to-[#066940] before:opacity-95 group-hover:before:opacity-100 before:transition-opacity">
      <div className="p-4 sm:p-5">
        <RailHeader icon={<Building2 className="w-4 h-4" />} title={listing.name} subtitle="Buy • Pending offers" />
        <div className="mt-2 flex items-center gap-2 text-xs text-[#5C7188]">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{listing.address}</span>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-[#F5F8FF] border border-[#E8EEF8] animate-pulse" />
            ))}
          </div>
        )}

        {isError && <div className="text-sm text-red-600">Failed to load pending offers.</div>}

        {!isLoading && !isError && pendings.length === 0 && (
          <div className="text-sm text-[#5C7188]">No pending offers for this listing.</div>
        )}

        {pendings.length > 0 && (
          <ul className="space-y-3">
            {pendings.map((p: PendingSale) => (
              <li
                key={p.id}
                className="group relative grid grid-cols-[56px_1fr_auto] gap-3 rounded-xl border border-[#E8EEF8] bg-[#F9FBFE] p-3 hover:bg-white transition"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#E8EEF8]">
                  <Image src={img0(listing.images as ImageLike[])} alt={listing.name} fill className="object-cover" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-[#002353]">
                      <strong className="font-medium">{p.buyer_name ?? p.buyer_id}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#5C7188]">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(p.created_at ?? Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#5C7188] line-clamp-2">
                    {p.message || <em>No message provided.</em>}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusChipClass(p.status)}`}>
                    {p.status ?? 'Pending'}
                  </span>

                  {!isFinalStatus(p.status) && (
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B8F55] text-white text-sm font-semibold hover:bg-[#087549] disabled:opacity-50"
                      disabled={busyId === p.id || confirm.isPending}
                      onClick={() => {
                        setBusyId(p.id);
                        confirm.mutate(p.id, {
                          onSuccess: () => {
                            qc.invalidateQueries({ queryKey: buyKeys.pending(listing.id) });
                            qc.invalidateQueries({ queryKey: buyKeys.myListings() });
                          },
                          onSettled: () => setBusyId(null),
                        });
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {busyId === p.id && confirm.isPending ? 'Confirming…' : 'Confirm'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Inbox-style section for the dashboard */
export default function PendingApprovalsSection() {
  const { data: myRents = [], isLoading: loadingRents } = useMyRentListings();
  const { data: myBuys = [], isLoading: loadingBuys } = useMyBuyListings();

  const isLoading = loadingRents || loadingBuys;
  const hasAny = (myRents?.length ?? 0) + (myBuys?.length ?? 0) > 0;

  return (
    <motion.section
      id="pendingApprovalsSection"
      className="w-full bg-white py-12 md:py-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[70px]">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E0E8F5] text-[#3871C1]">
            <Handshake className="w-4 h-4" />
            <span className="text-xs font-semibold">Pending Approvals</span>
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-[#002353]">Your Inbox</h2>
          <p className="text-sm md:text-base text-[#5C7188] mt-1">Review incoming requests and confirm them in one place.</p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white border border-[#E1EAF7] animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !hasAny && (
          <div className="rounded-2xl border border-[#E1EAF7] bg-white p-10 text-center shadow-[0_6px_24px_rgba(8,32,84,0.06)]">
            <Handshake className="w-10 h-10 text-[#9CB6D6] mx-auto mb-3" />
            <p className="text-[#5C7188]">No listings yet — your approval inbox will appear here.</p>
          </div>
        )}

        {!isLoading && hasAny && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RENTS */}
            <div className="space-y-6">
              <div className="sticky top-2 z-10 -mt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#003175] border border-[#CFE0FF]">
                  <Home className="w-4 h-4" />
                  <span className="text-xs font-semibold">Rent Requests</span>
                </div>
              </div>
              {myRents.map((r: Rent) => (
                <RentRail key={r.id} listing={r} />
              ))}
              {myRents.length === 0 && <div className="text-sm text-[#5C7188]">No rent listings.</div>}
            </div>

            {/* BUYS */}
            <div className="space-y-6">
              <div className="sticky top-2 z-10 -mt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F8F1] text-[#0B8F55] border border-[#AEE5C9]">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-semibold">Buy Offers</span>
                </div>
              </div>
              {myBuys.map((b: Buy) => (
                <BuyRail key={b.id} listing={b} />
              ))}
              {myBuys.length === 0 && <div className="text-sm text-[#5C7188]">No buy listings.</div>}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
