import { durationToSeconds } from '@/utils'
import { uiAmountToAmount } from '@/utils/spl-utils'
import { ChevronDoubleRightIcon, MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { FormEvent, FormEventHandler, memo, useState } from 'react'
import type { Unit, RewardConfig } from '../RewardConfig'
import { MAX_CONFIG_ITEMS } from '../RewardConfig'

type FormProps = {
  onSubmit: FormEventHandler<HTMLFormElement>
  handleAddItem: () => void
  handleRemoveItem: () => void
  handleEditItem: (index: number) => (value: RewardConfig) => void
  values: RewardConfig[]
  errorIndex?: number
  setIsEditing?: (value: boolean) => void
}

export const Form = ({
  onSubmit,
  handleAddItem,
  handleEditItem,
  handleRemoveItem,
  values,
  errorIndex,
  setIsEditing
}: FormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className='px-4 py-5 sm:px-6'>
        <div>
          {values.map((value, i) => {
            const isLast = values.length - 1 === i
            const hasError = i === errorIndex
            return (
              <ExtraRewardConfigItem
                key={i}
                hasError={hasError}
                isLast={isLast}
                handleRemove={handleRemoveItem}
                handleEdit={handleEditItem(i)}
                initialValues={value}
              />
            )
          })}
        </div>
        {values.length < MAX_CONFIG_ITEMS && (
          <button
            type='button'
            onClick={handleAddItem}
            className='group relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:border-gray-400 focus:outline-none'
          >
            <PlusCircleIcon className='mx-auto h-10 w-10 text-gray-200 group-hover:text-gray-300' />
            <span className='mt-1 block text-sm font-medium'>
              Add a reward/duration configuration
            </span>
          </button>
        )}
      </div>

      {/* Button row */}
      <div className='gap-2 px-4 py-5 sm:flex sm:justify-end sm:px-6'>
        {setIsEditing ? (
          <>
            <button
              type='button'
              onClick={() => setIsEditing(false)}
              className='inline-flex items-center rounded-md border border-transparent bg-pink-100 px-4 py-2 text-base font-medium text-pink-900 shadow-sm hover:bg-pink-200'
            >
              Cancel editing
            </button>
            <button
              type='submit'
              className='inline-flex items-center rounded-md border border-transparent bg-pink-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-pink-700'
            >
              Confirm
              <ChevronDoubleRightIcon className='ml-3 -mr-1 h-5 w-5' aria-hidden='true' />
            </button>
          </>
        ) : (
          <button
            type='submit'
            className='inline-flex items-center rounded-md border border-transparent bg-pink-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-pink-700'
          >
            Initialize configuration
            <ChevronDoubleRightIcon className='ml-3 -mr-1 h-5 w-5' aria-hidden='true' />
          </button>
        )}
      </div>
    </form>
  )
}

const ExtraRewardConfigItem = memo(function ExtraRewardConfigItem({
  isLast,
  hasError,
  handleRemove,
  handleEdit,
  initialValues
}: {
  isLast?: boolean
  hasError?: boolean
  handleRemove: () => void
  handleEdit: (value: RewardConfig) => void
  initialValues?: RewardConfig
}) {
  const [unit, setUnit] = useState<Unit>(initialValues ? initialValues.unit : 'days')
  const [duration, setDuration] = useState<string>(
    initialValues ? initialValues.duration.toString() : ''
  )
  const [percentage, setPercentage] = useState<string>(
    initialValues ? initialValues.extraPercentage.toString() : ''
  )
  const handleDurationChange = (e: any) => {
    setDuration(e.target.value)
    handleEdit({ duration: e.target.value, extraPercentage: percentage, unit })
  }
  const handlePercentChange = (e: any) => {
    setPercentage(e.target.value)
    handleEdit({ duration, extraPercentage: e.target.value, unit })
  }

  return (
    <div
      className={clsx(
        'relative mb-4 flex w-full flex-col gap-3 rounded-lg border-2 border-gray-300 p-4 focus:outline-none sm:flex-row',
        hasError ? 'border-red-600' : 'border-gray-300'
      )}
    >
      <div>
        <label htmlFor='duration' className='block text-sm font-medium text-gray-50'>
          Duration
        </label>
        <div className='relative mt-1 rounded-md shadow-sm'>
          <input
            type='text'
            name='duration'
            id='duration'
            className='block w-full rounded-md border-gray-300 pl-3 pr-12 text-gray-900 focus:border-sky-500 focus:ring-sky-500 sm:text-sm'
            value={duration}
            onChange={handleDurationChange}
            placeholder='0'
          />
          <div className='absolute inset-y-0 right-0 flex items-center'>
            <label htmlFor='unit' className='sr-only'>
              Duration unit
            </label>
            <select
              id='duration'
              name='duration'
              onChange={(e) => setUnit(e.target.value as Unit)}
              value={unit}
              className='h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-sky-500 focus:ring-sky-500 sm:text-sm'
            >
              <option value='days'>Days</option>
              <option value='weeks'>Weeks</option>
              <option value='months'>Months</option>
              <option value='years'>Years</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor='bonus_percentage' className='block text-sm font-medium text-gray-50'>
          Bonus percentage
        </label>
        <div className='relative mt-1 rounded-md text-gray-900 shadow-sm'>
          <input
            type='text'
            name='bonus_percentage'
            id='bonus_percentage'
            className='focus:border-ocean-500 focus:ring-ocean-500 block w-full rounded-md border-gray-300 pl-4 pr-12 sm:text-sm'
            value={percentage}
            onChange={handlePercentChange}
            placeholder='0.00'
            aria-describedby='percentage'
          />
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
            <span className='text-gray-500 sm:text-sm' id='percentage'>
              %
            </span>
          </div>
        </div>
      </div>
      {isLast && (
        <div className='flex justify-center sm:items-end'>
          <button onClick={handleRemove}>
            <MinusCircleIcon className='h-10 w-10 text-gray-200 group-hover:text-gray-300' />
          </button>
        </div>
      )}
    </div>
  )
})
