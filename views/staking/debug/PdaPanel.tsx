import { accountProviders } from '@unloc-dev/unloc-sdk-staking'
import { useState } from 'react'
import { AccountSelector } from '../../../components/AccountSelector'
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
      case 'PoolInfo':
        seeds = [
          {
            name: 'UNLOC_STAKING',
            type: (
              <p>
                literal: <Badge value={'unloc-staking'} />
              </p>
            ),
            description: 'The string "unloc-staking".'
          },
          {
            name: 'STAKING_POOL',
            type: (
              <p>
                literal: <Badge value={'staking-pool'} />
              </p>
            ),
            description: 'The string "staking-pool".'
          },
          {
            name: 'DATA_ACCOUNT',
            type: (
              <p>
                literal: <Badge value={'data-account'} />
              </p>
            ),
            description: 'The string "data-account".'
          }
        ]
        break
      case 'UpdatePoolConfigsInfo':
        seeds = [
          {
            name: 'UNLOC_STAKING',
            type: (
              <p>
                literal: <Badge value={'unloc-staking'} />
              </p>
            ),
            description: 'The prefix "unloc-staking".'
          },
          {
            name: 'UNLOC_UPDATE_CONFIGS',
            type: (
              <p>
                literal: <Badge value={'pool-update-configs'} />
              </p>
            ),
            description: 'The prefix "pool-update-configs".'
          },
          {
            name: 'Proposal authority wallet',
            type: 'Variable',
            description: 'The public key of the user making the proposal.'
          },
          {
            name: 'Pool info',
            type: 'Variable',
            description: 'PoolInfo PDA.'
          },
          {
            name: 'DATA_ACCOUNT',
            type: (
              <p>
                literal: <Badge value={'data-account'} />
              </p>
            ),
            description: 'The prefix "data-account".'
          }
        ]
        break
      case 'UserStakingsInfo':
        seeds = [
          {
            name: 'UNLOC_STAKING',
            type: (
              <p>
                literal: <Badge value={'unloc-staking'} />
              </p>
            ),
            description: 'The prefix "unloc-staking".'
          },
          {
            name: 'USER_STAKE_INFO',
            type: (
              <p>
                literal: <Badge value={'user-stake-info'} />
              </p>
            ),
            description: 'The string "user-stake-info".'
          },
          {
            name: 'User wallet',
            type: 'Variable',
            description: 'The public key (wallet) of the user.'
          },
          {
            name: 'Pool info',
            type: 'Variable',
            description: 'PoolInfo PDA.'
          },
          {
            name: 'DATA_ACCOUNT',
            type: (
              <p>
                literal: <Badge value={'data-account'} />
              </p>
            ),
            description: 'The string "data-account".'
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
