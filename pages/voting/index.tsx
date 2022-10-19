import { useAccount } from '@/hooks'
import { useStore } from '@/stores'
import { getVotingSessionKey } from '@/utils/spl-utils/unloc-voting'
import { VotingDashboard } from '@/views/voting'
import { VotingInitialize } from '@/views/voting/Initialize'
import { VotingSessionInfo } from '@unloc-dev/unloc-sdk-voting'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'

const DynamicInitializeView = dynamic<{}>(() => Promise.resolve(VotingInitialize), {
  ssr: false
})

const Voting: NextPage = () => {
  const { programs } = useStore()
  const votingSessionKey = getVotingSessionKey(programs.votePubkey)
  const { info } = useAccount(votingSessionKey, (_, data) => VotingSessionInfo.fromAccountInfo(data)[0])
  return (
    <main className='grid-content w-full p-7 text-white'>
      {!info && <DynamicInitializeView />}
      {info && <VotingDashboard />}
    </main>
  )
}

export default Voting
