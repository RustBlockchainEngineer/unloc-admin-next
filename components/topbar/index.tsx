import Link from 'next/link'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import { isWalletAdmin } from '../../functions/api-queries'
import { AdminContext, NetworkName } from '../../pages/_app'
import { useStore } from '../../stores'
import { AddressSetter, ProgramName, programs } from '../../stores/Programs.store'

import { NetworkSelect } from './networkSelect'
import { ProgramDisplay } from './programDisplay'

import logoImage from '/public/unlock_logo_dark.svg'

interface NavbarProps {
  network: NetworkName
  setNetwork: React.Dispatch<React.SetStateAction<NetworkName>>
  className?: string
}

// Helper function that gets the accessor to the set function for a given program name,
// so that we can pass it down to a child component (ProgramDisplay)
function getSetterAccessor(name: ProgramName): keyof AddressSetter {
  const programCapitalized = (name.charAt(0).toUpperCase() +
    name.slice(1)) as Capitalize<ProgramName>
  return `set${programCapitalized}`
}

export const Topbar = observer(({ network, setNetwork, className }: NavbarProps) => {
  const { connected, publicKey } = useWallet()
  const { setIsAdmin } = useContext(AdminContext)
  const { programs: programStore, lightbox: lightboxStore } = useStore()

  useEffect(() => {
    const checkIfAdmin = async () => {
      if (publicKey) {
        const check = await isWalletAdmin(publicKey.toBase58())

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
  }, [connected, publicKey, setIsAdmin])

  return (
    <div className={`inline-flex w-full py-4 bg-slate-700 ${className || ''}`}>
      <div className='inline-flex w-72 items-center justify-center py-4'>
        <Link href='/'>
          <Image src={logoImage} width={150} height={38} alt='logo' />
        </Link>
      </div>
      <div className='inline-flex w-full'>
        {programs.map((program) => {
          return (
            <ProgramDisplay
              key={program}
              name={program}
              getAddress={() => programStore[program]}
              getSetter={() => programStore[getSetterAccessor(program)]}
            />
          )
        })}
      </div>
      <div className='hidden xl:inline-flex items-center h-16 px-8 gap-x-8 border-l-slate-400 last:border-l-[1px]'>
        <NetworkSelect network={network} setNetwork={setNetwork} />
        <WalletMultiButton className='shadow-md transition-colors min-w-[160px]' />
      </div>
    </div>
  )
})
