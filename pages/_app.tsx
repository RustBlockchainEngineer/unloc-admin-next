import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { extend } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import { AppProps } from 'next/app'
import React, { Dispatch, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Topbar } from '../components/topbar'

import '@solana/wallet-adapter-react-ui/styles.css'
import { Sidebar } from '../components/sidebar'
import '../styles/main.css'
import rootStore, { StoreContext } from '../stores'
import { observer } from 'mobx-react-lite'

import Link from 'next/link'
import Image from 'next/image'
import logoImage from '../public/unlock_logo_dark.svg'

interface IAdminContext {
  isAdmin: boolean
  setIsAdmin: Dispatch<React.SetStateAction<boolean>>
}

export const AdminContext = React.createContext<IAdminContext>({} as IAdminContext)

extend(relativeTime)
extend(utc)

export type NetworkName = 'Devnet' | 'Mainnet' | 'Localnet'

const wrappedClusterApiUrl = (network: NetworkName, tls?: boolean): string => {
  if (network === 'Localnet') {
    return 'http://localhost:8899'
  }

  return clusterApiUrl(WalletAdapterNetwork[network], tls)
}

const uiNetworkToWalletAdapter = (network: NetworkName) => {
  if (network === 'Mainnet' || network === 'Devnet') {
    return WalletAdapterNetwork[network]
  } else {
    // If Localnet, fallback to Devnet
    return WalletAdapterNetwork.Devnet
  }
}

const App = ({ Component, pageProps }: AppProps): ReactNode => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [uiNetwork, setUiNetwork] = useState<NetworkName>('Devnet')
  const network = useMemo(() => uiNetworkToWalletAdapter(uiNetwork), [uiNetwork])
  const endpoint = useMemo(() => wrappedClusterApiUrl(uiNetwork), [uiNetwork])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network })
    ],
    [network]
  )

  const onError = useCallback(
    (error: any) =>
      toast.error(error.message ? `${error.name}: ${error.message}` : `${error.name}`),
    []
  )

  useEffect(() => {
    if (typeof window === 'object') {
      rootStore.programs.loadFromLocalStorage()
    }
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError}>
        <WalletModalProvider>
          <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
            <StoreContext.Provider value={rootStore}>
              <div className='app'>
                <div className='grid-logo bg-slate-700 inline-flex h-24 items-center justify-center p-10'>
                  <Link href='/'>
                    <Image src={logoImage} width={150} height={38} alt='logo' />
                  </Link>
                </div>
                <Sidebar className='grid-sidebar' network={uiNetwork} setNetwork={setUiNetwork} />
                <Topbar className='grid-topbar' network={uiNetwork} setNetwork={setUiNetwork} />
                <Component className='grid-content' {...pageProps} />
              </div>
            </StoreContext.Provider>
            <Toaster />
          </AdminContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default observer(App)
