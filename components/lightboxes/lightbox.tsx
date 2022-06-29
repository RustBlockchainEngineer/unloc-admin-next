import { observer } from 'mobx-react-lite'
import React, { useContext } from 'react'
import { useStore } from '../../stores'
import { Button } from '../common/Button'

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
        className={`lightbox ${className}`}
      >
        <div
          className='lightbox__container'
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key == 'Escape') {
              lightbox.hideAllLightboxes()
            }
          }}
        >
          <Button
            onClick={(e) => closeWindow(e, false)}
            color='black'
            ghost={true}
            className='w-7 h-7 bg-unlocClose lightbox__close'
          />
          {children}
        </div>
      </div>
    )
  }
)
