import { ChangeEvent, memo } from 'react'
import { NetworkName } from '../../pages/_app'

interface NetworkSelectProps {
  className?: string
  network: NetworkName
  setNetwork: React.Dispatch<React.SetStateAction<NetworkName>>
}

export const NetworkSelect = memo(function NetworkSelect({
  className,
  network,
  setNetwork
}: NetworkSelectProps) {
  const options: NetworkName[] = ['Mainnet', 'Devnet', 'Localnet']

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault()
    setNetwork(event.currentTarget.value as NetworkName)
  }

  return (
    <select
      defaultValue={network}
      onChange={handleChange}
      className={`form-select block h-12 !min-w-[160px] rounded-md bg-pink-600 text-center font-semibold text-white shadow-md hover:cursor-pointer md:min-w-fit ${className}`}
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  )
})
