'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  propertyImage: string;
}

const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  isOpen,
  onClose,
  propertyName,
  propertyImage
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [successOpen, setSuccessOpen] = useState(false); // ✅ success modal state

  // Mock data for unavailable dates
  const unavailableDates = [
    new Date(2024, 11, 15),
    new Date(2024, 11, 16),
    new Date(2024, 11, 20),
    new Date(2024, 11, 25),
    new Date(2024, 11, 26),
    new Date(2024, 11, 30),
  ];

  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailable =>
      unavailable.getDate() === date.getDate() &&
      unavailable.getMonth() === date.getMonth() &&
      unavailable.getFullYear() === date.getFullYear()
    );
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateSelect = (day: number) => {
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateInPast(selectedDateObj) && !isDateUnavailable(selectedDateObj)) {
      setSelectedDate(selectedDateObj);
    }
  };

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      console.log('Scheduling visit for:', formatDate(selectedDate), 'at', selectedTime);

      // ✅ Show success modal
      setSuccessOpen(true);

      // Reset selections
      setSelectedDate(null);
      setSelectedTime('');

      // Close main modal
      onClose();
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  return (
    <>
      {/* Main Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                  <Image
                    src={propertyImage}
                    alt={propertyName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Schedule a Visit</h2>
                  <p className="text-gray-600">{propertyName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date</h3>

                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h4 className="text-lg font-medium">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}

                    {Array.from({ length: startingDayOfWeek }, (_, i) => (
                      <div key={`empty-${i}`} className="h-10"></div>
                    ))}

                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const isUnavailable = isDateUnavailable(date);
                      const isPast = isDateInPast(date);
                      const isSelected = selectedDate &&
                        selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentMonth.getMonth() &&
                        selectedDate.getFullYear() === currentMonth.getFullYear();

                      return (
                        <button
                          key={day}
                          onClick={() => handleDateSelect(day)}
                          disabled={isPast || isUnavailable}
                          className={`
                            h-10 rounded-lg text-sm font-medium transition-colors
                            ${isPast || isUnavailable
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'hover:bg-blue-50 cursor-pointer'
                            }
                            ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                            ${isUnavailable ? 'line-through' : ''}
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span>Unavailable</span>
                    </div>
                  </div>
                </div>

                {/* Time Selection Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time</h3>

                  {selectedDate ? (
                    <div>
                      <p className="text-gray-600 mb-4">
                        Available times for {formatDate(selectedDate)}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {availableTimes.map(time => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`
                              p-3 rounded-lg border text-sm font-medium transition-colors
                              ${selectedTime === time
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                              }
                            `}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500">Please select a date first</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!selectedDate || !selectedTime}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-colors
                    ${selectedDate && selectedTime
                      ? 'bg-[#3871C1] text-white  hover:bg-[#388fc1]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  Schedule Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSuccessOpen(false)}></div>

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full text-center shadow-lg">
            <svg
              className="w-16 h-16 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Visit Scheduled!</h2>
            <p className="text-gray-600 mb-6">
              Your property visit has been successfully scheduled.
            </p>
            <button
              onClick={() => setSuccessOpen(false)}
              className="px-6 py-2 rounded-lg bg-[#3871C1] text-white hover:bg-[#388fc1] transition-colors"
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
