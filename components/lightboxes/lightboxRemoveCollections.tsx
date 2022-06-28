import { observer } from 'mobx-react-lite'
import { useStore } from '../../stores'

export const LightboxRemoveCollections: React.FC = observer(() => {
  const { lightbox, collections } = useStore()
  const { data } = lightbox
  const { collectionsData } = collections

  const handleRemove = async () => {
    try {
      await collections.removeCollections(data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      lightbox.setData([])
      lightbox.setShowRemoveCollections(false)
    }
  }

  const handleCancelRemove = () => {
    lightbox.setData([])
    lightbox.setShowRemoveCollections(false)
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
        <span className='font-bold text-red-600 underline'>
          WARNING: THIS ACTION IS{' '}
          {data.length === Object.keys(collectionsData).length ? 'DEFINITELY' : 'POTENTIALLY'}{' '}
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
})
