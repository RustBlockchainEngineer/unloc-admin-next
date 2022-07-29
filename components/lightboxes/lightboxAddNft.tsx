import { createRef } from 'react'
import { useStore } from '../../stores'
import { Button } from '../common/Button'

interface LightboxAddNftProps {
  collection: string
}

export const LightboxAddNft: React.FC<LightboxAddNftProps> = ({
  collection
}: LightboxAddNftProps) => {
  const { nfts: nftStore, lightbox } = useStore()
  const nftsRef = createRef<HTMLTextAreaElement>()

  const handleCreate = async () => {
    try {
      if (!(nftsRef.current && nftsRef.current.value.length > 0)) return

      await nftStore.addNfts(
        collection,
        nftsRef.current.value.split('\n').filter((mint) => mint.trim().length)
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      lightbox.setShowAddNft(false)
    }
  }

  const handleCancelCreate = () => {
    lightbox.setShowAddNft(false)

    if (!nftsRef.current) return

    nftsRef.current.value = ''
  }

  return (
    <>
      <span className='text-2xl font-bold text-slate-400 mb-3'>Add an NFT to whitelist</span>
      <textarea
        className='rounded-md bg-slate-800 text-slate-500 placeholder:text-slate-700 px-4 py-3'
        ref={nftsRef}
        required={true}
        rows={4}
        cols={60}
        placeholder='Enter NFT mints, one per line'
      />
      <Button
        color='white'
        ghost={true}
        className='create w-2/3 self-center mt-4'
        onClick={() => handleCreate()}
      >
        Create
      </Button>
    </>
  )
}
