'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/button';
import { useRouter } from 'next/navigation';

// ---------- Types ----------
type Review = {
  id: string;
  name: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string; // ISO
};

type Props = {
  slug: string;
  isRent: boolean;
  propertyName: string;
  currentUserName?: string | null;
  onLogin?: () => void;
  loginHref?: string;
};

// ---------- Local storage helpers ----------
const REVIEWS_KEY = (slug: string) => `reviews:${slug}`;

function loadReviews(slug: string): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REVIEWS_KEY(slug));
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

function saveReviews(slug: string, reviews: Review[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REVIEWS_KEY(slug), JSON.stringify(reviews));
}

// ---------- Stars ----------
const Stars: React.FC<{
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
  ariaLabel?: string;
}> = ({ value, onChange, size = 22, readOnly, ariaLabel }) => {
  const Star = ({ filled }: { filled: boolean }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`transition-colors ${filled ? 'text-[#FFB545]' : 'text-[#B9C7DC]'}`}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 17.27l6.18 3.73-1.64-7.03L21.5 9.24l-7.12-.61L12 2 9.62 8.63 2.5 9.24l4.96 4.73L5.82 21z"
      />
    </svg>
  );

  if (readOnly) {
    return (
      <div role="img" aria-label={ariaLabel} className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} filled={value >= n} />
        ))}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className="rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3871C1] hover:scale-[1.02] active:scale-[0.98] transition"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star filled={value >= n} />
        </button>
      ))}
    </div>
  );
};

// ---------- ReviewSection ----------
const ReviewSection: React.FC<Props> = ({
  slug,
  isRent,
  propertyName,
  currentUserName,
}) => {
  const router = useRouter();

  const MAX_LEN = 600;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // pagination state
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const isAuthed = !!(currentUserName && currentUserName.trim().length > 0);

  useEffect(() => {
    // Optional: skip side effect when not used
    if (!isRent) return;
    setReviews(loadReviews(slug));
  }, [slug, isRent]);

  const avg = useMemo(
    () => (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0),
    [reviews]
  );

  const starCounts = useMemo(() => {
    const m: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      m[r.rating] = (m[r.rating] ?? 0) + 1;
    });
    return m;
  }, [reviews]);

  const sorted = useMemo(() => {
    const arr = [...reviews];
    if (sortBy === 'highest')
      return arr.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
    if (sortBy === 'lowest')
      return arr.sort((a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt));
    return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reviews, sortBy]);

  useEffect(() => setPage(1), [sortBy, reviews.length]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visible = sorted.slice(start, start + PAGE_SIZE);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthed) return setError('You must be logged in to post a review.');
    if (rating < 1 || rating > 5) return setError('Please select a rating.');
    if (!comment.trim()) return setError('Please write a short comment.');

    const newReview: Review = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      name: currentUserName!.trim(),
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    const next = [newReview, ...reviews];
    setReviews(next);
    saveReviews(slug, next);
    setRating(0);
    setComment('');
    setPage(1);
  };

  const disabledSubmit = rating < 1 || !comment.trim();

  if (!isRent) return null;

  return (
    <div className="mb-12">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#0F274A]">Reviews (Renters)</h2>
          <p className="text-sm text-[#5C7188]">
            Share your renting experience for{' '}
            <span className="font-medium text-[#002353]">{propertyName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Stars value={Math.round(avg)} readOnly ariaLabel={`Average rating for ${propertyName}`} />
            <span className="text-sm text-[#3A4B63]">
              {avg ? avg.toFixed(1) : '0.0'} · {reviews.length} review{reviews.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="hidden sm:block w-px h-6 bg-[#D6E3F5]" />

          <label className="sr-only" htmlFor="reviews-sort">
            Sort reviews
          </label>
          <select
            id="reviews-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-[#AFC4DD] rounded-lg px-3 py-2 bg-[#F7FAFF] text-[#0F274A] focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest rating</option>
            <option value="lowest">Lowest rating</option>
          </select>
        </div>
      </div>

      {/* 3 columns: Form/Login • Breakdown • Reviews */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT CELL: Login CTA or form */}
        {!isAuthed ? (
          <div
            role="region"
            aria-label="Login to leave a review"
            className="bg-white border border-[#D6E3F5] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex items-center justify-center"
          >
            <div className="text-center max-w-sm">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-[#E7EEF8] flex items-center justify-center text-[#3871C1]">
                ★
              </div>
              <h3 className="text-base font-semibold text-[#0F274A]">Log in to leave a review</h3>
              <p className="text-sm text-[#5C7188] mt-1">
                You need an account to rate and share your renting experience.
              </p>
              <div className="mt-4 flex justify-center">
                <Button type="button" onClick={() => router.push('/auth?login')} aria-label="Log in to review">
                  Log in
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="bg-white border border-[#D6E3F5] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
            aria-label="Leave a review"
          >
            <div className="mb-4 rounded-md bg-[#F7FAFF] border border-[#DDE8FA] px-3 py-2 text-sm text-[#0F274A]">
              Signed in as <span className="font-bold">{currentUserName}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <label className="text-sm font-medium text-[#0F274A]">Your Rating</label>
              <Stars value={rating} onChange={setRating} ariaLabel="Select rating" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="review-comment" className="block text-sm text-[#3A4B63] mb-1">
                  Comment
                </label>
                <span id="char-left" className="text-xs text-[#5C7188]">
                  {MAX_LEN - comment.length} chars left
                </span>
              </div>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={MAX_LEN}
                aria-describedby="char-left"
                aria-invalid={!!error}
                className={`w-full rounded-lg bg-white px-3 py-2 outline-none h-[410px] resize-y focus:ring-2 focus:ring-[#3871C1] ${
                  error ? 'border border-red-400' : 'border border-[#AFC4DD]'
                } text-[#0F274A] placeholder-[#8FA2BC]`}
                placeholder="Share your renting experience…"
                required
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-col items-center justify-center gap-3">
              <Button type="submit" disabled={disabledSubmit}>
                Submit Review
              </Button>
              <span className="text-xs text-[#5C7188]">
                By submitting, you agree to our community guidelines.
              </span>
            </div>
          </form>
        )}

        <div className="flex flex-col col-span-2 gap-6">
          {/* breakdown card */}
          <div className="bg-white border border-[#D6E3F5] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-[#0F274A]">{avg ? avg.toFixed(1) : '0.0'}</div>
              <div>
                <Stars value={Math.round(avg)} readOnly ariaLabel="Average stars" />
                <p className="text-xs text-[#5C7188] mt-1">{reviews.length} total</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {[5, 4, 3, 2, 1].map((s) => {
                const pct = reviews.length ? Math.round((starCounts[s] / reviews.length) * 100) : 0;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <span className="w-8 text-sm text-[#3A4B63]">{s}★</span>
                    <div className="flex-1 h-2 rounded-full bg-[#E7EEF8] overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-[#3871C1] transition-[width] duration-500"
                      />
                    </div>
                    <span className="w-10 text-right text-sm text-[#3A4B63]">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* reviews list */}
          <div className="bg-white border border-[#D6E3F5] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#D6E3F5]">
              <h3 className="text-sm font-semibold text-[#0F274A]">Recent Reviews</h3>
              <p className="text-xs text-[#5C7188]">
                Page {page} of {totalPages}
              </p>
            </div>

            <div className="flex flex-col h-[360px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
                {reviews.length === 0 ? (
                  <div className="bg-white border border-[#D6E3F5] rounded-xl p-6 text-center text-sm text-[#3A4B63]">
                    No reviews yet. Be the first to share your renting experience!
                  </div>
                ) : (
                  visible.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white border border-[#D6E3F5] rounded-xl p-4 shadow-[0_3px_16px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-[#E7EEF8] flex items-center justify-center text-[#3871C1] text-sm font-bold flex-shrink-0">
                            {(r.name || 'A').trim().charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#0F274A] truncate">{r.name}</p>
                            <div className="flex items-center gap-2">
                              <Stars value={r.rating} readOnly ariaLabel={`${r.rating} star rating`} size={16} />
                              <span className="text-xs text-[#5C7188]">
                                {new Date(r.createdAt).toLocaleDateString('en-PH', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs border border-[#D6E3F5] text-[#3A4B63]">
                          {r.rating}★
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[#2A3D52] break-words whitespace-pre-wrap">
                        {r.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination controls */}
              <div className="border-t border-[#D6E3F5] p-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-full border border-[#CFE0FF] text-[#3871C1] disabled:opacity-50 hover:bg-[#F0F5FF] transition"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1 text-xs text-[#3A4B63]" aria-hidden>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(
                      Math.max(0, Math.min(page - 3, totalPages - 5)),
                      Math.max(5, Math.min(totalPages, Math.max(page + 2, 5)))
                    )
                    .map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`h-8 min-w-8 px-2 rounded-full border ${
                          n === page
                            ? 'border-[#3871C1] text-[#0F274A] font-medium'
                            : 'border-[#CFE0FF] text-[#3871C1] hover:bg-[#F0F5FF]'
                        } transition`}
                      >
                        {n}
                      </button>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-full border border-[#CFE0FF] text-[#3871C1] disabled:opacity-50 hover:bg-[#F0F5FF] transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
