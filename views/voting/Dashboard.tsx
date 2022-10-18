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
import { Copyable } from '@/components/common'
import { useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'
import { Dialog, Disclosure, Transition } from '@headlessui/react'
import { FormEventHandler, Fragment, useState } from 'react'
import { useStore } from '@/stores'
import { RecentCollection } from './RecentCollection'
import { ManageCollections } from './ManageCollections'
import { amountToUiAmount, numVal, val } from '@/utils/spl-utils'
import { useForm } from 'react-hook-form'
import BN from 'bn.js'
import dayjs from 'dayjs'
import UnlocToken from '../../public/unloc_token.png'
import Image from 'next/image'

type EmissionsFormData = {
  amount: number
  lenderPercentage: number
  startTimestamp: number
  endTimestamp: number
}

export const VotingDashboard = () => {
  const { programs } = useStore()
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const votingSessionKey = getVotingSessionKey(programs.votePubkey)
  const { loading, info } = useAccount(votingSessionKey, (_, data) => VotingSessionInfo.fromAccountInfo(data)[0])
  const [open, setOpen] = useState(false)

  const { register, watch, handleSubmit, setValue } = useForm<EmissionsFormData>({
    defaultValues: {
      lenderPercentage: 50
    }
  })
  const value = watch('lenderPercentage')

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

  const onSetEmission = async (data: EmissionsFormData) => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    const rewardAmount = new BN(data.amount).mul(new BN(10).pow(new BN(6)))
    const startTime = data.startTimestamp
    const endTime = data.endTimestamp
    const lenderShareBp = data.lenderPercentage * 100
    const borrowerShareBp = (100 - data.lenderPercentage) * 100

    const tx = await setEmissions(
      wallet,
      rewardAmount,
      startTime,
      endTime,
      lenderShareBp,
      borrowerShareBp,
      programs.votePubkey
    )

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

  const reallocPercent = ((info?.projects.projects.length / info?.projects.currentMaxProjectsPossible) * 100).toFixed(0)
  const lastFiveAddedCollections = info.projects.projects.slice(-5).reverse()

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

          <div className='grid min-h-max w-full divide-x-2 divide-gray-700 overflow-hidden bg-gray-800 shadow-xl sm:max-w-5xl sm:rounded'>
            <h3 className='bg-indigo-900 py-4 px-5 text-lg font-medium'>Voting Session</h3>
            <div className='grid'></div>
          </div>

          <div className='grid min-h-max w-full divide-x-2 divide-gray-700 overflow-hidden bg-gray-800 shadow-xl sm:max-w-5xl sm:rounded'>
            <h3 className='bg-indigo-900 py-4 px-5 text-lg font-medium'>Emissions</h3>

            <div className='grid divide-y-2 divide-gray-600 md:grid-cols-2 md:divide-x-2 md:divide-y-0'>
              <div className='py-6 px-6 md:py-4'>
                <h3 className='mb-6 text-lg font-medium'>Current emission config</h3>
                <div>
                  <dl className='flex flex-wrap gap-2'>
                    <div className='max-w-fit rounded-md border border-gray-500 px-4 py-3'>
                      <dd className='text-xs text-gray-300'>Emissions</dd>
                      <dt className='mt-2 flex items-center text-xl font-semibold'>
                        <p>{amountToUiAmount(info.emissions.rewards, 6).toLocaleString('en-us')}</p>
                        <div className='ml-1 mt-2 flex-shrink-0'>
                          <Image src={UnlocToken} height={24} width={24} alt='' className='rounded-full' />
                        </div>
                      </dt>
                    </div>
                    <div className='max-w-fit rounded-md border border-gray-500 px-4 py-3'>
                      <dd className='text-xs text-gray-300'>Reward split</dd>
                      <dt className='mt-2 grid grid-cols-2 gap-x-2'>
                        <span className='font-semibold'>{numVal(info.emissions.lenderShareBp) / 100}%</span>
                        <span className='text-right font-semibold'>
                          {numVal(info.emissions.borrowerShareBp) / 100}%
                        </span>
                        <span className='text-sm font-light'>Lender</span>
                        <span className='text-right text-sm font-light'>Borrower</span>
                      </dt>
                    </div>
                    <div className='rounded-md border border-gray-500 px-4 py-3'>
                      <dd className='text-xs text-gray-300'>Start time</dd>
                      <dt className='mt-2 font-mono text-xl font-semibold'>
                        {dayjs.unix(numVal(info.emissions.start)).format('YYYY-MM-DD HH:mm:ssZ[Z]')}
                      </dt>
                    </div>
                    <div className='rounded-md border border-gray-500 px-4 py-3'>
                      <dd className='text-xs text-gray-300'>End time</dd>
                      <dt className='mt-2 font-mono text-xl font-semibold'>
                        {dayjs.unix(numVal(info.emissions.end)).format('YYYY-MM-DD HH:mm:ssZ[Z]')}
                      </dt>
                    </div>
                    <div className='max-w-fit rounded-md border border-gray-500 px-4 py-3'>
                      <dd className='text-xs text-gray-300'>Updated allocations</dd>
                      <dt className='mt-2 text-xl font-semibold'>{info.emissions.allocationsUpdatedCount}</dt>
                    </div>
                  </dl>
                </div>
              </div>

              <div className='mx-auto w-full max-w-2xl py-8 px-6 md:pt-4'>
                <form onSubmit={handleSubmit(onSetEmission)} className='w-full space-y-6'>
                  <h3 className='text-lg font-semibold'>Set a new emission configuration</h3>
                  <div className='w-full'>
                    <label className='block text-sm font-medium text-gray-300'>Fund emissions (UNLOC)</label>
                    <div className='relative mt-1 rounded-md shadow-sm'>
                      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                        <WalletIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
                      </div>
                      <input
                        {...register('amount', { required: true })}
                        className='w-full rounded-md py-1.5 pl-10 text-gray-900'
                        type='number'
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor='lender_borrower_slider' className='mb-2 block text-sm text-gray-300'>
                      {'Reward ratio'}
                    </label>
                    <div className='rounded-md border border-gray-500 px-2 py-5'>
                      <input
                        id='lender_borrower_slider'
                        {...register('lenderPercentage', { required: true })}
                        defaultValue='50'
                        className='w-full '
                        type='range'
                        min='1'
                        max='100'
                      />
                      <div className='flex justify-between font-mono text-sm tracking-tighter text-gray-300'>
                        <span>Lender: {value}%</span>
                        <span>Borrower: {100 - value}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 flex justify-between'>
                      <label htmlFor='start_timestamp' className='block text-sm font-medium text-gray-300'>
                        Start time
                      </label>
                      <button
                        type='button'
                        onClick={() =>
                          setValue('startTimestamp', Math.round((Date.now() + 60 * 1000) / 1000), {
                            shouldDirty: true,
                            shouldValidate: true
                          })
                        }
                        className='inline-flex rounded-sm border border-gray-600 bg-transparent px-2 py-0.5 text-sm text-gray-50'
                      >
                        Now + 1 min
                      </button>
                    </div>
                    <input
                      id='start_timestamp'
                      type='text'
                      {...register('startTimestamp', { required: true })}
                      step='1'
                      className='w-full rounded-md py-1.5 px-3 font-mono text-gray-900 placeholder:text-sm placeholder:text-gray-400'
                      placeholder='Enter timestamp (seconds)'
                    />
                  </div>
                  <div>
                    <div className='mb-1 flex justify-between'>
                      <label htmlFor='end_timestamp' className='mb-1 block text-sm font-medium text-gray-300'>
                        End time
                      </label>
                      <div className='space-x-1'>
                        <button
                          type='button'
                          onClick={() => setValue('endTimestamp', Math.round((Date.now() + 60 * 60 * 1000) / 1000))}
                          className='inline-flex rounded-sm border border-gray-600 bg-transparent px-2 py-0.5 text-sm text-gray-50'
                        >
                          Now + 1 h
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            setValue('endTimestamp', Math.round((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000))
                          }
                          className='inline-flex rounded-sm border border-gray-600 bg-transparent px-2 py-0.5 text-sm text-gray-50'
                        >
                          Now + 1 week
                        </button>
                      </div>
                    </div>
                    <input
                      id='end_timestamp'
                      type='number'
                      {...register('endTimestamp', { required: true })}
                      step='1'
                      className='w-full rounded-md py-1.5 px-3 font-mono text-gray-900 placeholder:text-sm placeholder:text-gray-400'
                      placeholder='Enter timestamp (seconds)'
                    />
                  </div>
                  <div>
                    <button
                      type='submit'
                      className='block w-full rounded-md bg-pink-600 px-1 py-2 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 focus:ring-offset-gray-600'
                    >
                      Create configuration
                    </button>
                  </div>
                </form>
              </div>
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
