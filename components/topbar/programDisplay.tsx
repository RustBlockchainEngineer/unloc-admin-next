import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { FaEdit } from 'react-icons/fa'
import { ProgramName } from '../../stores/Programs.store'
import { compressAddress } from '../../utils'
import { Button } from '../common/Button'
import { Copyable } from '../common/Copyable'
import { ProgramModal } from './programModal'

interface ProgramDisplayProps {
  name: ProgramName
  getAddress: () => string
  getSetter: () => (address: string) => void
  className?: string
}

export const ProgramDisplay = observer(
  ({ name, getAddress, getSetter, className }: ProgramDisplayProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const handleEditClick = () => dialogRef.current?.showModal()
    const handleCloseClick = () => dialogRef.current?.close()

    return (
      <div
        className={`relative flex flex-1 flex-col items-center justify-center border-l-[1px] border-l-slate-400 text-white transition-colors hover:bg-slate-500 md:min-w-fit md:flex-row md:px-4 ${
          className || ''
        }`}
      >
        <div>
          <span className='mb-1 block text-center text-2xl capitalize'>{name}</span>
          <Copyable content={getAddress()} className='block text-center text-xs mx-auto'>
            <span className='text-center'>{compressAddress(4, getAddress())}</span>
          </Copyable>
        </div>
        <a
          aria-label='Edit address'
          onClick={handleEditClick}
          className='absolute right-4 text-xl hover:cursor-pointer md:relative md:right-0 md:pl-3'
        >
          <FaEdit />
        </a>
        <dialog
          ref={dialogRef}
          className='rounded-md shadow-md backdrop:bg-black backdrop:bg-opacity-40'
        >
          <ProgramModal name={name} addressSetter={getSetter} closeModal={handleCloseClick} />
        </dialog>
      </div>
    )
  }
)
