import { observer } from 'mobx-react-lite'
import { useContext, useRef } from 'react'
import { FaEdit } from 'react-icons/fa'
import { AdminContext } from '../../pages/_app'
import { useStore } from '../../stores'
import { ProgramName } from '../../stores/Programs.store'
import { compressAddress } from '../../utils'
import { Copyable } from '../common/Copyable'

interface ProgramDisplayProps {
  name: ProgramName
  getAddress: () => string
  getSetter: () => (address: string) => void
  className?: string
}

export const ProgramDisplay = observer(
  ({ name, getAddress, getSetter, className }: ProgramDisplayProps) => {
    const { isAdmin } = useContext(AdminContext)

    const { lightbox: lightboxStore } = useStore()

    const handleEditClick = () => {
      lightboxStore.setName(name)
      lightboxStore.setLightboxFunction(getSetter)
      lightboxStore.setShowProgram(true)
    }

    return (
      <div
        className={`program-display relative flex flex-1 flex-col items-center justify-center border-l-[1px] border-l-slate-400 text-white transition-colors hover:bg-slate-500 md:min-w-fit md:flex-row md:px-4 ${
          className || ''
        }`}
      >
        {isAdmin && (
          <a
            aria-label='Edit address'
            onClick={handleEditClick}
            className='text-md block absolute hidden hover:cursor-pointer md:relative md:left-[-1rem]'
          >
            <FaEdit />
          </a>
        )}
        <div>
          <span className='mb-1 block text-center text-xl capitalize'>{name}</span>
          <Copyable content={getAddress()} className='mx-auto block text-center text-xs'>
            <span className='text-center'>{compressAddress(4, getAddress())}</span>
          </Copyable>
        </div>
      </div>
    )
  }
)
