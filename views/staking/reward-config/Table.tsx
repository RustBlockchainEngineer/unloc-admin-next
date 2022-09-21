import { secondsToDays } from '@/utils/common'
import { numVal, val, amountToUiAmount } from '@/utils/spl-utils'
import { ExtraRewardsAccount } from '@unloc-dev/unloc-staking-solita'

export const Table = ({ extraRewardConfig }: { extraRewardConfig?: ExtraRewardsAccount }) => {
  if (!extraRewardConfig) return null

  return (
    <div className='flex flex-col px-6 sm:px-4 mt-4'>
      <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
        <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
          <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-md'>
            <table className='min-w-full divide-y divide-gray-600'>
              <thead className='bg-slate-900'>
                <tr>
                  <th
                    scope='col'
                    className='py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-200 sm:pl-6'
                  >
                    Index
                  </th>
                  <th
                    scope='col'
                    className='px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-200'
                  >
                    {'Duration (days)'}
                  </th>
                  <th
                    scope='col'
                    className='px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-200'
                  >
                    Extra percentage
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-600 bg-slate-800'>
                {extraRewardConfig.configs.map((config, idx) => (
                  <tr key={idx}>
                    <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-50 sm:pl-6'>
                      {idx + 1}
                    </td>
                    <td className='whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-200'>
                      {secondsToDays(numVal(config.duration))}
                    </td>
                    <td className='whitespace-nowrap px-2 py-2 text-sm text-gray-50'>
                      {amountToUiAmount(val(config.extraPercentage), 11)}%
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
