import { InformationIcon } from '@/components/common'
import { useAccount, useSendTransaction } from '@/hooks'
import { stakePoolParser } from '@/pages/staking'
import { useStore } from '@/stores'
import { compressAddress } from '@/utils'
import { UNLOC_MINT } from '@/utils/spl-utils/unloc-constants'
import { getStakingPoolKey, initializeStakingPool } from '@/utils/spl-utils/unloc-staking'
import { Transition } from '@headlessui/react'
import { DocumentPlusIcon } from '@heroicons/react/24/solid'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { StakingPoolInfo } from '@unloc-dev/unloc-sdk-staking'
import { BN } from 'bn.js'
import { observer } from 'mobx-react-lite'
import toast from 'react-hot-toast'
import { FormValues, InitializeForm } from './InitializeForm'
import { PoolOverview } from './PoolOverview'

const initializeInfo = [
  'This instruction is ran to initialize the pool to its initial state.',
  'We set the compounding frequency, interest rates, score multipliers for all staking account types, the profile level requirements and the fee reduction percentages (per-level).',
  'The initialized account will also control the token accounts that issue rewards and receive fees.'
]

export const StakingInitialize = observer(() => {
  const { programs } = useStore()
  const { publicKey: wallet } = useWallet()
  const stakePool = getStakingPoolKey(programs.stakePubkey)
  const sendAndConfirm = useSendTransaction()
  const { loading, account, info: poolInfo } = useAccount<StakingPoolInfo>(stakePool, stakePoolParser, true)
  console.log(stakePool.toBase58())

  const onSubmit = async (data: FormValues) => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    console.log('onSubmit()', data)
    const numAuthorities = data.numAuthorities
    const authorityWallets = [new PublicKey(data.authorityWallet)]
    const numApprovalsNeededForUpdate = data.requiredApprovals

    const interestRateFraction = data.interestRatesAndScoreMultipliers.reduce<any>(
      (obj, item) => ({ ...obj, [item.accountType]: toNumDenPair(item.interestRateMultiplier as number, 5) }),
      {}
    )
    interestRateFraction.compoundingFrequency = data.compoundingFrequency

    const scoreMultiplier = data.interestRatesAndScoreMultipliers.reduce<any>(
      (obj, item) => ({ ...obj, [item.accountType]: toNumDenPair(item.scoreMultiplier as number, 5) }),
      {}
    )

    const profileLevelMultiplier = data.profileLevelBenefits.reduce<any>(
      (obj, item) => ({
        ...obj,
        [item.profileLevel]: {
          minUnlocScore: item.minUnlocScore,
          feeReductionBasisPoints: item.feeReductionBasisPoints
        }
      }),
      {}
    )

    const unstakePenalityBasisPoints = new BN(data.unstakePenalityBasisPoints ?? 0)
    const tx = await initializeStakingPool(
      wallet,
      UNLOC_MINT,
      numAuthorities,
      authorityWallets,
      numApprovalsNeededForUpdate,
      interestRateFraction,
      scoreMultiplier,
      profileLevelMultiplier,
      unstakePenalityBasisPoints,
      programs.stakePubkey,
      programs.votePubkey,
      programs.liqMinPubkey
    )

    toast.promise(sendAndConfirm(tx, 'confirmed', true), {
      loading: 'Confirming...',
      error: (e) => (
        <div>
          <p>There was an error confirming your transaction</p>
          <p>{e.message}</p>
        </div>
      ),
      success: (e: any) => `Transaction ${compressAddress(6, e.signature)} confirmed.`
    })
  }

  return (
    <main className='flex w-full flex-col gap-x-12 gap-y-4 text-white lg:flex-row'>
      {!poolInfo && (
        <div className='max-w-xl rounded-lg bg-slate-700  shadow-sm lg:min-w-[450px]'>
          <div className='flex flex-wrap items-center justify-between border-b border-gray-500 p-8'>
            <p className='flex items-center text-2xl font-semibold text-gray-100'>
              <DocumentPlusIcon className='mr-2 h-6 w-6' />
              Initialize pool
              <InformationIcon info={initializeInfo} />
            </p>
          </div>
          <InitializeForm onSubmit={onSubmit} isProposal={false} />
        </div>
      )}

      <Transition
        show={!loading && !!account && !!poolInfo}
        enter='transform transition-opacity duration-150'
        enterFrom='opacity-0 scale-75'
        enterTo='opacity-100 scale-100'
      >
        {poolInfo && <PoolOverview poolAddress={stakePool} poolInfo={poolInfo} />}
      </Transition>
    </main>
  )
})

export const toNumDenPair = (number: number, exp: number) => {
  const denominator = new BN(10).pow(new BN(exp))

  const fractional = number.toString().split('.')[1]

  if (!fractional) {
    const numerator = denominator.muln(number)
    return { numerator, denominator }
  }

  const integer = new BN(number.toString().split('.')[0]).mul(denominator)
  const decimals = new BN(fractional.padEnd(exp, '0'))
  const numerator = integer.add(decimals)

  return { numerator, denominator }
}
