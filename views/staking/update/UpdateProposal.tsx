import { useSendTransaction } from '@/hooks'
import { compressAddress } from '@/utils'
import { closeUpdateProposal } from '@/utils/spl-utils/unloc-staking'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWallet } from '@solana/wallet-adapter-react'
import { UpdatePoolConfigsInfo } from '@unloc-dev/unloc-sdk-staking'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export const UpdateProposal = ({ config }: { config: UpdatePoolConfigsInfo }) => {
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const authority = config.proposalAuthorityWallet.toBase58()

  const handleCloseProposal = async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    const tx = closeUpdateProposal(wallet)
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
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button
            as='button'
            type='button'
            className={clsx(
              'flex w-full items-center justify-between gap-x-4 rounded-md bg-gray-700 px-4 py-5 hover:bg-gray-600',
              open && 'rounded-none rounded-t-md bg-gray-600'
            )}
          >
            <div className='text-left'>
              <h3>
                Proposal by <span className='font-semibold'>{compressAddress(4, authority)}</span>
              </h3>
              <p className='mt-1 text-sm leading-tight text-gray-400'>
                {config.approvalsReceived} approvals, {config.approvalsNeededForUpdate} needed.
              </p>
            </div>
            <ChevronDownIcon className='h-5 w-5' />
          </Disclosure.Button>
          <Disclosure.Panel className='rounded-b-md bg-gray-700'>
            <div className='border-b border-gray-500 px-4 py-5'>Proposal status</div>
            <div className='flex justify-end gap-x-2 py-6 px-4'>
              <button
                type='button'
                className='inline-flex items-center rounded-md border border-pink-600 bg-transparent px-2.5 py-1.5 hover:bg-gray-700/10 disabled:pointer-events-none'
              >
                Approve
              </button>
              <button
                disabled={!config.updateApproved}
                onClick={handleCloseProposal}
                type='button'
                className='inline-flex items-center rounded-md border border-transparent bg-pink-600 px-2.5 py-1.5 hover:bg-pink-700 disabled:pointer-events-none disabled:bg-gray-400'
              >
                Close proposal
              </button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
