import { amountToUiAmount, numVal, val } from '@/utils/spl-utils'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { VoteSessionInfo } from '@unloc-dev/unloc-sdk-voting'
import dayjs from 'dayjs'
import Image from 'next/image'
import UnlocToken from '../../public/unloc_token.png'

export const EmissionConfigInfo = ({ info }: { info: VoteSessionInfo }) => {
  return (
    <div className='py-6 px-6 md:py-4'>
      <h3 className='mb-6 text-lg font-medium'>Current emission config</h3>
      {val(info.emissions.udpatedAt).eqn(0) ? (
        <div className='flex justify-center pt-6'>
          <button
            type='button'
            // onClick={() => setFocus('amount')}
            className='group mx-8 flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 p-8 hover:border-gray-400'
          >
            <PlusCircleIcon className='mb-2 h-10 w-10 text-gray-500 group-hover:text-gray-400' />
            <p className='text-sm font-medium text-gray-200 group-hover:text-gray-100'>
              Initialize an emission configuration
            </p>
          </button>
        </div>
      ) : (
        <div>
          <dl className='flex flex-wrap gap-2'>
            <div className='max-w-fit rounded-md border border-gray-500 px-4 py-3'>
              <dd className='text-xs text-gray-300'>Emissions</dd>
              <dt className='mt-2 flex items-center text-xl font-semibold'>
                <p>{amountToUiAmount(info.emissions.totalRewards, 6).toLocaleString('en-us')}</p>
                <div className='ml-1 mt-2 flex-shrink-0'>
                  <Image src={UnlocToken} height={24} width={24} alt='' className='rounded-full' />
                </div>
              </dt>
            </div>
            <div className='max-w-fit rounded-md border border-gray-500 px-4 py-3'>
              <dd className='text-xs text-gray-300'>Reward split</dd>
              <dt className='mt-2 grid grid-cols-2 gap-x-2'>
                <span className='font-semibold'>{numVal(info.emissions.lenderShareBp) / 100}%</span>
                <span className='text-right font-semibold'>{numVal(info.emissions.borrowerShareBp) / 100}%</span>
                <span className='text-sm font-light'>Lender</span>
                <span className='text-right text-sm font-light'>Borrower</span>
              </dt>
            </div>
            <div className='rounded-md border border-gray-500 px-4 py-3'>
              <dd className='text-xs text-gray-300'>Start time</dd>
              <dt className='mt-2 font-mono text-xl font-semibold'>
                {dayjs.unix(numVal(info.emissions.startTimestamp)).format('YYYY-MM-DD HH:mm:ssZ[Z]')}
              </dt>
            </div>
            <div className='rounded-md border border-gray-500 px-4 py-3'>
              <dd className='text-xs text-gray-300'>End time</dd>
              <dt className='mt-2 font-mono text-xl font-semibold'>
                {dayjs.unix(numVal(info.emissions.endTimestamp)).format('YYYY-MM-DD HH:mm:ssZ[Z]')}
              </dt>
            </div>
            <div className='max-w-fit rounded-md border border-gray-500 px-4 py-3'>
              <dd className='text-xs text-gray-300'>Updated allocations</dd>
              <dt className='mt-2 text-xl font-semibold'>
                {info.emissions.allocationsUpdatedCount} / {info.projects.totalProjects}
              </dt>
            </div>
            <div className='max-w-fit rounded-md border border-gray-500 px-4 py-3'>
              <dd className='text-xs text-gray-300'>Last update</dd>
              <dt className='mt-2 font-mono text-xl font-semibold'>
                {dayjs.unix(numVal(info.emissions.udpatedAt)).format('YYYY-MM-DD HH:mm')}
              </dt>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
