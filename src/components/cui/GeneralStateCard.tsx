"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";

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
    <div className={`grid gap-3 sm:gap-4 ${className}`}>
      {items.map((item, idx) => {
        const itemId = item.id || `card-${idx}`;
        const active = isActiveTab(itemId);

        return (
          <div
            key={itemId}
            onClick={() => handleTab(itemId)}
            className={`bg-white border rounded-lg p-3.5 sm:p-4 transition-all cursor-pointer select-none ${
              active
                ? "border-slate-900 ring-2 ring-slate-900/10 shadow-xs"
                : "border-slate-200/80 hover:border-slate-300"
            }`}
          >
            {/* Header: Title & Icon */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs font-medium uppercase tracking-wider truncate transition-colors ${
                  active ? "text-slate-900 font-semibold" : "text-slate-500"
                }`}
              >
                {item.title}
              </span>
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.icon ? (
                  typeof item.icon === "function" ? (
                    <item.icon className="w-4 h-4" />
                  ) : (
                    item.icon
                  )
                ) : (
                  <Users className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Value & Subtext */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : item.value}
              </span>
              {item.description && (
                <span className="text-xs text-slate-400 truncate font-normal">
                  {item.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GeneralStateCard;
