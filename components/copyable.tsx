import React, { ReactNode, useState } from 'react'
import classNames from 'classnames'

interface CopyableProps {
  children: ReactNode
  content: string
}

export const Copyable = ({ children, content }: CopyableProps) => {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return
    }
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  return (
    <button className='relative' onClick={handleClick}>
      <div
        className={`absolute transition-transform z-10 right-1/2 translate-x-1/2 top-full text-center px-4 py-2 bg-black text-gray-50 rounded-sm origin-top ${
          copied ? 'scale-100' : 'scale-0'
        }`}
      >
        Copied!
      </div>
      {children}
    </button>
  )
}
