import { Button, InformationIcon } from '@/components/common'
import { useAccount, useSendTransaction } from '@/hooks'
import { stakePoolParser } from '@/pages/staking'
import { useStore } from '@/stores'
import { compressAddress } from '@/utils'
import { createLoanGlobalState } from '@/utils/spl-utils/unloc-loan'
import { getStakingPoolKey } from '@/utils/spl-utils/unloc-staking'
import { DocumentPlusIcon } from '@heroicons/react/24/solid'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { StakingPoolInfo } from '@unloc-dev/unloc-sdk-staking'
import { BN } from 'bn.js'
import { observer } from 'mobx-react-lite'
import toast from 'react-hot-toast'

const initializeInfo = [
  'This instruction is ran to initialize the pool to its initial state.',
  'We set the compounding frequency, interest rates, score multipliers for all staking account types, the profile level requirements and the fee reduction percentages (per-level).',
  'The initialized account will also control the token accounts that issue rewards and receive fees.'
]

export const LoanInitialize = observer(() => {
  const { programs } = useStore()
  const { publicKey: wallet } = useWallet()
  const stakePool = getStakingPoolKey(programs.stakePubkey)
  const sendAndConfirm = useSendTransaction()
  const { info: poolInfo } = useAccount<StakingPoolInfo>(stakePool, stakePoolParser, true)
  console.log(stakePool.toBase58())

  const onSubmit = async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    // these params need to be combined with frontend ui
    const accruedInterestNumerator = new BN(100);
    const denominator = new BN(10000)
    const minRepaidNumerator = new BN(100)
    const aprNumerator = new BN(100)
    const expireLoanDuration = new BN(90 * 24 * 3600)
    const treasuryWallet: PublicKey = wallet

    const tx = await createLoanGlobalState(
      wallet,
      accruedInterestNumerator,
      denominator,
      minRepaidNumerator,
      aprNumerator,
      expireLoanDuration,
      treasuryWallet,
      programs.loanPubkey
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
              Initialize Loan
              <InformationIcon info={initializeInfo} />
            </p>
          </div>
          <Button
            onClick={() => onSubmit()}
            color='light-slate'
            className={`text-sm font-normal !rounded-3xl w-44 bg-slate-400 hover:!bg-slate-400`}
          >
            Create Global State
          </Button>
        </div>
      )}
    </main>
  )
})
