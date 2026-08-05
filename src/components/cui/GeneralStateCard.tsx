"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";

export type GeneralStateCardProps = {
  title: string;
  value: number | string;
  description?: string;
  id?: string;
  icon?: React.ElementType | React.ReactNode;
};

const GeneralStateCard = ({
  className = "",
  items,
}: {
  className?: string;
  items: GeneralStateCardProps[];
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleTab = (id: string) => {
    setActiveTab(id);
  };

  const isActiveTab = (id: string) => {
    return activeTab === id;
  };

  useEffect(() => {
    if (items?.[0]?.id) {
      handleTab(items[0].id);
    }
  }, [items]);

  return (
    <div className={`grid gap-4 ${className}`}>
      {items.map((item, idx) => {
        const itemId = item.id || `card-${idx}`;
        const active = isActiveTab(itemId);

        return (
          <div
            key={itemId}
            onClick={() => handleTab(itemId)}
            className={`group relative overflow-hidden p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
              active
                ? "bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-md"
                : "bg-white border-slate-200/90 hover:border-slate-400 hover:shadow-xs"
            }`}
          >
            {/* Top Active Accent Bar */}
            {active && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 rounded-t-2xl" />
            )}

            {/* Header: Title */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3
                className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                  active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                }`}
              >
                {item.title}
              </h3>
            </div>

            {/* Value */}
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900">
              {typeof item.value === "number"
                ? item.value.toLocaleString()
                : item.value}
            </p>

            {/* Description */}
            {item.description && (
              <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GeneralStateCard;