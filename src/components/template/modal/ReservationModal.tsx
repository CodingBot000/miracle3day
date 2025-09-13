import React, { useState, useMemo } from 'react';

interface TimeSlot {
  time: string;
  enabled: boolean;
}

interface ReservationModalProps {
  onConfirm: (date: string, time: string) => void;
  onClose: () => void;
  timeSlots?: TimeSlot[];
}

const getDefaultTimeSlots = (selectedDate?: Date | null): TimeSlot[] => {
  const allSlots: TimeSlot[] = [
    { time: '10:00', enabled: true },
    { time: '10:30', enabled: true },
    { time: '11:00', enabled: true },
    { time: '11:30', enabled: true },
    { time: '12:00', enabled: true },
    { time: '12:30', enabled: true },
    { time: '13:00', enabled: true },
    { time: '13:30', enabled: true },
    { time: '14:00', enabled: true },
    { time: '14:30', enabled: true },
    { time: '15:00', enabled: true },
    { time: '15:30', enabled: true },
    { time: '16:00', enabled: true },
    { time: '16:30', enabled: true },
    { time: '17:00', enabled: true },
    { time: '17:30', enabled: true },
    { time: '18:00', enabled: true }
  ];

  if (!selectedDate) return allSlots;

  const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
  
  // 토요일인 경우 13:00까지만 표시
  if (dayOfWeek === 6) {
    return allSlots.filter(slot => slot.time <= '13:00');
  }
  
  return allSlots;
};

const getToday = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const ReservationModal: React.FC<ReservationModalProps> = ({ onConfirm, onClose, timeSlots }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = getToday();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const slots = useMemo(() => timeSlots || getDefaultTimeSlots(selectedDate), [timeSlots, selectedDate]);

  const getCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const dates: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) dates.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      dates.push(new Date(year, month, d));
    }
    return dates;
  };

  const isBeforeToday = (date: Date) => {
    const today = getToday();
    return date < today;
  };

  const isSunday = (date: Date) => {
    return date.getDay() === 0; // 0 = Sunday
  };

  const handleDateSelect = (date: Date | null) => {
    if (!date || isBeforeToday(date) || isSunday(date)) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (!slot.enabled) return;
    setSelectedTime(slot.time);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      onConfirm(dateStr, selectedTime);
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  const moveMonth = (diff: number) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() + diff, 1);
      return newMonth;
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20">
      <div
        className={`bg-white flex flex-col relative overflow-y-auto
          ${isMobile
            ? 'w-full min-h-screen rounded-none shadow-none m-0'
            : 'w-[420px] max-h-[calc(100vh-64px)] my-8 rounded-2xl shadow-lg'}
        `}
        style={{ maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)' }}
      >
        {/* 상단 */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
          <span className="text-xl font-medium">DATE</span>
          <button onClick={onClose} className="text-2xl bg-none border-none cursor-pointer">×</button>
        </div>
        {/* 안내문구 */}
        <div className="flex items-center gap-2 bg-[#f7f9fa] text-gray-600 text-base px-6 py-4 m-6 rounded-lg">
          <span className="text-lg">ⓘ</span>
          <span>Reservation times vary by day of the week, so please check the schedule before booking.</span>
        </div>
        {/* 달력 */}
        <div className="px-6 flex flex-col items-center">
          <div className="flex items-center justify-center gap-6 mb-2">
            <button onClick={() => moveMonth(-1)} className="bg-none border-none text-2xl cursor-pointer">{'<'}</button>
            <span className="text-lg font-medium">{currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
            <button onClick={() => moveMonth(1)} className="bg-none border-none text-2xl cursor-pointer">{'>'}</button>
          </div>
          <div className="grid grid-cols-7 w-full text-center mb-2">
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(day => (
              <div key={day} className="text-gray-400 font-medium py-1">{day}</div>
            ))}
            {getCalendarDates().map((date, idx) => {
              if (!date) return <div key={idx}></div>;
              const disabled = isBeforeToday(date) || isSunday(date);
              const selected = selectedDate && date.getFullYear() === selectedDate.getFullYear() && date.getMonth() === selectedDate.getMonth() && date.getDate() === selectedDate.getDate();
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={`m-1 w-9 h-9 rounded-full border-none font-medium transition-colors
                    ${selected ? 'bg-[#3ec6ad] text-white font-bold' : ''}
                    ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-[#e6faf7] cursor-pointer'}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
        {/* 시간 선택 */}
        {selectedDate && (
          <div className="px-6 mt-4">
            <div className="font-medium mb-2">Select Time</div>
            <div className="flex flex-wrap gap-3">
              {slots.map(slot => (
                <button
                  key={slot.time}
                  onClick={() => handleTimeSelect(slot)}
                  disabled={!slot.enabled}
                  className={`min-w-[72px] px-0 py-2 rounded-lg border transition-colors
                    ${selectedTime === slot.time ? 'border-[#3ec6ad] bg-[#e6faf7] font-bold' : 'border-gray-200 bg-white'}
                    ${!slot.enabled ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-[#e6faf7] cursor-pointer'}`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* CONFIRM 버튼 */}
        <button
          onClick={handleConfirm}
          disabled={!(selectedDate && selectedTime)}
          className={`mx-6 mt-8 mb-6 py-4 w-[calc(100%-48px)] rounded-lg font-semibold text-lg border-none transition-colors
            ${selectedDate && selectedTime ? 'bg-[#b6f2e3] text-gray-900 cursor-pointer' : 'bg-[#eaf6f4] text-gray-400 cursor-not-allowed'}`}
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
};

export default ReservationModal;
