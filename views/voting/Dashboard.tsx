import { Jdenticon } from '@/components/common/JdentIcon'
import { useAccount, useSendTransaction } from '@/hooks'
import {
  addAuthority,
  getVotingSessionKey,
  reallocSessionAccount,
  removeAuthority,
  setEmissions
} from '@/utils/spl-utils/unloc-voting'
import { PublicKey } from '@solana/web3.js'
import { VotingSessionInfo } from '@unloc-dev/unloc-sdk-voting'
import { compressAddress } from '@/utils'
import { ChevronDoubleRightIcon, WalletIcon } from '@heroicons/react/20/solid'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { Copyable } from '@/components/common'
import { useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'
import { Dialog, Disclosure, Transition } from '@headlessui/react'
import { FormEventHandler, Fragment, useState } from 'react'
import { useStore } from '@/stores'
import { RecentCollection } from './RecentCollection'
import { ManageCollections } from './ManageCollections'
import { numVal, val } from '@/utils/spl-utils'
import { useForm } from 'react-hook-form'
import BN from 'bn.js'
import dayjs from 'dayjs'
import { VotingSessionForm } from './VotingSessionForm'
import { EmissionConfigInfo } from './EmissionConfigInfo'
import { EmissionConfigForm } from './EmissionConfigForm'

export const VotingDashboard = () => {
  const { programs } = useStore()
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const votingSessionKey = getVotingSessionKey(programs.votePubkey)
  const { loading, info } = useAccount(votingSessionKey, (_, data) => VotingSessionInfo.fromAccountInfo(data)[0])
  const [open, setOpen] = useState(false)

  if (loading || !info) {
    return <div>Loading...</div>
  }

  const onAddAuthority: FormEventHandler = async (e) => {
    e.preventDefault()
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    let newAuthority: PublicKey
    try {
      // @ts-ignore
      newAuthority = new PublicKey(e.target.authority_pubkey.value)
    } catch {
      toast.error('Invalid pubkey')
      return
    }
    const tx = await addAuthority(wallet, newAuthority, programs.votePubkey)

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

  const onRemoveAuthority = (authority: PublicKey) => async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }
    const tx = await removeAuthority(wallet, authority, programs.votePubkey)

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

  const reallocPercent = ((info?.projects.projects.length / info?.projects.currentMaxProjectsPossible) * 100).toFixed(0)
  const lastFiveAddedCollections = info.projects.projects.slice(-5).reverse()
  const totalTime = val(info.session.endTime).sub(val(info.session.startTime))
  const elapsedTime = new BN(Date.now() / 1000).sub(val(info.session.startTime))
  const voteProgress = elapsedTime.divRound(totalTime)

  return (
    <>
      <div className='mx-auto'>
        <div className='w-full'>
          <div className='mb-6'>
            <h1 className='mb-1 text-2xl font-semibold'>Authority Settings</h1>
            <p className='truncate text-sm text-gray-500'>
              Control the approved authorities, collections and account reallocation.
            </p>
          </div>
          <div className='grid min-h-max w-full grid-cols-1 divide-x-2 divide-gray-700 overflow-hidden bg-gray-800 shadow-xl sm:rounded lg:grid-cols-3'>
            <div className='col-span-1 '>
              <div className='flex h-full flex-col'>
                <h3 className='bg-indigo-900 py-3 px-4 text-xl'>Approved authorities</h3>

                <div className='mt-6 flow-root'>
                  <ul role='list' className='-my-5 px-3'>
                    <li className='py-4'>
                      <div className='flex items-center space-x-4'>
                        <div className='flex-shrink-0'>
                          <Jdenticon size={'32px'} value={info?.initialiser.toBase58()} />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <Copyable content={info.initialiser.toBase58()}>
                            <p className='truncate font-mono text-sm text-gray-50'>
                              {compressAddress(4, info.initialiser.toBase58())}
                            </p>
                          </Copyable>
                          <p className='truncate text-sm text-gray-400'>{'@' + info.initialiser.toBase58()}</p>
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

                    {info?.authorities
                      .filter((address) => !address.equals(PublicKey.default))
                      .map((authority) => (
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
                                onClick={onRemoveAuthority(authority)}
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
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Panel as='form' onSubmit={onAddAuthority} className='mt-auto py-4 px-6'>
                        <div className='mb-4 '>
                          <label htmlFor='authority_pubkey' className='mb-1 block text-sm font-medium text-gray-400'>
                            Authority pubkey
                          </label>
                          <div className='mt-1 flex w-full rounded-md shadow-sm'>
                            <div className='relative flex flex-grow items-stretch focus-within:z-10'>
                              <input
                                id='authority_pubkey'
                                name='authority_pubkey'
                                type='text'
                                className='w-full rounded-l-md py-1.5 px-3 text-gray-900 placeholder:text-gray-400'
                                placeholder='address'
                              />
                            </div>
                            <button
                              type='submit'
                              className='relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-transparent bg-pink-600 px-2 py-2 text-sm font-medium text-gray-50 hover:bg-pink-700'
                            >
                              <ChevronDoubleRightIcon className='h-5 w-5 text-white' aria-hidden='true' />
                              <span>Submit</span>
                            </button>
                          </div>
                        </div>
                        <div className='flex items-center justify-end gap-x-2'>
                          <Disclosure.Button
                            as='button'
                            type='button'
                            className='inline-flex items-center rounded-md border border-gray-500 bg-transparent px-6 py-1.5 text-sm font-medium text-gray-100 shadow-sm hover:bg-gray-900 focus:outline-none'
                          >
                            Cancel
                          </Disclosure.Button>
                        </div>
                      </Disclosure.Panel>
                      {!open && (
                        <div className='mt-auto flex flex-wrap items-center justify-end gap-x-3 py-4 px-3'>
                          <p className='mb-1 hidden truncate align-middle text-sm text-gray-400 sm:block'>
                            Up to 6 different authorities can be added.
                          </p>

                          <Disclosure.Button
                            disabled={info?.authorities.length === 5}
                            className='inline-flex items-center truncate rounded-md bg-pink-600 px-3 py-1.5 hover:bg-pink-700'
                            as='button'
                          >
                            Add new authority
                          </Disclosure.Button>
                        </div>
                      )}
                    </>
                  )}
                </Disclosure>
              </div>
            </div>
            <div className='flex h-full flex-col'>
              <div className='flex justify-between bg-indigo-900 py-3 px-4'>
                <h3 className='text-xl'>Approved collections</h3>
              </div>
              <div className='px-3 py-4'>
                <p className='text-sm text-gray-400'>Recently added collections:</p>
                <div className='mt-6 flow-root'>
                  <ul role='list' className='-my-5 px-3'>
                    {lastFiveAddedCollections.map((project) => (
                      <Fragment key={project.collectionNft.toBase58()}>
                        <RecentCollection projectData={project} />
                      </Fragment>
                    ))}
                  </ul>
                </div>
              </div>
              <div className='mt-auto flex items-center gap-x-2 px-3 py-4 sm:justify-end'>
                <button
                  type='button'
                  onClick={() => setOpen(true)}
                  className='inline-flex items-center truncate rounded-md bg-pink-600 px-3 py-1.5 hover:bg-pink-700'
                >
                  Manage collections
                </button>
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
                <div className='relative mx-2 mt-1 h-8 w-[95%] overflow-hidden rounded-full bg-gray-700'>
                  <div
                    className='inline-flex h-8 items-center justify-end rounded-full bg-blue-600'
                    style={{ width: `${reallocPercent}%` }}
                  >
                    <span className='absolute left-1/2 -translate-x-1/2 text-sm'>
                      {info.projects.projects.length}/{info.projects.currentMaxProjectsPossible}
                    </span>
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

          <div className='my-6'>
            <h1 className='mb-1 text-2xl font-semibold'>Manage Voting Sessions</h1>
            <p className='truncate text-sm text-gray-500'>Start voting sessions and set emissions.</p>
          </div>

          <div className='mb-10 grid min-h-max w-full overflow-hidden bg-gray-800 shadow-xl sm:max-w-5xl sm:rounded'>
            <h3 className='bg-indigo-900 py-4 px-5 text-lg font-medium'>Voting Session</h3>
            <div className='grid divide-y-2 divide-gray-600 md:grid-cols-2 md:divide-x-2 md:divide-y-0'>
              <div className='py-6 px-6 md:py-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='mb-6 text-lg font-medium'>Latest voting session</h3>

                  {val(info.session.startTime).gt(new BN(Math.round(Date.now() / 1000))) && (
                    <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                      Not yet started
                    </span>
                  )}

                  {val(info.session.endTime).gt(new BN(Math.round(Date.now() / 1000))) && (
                    <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
                      Ongoing
                    </span>
                  )}

                  {val(info.session.endTime).lte(new BN(Math.round(Date.now() / 1000))) && (
                    <span className='inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800'>
                      Ended
                    </span>
                  )}
                </div>
                {val(info.session.sessionCount).eqn(0) ? (
                  <div className='flex justify-center pt-6'>
                    <button
                      type='button'
                      className='group mx-8 flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 p-8 hover:border-gray-400'
                    >
                      <PlusCircleIcon className='mb-2 h-10 w-10 text-gray-500 group-hover:text-gray-400' />
                      <p className='text-sm font-medium text-gray-200 group-hover:text-gray-100'>
                        Start a voting session
                      </p>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className='mb-4 w-full border-b border-gray-600 pb-4'>
                      <span className='text-gray-200'>Session</span>
                      <span className='font-bold text-gray-50'> #{info.session.sessionCount.toString()}</span>
                    </div>
                    {/* <div className='my-4'>
                      <p className='text-sm text-gray-300'>Progress</p>
                      <div className='relative mx-2 mt-1 h-8 w-full overflow-hidden rounded-full bg-gray-700'>
                        <div
                          className='inline-flex h-8 items-center justify-end rounded-full bg-blue-600'
                          style={{ width: `100%` }}
                        >
                          <span className='absolute left-1/2 -translate-x-1/2 text-sm'>
                            {elapsedTime.toString()}/{totalTime.toString()}
                          </span>
                        </div>
                      </div>
                    </div> */}
                    <dl className='flex flex-wrap gap-2'>
                      <div className='rounded-md border border-gray-500 px-4 py-2'>
                        <dd className='text-xs text-gray-300'>Start time</dd>
                        <dt className='mt-1 font-mono text-lg font-semibold leading-tight'>
                          {dayjs.unix(numVal(info.session.startTime)).format('YYYY-MM-DD HH:mm')}
                        </dt>
                      </div>
                      <div className='rounded-md border border-gray-500 px-4 py-2'>
                        <dd className='text-xs text-gray-300'>End time</dd>
                        <dt className='mt-1 font-mono text-lg font-semibold leading-tight'>
                          {dayjs.unix(numVal(info.session.endTime)).format('YYYY-MM-DD HH:mm')}
                        </dt>
                      </div>
                      <div className='rounded-md border border-gray-500 px-4 py-2'>
                        <dd className='text-xs text-gray-300'>Started</dd>
                        <dt className='mt-1 font-mono text-base  leading-tight'>{String(info.session.started)}</dt>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              <div className='py-6 px-6 md:py-4'>
                <div className='mb-6'>
                  <h3 className='mb-1 text-lg font-medium'>Start a voting session</h3>
                  <p className='text-sm text-gray-400'>There can be one voting session at a time.</p>
                </div>
                <VotingSessionForm />
              </div>
            </div>
          </div>

          <div className='grid min-h-max w-full overflow-hidden bg-gray-800 shadow-xl sm:max-w-5xl sm:rounded'>
            <h3 className='bg-indigo-900 py-4 px-5 text-lg font-medium'>Emissions</h3>

            <div className='grid divide-y-2 divide-gray-600 md:grid-cols-2 md:divide-x-2 md:divide-y-0'>
              <EmissionConfigInfo info={info} />

              <EmissionConfigForm />
            </div>
          </div>
        </div>
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as='div' className='relative z-10' open={open} onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity' />
          </Transition.Child>
          <div className='fixed inset-x-0 top-12 overflow-y-auto'>
            <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
              <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-gray-700 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6'>
                <ManageCollections projectsData={info.projects.projects} />
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
