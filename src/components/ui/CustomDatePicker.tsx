/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

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
  label,
  error,
  align = "left",
  placeholder,
  theme = "blue",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sync current month with incoming value or current date
  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(() => {
    if (value && dayjs(value).isValid()) {
      return dayjs(value);
    }
    return dayjs();
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Update calendar view month if value prop changes
  useEffect(() => {
    if (value && dayjs(value).isValid()) {
      setCurrentMonth(dayjs(value));
    }
  }, [value]);

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

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Calendar math
  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0 = Sun, 1 = Mon ...

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth((prev) => prev.subtract(1, "month"));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth((prev) => prev.add(1, "month"));
  };

  const handleSelectDay = (dayNum: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const selected = currentMonth.date(dayNum).format("YYYY-MM-DD");
    onChange(selected);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  const displayDate =
    value && dayjs(value).isValid()
      ? dayjs(value).format("ddd, DD MMM YYYY")
      : "";

  return (
    <div
      className={`space-y-1.5 relative ${isOpen ? "z-50" : "z-10"}`}
      ref={containerRef}
    >
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      {/* Input Trigger Button (Matches h-10 standard enterprise inputs) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-10 flex items-center justify-between px-3 py-2 bg-white border rounded-md text-xs sm:text-sm font-normal text-slate-800 hover:bg-slate-50/80 focus:outline-none focus:ring-2 transition-all cursor-pointer shadow-2xs select-none ${
          error
            ? "border-rose-400 focus:ring-rose-500/10 bg-rose-50/20"
            : isOpen
            ? "border-slate-500 ring-2 ring-slate-900/5 bg-white"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-slate-500 shrink-0" />
          <span
            className={`truncate ${
              displayDate
                ? "text-slate-900 font-medium"
                : "text-slate-400 font-normal"
            }`}
          >
            {displayDate || placeholder || (label ? `Select ${label}` : "Select Date")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            Pick
          </span>
        </div>
      </button>

      {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}

      {/* POPUP CALENDAR DROPDOWN */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-1.5 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs sm:text-sm font-semibold text-slate-900">
              {currentMonth.format("MMMM YYYY")}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1.5">
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
              <div key={`empty-${idx}`} className="h-7" />
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
                  onClick={(e) => handleSelectDay(dayNum, e)}
                  className={`h-7 rounded-md text-xs font-medium flex items-center justify-center transition-colors cursor-pointer relative ${
                    isSelected
                      ? theme === "amber"
                        ? "bg-amber-600 text-white font-semibold shadow-2xs"
                        : "bg-slate-900 text-white font-semibold shadow-2xs"
                      : isToday
                      ? "border border-slate-300 text-slate-900 font-semibold hover:bg-slate-100"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {dayNum}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-slate-900" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Presets Footer */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const todayStr = dayjs().format("YYYY-MM-DD");
                  onChange(todayStr);
                  setCurrentMonth(dayjs());
                  setIsOpen(false);
                }}
                className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const tomStr = dayjs().add(1, "day").format("YYYY-MM-DD");
                  onChange(tomStr);
                  setCurrentMonth(dayjs().add(1, "day"));
                  setIsOpen(false);
                }}
                className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
              >
                Tomorrow
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-[11px] font-medium px-2 py-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
