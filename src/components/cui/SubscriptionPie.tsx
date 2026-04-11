"use client";

// import { myFetch } from '@/utils/myFetch';
// import { useSearchParams } from 'next/navigation';
import React from 'react'
import CustomSelectOption from '../cui/CustomSelectOption';
import { selectOptionsRevenue } from '@/types/optionTypes';

const SubscriptionPie = () => {
  // const [data, setData] = useState<string>("");
  // const searchParams = useSearchParams();
  // const brandEngagementDuration = searchParams.get("brandEngagementDuration") ?? "7day";

  // useEffect(() => {
  //   const getGraphDate = async () => {
  //     const res = await myFetch(`/payment/brand-engagement?days=${brandEngagementDuration}`);
  //     console.log("Active Users: ", res?.data);
  //     if (res?.success) {
  //       // setData(res?.data);
  //     }
  //   };
  //   getGraphDate();
  // }, [brandEngagementDuration]);

  const subscriptionSummary = {
    totalSubscribers: 65,
    empty: 100 - 65,
  };

  return (
    <div className="rounded-2xl bg-white p-4 flex flex-col items-center py-6">
      <div className="w-full flex items-center justify-between mb-12 ">
        <h2 className="text-2xl font-bold text-gray-700">Subscriptions</h2>
        <div className='w-40'>
          <CustomSelectOption selectOptions={selectOptionsRevenue} placeHolderValue="Select Year" queryKey="brandEngagementDuration" />
        </div>
      </div>

      <div className="relative w-80 h-80 mb-6">
        <svg
          className="absolute inset-0 transform -rotate-90"
          viewBox="0 0 36 36"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            className="stroke-current text-secondary"
            strokeWidth="6"
          ></circle>
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            className="stroke-[#836AB1] text-primary"
            strokeWidth="6"
            strokeDasharray="100"
            strokeDashoffset={
              (100 * (100 - subscriptionSummary?.totalSubscribers)) / 100
            }
            strokeLinecap="round"
          ></circle>
        </svg>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary w-28 h-28 rounded-full flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">
            {subscriptionSummary?.totalSubscribers}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPie