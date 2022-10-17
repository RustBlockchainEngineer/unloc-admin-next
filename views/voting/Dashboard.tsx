import { Jdenticon } from '@/components/common/JdentIcon'
import { useAccount, useSendTransaction } from '@/hooks'
import { getVotingSessionKey, reallocSessionAccount, VOTING_PID } from '@/utils/spl-utils/unloc-voting'
import { PublicKey } from '@solana/web3.js'
import { VotingSessionInfo } from '@unloc-dev/unloc-sdk-voting'
import { compressAddress } from '@/utils'
import { ChevronDoubleRightIcon } from '@heroicons/react/20/solid'
import { Copyable } from '@/components/common'
import { useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'

export const VotingDashboard = () => {
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const votingSessionKey = getVotingSessionKey(VOTING_PID)
  const { loading, info } = useAccount(votingSessionKey, (_, data) => VotingSessionInfo.fromAccountInfo(data)[0])

  const onUpgrade = async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    const tx = await reallocSessionAccount(wallet)

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

  //   if (!info) {
  //     return <div>Loading...</div>
  //   }
  const authorities = [
    new PublicKey('86J52egGfkzDmByk961appyevaJ5BqaATXzKMRXCPyZJ'),
    new PublicKey('Le1PGWq1Hgdx1tKoDuWfaJa5etjaXVyXhAXLwCT8U4B'),
    new PublicKey('86J52egGfkzDmByk961appyevaJ5BqaATXzKMRXCPyZJ'),
    new PublicKey('86J52egGfkzDmByk961appyevaJ5BqaATXzKMRXCPyZJ')
  ]

  const initializer = new PublicKey('86J52egGfkzDmByk961appyevaJ5BqaATXzKMRXCPyZJ')

  return (
    <div className='mx-auto'>
      <div className='w-full'>
        <div className='mb-6'>
          <h1 className='mb-1 text-2xl font-semibold'>Authority Settings</h1>
          <p className='truncate text-sm text-gray-500'>
            Control the approved authorities, collections and account reallocation.
          </p>
        </div>
        <div className='grid min-h-max w-full grid-cols-1 divide-x-2 divide-gray-700 overflow-hidden bg-gray-800 shadow-xl sm:rounded md:grid-cols-3'>
          <div className='col-span-1 '>
            <div>
              <h3 className='bg-indigo-900 py-3 px-4 text-xl'>Approved authorities</h3>

              {info?.authorities.length === 0 && (
                <div className='font-mono text-sm'>
                  <p>There are no other authorities yet.</p>
                  <p>Only the program deployer can add other authorities.</p>
                </div>
              )}

              <div className='mt-6 flow-root'>
                <ul role='list' className='-my-5 px-3'>
                  <li className='py-4'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex-shrink-0'>
                        <Jdenticon size={'32px'} value={info?.initialiser.toBase58()} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <Copyable content={initializer.toBase58()}>
                          <p className='truncate font-mono text-sm text-gray-50'>
                            {compressAddress(4, initializer.toBase58())}
                          </p>
                        </Copyable>
                        <p className='truncate text-sm text-gray-400'>{'@' + initializer.toBase58()}</p>
                      </div>
                      <div>
                        <button
                          type='button'
                          disabled={true}
                          className='pointer-events-none inline-flex items-center rounded-full border border-blue-400 bg-blue-400 px-2.5 py-0.5 text-sm font-medium leading-5 text-blue-900 shadow-sm'
                        >
                          Initializer
                        </button>
                      </div>
                    </div>
                  </li>

                  {authorities.map((authority) => (
                    <li key={authority.toBase58()} className='py-4'>
                      <div className='flex items-center space-x-4'>
                        <div className='flex-shrink-0'>
                          <Jdenticon size={'32px'} value={authority.toBase58()} />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <Copyable content={authority.toBase58()}>
                            <p className='truncate font-mono text-sm text-gray-50'>
                              {compressAddress(4, authority.toBase58())}
                            </p>
                          </Copyable>
                          <p className='truncate text-sm text-gray-400'>{'@' + authority.toBase58()}</p>
                        </div>
                        <div>
                          <button
                            type='button'
                            className='font inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-sm leading-5 text-gray-700 shadow-sm hover:bg-gray-50'
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='mt-6 flex items-center justify-end gap-x-3 py-4 px-3'>
                <p className='hidden truncate align-middle text-sm text-gray-400 sm:block'>
                  Up to 5 different authorities can be added.
                </p>
                <button
                  disabled={authorities.length === 5}
                  className='inline-flex items-center truncate rounded-md bg-pink-600 px-3 py-1.5 hover:bg-pink-700'
                  type='button'
                >
                  <ChevronDoubleRightIcon className='-ml-1 mr-1 h-5 w-5' />
                  Add New
                </button>
              </div>
            </div>
          </div>
          <div className='col-span-1'>
            <div className='flex justify-between bg-indigo-900 py-3 px-4'>
              <h3 className='text-xl'>Approved collections</h3>
            </div>
          </div>
          <div>
            <div className='flex items-center justify-between bg-indigo-900 py-3 px-4'>
              <h3 className='text-xl'>Account Realloc</h3>
              <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
                Enough space
              </span>
            </div>
            <div className='py-4 px-3 text-gray-200'>
              <p className='pb-4'>
                The <code>Voting Session</code> account used to store information required for the Voting program to
                work is dynamically sized.
              </p>
              <p>
                This means that its data buffer can be reallocated to fit more information, without paying the
                allocation costs upfront.
              </p>
            </div>
            <div className='py-4 px-3'>
              <small className='leading-tight text-gray-400'>
                The account should be reallocated for every 100 approved collections added.
              </small>
              <div className='mx-2 mt-1 h-8 w-full rounded-full bg-gray-700'>
                <div
                  className='inline-flex h-8 items-center justify-end rounded-full bg-blue-600 px-6 text-sm'
                  style={{ width: '40%' }}
                >
                  40/100
                </div>
              </div>
            </div>
            <div className='block py-4 px-3 sm:flex sm:items-center sm:justify-end'>
              <button
                className='inline-flex items-center truncate rounded-md bg-pink-600 px-3 py-1.5 hover:bg-pink-700'
                onClick={onUpgrade}
                type='button'
              >
                <ChevronDoubleRightIcon className='-ml-1 mr-1 h-5 w-5' />
                Reallocate
              </button>
            </div>
          </div>
        </div>

        <div className='my-10'>
          <h1 className='mb-1 text-2xl font-semibold'>Manage Voting Sessions</h1>
          <p className='truncate text-sm text-gray-500'>Start voting sessions and set emissions.</p>
        </div>

        <div className='grid min-h-max w-full grid-cols-1 divide-x-2 divide-gray-700 overflow-hidden bg-gray-800 shadow-xl sm:rounded md:grid-cols-3'>
          Hello world
        </div>
      </div>
    </div>
  )
}
