"use client"

import React from 'react'
import CustomJodit from '@/components/cui/CustomJodit';

const PrivacyPolicy = () => {


  return (
    <div className="py-1 px-4">
      <div className="p-2 rounded">
        <h1 className="text-4xl font-bold py-4 text-gray-700">
          Privacy Policy
        </h1>

        <CustomJodit url="privacyPolicy" />

      </div>
    </div>
  )
}

export default PrivacyPolicy