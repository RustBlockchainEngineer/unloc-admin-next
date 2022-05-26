import React, { createRef, useContext } from 'react'
import { CollectionsContext } from '../../stores/Collections.store'
import { LightboxContext } from '../../stores/Lightbox.store'

export const LightboxCreateCollection: React.FC = () => {
  const store = useContext(CollectionsContext)
  const lightboxes = useContext(LightboxContext)
  const collectionRef = createRef<HTMLTextAreaElement>()

  const handleCreate = async () => {
    try {
      if (!(collectionRef.current && collectionRef.current.value)) return

      await store.createCollections(collectionRef.current.value.split('\n').filter((mint) => mint.length))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      lightboxes.setShowCreateCollection(false)
    }
  }

  const handleCancelCreate = () => {
    lightboxes.setShowCreateCollection(false)

    if (!(collectionRef.current && collectionRef.current.value)) return

    collectionRef.current.value = ''
  }

  return (
    <>
      <span className='lightbox__title'>Create Collection</span>
      <textarea className='lightbox__input' ref={collectionRef} required={true} rows={5} cols={50} />
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
}
