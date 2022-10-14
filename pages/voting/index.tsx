import React from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { VotingInitialize } from '@/views/voting/Initialize'

const DynamicInitializeView = dynamic<{}>(() => Promise.resolve(VotingInitialize), {
  ssr: false
})

const Voting: NextPage = () => {
  return (
    <main className='grid-content w-full p-7 text-white'>
      <DynamicInitializeView />
    </main>
  )
}

export default Voting
