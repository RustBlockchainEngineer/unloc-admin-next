import { observer } from 'mobx-react-lite'
import { useStore } from '../../stores'
import { Button } from '../common/Button'

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
      <span className='text-2xl font-bold text-slate-400'>Remove Collection{data.length > 1 && 's'}</span>
      <span className='text-slate-500 mb-3'>
        Are you sure you want to remove{' '}
        {data.length === 1
          ? 'this collection'
          : data.length < Object.keys(collectionsData).length
          ? 'these collections'
          : 'all collections'}
        ?
      </span>
      <span className='font-bold text-red-600 underline'>
        WARNING: THIS ACTION IS{' '}
        {data.length === Object.keys(collectionsData).length ? 'DEFINITELY' : 'POTENTIALLY'}{' '}
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
})
