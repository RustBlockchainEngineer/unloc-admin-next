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
  const { isAdmin, setIsAdmin } = useContext(AdminContext)
  const { programs: programStore } = useStore()

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
  }, [connected, publicKey, setIsAdmin])

  return (
    <div className={`flex w-full bg-slate-700 pr-12 ${className || ''}`}>
      <div className='flex w-full py-4'>
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
      <div className='ml-6 inline-flex gap-x-4 py-6'>
        <NetworkSelect network={network} setNetwork={setNetwork} />
        <WalletMultiButton className='shadow-md transition-colors' />
      </div>
    </div>
  )
})
