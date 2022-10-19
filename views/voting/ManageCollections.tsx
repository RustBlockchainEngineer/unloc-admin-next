// Shown inside a dialog

import { compressAddress, removeNulChars } from '@/utils'
import { Dialog } from '@headlessui/react'
import { ProjectData } from '@unloc-dev/unloc-sdk-voting'
import { val, numVal } from '@/utils/spl-utils'
import dayjs from 'dayjs'
import { PublicKey } from '@solana/web3.js'
import { useAccount, useSendTransaction } from '@/hooks'
import { useWallet } from '@solana/wallet-adapter-react'
import { addCollection, getNftMetadataKey, removeCollection } from '@/utils/spl-utils/unloc-voting'
import toast from 'react-hot-toast'
import { useMemo, useState } from 'react'
import { ChevronDoubleRightIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useForm } from 'react-hook-form'
import { isPublicKey } from '@/utils/spl-utils/common'
import { useStore } from '@/stores'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { Copyable } from '@/components/common'

type FormData = {
  collectionMint: string
}

export const ManageCollections = ({ projectsData }: { projectsData: ProjectData[] }) => {
  const { programs } = useStore()
  const { publicKey: wallet } = useWallet()
  const sendAndConfirm = useSendTransaction()
  const [isAdding, setIsAdding] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>()

  const onAddCollection = async (data: FormData) => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }
    //params - frontend binding part
    const collectionNft = new PublicKey(data.collectionMint)

    const tx = await addCollection(wallet, collectionNft, programs.votePubkey)

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

  const onRemoveCollection = (collectionNft: PublicKey, projectId: number) => async () => {
    if (!wallet) {
      toast.error('Connect your wallet')
      return
    }

    const tx = await removeCollection(wallet, collectionNft, projectId, programs.votePubkey)

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

  return (
    <div className='sm:flex sm:items-start'>
      <div className='mt-3 w-full text-center sm:mt-0 sm:text-left'>
        <div className='flex flex-wrap justify-between'>
          <div>
            <Dialog.Title as='h3' className='text-lg font-medium leading-6 text-white'>
              Manage collections
            </Dialog.Title>
            <p className='mt-1 text-sm tracking-tight text-gray-400'>
              Collections can be added by entering the collection NFT mint address.
            </p>
          </div>
          {isAdding ? (
            <form onSubmit={handleSubmit(onAddCollection)} className='mt-2 w-full'>
              <div className='flex items-center'>
                <input
                  {...register('collectionMint', {
                    required: true,
                    validate: (value) => isPublicKey(value) || 'Not a valid pubkey'
                  })}
                  type='text'
                  className='w- rounded-l-md py-2 text-sm'
                  placeholder='Collection mint'
                />
                <button className='inline-flex items-center rounded-r-md border border-transparent bg-indigo-600 py-2 px-3 text-sm text-white'>
                  <ChevronRightIcon className='-ml-1 mr-2 h-4 w-4' />
                  Submit
                </button>

                <button
                  type='button'
                  onClick={() => setIsAdding(false)}
                  className='mx-4 text-gray-50 hover:text-gray-400'
                >
                  Cancel
                </button>
              </div>
              {errors.collectionMint && <p className='text-sm text-red-500'>{errors.collectionMint.message}</p>}
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className='inline-flex items-center rounded-md border border-transparent bg-pink-600 px-4 py-2 text-white hover:bg-pink-700'
            >
              Add Collection
            </button>
          )}
        </div>
        <div className='mt-2 sm:flex sm:items-center'>
          <div className='mt-8 flex w-full flex-col'>
            <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-300'>
                    <thead className='bg-slate-800 text-gray-50'>
                      <tr>
                        <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold'>
                          Name & address
                        </th>
                        <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold'>
                          Status
                        </th>
                        <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold'>
                          Last allocation
                        </th>
                        <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold'>
                          Last vote reset
                        </th>
                        <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold'>
                          Votes
                        </th>
                        <th scope='col' className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
                          <span className='sr-only'>Remove</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-slate-200'>
                      {projectsData.map((project) => (
                        <tr key={project.id}>
                          <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-4'>
                            <div className='flex'>
                              <div>
                                <div className='font-medium text-gray-900'>
                                  <CollectionName collectionKey={project.collectionNft} />
                                </div>
                                <div className='text-gray-500'>
                                  <Copyable content={project.collectionNft.toBase58()}>
                                    {compressAddress(4, project.collectionNft.toBase58())}
                                  </Copyable>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            {project.active ? (
                              <span className='inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800'>
                                Active
                              </span>
                            ) : (
                              <span className='inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800'>
                                Disabled
                              </span>
                            )}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm'>
                            {val(project.allocationUpdatedAt).eqn(0) ? (
                              <div className='font-medium text-gray-900'>Never</div>
                            ) : (
                              <>
                                <div className='font-medium text-gray-900'>
                                  {dayjs(numVal(project.allocationUpdatedAt) * 1000).format('DD/MM/YYYY')}
                                </div>
                                <div className='text-gray-500'>{project.allocationUpdatedAt.toString()}</div>
                              </>
                            )}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm'>
                            {val(project.votesResetTimestamp).eqn(0) ? (
                              <div className='font-medium text-gray-900'>Never</div>
                            ) : (
                              <>
                                <div className='font-medium text-gray-900'>
                                  {dayjs(numVal(project.votesResetTimestamp) * 1000).format('DD/MM/YYYY')}
                                </div>
                                <div className='text-gray-500'>{project.votesResetTimestamp.toString()}</div>
                              </>
                            )}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm'>{project.votesCount.toString()}</td>
                          <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                            {project.active && (
                              <button
                                type='button'
                                onClick={onRemoveCollection(project.collectionNft, project.id)}
                                className='text-orange-600 hover:text-orange-900'
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const CollectionName = ({ collectionKey }: { collectionKey: PublicKey }) => {
  const collectionMetadata = useMemo(() => getNftMetadataKey(collectionKey), [collectionKey])
  const { loading, info } = useAccount(collectionMetadata, (_, data) => Metadata.fromAccountInfo(data)[0], true)

  if (loading) {
    return <div className='h-6 w-full animate-pulse rounded-full bg-slate-500'></div>
  }
  if (!info) {
    return <>{compressAddress(4, collectionKey.toBase58())}</>
  }

  return <>{removeNulChars(info.data.name)}</>
}
