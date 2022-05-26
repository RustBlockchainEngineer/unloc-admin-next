import React, { createRef, useContext } from 'react'
import { NftsContext } from '../../stores/Nfts.store'
import { LightboxContext } from '../../stores/Lightbox.store'

interface LightboxAddNftProps {
  collection: string
}

export const LightboxAddNft: React.FC<LightboxAddNftProps> = ({ collection }: LightboxAddNftProps) => {
  const store = useContext(NftsContext)
  const lightboxes = useContext(LightboxContext)
  const nftsRef = createRef<HTMLTextAreaElement>()

  const handleCreate = async () => {
    try {
      if (!(nftsRef.current && nftsRef.current.value.length > 0)) return

      await store.addNfts(
        collection,
        nftsRef.current.value.split('\n').filter((mint) => mint.length)
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      lightboxes.setShowAddNft(false)
    }
  }

  const handleCancelCreate = () => {
    lightboxes.setShowAddNft(false)

    if (!nftsRef.current) return

    nftsRef.current.value = ''
  }

  return (
    <>
      <span className='lightbox__title'>Add an NFT to whitelist</span>
      <textarea className='lightbox__input' ref={nftsRef} required={true} rows={5} cols={50} />
      <div className='lightbox__buttons'>
        <button className='btn btn--green create' onClick={() => handleCreate()}>
          OK
        </button>
        <button className='btn btn--red cancel-create' onClick={() => handleCancelCreate()}>
          Cancel
        </button>
      </div>
    </>
  )
}
