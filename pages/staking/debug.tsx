import { Combobox, Tab, Transition } from '@headlessui/react'
import { ArchiveBoxIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { PublicKey } from '@solana/web3.js'
import {
  accountProviders,
  extraRewardsAccountDiscriminator,
  farmPoolAccountDiscriminator,
  farmPoolUserAccountDiscriminator,
  stateAccountDiscriminator
} from '@unloc-dev/unloc-staking-solita'
import { NextPage } from 'next'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'

import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism'

import { useConnection } from '@solana/wallet-adapter-react'
import clsx from 'clsx'
import { Spinner } from '@/components/common'
import toast from 'react-hot-toast'
import { AccountSelector } from '@/views/staking/AccountSelector'
import { useStakingId } from '@/hooks'
import { useStore } from '@/stores'

const SearchPanelView = () => {
  const { connection } = useConnection()
  const { programs } = useStore()
  const [selectedAccount, setSelectedAccount] = useState<string>()
  const [data, setData] = useState<any>()
  const selectedProvider = useMemo(
    () =>
      selectedAccount ? accountProviders[selectedAccount as keyof typeof accountProviders] : null,
    [selectedAccount]
  )

  const getData = useCallback(async (): Promise<any> => {
    if (!selectedProvider) return
    let discriminator: number[]
    switch (selectedAccount) {
      case 'StateAccount':
        discriminator = stateAccountDiscriminator
        break
      case 'FarmPoolAccount':
        discriminator = farmPoolAccountDiscriminator
        break
      case 'FarmPoolUserAccount':
        discriminator = farmPoolUserAccountDiscriminator
        break
      case 'ExtraRewardsAccount':
        discriminator = extraRewardsAccountDiscriminator
        break
      default:
        return
    }
    try {
      const query = selectedProvider
        .gpaBuilder(programs.stakePubkey)
        .addFilter('accountDiscriminator', discriminator)

      const accounts = await query.run(connection)
      const data = accounts.map(({ account }) =>
        selectedProvider.fromAccountInfo(account)[0].pretty()
      )
      // setAccountsLength(1)
      // setPages(1)
      return data
    } catch (e) {
      console.log('Error:', e)
    }
  }, [connection, selectedProvider, programs, selectedAccount])

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getData()
        console.log(data)
        setData(data)
      } catch (e) {
        console.log('Error:', e)
      }
    }
    if (selectedAccount) fetchData()
  }, [selectedAccount, getData])

  return (
    <div className='container my-6 p-4'>
      <div className='mb-6 flex flex-col gap-6 md:flex-row'>
        <div className='w-56 space-y-4'>
          <p className='px-1 text-xl'>Account</p>
          <AccountSelector
            accounts={Object.keys(accountProviders)}
            setSelectedAccount={setSelectedAccount}
            selectedAccount={selectedAccount || ''}
          />
        </div>
      </div>
      <div className='max-w-full rounded-t-md border border-slate-300'>
        <div className='grid grid-cols-3 bg-slate-700 py-2 px-4 text-slate-50'>
          {/* Account name */}
          <div className='flex min-w-[220px] items-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-6 w-6 text-slate-300'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3'
              />
            </svg>

            <h5 className='tracking-wide'>
              {selectedAccount ? selectedAccount : 'Select an Account'}
            </h5>
          </div>

          {/* state */}
          <div className='flex items-center justify-self-center'>
            {data?.length > 0 ? `${data.length} account found` : 'No results found'}
          </div>

          <div className='flex gap-x-2 justify-self-end'>
            <button
              className={clsx(
                'relative inline-flex items-center justify-self-end rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700',
                'hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              Previous
            </button>
            <button
              className={clsx(
                'relative inline-flex items-center justify-self-end rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700',
                'hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              Next
            </button>
          </div>

          {/* refresh action */}
        </div>
        <div className='min-w-full border-t prose-img:mx-auto prose-img:mt-0 prose-img:mb-0 prose-img:max-h-[150px] prose-img:max-w-[150px]'>
          <SyntaxHighlighter
            showLineNumbers
            wrapLongLines
            language='json'
            style={dracula}
            customStyle={{ fontSize: 15, margin: 0 }}
          >
            {JSON.stringify(data, null, 2)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}

const DecodingPanelView = () => {
  const { connection } = useConnection()
  const [selectedAccount, setSelectedAccount] = useState<string>()
  const [data, setData] = useState<any>()
  const [address, setAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const selectedProvider = useMemo(
    () => selectedAccount && accountProviders[selectedAccount as keyof typeof accountProviders],
    [selectedAccount]
  )
  const isQueryable = address && selectedProvider

  const handleQuery = async () => {
    if (!isQueryable) return
    let pubkey: PublicKey
    try {
      pubkey = new PublicKey(address)
    } catch {
      return
    }

    // If it takes too long, it probably means we're using the wrong account type.
    // Decoding a wrong account type can slow down the browser.
    try {
      setIsLoading(true)
      const info = await connection.getAccountInfo(pubkey)
      if (!info) throw Error('Account not found')

      const data = selectedProvider.fromAccountInfo(info, 0)[0].pretty()
      setData(data)
    } catch (e: any) {
      console.log(e)
      // throw Error('Error parsing account. Did you select the correct account type?')
      let msg = ''
      if (e.message && e.message === 'Account not found') {
        msg = 'Account was not found. Did you enter the correct address?'
      } else {
        msg = 'Error parsing account. Did you select the correct account type?'
      }
      toast.error(msg, {
        style: { minWidth: '250px', backgroundColor: '#334155', color: '#fff' },
        position: 'bottom-left'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='container my-6 p-4'>
      <div className='mb-6 flex flex-col gap-6 md:flex-row'>
        <div className='w-56 space-y-4'>
          <p className='px-1 text-xl'>Account</p>
          <AccountSelector
            accounts={Object.keys(accountProviders)}
            setSelectedAccount={setSelectedAccount}
            selectedAccount={selectedAccount || ''}
          />
        </div>
        <div className='w-56 space-y-4'>
          <label htmlFor='address_input' className='px-1 text-xl'>
            Address
          </label>
          <input
            id='address_input'
            placeholder='Account address'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className='block w-full rounded-md border-none py-2 px-3 text-sm leading-5 text-gray-900 focus:ring-0'
          />
        </div>
        <div className='flex w-56 md:flex-col md:justify-end'>
          <button
            type='button'
            disabled={!isQueryable || isLoading}
            onClick={handleQuery}
            className={clsx(
              'mt-auto inline-flex h-9 items-center justify-center rounded-md bg-pink-600 px-4 shadow',
              isQueryable ? 'hover:cursor-pointer hover:bg-pink-500' : 'bg-gray-500'
            )}
          >
            {isLoading && <Spinner className='justify-self-start' />}
            Query
          </button>
        </div>
      </div>

      <div className='max-w-full rounded-t-md border border-slate-300'>
        <div className='grid grid-cols-3 bg-slate-700 py-2 px-4 text-slate-50'>
          {/* Account name */}
          <div className='flex min-w-[220px] items-center gap-2'>
            <ArchiveBoxIcon className='h-6 w-6 text-slate-300' />
            <h5 className='tracking-wide'>
              {selectedAccount ? selectedAccount : 'Select an Account'}
            </h5>
          </div>

          {/* state */}
          <div className='flex items-center justify-self-center'>
            {data ? '1 account found' : 'No results found'}
          </div>

          {/* refresh action */}
          <button
            onClick={handleQuery}
            className={clsx(
              'relative inline-flex items-center justify-self-end rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700',
              'hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <ArrowPathIcon className={clsx('h-6 w-6 text-gray-500', isLoading && 'animate-spin')} />
          </button>
        </div>
        <div className='min-w-full border-t prose-img:mx-auto prose-img:mt-0 prose-img:mb-0 prose-img:max-h-[150px] prose-img:max-w-[150px]'>
          <SyntaxHighlighter
            showLineNumbers
            wrapLongLines
            language='json'
            style={dracula}
            customStyle={{ fontSize: 15, margin: 0 }}
          >
            {JSON.stringify(data, null, 2)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}

const StakingDebug: NextPage = () => {
  return (
    <main className='grid-content w-full p-7 text-white'>
      <Tab.Group>
        <Tab.List className='flex max-w-md space-x-1 rounded-xl bg-slate-700 p-1'>
          {['Decode', 'Search Accounts'].map((name, i) => (
            <Tab
              key={i}
              className={({ selected }) =>
                clsx(
                  'text-md w-full rounded-lg py-2.5 font-medium leading-5 text-blue-700',
                  'ring-white ring-opacity-60 ring-offset-1 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className='mt-6'>
          <Tab.Panel key={0}>
            <DecodingPanelView />
          </Tab.Panel>
          <Tab.Panel key={1}>
            <SearchPanelView />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </main>
  )
}

export default StakingDebug
