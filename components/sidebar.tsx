import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import logoImage from '../public/unlock_logo_dark.svg'
import { NavItem } from './navItem'
import { useRouter } from 'next/router'

// -------------------- Current
// Airdrop
// Distribute NFTs
// Manage Authority
// Users
// Contracts V2
// Manage Collections
// Set Global State
// Whitelist Users

// -------------------- After
// Devnet
//   airdrop
//   distribute NFTs
//   whitelist users
//   users
//   ...
// Loan
// Rewards
// Staking
// Users

const navItems = [
  { label: 'Airdrop', path: '' },
  { label: 'Distribute NFTs', path: 'distribute' },
  { label: 'Manage Authority', path: 'manage' },
  { label: 'Users', path: 'users' },
  { label: 'Contracts V2', path: 'migration' },
  { label: 'Manage Collections', path: 'collections' },
  { label: 'Set Global State', path: 'global-state' },
  { label: 'Whitelist Users', path: 'whitelist' }
] as const

type NavOption = typeof navItems[number]['label']

interface SidebarProps {
  className?: string
}

export const Sidebar = ({ className }: SidebarProps) => {
  const router = useRouter()
  const path = useMemo(() => router.pathname.slice(1), [router])

  return (
    <div className={`h-1/1 bg-slate-700 ${className || ''}`}>
      <div className='fixed'>
        <div className='flex h-24 items-center p-10'>
          <Image src={logoImage} width={150} height={38} alt='logo'></Image>
        </div>
        <div className='px-9'>
          <nav className='flex'>
            <ul className='flex flex-col space-y-2'>
              {navItems.map((item) => {
                return (
                  <NavItem
                    key={item.label}
                    label={item.label}
                    target={item.path}
                    expanded={path === item.path}
                  />
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}
