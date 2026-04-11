"use client"

import React from "react";
import { TbReportMoney } from "react-icons/tb";
import { PiUsersThree } from "react-icons/pi";

interface TData {
  totalUser: number;
  totalDoctor: number;
  totalSubscription: number;
  totalRevenue: number;
}


const GeneralState = () => {

  const overviewDatas: TData = {
    totalUser: 1130,
    totalDoctor: 56,
    totalSubscription: 984,
    totalRevenue: 231220,
  };


  return (
    <div className="grid md:grid-cols-4 gap-6">
      <SubComponent title="Total Creator" des={overviewDatas?.totalUser} icon={PiUsersThree} />
      <SubComponent title="Total Brand" des={overviewDatas?.totalDoctor} icon={PiUsersThree} />
      <SubComponent title="Total Subscription" des={overviewDatas?.totalSubscription + "+"} icon={PiUsersThree} />
      <SubComponent title="Total Revenue" des={"$" + overviewDatas?.totalRevenue + "K"} icon={TbReportMoney} />
    </div>
  );
};

const SubComponent = ({ title, des, icon }: { title: string; des: string | number; icon: React.ElementType }) => {
  return (
    <div className="relative bg-white py-8 ps-6 flex gap-4 cursor-pointer h-44 overflow-hidden">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
        {icon && React.createElement(icon, { className: "text-gray-500", size: 20 })}
      </div>
      <div className="flex flex-col items-start gap-1">
        <h2 className="text-center text-2xl font-semibold text-gray-500">{title}</h2>
        <h3 className="text-center text-3xl font-bold text-gray-700">
          {des}
        </h3>
      </div>
      <div className="absolute -bottom-10 left-0  w-full h-20 rounded-full bg-clr/10"/>
    </div>
  )
}

export default GeneralState;
