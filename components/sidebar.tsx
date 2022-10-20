import React, { useState } from 'react'
import { NavItem } from './navItem'
import { NavListItem } from './navListItem'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { NetworkSelect } from './topbar/networkSelect'
import { NetworkName } from '../pages/_app'
import { FaBars } from 'react-icons/fa'

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

interface SidebarProps {
  className?: string
  network: NetworkName
  setNetwork: React.Dispatch<React.SetStateAction<NetworkName>>
}

export const Sidebar = ({ className, network, setNetwork }: SidebarProps) => {
  const [hidden, setHidden] = useState(true)

  const toggleSideNav = (): void => setHidden(!hidden)

  return (
    <div className={`transition-all bg-slate-800 ${hidden ? 'w-16 delay-100' : 'w-72'} ${className || ''}`}>
      <a className={`transition-transform block mt-2 mb-4 hover:cursor-pointer ${hidden ? 'rotate-0 delay-100' : 'rotate-180'}`} onClick={toggleSideNav}>
        <FaBars className='block text-white w-12 h-12 m-auto' />
      </a>
      <div className={`transition-all px-9 ${hidden ? 'invisibile opacity-0' : 'invisibile opacity-100 delay-100'}`}>
        <nav className={`flex ${hidden ? 'w-0 delay-100' : 'w-full'}`}>
          <ul className='flex flex-col space-y-2'>
            <NavItem label={network} mode='list'>
              <NavListItem label='Whitelist' path='whitelist' />
              <NavListItem label='Manage Authority' path='manage' />
              <NavListItem label='Manage Collections' path='collections' />
              <NavListItem label='NFT Distribution' path='distribute' />
              <NavListItem label='Token Airdropper' path='' />
            </NavItem>

            <NavItem label='Rewards' mode='list'>
            </NavItem>

            <NavItem label='Staking' mode='list'>
              <NavListItem label='Settings' path='staking' />
              <NavListItem label="Update" path='staking/update' />
              <NavListItem label='Stats' path='staking/stats' />
              <NavListItem label='Debug' path='staking/debug' />
            </NavItem>
            <NavItem label='Voting' mode='list'>
              <NavListItem label='Settings' path='voting' />
              <NavListItem label='Debug' path='voting/debug' />
            </NavItem>

            <NavItem label='Users' mode='list'>
              <NavListItem label='History' path='users' />
            </NavItem>

            <NavItem label='Loan' mode='link' path='loan' />

            <NavItem label='Contracts v2' mode='link' path='migration' />
          </ul>
        </nav>
      </div>
      <div className={`transition-opacity flex flex-col m-6 gap-y-4 xl:hidden ${hidden ? 'invisibile opacity-0' : 'invisibile opacity-100 delay-100'}`}>
        <NetworkSelect network={network} setNetwork={setNetwork} className='h-12' />
        <WalletMultiButton className='shadow-md transition-colors w-full' />
      </div>
    </div>
  )
}
