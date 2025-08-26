'use client';

import React, { useEffect, useMemo, useState } from 'react';

/* ---------- Module-level constants & helpers (stable for hooks) ---------- */

const BASE_TIMES: string[] = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

// Mock data for unavailable dates (Dec 2024)
const UNAVAILABLE_DATES: Readonly<Date[]> = Object.freeze([
  new Date(2024, 11, 15),
  new Date(2024, 11, 16),
  new Date(2024, 11, 20),
  new Date(2024, 11, 25),
  new Date(2024, 11, 26),
  new Date(2024, 11, 30),
]);

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const parseTimeToMinutes = (time: string) => {
  // "h:mm AM/PM" → minutes from midnight
  const [t, meridiem] = time.split(' ');
  const [hh, mm] = t.split(':').map((n) => parseInt(n, 10));
  let h24 = hh % 12;
  if (meridiem === 'PM') h24 += 12;
  return h24 * 60 + (mm || 0);
};

const todayMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const isDateInPast = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

const isDateUnavailable = (date: Date) =>
  UNAVAILABLE_DATES.some((u) => isSameDay(u, date));

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    daysInMonth: lastDay.getDate(),
    startingDayOfWeek: firstDay.getDay(), // 0 (Sun) - 6 (Sat)
  };
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

/* ------------------------------------------------------------------------ */

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
}

const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  isOpen,
  onClose,
  propertyName,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [successOpen, setSuccessOpen] = useState(false);

  // If the selected date is today, only show future times
  const availableTimes = useMemo<string[]>(() => {
    if (!selectedDate) return BASE_TIMES;
    if (isSameDay(selectedDate, new Date())) {
      const nowMin = todayMinutes();
      return BASE_TIMES.filter((t) => parseTimeToMinutes(t) > nowMin);
    }
    return BASE_TIMES;
  }, [selectedDate]);

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handleDateSelect = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (!isDateInPast(date) && !isDateUnavailable(date)) {
      setSelectedDate(date);
      // reset time if it’s no longer valid for today
      if (selectedTime && isSameDay(date, new Date())) {
        const stillValid = parseTimeToMinutes(selectedTime) > todayMinutes();
        if (!stillValid) setSelectedTime('');
      }
    }
  };

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      console.log(
        'Scheduling visit for:',
        formatDate(selectedDate),
        'at',
        selectedTime
      );
      setSuccessOpen(true);
      setSelectedDate(null);
      setSelectedTime('');
      onClose();
    }
  };

  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // When modal is closed, still allow success modal to show
  if (!isOpen) {
    return (
      <>
        {successOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setSuccessOpen(false)}
            />
            <div className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
              <svg
                className="w-16 h-16 text-green-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h2 className="text-xl font-bold mb-2">Visit Scheduled!</h2>
              <p className="text-gray-600 mb-6">
                Your property visit has been successfully scheduled.
              </p>
              <button
                onClick={() => setSuccessOpen(false)}
                className="px-6 py-2 rounded-lg bg-[#3871C1] text-white hover:bg-[#2f5ea6] transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Main Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-visit-title"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        {/* Modal Card */}
        <div
          className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl ring-1 ring-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-6 border-b border-[#d1d5dc] bg-white/70 backdrop-blur-sm">
            <div className="min-w-0">
              <h2
                id="schedule-visit-title"
                className="text-xl md:text-2xl font-bold text-[#002353]"
              >
                Schedule a Visit
              </h2>
              <p className="text-sm text-[#5C7188] truncate">{propertyName}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-[#5C7188] hover:text-[#002353] transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar */}
              <div className="bg-[#F8FAFF] border border-[#E6EEF9] rounded-xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevMonth}
                    aria-label="Previous month"
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <h4 className="text-base md:text-lg font-semibold text-[#002353]">
                    {currentMonth.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h4>

                  <button
                    onClick={nextMonth}
                    aria-label="Next month"
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#5C7188] mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="py-2">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const date = new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      day
                    );
                    const unavailable = isDateUnavailable(date);
                    const past = isDateInPast(date);
                    const selected =
                      !!selectedDate && isSameDay(date, selectedDate);
                    const today = isSameDay(date, new Date());

                    const disabled = past || unavailable;

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        disabled={disabled}
                        className={[
                          'aspect-square rounded-lg text-sm flex items-center justify-center transition',
                          disabled
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-white cursor-pointer',
                          selected
                            ? 'bg-[#3871C1] text-white hover:bg-[#2f5ea6]'
                            : 'bg-transparent text-[#002353]',
                          today && !selected && !disabled
                            ? 'ring-1 ring-[#C9DBEE]'
                            : '',
                          unavailable ? 'line-through' : '',
                        ].join(' ')}
                        aria-label={date.toDateString()}
                        aria-pressed={selected}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs mt-4 text-[#5C7188]">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#3871C1]" /> Selected
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-gray-300" /> Unavailable
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 rounded ring-1 ring-[#C9DBEE]" /> Today
                  </span>
                </div>
              </div>

              {/* Time selection */}
              <div className="bg-white border border-[#E6EEF9] rounded-xl p-4 md:p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#002353] mb-2">
                  Select Time
                </h3>

                {selectedDate ? (
                  <>
                    <p className="text-sm text-[#5C7188] mb-4">
                      Available times for{' '}
                      <span className="font-medium text-[#002353]">
                        {formatDate(selectedDate)}
                      </span>
                    </p>

                    {availableTimes.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableTimes.map((time) => {
                          const active = selectedTime === time;
                          return (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={[
                                'px-3 py-2 rounded-lg text-sm font-medium border transition',
                                active
                                  ? 'border-[#3871C1] bg-[#EAF2FF] text-[#3871C1]'
                                  : 'border-gray-200 hover:border-[#C9DBEE] text-[#002353]',
                              ].join(' ')}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="w-10 h-10 text-gray-300 mx-auto mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-sm text-[#5C7188]">
                          No remaining times today. Please choose another date.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTime('');
                          setSelectedDate(null);
                        }}
                        className="text-xs text-[#5C7188] hover:text-[#002353] underline"
                      >
                        Clear selection
                      </button>
                      {selectedDate && selectedTime && (
                        <div className="text-xs text-[#002353]">
                          <span className="opacity-70 mr-1">Selected:</span>
                          <span className="font-medium">
                            {formatDate(selectedDate)} · {selectedTime}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <svg
                      className="w-12 h-12 text-gray-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-[#5C7188]">
                      Please select a date to see available times.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Actions */}
          <div className="p-4 border-t border-[#d1d5dc] bg-white/80 backdrop-blur-sm sticky bottom-0">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-[#002353] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedTime}
                className={[
                  'px-5 py-2.5 rounded-lg font-semibold transition-colors',
                  selectedDate && selectedTime
                    ? 'bg-[#3871C1] text-white hover:bg-[#2f5ea6]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed',
                ].join(' ')}
              >
                Schedule Visit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSuccessOpen(false)}
          />
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
            <svg
              className="w-16 h-16 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-xl font-bold mb-2">Visit Scheduled!</h2>
            <p className="text-gray-600 mb-6">
              Your property visit has been successfully scheduled.
            </p>
            <button
              onClick={() => setSuccessOpen(false)}
              className="px-6 py-2 rounded-lg bg-[#3871C1] text-white hover:bg-[#2f5ea6] transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleVisitModal;
