'use client';

import { motion } from 'framer-motion';
import { X, CreditCard, Smartphone, Wallet, Building2, QrCode } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/button';
import { useState, useEffect } from 'react';
import { useCreatePendingSale } from '@/features/buy/hooks';
import { useCreatePendingRental } from '@/features/rent/hooks';

type SendOfferModalProps = {
  isOpen: boolean;
  onClose: () => void;
  property: {
    listingType: string;
    name: string;
    rentId: string;
    listerId: string;
    tenantId: string;
    address: string;
    freq: string;
    price: number;
    image?: string;
  };
};

type ProviderId =
  | 'gcash' | 'maya' | 'grabpay' | 'shopeepay' | 'coins'
  | 'card'
  | 'bpi' | 'bdo' | 'unionbank' | 'metrobank' | 'security' | 'landbank'
  | '711' | 'cebuana' | 'mlhuillier';

const PROVIDERS: Record<string, { title: string; items: { id: ProviderId; label: string; icon?: 'wallet' | 'phone' | 'card' | 'bank' }[] }> = {
  'E-wallets': {
    title: 'E-wallets',
    items: [
      { id: 'gcash', label: 'GCash', icon: 'phone' },
      { id: 'maya', label: 'Maya', icon: 'phone' },
      { id: 'grabpay', label: 'GrabPay', icon: 'phone' },
      { id: 'shopeepay', label: 'ShopeePay', icon: 'phone' },
      { id: 'coins', label: 'Coins.ph', icon: 'phone' },
    ],
  },
  'Cards': {
    title: 'Cards',
    items: [{ id: 'card', label: 'Debit/Credit (Visa/Mastercard)', icon: 'card' }],
  },
  'Online banking': {
    title: 'Online banking',
    items: [
      { id: 'bpi', label: 'BPI', icon: 'bank' },
      { id: 'bdo', label: 'BDO', icon: 'bank' },
      { id: 'unionbank', label: 'UnionBank', icon: 'bank' },
      { id: 'metrobank', label: 'Metrobank', icon: 'bank' },
      { id: 'security', label: 'Security Bank', icon: 'bank' },
      { id: 'landbank', label: 'Landbank', icon: 'bank' },
    ],
  },
  'Over-the-counter': {
    title: 'Over-the-counter',
    items: [
      { id: '711', label: '7-Eleven (CLiQQ)', icon: 'wallet' },
      { id: 'cebuana', label: 'Cebuana Lhuillier', icon: 'wallet' },
      { id: 'mlhuillier', label: 'M Lhuillier', icon: 'wallet' },
    ],
  },
};

export default function SendOfferModal({ isOpen, onClose, property }: SendOfferModalProps) {
  const [message, setMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(null);

  // Non-functional payment UI states
  const [cardInfo, setCardInfo] = useState({ name: '', number: '', exp: '', cvc: '' });
  const [walletInfo, setWalletInfo] = useState({ mobile: '', name: '' });
  const [bankInfo, setBankInfo] = useState({ accountName: '', accountNumber: '', reference: '' });
  const [otcInfo, setOtcInfo] = useState({ fullName: '', mobile: '' });

  const createSale = useCreatePendingSale();
  const createRental = useCreatePendingRental();

  // Close on ESC (nice for desktop)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      // Payment UI is non-functional (not sent)
      if (property.listingType === 'buy') {
        await createSale.mutateAsync({
          buy_id: property.rentId,
          lister_id: property.listerId,
          buyer_id: property.tenantId,
          message,
        });
      } else {
        await createRental.mutateAsync({
          rent_id: property.rentId,
          lister_id: property.listerId,
          tenant_id: property.tenantId,
          message,
        });
      }
      onClose();
    } catch (err) {
      console.error('Offer failed:', err);
    }
  };

  const isSending = createSale.isPending || createRental.isPending;

  const ProviderIcon = (kind?: 'wallet' | 'phone' | 'card' | 'bank') => {
    if (kind === 'card') return <CreditCard className="h-4 w-4" />;
    if (kind === 'phone') return <Smartphone className="h-4 w-4" />;
    if (kind === 'bank') return <Building2 className="h-4 w-4" />;
    return <Wallet className="h-4 w-4" />;
  };

  const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-center gap-2 text-[#002353]">
      <div className="p-1.5 rounded-lg bg-[#EDF3FF] text-[#3871C1]">{icon}</div>
      <h3 className="text-base md:text-lg font-semibold">{children}</h3>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center px-0 md:px-4"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 1 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full md:max-w-2xl lg:max-w-3xl rounded-t-3xl md:rounded-3xl bg-white backdrop-blur-xl shadow-2xl border border-[#E3ECF9] overflow-hidden
                   max-h-[92vh] md:max-h-[85vh] flex flex-col"
      >
        {/* Header (sticky for long content) */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[#E3ECF9] bg-gradient-to-r from-[#F9FAFF] to-[#EFF5FF]">
          <h2 className="text-lg md:text-xl font-semibold text-[#002353] flex items-center gap-2">
            Send an Offer
          </h2>
          <button
            onClick={onClose}
            className="p-2 md:p-2.5 rounded-full hover:bg-[#EDF3FF] transition-colors text-[#5C7188]"
            aria-label="Close"
          >
            <X className="h-5 w-5 md:h-5 md:w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 space-y-5 md:space-y-6">
          {/* Property preview */}
          <div className="flex items-center gap-3 md:gap-4 p-3 rounded-2xl">
            {property.image && (
              <div className="relative w-24 h-16 md:w-28 md:h-20 shrink-0 rounded-xl overflow-hidden">
                <Image src={property.image} alt={property.name} fill className="object-cover" />
              </div>
            )}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-[#002353]">{property.name}</h3>
              <p className="text-xs md:text-sm text-[#5C7188]">{property.address}</p>
              <p className="text-[#3871C1] font-bold mt-1 text-sm md:text-base">
                ₱{property.price.toLocaleString()}{' '}
                <span className="font-normal text-[#002353]/60">/ {property.freq}</span>
              </p>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-[#001619B2] mb-2">
              Message to the owner
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. I’m very interested in this property. Can we arrange a viewing or discuss the price?"
              rows={4}
              className="w-full rounded-xl border border-[#D2E4FF] bg-[#F9FAFF] px-3 md:px-4 py-2.5 md:py-3 text-sm 
                         placeholder:text-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#3871C1] transition"
            />
          </div>

          {/* Payment (UI only) */}
          <div className="space-y-4">
            <SectionTitle icon={<Wallet className="h-5 w-5" />}>Payment (optional)</SectionTitle>
            <p className="text-xs md:text-sm text-[#5C7188]">
              Choose a preferred method to include with your offer. This won’t charge you.
            </p>

            <div className="space-y-5">
              {Object.entries(PROVIDERS).map(([groupName, group]) => (
                <div key={groupName} className="space-y-3">
                  <div className="text-[11px] md:text-xs font-semibold uppercase tracking-wide text-[#5C7188]">
                    {group.title}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
                    {group.items.map((item) => {
                      const selected = selectedProvider === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedProvider(item.id)}
                          className={`flex items-center justify-between w-full rounded-xl border px-3.5 md:px-4 py-2.5 md:py-3 text-left transition
                            ${selected ? 'border-[#8FB6FF] ring-2 ring-[#3871C1] bg-[#F5F8FF]' : 'border-[#D2E4FF] hover:bg-[#F9FAFF]'}`}
                          disabled={isSending}
                        >
                          <span className="flex items-center gap-2.5 md:gap-3">
                            <span className="p-1.5 md:p-2 rounded-lg bg-[#EDF3FF] text-[#3871C1]">
                              {ProviderIcon(item.icon)}
                            </span>
                            <span className="text-sm font-medium text-[#002353]">{item.label}</span>
                          </span>
                          <span
                            className={`h-5 w-5 rounded-full border flex items-center justify-center
                              ${selected ? 'border-[#3871C1] bg-[#3871C1]' : 'border-[#CFE0FF] bg-white'}`}
                          >
                            {selected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Conditional details */}
            {selectedProvider && (
              <div className="rounded-2xl border border-[#E3ECF9] bg-[#F9FAFF] p-3.5 md:p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white text-[#3871C1] border border-[#E3ECF9]">
                      {selectedProvider === 'card' ? (
                        <CreditCard className="h-4 w-4" />
                      ) : ['bpi', 'bdo', 'unionbank', 'metrobank', 'security', 'landbank'].includes(selectedProvider) ? (
                        <Building2 className="h-4 w-4" />
                      ) : ['gcash', 'maya', 'grabpay', 'shopeepay', 'coins'].includes(selectedProvider) ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Wallet className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-sm font-semibold text-[#002353]">
                      {(() => {
                        const label = Object.values(PROVIDERS).flatMap(g => g.items).find(i => i.id === selectedProvider)?.label;
                        return label || 'Selected method';
                      })()}
                    </div>
                  </div>
                  {['gcash', 'maya', 'grabpay', 'shopeepay', 'coins'].includes(selectedProvider) && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3871C1] hover:underline"
                      disabled={isSending}
                      onClick={() => {}}
                      title="Show QR (UI only)"
                    >
                      <QrCode className="h-4 w-4" />
                      Show sample QR
                    </button>
                  )}
                </div>

                {/* Fields */}
                {/* Card */}
                {selectedProvider === 'card' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Name on card</label>
                      <input
                        value={cardInfo.name}
                        onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                        placeholder="Juan Dela Cruz"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Card number</label>
                      <input
                        value={cardInfo.number}
                        onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Expiry (MM/YY)</label>
                      <input
                        value={cardInfo.exp}
                        onChange={(e) => setCardInfo({ ...cardInfo, exp: e.target.value })}
                        placeholder="MM/YY"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">CVV</label>
                      <input
                        value={cardInfo.cvc}
                        onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                        placeholder="123"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                  </div>
                )}

                {/* E-wallets */}
                {['gcash', 'maya', 'grabpay', 'shopeepay', 'coins'].includes(selectedProvider) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Mobile number</label>
                      <input
                        value={walletInfo.mobile}
                        onChange={(e) => setWalletInfo({ ...walletInfo, mobile: e.target.value })}
                        placeholder="09XXXXXXXXX"
                        inputMode="tel"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Account name (optional)</label>
                      <input
                        value={walletInfo.name}
                        onChange={(e) => setWalletInfo({ ...walletInfo, name: e.target.value })}
                        placeholder="e.g. Juan Dela Cruz"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                    <p className="sm:col-span-2 text-xs text-[#5C7188]">
                      You’ll receive a payment request or QR after the owner accepts your offer.
                    </p>
                  </div>
                )}

                {/* Online banking */}
                {['bpi', 'bdo', 'unionbank', 'metrobank', 'security', 'landbank'].includes(selectedProvider) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Bank</label>
                      <input
                        value={(() => {
                          const label = Object.values(PROVIDERS).flatMap(g => g.items).find(i => i.id === selectedProvider)?.label;
                          return label || '';
                        })()}
                        readOnly
                        className="w-full rounded-lg border border-[#D2E4FF] bg-[#F9FAFF] px-3 py-2 text-sm text-[#5C7188]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Account name</label>
                      <input
                        value={bankInfo.accountName}
                        onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                        placeholder="Juan Dela Cruz"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Account number</label>
                      <input
                        value={bankInfo.accountNumber}
                        onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                        placeholder="###########"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Reference (optional)</label>
                      <input
                        value={bankInfo.reference}
                        onChange={(e) => setBankInfo({ ...bankInfo, reference: e.target.value })}
                        placeholder="InstaPay/PESONet reference"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                    <p className="sm:col-span-2 text-xs text-[#5C7188]">
                      For security, complete the transfer only after your offer is accepted.
                    </p>
                  </div>
                )}

                {/* Over the counter */}
                {['711', 'cebuana', 'mlhuillier'].includes(selectedProvider) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Full name</label>
                      <input
                        value={otcInfo.fullName}
                        onChange={(e) => setOtcInfo({ ...otcInfo, fullName: e.target.value })}
                        placeholder="Juan Dela Cruz"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#001619B2] mb-1">Mobile number</label>
                      <input
                        value={otcInfo.mobile}
                        onChange={(e) => setOtcInfo({ ...otcInfo, mobile: e.target.value })}
                        placeholder="09XXXXXXXXX"
                        inputMode="tel"
                        className="w-full rounded-lg border border-[#D2E4FF] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                        disabled={isSending}
                      />
                    </div>
                    <p className="sm:col-span-2 text-xs text-[#5C7188]">
                      Get a payment code and pay at your selected partner counter once the owner accepts your offer.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Summary strip */}
            <div className="flex items-center justify-between rounded-xl border border-[#E3ECF9] bg-gradient-to-r from-[#F9FAFF] to-[#EFF5FF] px-3.5 md:px-4 py-2.5 md:py-3">
              <span className="text-sm text-[#5C7188]">Offer amount</span>
              <span className="text-sm font-semibold text-[#002353]">
                ₱{property.price.toLocaleString()}{' '}
                <span className="text-[#002353]/60 font-normal">/ {property.freq}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer (sticky) */}
        <div className="sticky bottom-0 z-10 bg-gradient-to-r from-[#F9FAFF] to-[#EFF5FF] border-t border-[#E3ECF9] px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 w-full pb-[env(safe-area-inset-bottom)]">
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-[#3871C1] border border-[#CFE0FF] hover:bg-[#F5F8FF]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSending}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[#5AA6FF] via-[#3871C1] to-[#2D3E8B] 
              shadow-[0_10px_20px_rgba(56,113,193,0.35)] hover:shadow-[0_12px_24px_rgba(56,113,193,0.5)] 
              transition focus:outline-none focus:ring-4 focus:ring-[#3871C1]/30"
            >
              {isSending ? 'Sending…' : 'Send Offer'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
