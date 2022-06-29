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
      <div className='tr nfts__tr'>
        <div className='td nfts__td select'>
          <input
            type='checkbox'
            onChange={() => handleSelection()}
            checked={selected.includes(nftMint)}
          />
        </div>
        <div className='td nfts__td nft-mint'>
          <span>{nftMint}</span>
        </div>
        <div className='td nfts__td proposed-count'>{proposed}</div>
        <div className='td nfts__td accepted-count'>{accepted}</div>
        <div className='td nfts__td actions'>
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
