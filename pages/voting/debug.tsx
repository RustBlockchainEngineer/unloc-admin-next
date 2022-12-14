import { Tab } from '@headlessui/react'
import { NextPage } from 'next'
import clsx from 'clsx'
import { DecodingPanelView } from '@/views/voting/debug'

import dynamic from 'next/dynamic'
const DynamicDecodingView = dynamic(() => Promise.resolve(DecodingPanelView), {
  ssr: false
})

const VotingDebug: NextPage = () => {
  return (
    <main className='grid-content w-full p-7 text-white'>
      <Tab.Group>
        <Tab.List className='flex max-w-md space-x-1 rounded-xl bg-slate-700 p-1'>
          {['Decode'].map((panel, i) => (
            <Tab
              key={i}
              className={({ selected }) =>
                clsx(
                  'text-md w-full rounded-lg py-2.5 font-medium leading-5 text-blue-700',
                  'ring-white ring-opacity-60 ring-offset-1 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {panel}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className='mt-6'>
          <Tab.Panel key={0}>
            <DynamicDecodingView />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </main>
  )
}

export default VotingDebug
