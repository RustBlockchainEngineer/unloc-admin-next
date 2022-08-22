import { useStore } from '../../stores'
import { Button } from '../common/Button'

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
      <span className='text-2xl font-bold text-slate-400'>Remove NFT{data.length > 1 && 's'}</span>
      <span className='text-slate-500 mb-3'>
        Are you sure you want to remove{' '}
        {data.length === 1 ? 'this NFT' : data.length < nfts.length ? 'these NFTs' : 'all NFTs'}
        ?
      </span>
      <span className='font-bold text-red-600 underline'>
        WARNING: THIS ACTION IS {data.length === nfts.length ? 'DEFINITELY' : 'POTENTIALLY'}{' '}
        DESTRUCTIVE!
      </span>
      <div className='inline-flex justify-evenly items-center mt-4'>
        <Button
          color='red'
          ghost={true}
          className='w-1/3 remove'
          onClick={() => handleRemove()}
        >
          OK
        </Button>
        <Button
          color='gray'
          ghost={true}
          className='w-1/3 cancel-remove'
          onClick={() => handleCancelRemove()}
        >
          Cancel
        </Button>
      </div>
    </>
  )
}
