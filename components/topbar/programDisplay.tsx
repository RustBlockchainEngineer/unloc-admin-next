import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { FaEdit } from 'react-icons/fa'
import { ProgramName } from '../../stores/Programs.store'
import { compressAddress } from '../../utils'
import { Copyable } from '../common/Copyable'
import { ProgramModal } from './programModal'

interface ProgramDisplayProps {
  name: ProgramName
  getAddress: () => string
  getSetter: () => (address: string) => void
  classNames?: string
}

export const ProgramDisplay = observer(
  ({ name, getAddress, getSetter, classNames }: ProgramDisplayProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const handleEditClick = () => dialogRef.current?.showModal()
    const handleCloseClick = () => dialogRef.current?.close()

    return (
      <div
        className={`relative flex flex-1 flex-col items-center justify-center border-l-[1px] border-x-unlocGray-100 text-white transition-colors last:border-r-[1px] hover:bg-unlocGray-200 md:min-w-fit md:flex-row md:px-4 ${
          classNames || ''
        }`}
      >
        <div>
          <span className='mb-1 block text-center text-2xl capitalize'>{name}</span>
          <Copyable content={getAddress()} classNames='block text-center text-xs mx-auto'>
            <span className='text-center'>{compressAddress(4, getAddress())}</span>
          </Copyable>
        </div>
        <button
          aria-label='Edit address'
          onClick={handleEditClick}
          className='absolute right-4 text-xl hover:cursor-pointer md:relative md:right-0 md:pl-3'
        >
          <FaEdit />
        </button>
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
