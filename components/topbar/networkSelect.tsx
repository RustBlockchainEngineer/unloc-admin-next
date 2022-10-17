import { NetworkName } from '../../pages/_app'
import { Select } from '../common/Select'

interface NetworkSelectProps {
  className?: string
  network: NetworkName
  setNetwork: React.Dispatch<React.SetStateAction<NetworkName>>
}

export const NetworkSelect = ({
  className,
  network,
  setNetwork
}: NetworkSelectProps) => {
  const options: NetworkName[] = ['Mainnet', 'Devnet', 'Localnet']

  const handleChange = (selected: string) => {
    setNetwork(selected as NetworkName)
  }

  // TODO: Change it to a custom component
  return (
    <Select
      defaultOption={network}
      options={options}
      handler={handleChange}
      className={`h-12 !min-w-[160px] rounded-md bg-pink-600 font-semibold text-white shadow-md md:min-w-fit hover:bg-pink-800 ${className}`}
    />
  )
}
