import { useState } from 'react'
import { AccountSelector } from './AccountSelector'
import { accountProviders } from '@unloc-dev/unloc-staking-solita'
import { ExtraRewardPdaForm, FarmPoolPdaForm, FarmPoolUserPdaForm, StatePdaForm } from './PdaForms'

const Badge = ({ value }: { value: string }) => {
  return (
    <span className='inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-800'>
      {value}
    </span>
  )
}

export const PdaPanel = () => {
  const [selectedAccount, setSelectedAccount] = useState<string>('')

  const renderPdaSeeds = () => {
    if (!selectedAccount) return null

    let seeds = []
    switch (selectedAccount) {
      case 'StateAccount':
        seeds = [
          {
            name: 'State',
            type: (
              <p>
                literal: <Badge value={'state'} />
              </p>
            ),
            description: 'The prefix "state".'
          }
        ]
        break
      case 'ExtraRewardsAccount':
        seeds = [
          {
            name: 'Extra',
            type: (
              <p>
                literal: <Badge value={'extra'} />
              </p>
            ),
            description: 'The prefix "extra".'
          }
        ]
        break
      case 'FarmPoolAccount':
        seeds = [
          {
            name: 'Mint',
            type: 'Variable',
            description: 'The public key of the mint that is staked in this pool (UNLOC mint).'
          }
        ]
        break
      case 'FarmPoolUserAccount':
        seeds = [
          {
            name: 'Pool',
            type: 'Variable',
            description: 'The public key of the pool this user is staking in.'
          },
          {
            name: 'Authority',
            type: 'Variable',
            description: 'The public key (wallet) of the user.'
          },
          {
            name: 'Stake seed',
            type: 'Variable',
            description: (
              <p>
                The number <Badge value={'[1-20]'} /> or <Badge value={'60'} /> that identifies
                seperate staking accounts
              </p>
            )
          }
        ]
        break
      default:
        throw Error('Invalid account selected')
    }

    return (
      <div className='mt-2 flex flex-col'>
        <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
            <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-600'>
                <thead className='bg-slate-800'>
                  <tr>
                    <th
                      scope='col'
                      className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-200 sm:pl-6'
                    >
                      Seed
                    </th>
                    <th
                      scope='col'
                      className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-200 sm:pl-6'
                    >
                      Type
                    </th>
                    <th
                      scope='col'
                      className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-200 sm:pl-6'
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-slate-700'>
                  {seeds.map((seed, idx) => (
                    <tr key={seed.name} className={idx % 2 === 0 ? 'undefined' : 'bg-slate-600'}>
                      <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6'>
                        {seed.name}
                      </td>
                      <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-100'>
                        {seed.type}
                      </td>
                      <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-100'>
                        {seed.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPdaForms = () => {
    switch (selectedAccount) {
      case 'StateAccount':
        return <StatePdaForm />
      case 'ExtraRewardsAccount':
        return <ExtraRewardPdaForm />
      case 'FarmPoolAccount':
        return <FarmPoolPdaForm />
      case 'FarmPoolUserAccount':
        return <FarmPoolUserPdaForm />
      default:
        return null
    }
  }

  return (
    <div>
      <div className='mb-8 max-w-fit'>
        <AccountSelector
          accounts={Object.keys(accountProviders)}
          selectedAccount={selectedAccount || ''}
          setSelectedAccount={setSelectedAccount}
        />
      </div>
      {selectedAccount && (
        <div className='max-w-3xl'>
          <h1 className='ml-2 text-lg font-semibold text-gray-50'>Seeds</h1>
          {renderPdaSeeds()}
          {renderPdaForms()}
        </div>
      )}
    </div>
  )
}
