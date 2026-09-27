"use client";

import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  error?: string;
  align?: "left" | "right";
  placeholder?: string;
  theme?: "blue" | "amber";
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label = "Match Date",
  error,
  align = "left",
  placeholder,
  theme = "blue",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Current view month/year in calendar
  const initialDate = value ? dayjs(value) : dayjs();
  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(
    initialDate.isValid() ? initialDate : dayjs()
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calendar math
  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0 = Sun, 1 = Mon ...

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const handleSelectDay = (dayNum: number) => {
    const selected = currentMonth.date(dayNum).format("YYYY-MM-DD");
    onChange(selected);
    setIsOpen(false);
  };

  const displayDate = value && dayjs(value).isValid()
    ? dayjs(value).format("ddd, DD MMM YYYY")
    : (placeholder || (label ? `Select ${label}` : "Select Date"));

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-14 flex items-center justify-between px-3.5 py-2 bg-[#f8fafc] border rounded-xl text-xs font-semibold text-slate-800 hover:bg-white focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer shadow-2xs ${
          error
            ? "border-red-400 focus:ring-red-100 bg-red-50/30"
            : isOpen
            ? theme === "amber"
              ? "border-amber-500 ring-2 ring-amber-500/10 bg-white shadow-sm"
              : "border-blue-500 ring-2 ring-blue-500/10 bg-white shadow-sm"
            : theme === "amber"
            ? "border-slate-200 hover:border-amber-300 hover:shadow-xs"
            : "border-slate-200 hover:border-blue-300 hover:shadow-xs"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <div
            className={`w-8 h-8 rounded-lg text-white flex items-center justify-center shrink-0 shadow-xs ${
              theme === "amber"
                ? "bg-gradient-to-br from-amber-500 to-amber-600"
                : "bg-gradient-to-br from-blue-500 to-indigo-600"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="text-left truncate">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Date
            </span>
            <span className={`block text-xs font-bold truncate ${value ? "text-slate-900" : "text-slate-400 font-medium"}`}>
              {displayDate}
            </span>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
            theme === "amber"
              ? "bg-amber-50 text-amber-800 border-amber-200/80"
              : "bg-blue-50 text-blue-700 border-blue-100/80"
          }`}
        >
          Calendar
        </span>
      </button>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* POPUP CALENDAR DROPDOWN */}
      {isOpen && (
        <div className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-bold text-gray-900">
              {currentMonth.format("MMMM YYYY")}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for previous month days */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = currentMonth.date(dayNum).format("YYYY-MM-DD");
              const isSelected = value === dateStr;
              const isToday = dayjs().format("YYYY-MM-DD") === dateStr;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? (theme === "amber" ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-md shadow-amber-500/25 scale-105" : "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 scale-105")
                      : isToday
                      ? (theme === "amber" ? "bg-amber-50 text-amber-700 font-bold border border-amber-200" : "bg-blue-50 text-blue-600 font-bold border border-blue-200")
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {dayNum}
                  {isToday && !isSelected && (
                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${theme === "amber" ? "bg-amber-600" : "bg-blue-600"}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Presets Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const todayStr = dayjs().format("YYYY-MM-DD");
                  onChange(todayStr);
                  setCurrentMonth(dayjs());
                  setIsOpen(false);
                }}
                className="text-[10px] font-bold px-2 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 rounded-md transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomStr = dayjs().add(1, "day").format("YYYY-MM-DD");
                  onChange(tomStr);
                  setCurrentMonth(dayjs().add(1, "day"));
                  setIsOpen(false);
                }}
                className="text-[10px] font-bold px-2 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 rounded-md transition-colors cursor-pointer"
              >
                Tomorrow
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold px-2 py-1 bg-gray-50 hover:bg-gray-200 text-gray-500 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
