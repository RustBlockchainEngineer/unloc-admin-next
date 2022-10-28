import { useSendTransaction } from '@/hooks'
import { useStore } from '@/stores'
import { compressAddress } from '@/utils'
import { isPublicKey } from '@/utils/spl-utils/common'
import { UNLOC_MINT } from '@/utils/spl-utils/unloc-constants'
import { initializeVotingSession, reallocSessionAccount } from '@/utils/spl-utils/unloc-voting'
import { ChevronDoubleRightIcon } from '@heroicons/react/20/solid'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { observer } from 'mobx-react-lite'
import { FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

type FormData = {
  stakingPid: string
  liquidityMiningPid: string
  liquidityMiningRewardsMint: string
}

export const VotingInitialize = observer(() => {
  const { programs } = useStore()
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>()

  const handleFillDefault = () => {
    const defaults: FormData = {
      stakingPid: programs.stake,
      liquidityMiningPid: programs.liqMin,
      liquidityMiningRewardsMint: UNLOC_MINT.toBase58()
    }
    reset(defaults)
  }

  // Need to call only 1 time at starting
  const onInitialize = async (data: FormData) => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    let tx: Transaction
    try {
      const staking = new PublicKey(data.stakingPid)
      const liqMin = new PublicKey(data.liquidityMiningPid)
      const rewardMint = new PublicKey(data.liquidityMiningRewardsMint)
      tx = await initializeVotingSession(wallet, staking, liqMin, rewardMint, programs.votePubkey)
    } catch (err) {
      console.log(err)
      toast.error('Error creating transaction object, check the console.')
      return
    }

    toast.promise(sendAndConfirm(tx), {
      loading: 'Confirming...',
      error: (e) => {
        console.log(e)
        return (
          <div>
            <p>There was an error confirming your transaction</p>
            <p>{e.message}</p>
          </div>
        )
      },
      success: (e: any) => `Transaction ${compressAddress(6, e.signature)} confirmed.`
    })
  }

  return (
    <div className='mx-auto max-w-xl'>
      <form onSubmit={handleSubmit(onInitialize)}>
        <h3 className='border-b border-pink-600 py-4 px-1 text-2xl'>Initialize Voting Program</h3>
        <div className='mt-4 flex flex-col gap-y-6 border-b border-dotted border-gray-500 pb-6'>
          <div>
            <label htmlFor='staking_pid' className='font-mono text-sm text-slate-200'>
              Staking PID
            </label>
            <input
              id='staking_pid'
              type='text'
              {...register('stakingPid', {
                required: true,
                validate: (value) => isPublicKey(value) || 'Not a valid pubkey.'
              })}
              className='w-full rounded-md px-3 py-1.5 text-gray-900 placeholder:text-gray-300'
              placeholder='65SDRmYzcAwHiSRyuij6f8LmHAwJ98fwfUnxkog17rbP'
            />
            {errors.stakingPid && <p className='font-mono text-sm text-red-400'>{errors.stakingPid.message}</p>}
          </div>
          <div>
            <label htmlFor='liquidity_mining_pid' className='mb-1 font-mono text-sm text-slate-200'>
              Liquidity Mining PID
            </label>
            <input
              id='liquidity_mining_pid'
              type='text'
              {...register('liquidityMiningPid', {
                required: true,
                validate: (value) => isPublicKey(value) || 'Not a valid pubkey.'
              })}
              className='w-full rounded-md px-3 py-1.5 text-gray-900 placeholder:text-gray-300'
              placeholder='TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG'
            />
            {errors.liquidityMiningPid && (
              <p className='font-mono text-sm text-red-400'>{errors.liquidityMiningPid.message}</p>
            )}
          </div>
          <div>
            <label htmlFor='liquidity_mining_rewards_mint' className='mb-1 font-mono text-sm text-slate-200'>
              Liquidity Mining Rewards Mint
            </label>
            <input
              id='liquidity_mining_rewards_mint'
              type='text'
              {...register('liquidityMiningRewardsMint', {
                required: true,
                validate: (value) => isPublicKey(value) || 'Not a valid pubkey.'
              })}
              className='w-full rounded-md px-3 py-1.5 text-gray-900 placeholder:text-gray-300'
              placeholder='Bt8KVz26uLrXrMzRKaJgX9rYd2VcfBh8J67D4s3kRmut'
            />
            {errors.liquidityMiningRewardsMint && (
              <p className='font-mono text-sm text-red-400'>{errors.liquidityMiningRewardsMint.message}</p>
            )}
          </div>
        </div>
        <div className='my-4 flex items-center justify-end gap-x-4'>
          <button
            type='button'
            onClick={handleFillDefault}
            className='rounded-md border border-gray-800 px-3 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-800'
          >
            Fill Defaults
          </button>
          <button
            type='submit'
            className='inline-flex items-center rounded-md border border-transparent bg-pink-600 px-5 py-2 text-sm tracking-wide hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
          >
            <ChevronDoubleRightIcon className='mr-1 -ml-2 h-5 w-5' />
            Initialize
          </button>
        </div>
      </form>
    </div>
  )
})
