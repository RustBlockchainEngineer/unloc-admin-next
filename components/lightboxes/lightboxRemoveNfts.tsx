import { useStore } from '../../stores'

interface LightboxRemoveNftsProps {
  collection: string
}

export const LightboxRemoveNfts: React.FC<LightboxRemoveNftsProps> = ({
  collection
}: LightboxRemoveNftsProps) => {
  const { lightbox, nfts: nftStore } = useStore()
  const { data } = lightbox
  const { nfts } = nftStore

  const handleRemove = async () => {
    try {
      await nftStore.removeNfts(collection, data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      lightbox.setData([])
      lightbox.setShowRemoveNfts(false)
    }
  }

  const handleCancelRemove = () => {
    // eslint-disable-next-line no-console
    console.log(data)
    lightbox.setData([])
    lightbox.setShowRemoveNfts(false)
  }

  return (
    <>
      <span className='lightbox__title'>Remove NFT{data.length > 1 ? 's' : ''}</span>
      <div className='lightbox__content'>
        Are you sure you want to remove{' '}
        {data.length === 1 ? 'this NFT' : data.length < nfts.length ? 'these NFTs' : 'all NFTs'}
        ?
        <br />
        <span className='font-bold text-red-600 underline'>
          WARNING: THIS ACTION IS {data.length === nfts.length ? 'DEFINITELY' : 'POTENTIALLY'}{' '}
          DESTRUCTIVE!
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
