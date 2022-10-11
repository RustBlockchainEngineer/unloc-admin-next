import { useAccount } from '@/hooks'
import { TypedAccountParser } from '@/utils/spl-utils/accountFetchCache'
import { getStakingPoolKey } from '@/utils/spl-utils/unloc-staking'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { StakingInitialize, StakingInitializeProps } from '@/views/staking/Initialize'
import { PoolInfo } from '@unloc-dev/unloc-sdk-staking'

const StateParser: TypedAccountParser<PoolInfo> = (_: PublicKey, data: AccountInfo<Buffer>) => {
  return PoolInfo.fromAccountInfo(data)[0]
}

const DynamicInitializeView = dynamic<StakingInitializeProps>(() => Promise.resolve(StakingInitialize), { ssr: false })

const Staking: NextPage = () => {
  const stakeState = getStakingPoolKey()
  const { loading, account, info } = useAccount<PoolInfo>(stakeState, StateParser, true)

  return (
    <main className='grid-content w-full p-7 text-white'>
      <DynamicInitializeView loading={loading} account={account} statePubkey={stakeState} state={info} />
    </main>
  )
}

export default Staking
