import { notify } from '@/components/Notification'
import { useSendTransaction } from '@/hooks'
import { compressAddress } from '@/utils'
import { tryGetErrorCodeFromMessage } from '@/utils/spl-utils'
import { closeUpdateProposal } from '@/utils/spl-utils/unloc-staking'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWallet } from '@solana/wallet-adapter-react'
import { errorFromCode, UpdatePoolConfigsInfo } from '@unloc-dev/unloc-sdk-staking'
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
    let txid = ''
    try {
      const { signature, result } = await sendAndConfirm(tx)
      txid = signature
      if (result.value.err) {
        if (result.value.err?.toString()) throw Error('Close proposal failed.', { cause: result.value.err })
      }
      notify({
        type: 'success',
        title: 'Update proposal closed',
        txid
      })
    } catch (err: any) {
      console.log({ err })
      const code = tryGetErrorCodeFromMessage(err?.message || '')
      const decodedError = code ? errorFromCode(code) : undefined
      notify({
        type: 'error',
        title: 'Failed to close proposal',
        txid,
        description: (
          <span className='break-words'>
            {decodedError ? (
              <>
                <span className='block'>
                  Decoded error: <span className='font-medium text-orange-300'>{decodedError.name}</span>
                </span>
                <span className='block'>{decodedError.message}</span>
              </>
            ) : err?.message ? (
              <>
                <span className='block break-words'>{err.message}</span>
              </>
            ) : (
              'Unknown error, check the console for more details'
            )}
          </span>
        )
      })
    }
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
            <div className='border-b border-gray-500 px-4 py-5'>
              <div className='text-lg'>Proposal status</div>
              <div>
                <pre>{JSON.stringify(config, null, 2)}</pre>
              </div>
              <div>Approvals received: {config.approvalsReceived}</div>
              <div>Update approved? {String(config.updateApproved)}</div>
              <div>Update done? {String(config.updateDone)}</div>
            </div>
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
