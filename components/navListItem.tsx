import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

interface NavListItemProps {
  className?: string
  label: string
  path: string
}

export const NavListItem = ({ className, label, path }: NavListItemProps) => {
  const router = useRouter()
  const currPath = useMemo(() => router.pathname.slice(1), [router])

  return (
    <li className={`text-left text-white pl-2 ${path === currPath ? 'ml-[-3px] border-l-4 font-black' : 'ml-[1px]'} ${className}`}>
      <Link href={`/${path}`}>
        <a className='transition-colors hover:text-gray-300 cursor-pointer w-full h-full block' >
          {label}
        </a>
      </Link>
    </li>
  )
}
