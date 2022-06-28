import { observer } from 'mobx-react-lite'
import React, { useContext } from 'react'
import { useStore } from '../../stores'

interface LightboxProps {
  classNames?: string
  children: JSX.Element
}

export const Lightbox: React.FC<LightboxProps> = observer(
  ({ children, classNames }: LightboxProps) => {
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
        className={`lightbox ${classNames}`}
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
          <button
            onClick={(e) => {
              closeWindow(e, false)
            }}
            className='btn btn--ico btn--black-ghost btn--close lightbox__close'
          />
          {children}
        </div>
      </div>
    )
  }
)
