"use client"

import React from 'react'
import { toast } from 'sonner';

const BlockDelete = ({id}:{id:string}) => {

  // console.log("User ID:", id);

  const handleDelete = () => {
    console.log("delete", id);
    toast.success("User deleted successfully");
  };

  const handleBlock = () => {
    console.log("block", id);
    toast.success("User blocked successfully");
  };


  return (
    <div className='bg-white p-4 customShadow flex items-center justify-between'>
      <p className='text-gray-700 text-xl'>If you feel the user is fake in any way, you can block or delete the user from here.</p>
      <div className='flex justify-end items-center gap-4'>
        <button onClick={handleDelete} className='bg-violet-500 hover:bg-violet-600 text-white px-4 py-1.5 transitionClr'>Block</button>
        <button onClick={handleBlock} className='bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 transitionClr'>Delete</button>
      </div>
    </div>
  )
}

export default BlockDelete