import { useState, useMemo } from 'react'
import { Spinner } from '@/components/common'
import { ArrowPathIcon, CircleStackIcon } from '@heroicons/react/24/solid'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
// import { accountProviders } from '@unloc-dev/unloc-staking-solita'
import { accountProviders } from '@/lib'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { AccountSelector } from './AccountSelector'
import { accountDiscriminator } from '@/utils/spl-utils'

import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { FilterOption } from './Filter'
import { useStore } from '@/stores'

export const DecodingPanelView = () => {
  const { programs } = useStore()
  const { connection } = useConnection()
  const [selectedAccount, setSelectedAccount] = useState<string>()
  const [option, setOption] = useState<'address' | 'memcmp'>()
  const [filter, setFilter] = useState<any>({})
  const [data, setData] = useState<any>()
  const [isLoading, setIsLoading] = useState(false)

  const selectedProvider = useMemo(
    () => selectedAccount && accountProviders[selectedAccount as keyof typeof accountProviders],
    [selectedAccount]
  )
  const isQueryable = !!selectedProvider && !!selectedAccount

  const handleQuery = async () => {
    if (!isQueryable) return

    // Fetch only one account
    try {
      if (filter.address) {
        // If it takes too long, it probably means we're using the wrong account type.
        // Decoding a wrong account type can slow down the browser.
        setIsLoading(true)
        const pubkey = new PublicKey(filter.address)
        const info = await connection.getAccountInfo(pubkey)
        if (!info) throw Error('Account not found')

        const data = selectedProvider.fromAccountInfo(info, 0)[0].pretty()
        setData(data)
      } else if (filter.offset && filter.bytes) {
        const discriminator = accountDiscriminator(selectedAccount)
        const query = selectedProvider
          .gpaBuilder(programs.stakePubkey)
          .addFilter('accountDiscriminator', [...discriminator])
        query.config.filters = [
          {
            memcmp: {
              bytes: filter.bytes,
              offset: filter.offset
            }
          }
        ]
        const data = (await query.run(connection)).map(
          ({ account }) => selectedProvider.fromAccountInfo(account)[0]
        )
        setData(data)
      } else {
        const discriminator = accountDiscriminator(selectedAccount)
        const query = selectedProvider
          .gpaBuilder(programs.stakePubkey)
          .addFilter('accountDiscriminator', [...discriminator])
        const data = (await query.run(connection)).map(
          ({ account }) => selectedProvider.fromAccountInfo(account)[0]
        )
        setData(data)
      }
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
            Filter using:
          </label>
          <FilterOption
            option={option}
            setOption={setOption}
            filter={filter}
            setFilter={setFilter}
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
            <CircleStackIcon className='h-6 w-6 text-slate-300' />
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
