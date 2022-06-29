import { ButtonHTMLAttributes, FC, MouseEventHandler, ReactNode } from 'react'

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  color?: 'black' | 'gray' | 'red' | 'green' | 'blue' |  'yellow' | 'purple'
  ghost?: boolean
  disabled?: boolean
}

export const Button: FC<IButtonProps> = ({
  children,
  color,
  className,
  ghost = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}: IButtonProps) => {
  const handleColour = () => {
    if (disabled) {
      return 'cursor-not-allowed border-gray-200 bg-gray-200 text-white'
    }

    switch (color) {
      case 'black':
        return `border-black hover:bg-gray-900 ${ghost ? 'text-black bg-transparent' : 'bg-black text-white'}`

      case 'gray':
        return `border-gray-400 hover:bg-gray-300 ${ghost ? 'text-gray-400 bg-transparent' : 'bg-gray-400 text-white'}`

      case 'red':
        return `border-red-600 hover:bg-red-500 ${ghost ? 'text-red-600 bg-transparent' : 'bg-red-600 text-white'}`

      case 'green':
        return `border-green-600 hover:bg-red-500 ${ghost ? 'text-green-600 bg-transparent' : 'bg-green-600 text-white'}`

      case 'blue':
        return `border-blue-600 hover:bg-red-500 ${ghost ? 'text-blue-600 bg-transparent' : 'bg-blue-600 text-white'}`

      case 'yellow':
        return `border-yellow-500 hover:bg-red-400 ${ghost ? 'text-yellow-500 bg-transparent' : 'bg-yellow-500 text-white'}`

      case 'purple':
        return `border-purple-700 hover:bg-purple-600 ${ghost ? 'text-purple-700 bg-transparent' : 'bg-purple-700 text-white'}`

      default:
        return ''
    }
  }

  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      className={`flex items-center cursor-pointer border-solid border-2 rounded-lg p-2 font-semibold ${handleColour()} ${className}`}
    >
      {children}
    </button>
  )
}
