import { RadioGroup } from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'

const options = ['address', 'memcmp']

type FilterOptionProps = {
  filter: any
  option: 'address' | 'memcmp' | undefined
  setFilter: (filter: any) => void
  setOption: (option: 'address' | 'memcmp') => void
}

export const FilterOption = ({ filter, option, setFilter, setOption }: FilterOptionProps) => {
  return (
    <>
      <RadioGroup value={option} onChange={setOption} className='mt-2'>
        <RadioGroup.Label className='sr-only'>Choose a filtering option</RadioGroup.Label>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {options.map((option) => (
            <RadioGroup.Option
              key={option}
              value={option}
              className={({ active, checked }) =>
                clsx(
                  active && 'ring-2 ring-rose-600 ring-offset-2',
                  checked
                    ? 'border-transparent bg-rose-600 text-white hover:bg-rose-700'
                    : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
                  'flex h-9 items-center justify-center rounded-md border py-2 px-3 text-sm font-medium sm:flex-1'
                )
              }
            >
              <RadioGroup.Label as='span'>{option}</RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      {option === 'address' && (
        <div className='mt-5 flex w-full rounded-md shadow-sm'>
          <span className='inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 leading-5 text-gray-500 sm:text-sm'>
            account
          </span>
          <input
            type='text'
            name='offset'
            id='offset'
            onChange={(event) => setFilter({ ...filter, address: event.target.value })}
            className='focus:border-rose block w-28 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:ring-rose-500 sm:text-sm'
          />
        </div>
      )}

      {option === 'memcmp' && (
        <>
          <div className='mt-5 flex w-fit rounded-md shadow-sm'>
            <span className='inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm'>
              offset
            </span>
            <input
              type='number'
              name='offset'
              id='offset'
              onChange={(event) => setFilter({ ...filter, offset: event.target.value })}
              className='block w-28 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-rose-500 focus:ring-rose-500 sm:text-sm'
              placeholder='1'
            />
          </div>

          <div className='mt-5 flex rounded-md shadow-sm'>
            <span className='inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm'>
              bytes
            </span>
            <input
              type='text'
              name='bytes'
              onChange={(event) => setFilter({ ...filter, bytes: event.target.value })}
              id='bytes'
              className='block w-40 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-rose-500 focus:ring-rose-500 sm:text-sm'
            />
          </div>
        </>
      )}
    </>
  )
}
