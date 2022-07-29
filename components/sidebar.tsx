import React from 'react'
import { NavItem } from './navItem'
import { NavListItem } from './navListItem'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { NetworkSelect } from './topbar/networkSelect'
import { NetworkName } from '../pages/_app'

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
  return (
    <div className={`h-1/1 bg-slate-700 ${className || ''}`}>
      <div className='px-9'>
        <nav className='flex'>
          <ul className='flex flex-col space-y-2 w-full'>
            <NavItem label={network} mode='list'>
              <NavListItem label='Whitelist' path='whitelist' />
              <NavListItem label='Manage Authority' path='manage' />
              <NavListItem label='Manage Collections' path='collections' />
              <NavListItem label='NFT Distribution' path='distribute' />
              <NavListItem label='Token Airdropper' path='' />
              <NavListItem label='Set Global State' path='global-state' />
            </NavItem>

            <NavItem label='Rewards' mode='list'>
            </NavItem>

            <NavItem label='Staking' mode='list'>
            </NavItem>

            <NavItem label='Users' mode='list'>
              <NavListItem label='History' path='users' />
            </NavItem>

            <NavItem label='Loan' mode='link' path='loan' />

            <NavItem label='Contracts v2' mode='link' path='migration' />
          </ul>
        </nav>
      </div>
      <div className='flex flex-col xl:hidden m-6 gap-y-6'>
        <NetworkSelect network={network} setNetwork={setNetwork} className='h-12' />
        <WalletMultiButton className='shadow-md transition-colors w-full' />
      </div>
    </div>
  )
}
