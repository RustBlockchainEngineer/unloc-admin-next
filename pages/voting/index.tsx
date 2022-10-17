import React from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { VotingInitialize } from '@/views/voting/Initialize'
import { AuthorityOverview, CollectionOverview, EmissionConfig, SessionCycle } from '@/views/voting'

const DynamicInitializeView = dynamic<{}>(() => Promise.resolve(VotingInitialize), {
  ssr: false
})
const DynamicAuthorityOverview = dynamic<{}>(() => Promise.resolve(AuthorityOverview), {
  ssr: false
})
const DynamicCollectionOverview = dynamic<{}>(() => Promise.resolve(CollectionOverview), {
  ssr: false
})
const DynamicEmissionConfig = dynamic<{}>(() => Promise.resolve(EmissionConfig), {
  ssr: false
})
const DynamicSessionCycle = dynamic<{}>(() => Promise.resolve(SessionCycle), {
  ssr: false
})
const Voting: NextPage = () => {
  return (
    <main className='grid-content w-full p-7 text-white'>
      <DynamicInitializeView />
      <DynamicAuthorityOverview />
      <DynamicCollectionOverview />
      <DynamicEmissionConfig />
      <DynamicSessionCycle />
    </main>
  )
}

export default Voting
