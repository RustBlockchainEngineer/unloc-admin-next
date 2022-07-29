import { observer } from 'mobx-react-lite'
import React from 'react'
import { FaTimes } from 'react-icons/fa'
import { useStore } from '../../stores'

interface LightboxProps {
  className?: string
  children: JSX.Element
}

export const Lightbox: React.FC<LightboxProps> = observer(
  ({ children, className }: LightboxProps) => {
    const { lightbox } = useStore()

    const closeWindow = (e: any, check: boolean) => {
      if (e.target !== e.currentTarget && check) {
        return
      }

      lightbox.hideAllLightboxes()
    }

    return (
      <div
        onClick={(e) => {
          closeWindow(e, true)
        }}
        className={`fixed top-0 left-0 flex flex-col justify-center items-center w-full h-full bg-slate-900/50 ${className}`}
      >
        <dialog
          className='relative flex flex-col bg-slate-700 rounded-lg px-4 pt-3 pb-3'
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key == 'Escape') {
              lightbox.hideAllLightboxes()
            }
          }}
        >
          <a onClick={(e) => closeWindow(e, false)} className='absolute top-3 right-4 cursor-pointer'>
            <FaTimes className='w-7 h-7 text-white' />
          </a>
          {children}
        </dialog>
      </div>
    )
  }
)
