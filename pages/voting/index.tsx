import React from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { VotingInitialize } from '@/views/voting/Initialize'
import { CollectionOverview, EmissionConfig, SessionCycle } from '@/views/voting'
import { useAccount } from '@/hooks'
import { useStore } from '@/stores'
import { getVotingSessionKey, VOTING_PID } from '@/utils/spl-utils/unloc-voting'
import { accountProviders } from '@unloc-dev/unloc-sdk-voting'
import { VotingDashboard } from '@/views/voting/Dashboard'

const DynamicInitializeView = dynamic<{}>(() => Promise.resolve(VotingInitialize), {
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
  const { programs } = useStore()
  const votingSessionKey = getVotingSessionKey(programs.votePubkey)
  const { info } = useAccount(
    votingSessionKey,
    (_, data) => accountProviders.VotingSessionInfo.fromAccountInfo(data)[0]
  )
  return (
    <main className='grid-content w-full p-7 text-white'>
      {!info && <DynamicInitializeView />}
      {info && (
        <>
          <VotingDashboard />
          {/* <DynamicAuthorityOverview />
          <DynamicCollectionOverview />
          <DynamicEmissionConfig />
          <DynamicSessionCycle /> */}
        </>
      )}
    </main>
  )
}

export default Voting
