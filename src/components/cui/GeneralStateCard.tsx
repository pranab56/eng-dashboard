/* eslint-disable react-hooks/exhaustive-deps */
import React, {  useEffect, useState } from "react";

export type GeneralStateCardProps = {
  title: string;
  value: number | string;
  description?: string;
  id?: string;
};

const GeneralStateCard = ({className, items}:{className?:string, items: GeneralStateCardProps[]}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleTab = (id: string) => {
    setActiveTab(id);
  };

  const isActiveTab = (id: string) => {
    return activeTab === id;
  }

  useEffect(() => {
    handleTab(items[0].id!);
  }, []);


  return (
    <div className={`grid gap-4 ${className}`}>
      {items.map((item) => (
        <div key={item.id} onClick={() => handleTab(item.id!)} className={`px-4 py-4 rounded-xl transition-all duration-200 cursor-pointer ${isActiveTab(item.id!) ? 
          "bg-[#19CA77] text-white shadow-lg scale-[1.02]" : "bg-white text-gray-800 hover:bg-gray-200"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className={`text-lg font-semibold ${isActiveTab(item.id!) ? "text-white" : "text-gray-500"}`}>{item.title}</h1>
          </div>

          <p className={`text-3xl font-bold ${isActiveTab(item.id!) ? "text-white" : "text-gray-800"}`}>{item.value}</p>

          {item.description && (
            <p className={`text-sm mt-1 ${isActiveTab(item.id!) ? "text-white/80" : "text-gray-400"}`} >{item.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default GeneralStateCard;