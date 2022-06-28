import { observer } from 'mobx-react-lite'
import { createRef } from 'react'
import { useStore } from '../../stores'

export const LightboxCreateCollection: React.FC = observer(() => {
  const { lightbox, collections } = useStore()
  const collectionRef = createRef<HTMLTextAreaElement>()

  const handleCreate = async () => {
    try {
      if (!(collectionRef.current && collectionRef.current.value)) return

      await collections.createCollections(
        collectionRef.current.value.split('\n').filter((mint) => mint.length)
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
      <span className='lightbox__title'>Create Collection</span>
      <textarea
        className='lightbox__input'
        ref={collectionRef}
        required={true}
        rows={5}
        cols={50}
      />
      <div className='lightbox__buttons'>
        <button className='btn btn--green create' onClick={() => handleCreate()}>
          Create
        </button>
        <button className='btn btn--red cancel-create' onClick={() => handleCancelCreate()}>
          Cancel
        </button>
      </div>
    </>
  )
})
