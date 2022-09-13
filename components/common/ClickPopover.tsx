import { ReactNode } from 'react'
import { Popover, Transition } from '@headlessui/react'

type ClickPopoverProps = {
  panel: ReactNode
  children: (open?: boolean) => ReactNode
}

export const ClickPopover = ({ panel, children }: ClickPopoverProps) => {
  return (
    <Popover as='button' className='relative z-10 flex items-center justify-center'>
      {({ open }) => (
        <>
          <Popover.Button>{children(open)}</Popover.Button>

          <Transition
            enter='transition duration-100 ease-out'
            enterFrom='transform scale-95 opacity-0'
            enterTo='transform scale-100 opacity-100'
            leave='transition duration-75 ease-out'
            leaveFrom='transform scale-100 opacity-100'
            leaveTo='transform scale-95 opacity-0'
          >
            <Popover.Panel className='absolute z-20'>{panel}</Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
