/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import MatchManagement from './MatchManagement'

const page = async ({ searchParams }:{ searchParams: any }) => {
  const { status, date1, date2 } = await searchParams;

  console.log({status, date1, date2});

  return (
    <>
      <MatchManagement />
    </>
  )
}

export default page