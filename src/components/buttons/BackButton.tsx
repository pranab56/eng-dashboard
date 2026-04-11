"use client"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const BackButton = ({ redirectUrl }: { redirectUrl?: string }) => {
  const router = useRouter();
  return <button
    type="button"
    onClick={() => redirectUrl ? router.push(redirectUrl) : router.back()}
    className="flex items-center justify-center w-12 h-12 border-2 border-[#EABB00] rounded-full  cursor-pointer group"
  >
    <ArrowLeft className="size-5 group-hover:scale-110 transition-transform duration-300" />
  </button>
}

export default BackButton