import { useSendTransaction } from '@/hooks'
import { compressAddress } from '@/utils'
import { addAuthority, removeAuthority, setEmissions, setVotingSessionTime } from '@/utils/spl-utils/unloc-voting'
import { BN } from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { Keypair } from '@solana/web3.js'
import { observer } from 'mobx-react-lite'
import toast from 'react-hot-toast'


export const EmissionConfig = observer(() => {
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  
  const onSetEmission = async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }
    //params - frontend binding part
    const rewardAmount = new BN(100 * 10 ** 6);
    const startTime = new BN(Date.now() / 1000);
    const endTime = new BN(Date.now() / 1000 + 3600 * 24 * 30);
    const lenderShareBp = 50;
    const borrowerShareBp = 50;

    const tx = await setEmissions(wallet, rewardAmount, startTime, endTime, lenderShareBp, borrowerShareBp);

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
        onClick={onSetEmission}
        className='inline-flex items-center rounded-full bg-pink-600 px-5 py-1 text-sm tracking-wide hover:bg-pink-700'
      >
        Set Emission
      </button>
    </main>
  )
})
