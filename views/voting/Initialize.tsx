import { useSendTransaction } from '@/hooks'
import { compressAddress } from '@/utils'
import { initializeVotingSession, reallocSessionAccount } from '@/utils/spl-utils/unloc-voting'
import { useWallet } from '@solana/wallet-adapter-react'
import { observer } from 'mobx-react-lite'
import toast from 'react-hot-toast'


export const VotingInitialize = observer(() => {
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  
  // Need to call only 1 time at starting
  const onInitialize = async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    const tx = await initializeVotingSession(wallet);

    toast.promise(sendAndConfirm(tx, 'confirmed', false), {
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

  // Need to call when total_projects_count % 100 == 0
  const onUpgrade = async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    const tx = await reallocSessionAccount(wallet);

    toast.promise(sendAndConfirm(tx, 'confirmed', false), {
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
      <button
        type='button'
        onClick={onInitialize}
        className='inline-flex items-center rounded-full bg-pink-600 px-5 py-1 text-sm tracking-wide hover:bg-pink-700'
      >
        Intialize Voting Session
      </button>
      <button
        type='button'
        onClick={onUpgrade}
        className='inline-flex items-center rounded-full bg-pink-600 px-5 py-1 text-sm tracking-wide hover:bg-pink-700'
      >
        Upgrade Voting Session
      </button>
    </main>
  )
})
