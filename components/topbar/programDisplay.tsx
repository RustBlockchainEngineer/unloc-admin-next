import { Dialog, Transition } from '@headlessui/react'
import { observer } from 'mobx-react-lite'
import { Fragment, useState } from 'react'
import { FaEdit } from 'react-icons/fa'
import { useStore } from '../../stores'
import { ProgramName, initialValues } from '../../stores/Programs.store'
import { compressAddress } from '../../utils'
import { Copyable } from '../common/Copyable'

interface ProgramDisplayProps {
  name: ProgramName
  getAddress: () => string
  getSetter: () => (address: string) => void
  className?: string
}

export const ProgramDisplay = observer(({ name, getAddress, getSetter, className }: ProgramDisplayProps) => {
  let [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')

  const handleSetDefault = () => {
    getSetter()(initialValues[name])
    setIsOpen(false)
  }

  const handleSetAddress = () => {
    getSetter()(value)
    setIsOpen(false)
  }

  return (
    <>
      <div
        className={`program-display relative flex flex-1 flex-col items-center justify-center border-l-[1px] border-l-slate-400 text-white transition-colors hover:bg-slate-500 md:min-w-fit md:flex-row md:px-4 ${
          className || ''
        }`}
      >
        <button
          type='button'
          aria-label='Edit address'
          onClick={() => setIsOpen(true)}
          className='text-md absolute block hover:cursor-pointer md:relative md:left-[-1rem]'
        >
          <FaEdit />
        </button>
        <div>
          <span className='mb-1 block text-center text-xl capitalize'>{name}</span>
          <Copyable content={getAddress()} className='mx-auto block text-center text-xs'>
            <span className='text-center'>{compressAddress(4, getAddress())}</span>
          </Copyable>
        </div>
      </div>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed inset-0 z-10 overflow-y-auto'>
            <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6'>
                  <div className='mt-1 text-center sm:mt-1'>
                    <Dialog.Title as='h3' className='text-lg font-medium leading-6 text-gray-900'>
                      Change {name} program address
                    </Dialog.Title>
                    <div className='mt-2'>
                      <input
                        type='text'
                        className='w-full rounded-md'
                        placeholder='Address'
                        onChange={(e) => setValue(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='mt-5 flex items-center justify-between sm:mt-6'>
                    <button
                      type='button'
                      className='inline-flex justify-center rounded-md border border-gray-500 bg-transparent px-4 py-2 text-base font-medium text-gray-700 shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:text-sm'
                      onClick={handleSetDefault}
                    >
                      Reset to default
                    </button>
                    <button
                      onClick={handleSetAddress}
                      className='inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm'
                    >
                      Submit
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
})
