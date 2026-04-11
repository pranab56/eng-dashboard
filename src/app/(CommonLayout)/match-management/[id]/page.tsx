"use client"

import { userImg } from '@/assets/assets';
import BlockDelete from '@/components/cui/BlockDelete';
import Image from 'next/image';
import React from 'react'
import { MdArrowBackIosNew } from "react-icons/md";

type TUserDetails = {
  _id: string,
  profilePic: string | null,
  name: string,
  email: string
  number: string,
  streetAddress: string,
  city: string,
  state: string,
  dob: string,
  occupation: string,
  gender: string,
  healthConcern: string,
  bloodGroup: string
}

const SingleUser: TUserDetails = {
  _id: "1",
  profilePic: null,
  name: "John Doe",
  email: "john@doe",
  number: "564464341",
  streetAddress: "Link Road",
  city: "Dhaka",
  state: "Bangladesh",
  dob: "01/01/2000",
  occupation: "Student",
  gender: "Male",
  healthConcern: "Allergies",
  bloodGroup: "O-"
}

const UserDetails = () => {

  return (
    <div className='px-8 py-8 space-y-8'>
      <button onClick={() => window.history.back()} className='flex items-center gap-2 cursor-pointer group'>
        <span className='w-9 h-9 rounded-full bg-white group-hover:bg-gray-50 flex items-center justify-center transition-colors duration-300'>
          <MdArrowBackIosNew />
        </span>
        <span className='text-2xl font-semibold text-gray-700 group-hover:text-gray-500 transition-colors duration-300'>User Details</span>
      </button>
      <div className='flex gap-16 bg-white p-8 customShadow'>
        <div className="w-[400px] h-[400px] relative">
          <Image
            src={userImg}
            alt="profileImage"
            fill
            className="object-cover"
          />
        </div>
        <table>
          <tbody>
            {Object.entries(SingleUser).map(([key, value], index) => {
              if (key === "profilePic") return null
              return (
                <tr key={index}>
                  <td className='font-semibold text-gray-700 pr-16 text-lg'>{key}</td>
                  <td className='text-gray-700 text-lg'>: {value}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <>
        {SingleUser?._id && <BlockDelete id={SingleUser._id} />}
      </>
    </div>
  )
}

export default UserDetails