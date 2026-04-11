/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import PlayerManagement from './PlayerManagement'

const page = async ({ searchParams }:{ searchParams: any }) => {
  const { playerPosition, teamName } = await searchParams;
  console.log({playerPosition, teamName});

  return (
    <div>
      <PlayerManagement />
    </div>
  )
}

export default page