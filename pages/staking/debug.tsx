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
import { AccountSelector } from '@/views/staking/debug/AccountSelector'
import { useStore } from '@/stores'
import { DecodingPanelView } from '@/views/staking/debug'

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
