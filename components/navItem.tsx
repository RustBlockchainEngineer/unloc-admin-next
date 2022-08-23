import { useRouter } from 'next/router'
import Link from 'next/link'
import { ReactNode, useState, useMemo } from 'react'
import { FaChevronRight } from 'react-icons/fa'

interface NavItemBasicProps {
  className?: string
  label: string
}

interface NavItemWithChildrenProps extends NavItemBasicProps {
  children: ReactNode
  mode: 'list'
  path?: never
}

interface NavItemAsLinkProps extends NavItemBasicProps {
  children?: never
  path: string
  mode: 'link'
}

type NavItemProps = NavItemAsLinkProps | NavItemWithChildrenProps

export const NavItem = ({ className, label, children, mode, path = '' }: NavItemProps) => {
  const router = useRouter()
  const currPath = useMemo(() => router.pathname.slice(1), [router])

  const [expanded, setExpanded] = useState(false)

  return (
    <li className='text-left text-white w-full'>
      {mode === 'list' &&
        <>
          <a
            className='block w-full text-lg transition-colors hover:text-gray-300 cursor-pointer'
            onClick={() => setExpanded(!expanded)}
          >
            <FaChevronRight className={'inline transition-transform' + `${expanded ? ' rotate-90' : ''}`} />
            <span className={`ml-2 ${expanded && 'font-black'}`}>{label}</span>
          </a>
          <ul className={`mt-2 ml-8 border-l-2 border-l-slate-500 gap-y-2 ${expanded ? 'flex flex-col' : 'hidden'} w-full`}>
            {children}
          </ul>
        </>
      }

      {mode === 'link' &&
        <Link href={`/${path}`}>
          <a className={`block w-full ml-7 text-lg transition-colors hover:text-gray-300 cursor-pointer ${path === currPath && 'font-black'} ${className}`}>
            <span>{label}</span>
          </a>
        </Link>
      }
    </li>
  )
}
