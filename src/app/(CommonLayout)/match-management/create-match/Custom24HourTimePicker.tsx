"use client";

import React, { useEffect, useRef, useState } from "react";
import { Clock, Check, X } from "lucide-react";

interface Custom24HourTimePickerProps {
  value: string; // "HH:mm" in 24-hour format
  onChange: (timeStr: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  align?: "left" | "right";
}

export const Custom24HourTimePicker: React.FC<Custom24HourTimePickerProps> = ({
  value,
  onChange,
  label = "Kick-off Time",
  error,
  placeholder = "Select Time (24h)",
  align = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleApplyTime = (h: string, min: string) => {
    const formatted = `${h}:${min}`;
    onChange(formatted);
  };

  const handleHourSelect = (h: string) => {
    setSelectedHour(h);
    handleApplyTime(h, selectedMin || "00");
  };

  const handleMinSelect = (m: string) => {
    setSelectedMin(m);
    handleApplyTime(selectedHour || "15", m);
  };

  const handlePresetSelect = (time24: string) => {
    onChange(time24);
    const parsed = parseHourMinute(time24);
    setSelectedHour(parsed.hour24);
    setSelectedMin(parsed.minute);
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
    "09:00", "10:30", "12:00", "13:30",
    "15:00", "16:30", "18:00", "19:30", "20:00",
  ];

  const displayTime = value ? `${value} (24h)` : "";

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

      {/* Input Trigger Button (Matches standard h-10 enterprise inputs) */}
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
              displayTime
                ? "text-slate-900 font-medium font-mono"
                : "text-slate-400 font-normal"
            }`}
          >
            {displayTime || placeholder}
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
            24h
          </span>
        </div>
      </button>

      {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}

      {/* POPUP 24-HOUR TIME PICKER DROPDOWN */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-1.5 w-76 sm:w-84 bg-white rounded-lg shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Digital Time Header with Direct Editable Inputs */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 bg-slate-50/80 p-2.5 rounded-md border border-slate-200">
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
                className="w-11 h-9 text-center text-lg font-bold text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 font-mono shadow-2xs"
                title="Type Hour (00-23)"
              />
              <span className="text-lg font-bold text-slate-600">:</span>
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
                className="w-11 h-9 text-center text-lg font-bold text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 font-mono shadow-2xs"
                title="Type Minute (00-59)"
              />
            </div>

            <div className="text-right">
              <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300/80 mb-0.5">
                24-Hour Military Format
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                Direct click or type
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mb-3">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Quick Kick-off Presets
            </span>
            <div className="flex flex-wrap gap-1">
              {presetsList.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handlePresetSelect(t)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors cursor-pointer font-mono ${
                    value === t
                      ? "bg-slate-900 text-white font-semibold"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Hours & Minutes Picker Grids */}
          <div className="grid grid-cols-2 gap-2.5 pb-3 border-b border-slate-100 mb-2.5">
            {/* 24-Hour Grid */}
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Hour (00 - 23)
              </span>
              <div className="grid grid-cols-4 gap-1 max-h-36 overflow-y-auto pr-1">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourSelect(h)}
                    className={`h-7 text-xs font-medium rounded transition-colors cursor-pointer font-mono ${
                      selectedHour === h
                        ? "bg-slate-900 text-white font-semibold shadow-2xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-200/70"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Grid */}
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Minute (00 - 55)
              </span>
              <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto pr-1">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinSelect(m)}
                    className={`h-7 text-xs font-medium rounded transition-colors cursor-pointer font-mono ${
                      selectedMin === m
                        ? "bg-slate-900 text-white font-semibold shadow-2xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-200/70"
                    }`}
                  >
                    :{m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                handleApplyTime(selectedHour || "15", selectedMin || "00");
                setIsOpen(false);
              }}
              className="text-xs font-semibold px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Set Kick-off Time
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Custom24HourTimePicker;
