import { observer } from 'mobx-react-lite'
import { createRef, useEffect } from 'react'
import { useStore } from '../../stores'
import { Button } from '../common/Button'

export const LightboxCreateCollection: React.FC = observer(() => {
  const { lightbox, collections } = useStore()
  const collectionRef = createRef<HTMLTextAreaElement>()

  const handleCreate = async () => {
    try {
      if (!(collectionRef.current && collectionRef.current.value)) return

      await collections.createCollections(
        collectionRef.current.value.split('\n').filter((mint) => mint.trim().length)
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      lightbox.setShowCreateCollection(false)
    }
  }

  const handleCancelCreate = () => {
    lightbox.setShowCreateCollection(false)

    if (!(collectionRef.current && collectionRef.current.value)) return

    collectionRef.current.value = ''
  }

  return (
    <>
      <span className='text-2xl font-bold text-slate-400 mb-3'>Create Collections</span>
      <textarea
        className='rounded-md bg-slate-800 text-slate-500 placeholder:text-slate-700 px-4 py-3'
        ref={collectionRef}
        required={true}
        rows={4}
        cols={60}
        placeholder='Enter collection names, one per line'
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
})
