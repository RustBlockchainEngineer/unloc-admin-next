import { Button, InformationIcon } from '@/components/common'
import { useAccount, useSendTransaction } from '@/hooks'
import { stakePoolParser } from '@/pages/staking'
import { useStore } from '@/stores'
import { compressAddress } from '@/utils'
import { claimExpiredCollateral, createLoanGlobalState } from '@/utils/spl-utils/unloc-loan'
import { getStakingPoolKey } from '@/utils/spl-utils/unloc-staking'
import { DocumentPlusIcon } from '@heroicons/react/24/solid'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Keypair, PublicKey, Signer } from '@solana/web3.js'
import { StakingPoolInfo } from '@unloc-dev/unloc-sdk-staking'
import { BN } from 'bn.js'
import { observer } from 'mobx-react-lite'
import toast from 'react-hot-toast'

export const LoanClaimExpiredCollateral = observer(() => {
  const { programs } = useStore()
  const { publicKey: wallet } = useWallet()
  const { connection } = useConnection()
  const sendAndConfirm = useSendTransaction()

  const onSubmit = async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    // these params need to be combined with frontend ui
    const subOffer: PublicKey = PublicKey.default

    const signers: Keypair[] = []
    let tx = await claimExpiredCollateral(connection, wallet, subOffer, signers, programs.loanPubkey)

    tx.sign(...signers)
    toast.promise(sendAndConfirm(tx, { skipPreflight: true }), {
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
      <div className='max-w-xl rounded-lg bg-slate-700  shadow-sm lg:min-w-[450px]'>
        <div className='flex flex-wrap items-center justify-between border-b border-gray-500 p-8'>
          <p className='flex items-center text-2xl font-semibold text-gray-100'>
            <DocumentPlusIcon className='mr-2 h-6 w-6' />
            Claim Expired Collateral
          </p>
        </div>
        <Button
          onClick={() => onSubmit()}
          color='light-slate'
          className={`w-44 !rounded-3xl bg-slate-400 text-sm font-normal hover:!bg-slate-400`}
        >
          Claim Expired Collateral
        </Button>
      </div>
    </main>
  )
})
