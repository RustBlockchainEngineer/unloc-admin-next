import { observer } from 'mobx-react-lite'
import { useStore } from '../stores'
import { Button } from './common/Button'

interface NftRowProps {
  nftMint: string
  proposed: number
  accepted: number
}

export const NftRow: React.FC<NftRowProps> = observer(
  ({ nftMint, proposed, accepted }: NftRowProps) => {
    const { nfts: nftStore, lightbox } = useStore()
    const { selected } = nftStore

    const handleSelection = () => {
      if (selected.includes(nftMint)) {
        nftStore.setSelected(selected.filter((c) => c !== nftMint))
        lightbox.setData(selected)
      } else {
        nftStore.setSelected([...selected, nftMint])
      }
    }

    const handleRemoveNft = async () => {
      try {
        lightbox.setData([nftMint])
        lightbox.setShowRemoveNfts(true)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }

    return (
      <div className='inline-flex even:bg-white odd:bg-gray-100'>
        <div className='w-1/12 flex-wrap text-center inline-flex items-center justify-center border-2 border-solid border-gray-200 p-2 select'>
          <input
            type='checkbox'
            onChange={() => handleSelection()}
            checked={selected.includes(nftMint)}
          />
        </div>
        <div className='w-5/12 flex-wrap text-center inline-flex items-center justify-center border-2 border-solid border-gray-200 p-2 nft-mint'>
          <span>{nftMint}</span>
        </div>
        <div className='w-1/12 flex-wrap text-center inline-flex items-center justify-center border-2 border-solid border-gray-200 p-2 proposed-count'>{proposed}</div>
        <div className='w-1/12 flex-wrap text-center inline-flex items-center justify-center border-2 border-solid border-gray-200 p-2 accepted-count'>{accepted}</div>
        <div className='w-1/3 flex-wrap text-center inline-flex items-center justify-center border-2 border-solid border-gray-200 p-2 actions'>
          <Button
            color='red'
            ghost={true}
            className='collections__btn remove-collection'
            onClick={() => handleRemoveNft()}
          >
            Remove NFT from whitelist
          </Button>
        </div>
      </div>
    )
  }
)
