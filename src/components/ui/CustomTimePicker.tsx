"use client";

import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { Clock, Check, X } from "lucide-react";

interface CustomTimePickerProps {
  value: string; // HH:mm format e.g. "15:00"
  onChange: (timeStr: string) => void;
  label?: string;
  error?: string;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  label = "Kick-off Time",
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parseHourMinute = (timeVal: string) => {
    if (!timeVal) return { hour12: "03", minute: "00", period: "PM" };
    const parts = timeVal.split(":");
    let h24 = parseInt(parts[0], 10);
    const m = parts[1] || "00";

    if (isNaN(h24)) h24 = 15;
    const period = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;

    return {
      hour12: h12 < 10 ? `0${h12}` : `${h12}`,
      minute: m.padStart(2, "0"),
      period,
    };
  };

  const current = parseHourMinute(value);

  const [selectedHour, setSelectedHour] = useState(current.hour12);
  const [selectedMin, setSelectedMin] = useState(current.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(current.period);

  useEffect(() => {
    const updated = parseHourMinute(value);
    setSelectedHour(updated.hour12);
    setSelectedMin(updated.minute);
    setSelectedPeriod(updated.period);
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

  const handleApplyTime = (h12: string, min: string, ampm: string) => {
    let h24 = parseInt(h12, 10);
    if (ampm === "PM" && h24 < 12) h24 += 12;
    if (ampm === "AM" && h24 === 12) h24 = 0;

    const formatted24 = `${h24 < 10 ? `0${h24}` : h24}:${min}`;
    onChange(formatted24);
  };

  const handleHourSelect = (h: string) => {
    setSelectedHour(h);
    handleApplyTime(h, selectedMin, selectedPeriod);
  };

  const handleMinSelect = (m: string) => {
    setSelectedMin(m);
    handleApplyTime(selectedHour, m, selectedPeriod);
  };

  const handlePeriodSelect = (p: string) => {
    setSelectedPeriod(p);
    handleApplyTime(selectedHour, selectedMin, p);
  };

  const handlePresetSelect = (time24: string) => {
    onChange(time24);
    setIsOpen(false);
  };

  const hoursList = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12"
  ];
  const minutesList = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
  const presetsList = ["14:00", "15:00", "18:00", "19:30", "20:00"];

  const displayTime = value
    ? dayjs(`2000-01-01 ${value}`).format("hh:mm A")
    : "Select Kick-off Time";

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-gray-700">
          {label}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-[#f8fafc] border rounded-2xl text-xs font-semibold text-gray-800 hover:bg-white focus:outline-none focus:ring-4 transition-all duration-200 cursor-pointer shadow-sm ${
          error
            ? "border-red-400 focus:ring-red-100 bg-red-50/30"
            : isOpen
            ? "border-amber-500 ring-4 ring-amber-500/10 bg-white shadow-md shadow-amber-500/5"
            : "border-gray-200 hover:border-amber-300 hover:shadow"
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-left truncate">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Time
            </span>
            <span className={`block text-xs font-bold truncate ${value ? "text-gray-900" : "text-gray-400 font-medium"}`}>
              {displayTime}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-100/80">
          Clock
        </span>
      </button>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* POPUP CLOCK TIME PICKER DROPDOWN */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Digital Time Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3 bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100/50">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-amber-900 tracking-wider">
                {selectedHour}:{selectedMin}
              </span>
              <span className="text-xs font-bold text-amber-600 ml-1">
                {selectedPeriod}
              </span>
            </div>

            {/* AM/PM Switcher */}
            <div className="flex bg-white p-0.5 rounded-lg border border-amber-200 shadow-sm">
              <button
                type="button"
                onClick={() => handlePeriodSelect("AM")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  selectedPeriod === "AM"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-amber-600"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handlePeriodSelect("PM")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  selectedPeriod === "PM"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-amber-600"
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Hours & Minutes Picker Grids */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Hours Grid */}
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Hour
              </span>
              <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto pr-1">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourSelect(h)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedHour === h
                        ? "bg-amber-500 text-white shadow-sm scale-105"
                        : "bg-gray-50 text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Grid */}
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Minute
              </span>
              <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto pr-1">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinSelect(m)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedMin === m
                        ? "bg-amber-500 text-white shadow-sm scale-105"
                        : "bg-gray-50 text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                  >
                    :{m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preset Kick-off Times */}
          <div className="pt-2 border-t border-gray-100 mb-3">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Quick Kick-off
            </span>
            <div className="flex flex-wrap gap-1">
              {presetsList.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handlePresetSelect(t)}
                  className="text-[10px] font-bold px-2 py-1 bg-gray-100 hover:bg-amber-100 hover:text-amber-800 text-gray-600 rounded-md transition-colors cursor-pointer"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full text-xs font-bold py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Check className="w-4 h-4" />
              Set Kick-off Time
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
