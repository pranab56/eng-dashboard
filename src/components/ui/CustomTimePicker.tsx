"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock, Check, X } from "lucide-react";

interface CustomTimePickerProps {
  value: string; // HH:mm format (24-hour) e.g. "15:00"
  onChange: (timeStr: string) => void;
  label?: string;
  error?: string;
  align?: "left" | "right";
  placeholder?: string;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  label,
  error,
  align = "left",
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse 24-hour "HH:mm"
  const parseHourMinute = (timeVal: string) => {
    if (!timeVal) return { hour24: "15", minute: "00" };
    const parts = timeVal.split(":");
    let h = parseInt(parts[0], 10);
    const m = parts[1] || "00";

    if (isNaN(h) || h < 0 || h > 23) h = 15;
    const cleanMin = parseInt(m, 10);
    const mStr =
      isNaN(cleanMin) || cleanMin < 0 || cleanMin > 59
        ? "00"
        : `${cleanMin < 10 ? `0${cleanMin}` : cleanMin}`;

    return {
      hour24: h < 10 ? `0${h}` : `${h}`,
      minute: mStr,
    };
  };

  const current = parseHourMinute(value);
  const [selectedHour, setSelectedHour] = useState(current.hour24);
  const [selectedMin, setSelectedMin] = useState(current.minute);

  useEffect(() => {
    const updated = parseHourMinute(value);
    setSelectedHour(updated.hour24);
    setSelectedMin(updated.minute);
  }, [value]);

  // Close on click outside
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

  const handleApplyTime = (h: string, min: string) => {
    const formatted = `${h}:${min}`;
    onChange(formatted);
  };

  const handleHourSelect = (h: string) => {
    setSelectedHour(h);
    handleApplyTime(h, selectedMin);
  };

  const handleMinSelect = (m: string) => {
    setSelectedMin(m);
    handleApplyTime(selectedHour, m);
  };

  const handlePresetSelect = (time24: string) => {
    onChange(time24);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  const hoursList = Array.from({ length: 24 }, (_, i) =>
    i < 10 ? `0${i}` : `${i}`
  );
  const minutesList = [
    "00", "05", "10", "15", "20", "25",
    "30", "35", "40", "45", "50", "55",
  ];
  const presetsList = [
    "09:00", "10:30", "12:00", "14:00",
    "15:00", "17:00", "18:30", "20:00",
  ];

  const displayTime = value || placeholder || (label ? `Select ${label}` : "Select Time");

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

      {/* Input Trigger Button (Matches CustomDatePicker exactly: h-10, rounded-md, border-slate-200) */}
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
          <Clock className="w-4 h-4 text-slate-500 shrink-0" />
          <span
            className={`truncate ${
              value
                ? "text-slate-900 font-medium font-mono"
                : "text-slate-400 font-normal"
            }`}
          >
            {displayTime}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear time"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            Pick
          </span>
        </div>
      </button>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* POPUP 24-HOUR TIME PICKER DROPDOWN */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-1.5 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Digital Time Header with Direct Editable Inputs */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 bg-gradient-to-r from-amber-50 to-orange-50/80 p-3 rounded-xl border border-amber-200/60">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                maxLength={2}
                value={selectedHour}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (!val) {
                    setSelectedHour("");
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (num >= 0 && num <= 23) {
                    const formatted = val.length === 2 ? (num < 10 ? `0${num}` : `${num}`) : val;
                    setSelectedHour(formatted);
                    if (val.length === 2) {
                      handleApplyTime(formatted, selectedMin || "00");
                    }
                  }
                }}
                onBlur={() => {
                  let num = parseInt(selectedHour, 10);
                  if (isNaN(num) || num < 0 || num > 23) num = 15;
                  const formatted = num < 10 ? `0${num}` : `${num}`;
                  setSelectedHour(formatted);
                  handleApplyTime(formatted, selectedMin || "00");
                }}
                className="w-12 h-10 text-center text-2xl font-black text-amber-950 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono shadow-xs"
                title="Type Hour (00-23)"
              />
              <span className="text-2xl font-black text-amber-900">:</span>
              <input
                type="text"
                maxLength={2}
                value={selectedMin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (!val) {
                    setSelectedMin("");
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (num >= 0 && num <= 59) {
                    const formatted = val.length === 2 ? (num < 10 ? `0${num}` : `${num}`) : val;
                    setSelectedMin(formatted);
                    if (val.length === 2) {
                      handleApplyTime(selectedHour || "15", formatted);
                    }
                  }
                }}
                onBlur={() => {
                  let num = parseInt(selectedMin, 10);
                  if (isNaN(num) || num < 0 || num > 59) num = 0;
                  const formatted = num < 10 ? `0${num}` : `${num}`;
                  setSelectedMin(formatted);
                  handleApplyTime(selectedHour || "15", formatted);
                }}
                className="w-12 h-10 text-center text-2xl font-black text-amber-950 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono shadow-xs"
                title="Type Minute (00-59)"
              />
            </div>

            <div className="text-right">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 mb-0.5">
                24-Hour Format
              </span>
              <span className="block text-[9px] text-amber-800 font-medium">
                Click or Type directly
              </span>
            </div>
          </div>

          {/* Hours & Minutes Grids */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* 24 Hours Grid */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Hours (00 - 23)
              </span>
              <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto pr-1">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourSelect(h)}
                    className={`py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                      selectedHour === h
                        ? "bg-amber-500 text-white shadow-xs scale-105"
                        : "bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Grid */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Minutes
              </span>
              <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto pr-1">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinSelect(m)}
                    className={`py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                      selectedMin === m
                        ? "bg-amber-500 text-white shadow-xs scale-105"
                        : "bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                  >
                    :{m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-slate-100 mb-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Quick Select
            </span>
            <div className="flex flex-wrap gap-1">
              {presetsList.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handlePresetSelect(t)}
                  className="text-[10px] font-bold font-mono px-2 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full text-xs font-semibold py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              Set Time ({selectedHour}:{selectedMin})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
