import React, { useContext } from 'react'
import { CollectionsContext } from '../../stores/Collections.store'
import { LightboxContext } from '../../stores/Lightbox.store'

export const LightboxRemoveCollections: React.FC = () => {
  const store = useContext(CollectionsContext)
  const lightboxes = useContext(LightboxContext)
  const { data } = lightboxes
  const { collectionsData } = store

  const handleRemove = async () => {
    try {
      await store.removeCollections(data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      lightboxes.setData([])
      lightboxes.setShowRemoveCollections(false)
    }
  }

  const handleCancelRemove = () => {
    lightboxes.setData([])
    lightboxes.setShowRemoveCollections(false)
  }

  return (
    <>
      <span className='lightbox__title'>Remove Collection{data.length > 1 ? 's' : ''}</span>
      <div className='lightbox__content'>
        Are you sure you want to remove{' '}
        {data.length === 1
          ? 'this collection'
          : data.length < Object.keys(collectionsData).length
          ? 'these collections'
          : 'all collections'}
        ?
        <br />
        <span className='font-bold underline text-red-600'>
          WARNING: THIS ACTION IS {data.length === Object.keys(collectionsData).length ? 'DEFINITELY' : 'POTENTIALLY'}{' '}
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
