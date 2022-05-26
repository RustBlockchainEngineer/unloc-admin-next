import { observer } from 'mobx-react-lite'
import React, { useContext } from 'react'
import { LightboxContext } from '../stores/Lightbox.store'
import { NftsContext } from '../stores/Nfts.store'

interface NftRowProps {
  nftMint: string
  proposed: number
  accepted: number
}

export const NftRow: React.FC<NftRowProps> = observer(({ nftMint, proposed, accepted }: NftRowProps) => {
  const store = useContext(NftsContext)
  const lightboxes = useContext(LightboxContext)
  const { selected } = store

  const handleSelection = () => {
    if (selected.includes(nftMint)) {
      store.setSelected(selected.filter((c) => c !== nftMint))
    } else {
      store.setSelected([...selected, nftMint])
    }
  }

  const handleRemoveNft = async () => {
    try {
      lightboxes.setData([nftMint])
      lightboxes.setShowRemoveNfts(true)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  return (
    <div className='tr nfts__tr'>
      <div className='td nfts__td select'>
        <input type='checkbox' onChange={() => handleSelection()} checked={selected.includes(nftMint)} />
      </div>
      <div className='td nfts__td nft-mint'>
        <span>{nftMint}</span>
      </div>
      <div className='td nfts__td proposed-count'>{proposed}</div>
      <div className='td nfts__td accepted-count'>{accepted}</div>
      <div className='td nfts__td actions'>
        <button className='btn btn--red-ghost collections__btn remove-collection' onClick={() => handleRemoveNft()}>
          Remove NFT from whitelist
        </button>
      </div>
    </div>
  )
})