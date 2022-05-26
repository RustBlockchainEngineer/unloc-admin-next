import { AppProps } from 'next/app'
import React, { useCallback, useMemo, useState, Dispatch } from 'react'
import { ReactNode } from 'react'
import { clusterApiUrl } from '@solana/web3.js'
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
import toast, { Toaster } from 'react-hot-toast'
import { Navbar } from '../components/navbar'

import '../styles/globals.css'
import '@solana/wallet-adapter-react-ui/styles.css'

interface IAdminContext {
  isAdmin: boolean
  setIsAdmin: Dispatch<React.SetStateAction<boolean>>
}

export const AdminContext = React.createContext<IAdminContext>({} as IAdminContext)

const App = ({ Component, pageProps }: AppProps): ReactNode => {
  const [isAdmin, setIsAdmin] = useState(false)
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])
  // const endpoint = 'http://localhost:8899'

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
    (error) => toast.custom(error.message ? `${error.name}: ${error.message}` : `${error.name}`),
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError}>
        <WalletModalProvider>
          <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
            <div className='app'>
              <Navbar network={network} />
              <Component {...pageProps} />
            </div>
            <Toaster />
          </AdminContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
