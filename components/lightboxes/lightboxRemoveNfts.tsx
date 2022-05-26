import React, { useContext } from 'react'
import { NftsContext } from '../../stores/Nfts.store'
import { LightboxContext } from '../../stores/Lightbox.store'

interface LightboxRemoveNftsProps {
  collection: string
}

export const LightboxRemoveNfts: React.FC<LightboxRemoveNftsProps> = ({ collection }: LightboxRemoveNftsProps) => {
  const store = useContext(NftsContext)
  const lightboxes = useContext(LightboxContext)
  const { data } = lightboxes
  const { nfts } = store

  const handleRemove = async () => {
    try {
      await store.removeNfts(collection, data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      lightboxes.setData([])
      lightboxes.setShowRemoveNfts(false)
    }
  }

  const handleCancelRemove = () => {
    // eslint-disable-next-line no-console
    console.log(data)
    lightboxes.setData([])
    lightboxes.setShowRemoveNfts(false)
  }

  return (
    <>
      <span className='lightbox__title'>Remove NFT{data.length > 1 ? 's' : ''}</span>
      <div className='lightbox__content'>
        Are you sure you want to remove{' '}
        {data.length === 1 ? 'this NFT' : data.length < nfts.length ? 'these NFTs' : 'all NFTs'}
        ?
        <br />
        <span className='font-bold underline text-red-600'>
          WARNING: THIS ACTION IS {data.length === nfts.length ? 'DEFINITELY' : 'POTENTIALLY'} DESTRUCTIVE!
        </span>
      </div>
      <div className='lightbox__buttons'>
        <button className='btn btn--red remove' onClick={() => handleRemove()}>
          OK
        </button>
        <button className='btn btn--gray cancel-remove' onClick={() => handleCancelRemove()}>
          Cancel
        </button>
      </div>
    </>
  )
}
