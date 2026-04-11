/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import SingleTeam from './SingleTeam'

const page = async ({ searchParams }:{ searchParams: any }) => {
  const { playerPosition, teamName } = await searchParams;
  console.log({playerPosition, teamName});

  return (
    <div>
      <SingleTeam />
    </div>
  )
}

export default page