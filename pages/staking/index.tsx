import { TypedAccountParser } from '@/utils/spl-utils/accountFetchCache'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { StakingInitialize } from '@/views/staking/Initialize'
import { PoolInfo } from '@unloc-dev/unloc-sdk-staking'

export const stakePoolParser: TypedAccountParser<PoolInfo> = (_: PublicKey, data: AccountInfo<Buffer>) => {
  return PoolInfo.fromAccountInfo(data)[0]
}

const DynamicInitializeView = dynamic<{}>(() => Promise.resolve(StakingInitialize), {
  ssr: false
})

const Staking: NextPage = () => {
  return (
    <main className='grid-content w-full p-7 text-white'>
      <DynamicInitializeView />
    </main>
  )
}

export default Staking
