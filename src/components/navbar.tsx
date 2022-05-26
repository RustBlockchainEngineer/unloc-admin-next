import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { useContext, useEffect, useState } from 'react'
import { isWalletAdmin } from '../functions/api-queries'
import { AdminContext } from '../pages/_app'

interface NavbarProps {
  network: WalletAdapterNetwork
}

export const Navbar = ({ network }: NavbarProps) => {
  const { connected, publicKey } = useWallet()
  const { isAdmin, setIsAdmin } = useContext(AdminContext)

  useEffect(() => {
    const checkIfAdmin = async () => {
      if (publicKey) {
        const check = await isWalletAdmin(publicKey.toBase58())
        console.log(check)

        if (typeof check === 'boolean') {
          setIsAdmin(check)
        } else {
          // eslint-disable-next-line no-console
          console.error(check)
        }
      } else {
        setIsAdmin(false)
      }
    }

    // initLoanProgram(wallet)
    checkIfAdmin()
  }, [connected, publicKey])

  return (
    <nav className='topbar'>
      <ul className='topbar__nav'>
        <li>
          <Link href='/'>
            <a>Airdrop</a>
          </Link>
        </li>
        <li>
          <Link href='/airdrop-to'>
            <a>Multi Airdrop</a>
          </Link>
        </li>
        <li>
          <Link href='/distribute'>
            <a>Distribute NFTs</a>
          </Link>
        </li>
        <li>
          <Link href='/manage'>
            <a>Manage Authority</a>
          </Link>
        </li>
        {isAdmin ? (
          <>
            <li>
              <Link href='/collections'>
                <a>Manage Collections</a>
              </Link>
            </li>
            <li>
              <Link href='/global-state'>
                <a>Set Global State</a>
              </Link>
            </li>
            <li>
              <Link href='/whitelist'>
                <a>Whitelist Users</a>
              </Link>
            </li>
          </>
        ) : (
          ''
        )}
      </ul>
      <div className='connection'>
        {connected && <div className='network-indicator'>{network}</div>}
        <WalletMultiButton />
      </div>
    </nav>
  )
}
