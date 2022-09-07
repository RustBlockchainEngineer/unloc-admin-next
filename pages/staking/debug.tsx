import { NextPage } from 'next'
import { accountProviders } from '@unloc-dev/unloc-staking-solita'
import { Listbox } from '@headlessui/react'
import { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { Button } from '../../components/common/Button'

const keys = ['Select an account type', ...Object.keys(accountProviders)]

const StakingDebug: NextPage = () => {
  const [selectedAccountType, setSelectedAccountType] = useState<string>(keys[0])

  return (
    <main className='main text-lg text-white'>
      <div className='mx-8 flex-row rounded-sm bg-slate-800 p-8'>
        <h1>Account Lookup</h1>
        <div className='flex-col space-y-4'>
          <Listbox value={selectedAccountType} onChange={setSelectedAccountType}>
            <Listbox.Button>{selectedAccountType}</Listbox.Button>
            <Listbox.Options>
              {keys.map((key) => (
                <Listbox.Option key={key} value={key}>
                  {key}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
          <div>
            <input
              type='text'
              placeholder='Address'
              className='border-0 h-12 rounded-md placeholder-gray-400  bg-slate-200 px-2 text-gray-900 ring-1 ring-bl focus:outline-none'
            ></input>
          </div>
        </div>
      </div>
      <div>
        <pre>
            
        </pre>
      </div>
    </main>
  )
}

export default StakingDebug
