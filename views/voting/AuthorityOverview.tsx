import { useSendTransaction } from '@/hooks'
import { compressAddress } from '@/utils'
import { addAuthority, removeAuthority } from '@/utils/spl-utils/unloc-voting'
import { useWallet } from '@solana/wallet-adapter-react'
import { Keypair } from '@solana/web3.js'
import { observer } from 'mobx-react-lite'
import toast from 'react-hot-toast'


export const AuthorityOverview = observer(() => {
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  
  const onAdd = async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }
    //params - frontend binding part
    const newAuthority = Keypair.generate().publicKey;

    const tx = await addAuthority(wallet, newAuthority);

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

  const onRemove = async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    //params - frontend binding part
    const authorityToRemove = Keypair.generate().publicKey;

    const tx = await removeAuthority(wallet, authorityToRemove);

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
        onClick={onAdd}
        className='inline-flex items-center rounded-full bg-pink-600 px-5 py-1 text-sm tracking-wide hover:bg-pink-700'
      >
        Add Authority
      </button>
      <button
        type='button'
        onClick={onRemove}
        className='inline-flex items-center rounded-full bg-pink-600 px-5 py-1 text-sm tracking-wide hover:bg-pink-700'
      >
        Remove Authority
      </button>
    </main>
  )
})
