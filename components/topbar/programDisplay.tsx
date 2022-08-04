import { observer } from 'mobx-react-lite'
import { useContext, useRef } from 'react'
import { FaEdit } from 'react-icons/fa'
import { AdminContext } from '../../pages/_app'
import { ProgramName } from '../../stores/Programs.store'
import { compressAddress } from '../../utils'
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
    const { isAdmin } = useContext(AdminContext)
    const dialogRef = useRef<HTMLDialogElement>(null)
    const handleEditClick = () => dialogRef.current?.showModal()
    const handleCloseClick = () => dialogRef.current?.close()

    return (
      <div
        className={
          `relative flex flex-1 flex-col items-center justify-center border-l-[1px] border-l-slate-400 text-white transition-colors hover:bg-slate-500 hover:font-bold md:min-w-fit md:flex-row md:px-4 program-display ${
          className || ''
        }`}
      >
        {isAdmin && <a
          aria-label='Edit address'
          onClick={handleEditClick}
          className='hidden absolute text-md hover:cursor-pointer md:relative md:left-[-1rem] edit-address'
        >
          <FaEdit />
        </a>}
        <div>
          <span className='mb-1 block text-center text-xl capitalize'>{name}</span>
          <Copyable content={getAddress()} className='block text-center text-xs mx-auto'>
            <span className='text-center'>{compressAddress(4, getAddress())}</span>
          </Copyable>
        </div>
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
