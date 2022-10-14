import { useSendTransaction } from '@/hooks'
import { useWallet } from '@solana/wallet-adapter-react'
import { observer } from 'mobx-react-lite'


export const VotingInitialize = observer(() => {
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  
  return (
    <main className='flex w-full flex-col gap-x-12 gap-y-4 text-white lg:flex-row'>
      <button
        type='button'
        onClick={() => {}}
        className='inline-flex items-center rounded-full bg-pink-600 px-5 py-1 text-sm tracking-wide hover:bg-pink-700'
      >
        Intialize
      </button>
    </main>
  )
})
