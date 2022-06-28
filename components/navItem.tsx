import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa'

interface NavItemProps {
  label: string
  target: string
  expanded?: boolean
  subItems?: string[]
}

export const NavItem = ({ label, target, expanded = false }: NavItemProps) => {
  const chevronClass = 'mr-1 inline transition-transform'

  return (
    <li className='text-left text-white'>
      <Link href={'/' + target}>
        <button className='flex items-center text-lg transition-colors hover:cursor-pointer hover:text-gray-300'>
          <FaChevronRight className={chevronClass + `${expanded ? ' rotate-90' : ''}`} />
          <span className='font-bold'>{label}</span>
        </button>
      </Link>
    </li>
  )
}
