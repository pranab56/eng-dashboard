"use client";
import React from 'react'
import Image from 'next/image'
import { headersMenu } from '@/assets/assets';
import { useHeaders } from '@/hooks/useHeaders';

const Header = () => {
  const { headers } = useHeaders();
  const imageSrc: string = process.env.NEXT_PUBLIC_PROFILE_IMAGE_URL!

  return (
    <div className='h-full flex items-center justify-between gap-2 px-8'>
      <div className='flex items-center gap-4'>
        <Image src={headersMenu} width={100} height={100} alt={`${headers?.title} Icon`} className='w-10 h-10' />
        <div>
          <p className='font-bold text-xl text-[#080808]'>{headers?.title}</p>
          <p className='text-sm text-[#6B6B6B]'>{headers?.des}</p>
        </div>
      </div>
      <div className='h-full flex gap-3 items-center group'>
        <p className='flex flex-col justify-end items-end'>
          <span className='font-bold text-lg text-gray-800 group-hover:text-gray-500 transition-colors duration-300'>Rasel Parvez</span>
          <span className='font-semibold text-sm text-gray-700 group-hover:text-gray-400 transition-colors duration-300'>Admin</span>
        </p>
        <div className='w-13 h-13 bg-gray-200 flex items-center justify-center rounded-md border-2 border-[#F3F3F3] overflow-hidden'>
          <Image src={imageSrc} width={1000} height={1000} alt="profileImage" className='' />
        </div>
      </div>
    </div>
  )
}

export default Header