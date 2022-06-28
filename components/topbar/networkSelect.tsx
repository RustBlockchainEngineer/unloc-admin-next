import { ChangeEvent, memo } from 'react'
import { NetworkName } from '../../pages/_app'

interface NetworkSelectProps {
  network: NetworkName
  setNetwork: React.Dispatch<React.SetStateAction<NetworkName>>
}

export const NetworkSelect = memo(function NetworkSelect({
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
      className='form-select block min-w-[160px] rounded-md bg-unlocPink text-center font-semibold text-white shadow-md hover:cursor-pointer md:min-w-fit'
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  )
})
