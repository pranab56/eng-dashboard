"use client";
import { headersMenu } from '@/assets/assets';
import { useHeaders } from '@/hooks/useHeaders';
import Image from 'next/image';

import { useGetProfileQuery } from '@/features/profile/profileApi';
import Link from 'next/link';
import { baseURL } from '../../utils/BaseURL';

const Header = () => {
  const { headers } = useHeaders();
  const { data: profileData } = useGetProfileQuery({});
  const user = profileData?.data;

  return (
    <div className='h-full flex items-center justify-between gap-2 px-8'>
      <div className='flex items-center gap-4'>
        <Image src={headersMenu} width={100} height={100} alt={`${headers?.title} Icon`} className='w-10 h-10' />
        <div>
          <p className='font-bold text-xl text-[#080808]'>{headers?.title}</p>
          <p className='text-sm text-[#6B6B6B]'>{headers?.des}</p>
        </div>
      </div>
      <Link href="/profile" className='h-full flex gap-3 items-center group cursor-pointer'>
        <p className='flex flex-col justify-end items-end'>
          <span className='font-bold text-lg text-gray-800 group-hover:text-gray-500 transition-colors duration-300'>
            {user?.userName || "Admin User"}
          </span>
          <span className='font-semibold text-sm text-gray-700 group-hover:text-gray-400 transition-colors duration-300 uppercase tracking-wider'>
            {user?.role?.replace("_", " ") || "Administrator"}
          </span>
        </p>
        <div className='w-14 h-14 bg-gray-50 flex items-center justify-center rounded-xl border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300'>
          {user?.profile ? (
            <Image src={baseURL + user.profile} width={200} height={200} alt="profile" className='w-full h-full object-cover' />
          ) : (
            <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-black text-xs'>VOID</div>
          )}
        </div>
      </Link>
    </div>
  )
}

export default Header;