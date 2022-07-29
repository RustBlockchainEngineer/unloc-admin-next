import { observer } from 'mobx-react-lite'
import { useStore } from '../stores'
import { Button } from './common/Button'

interface NftRowProps {
  nftMint: string
  proposed: number
  accepted: number
}

export const NftRow: React.FC<NftRowProps> = observer(
  ({ nftMint, proposed, accepted }: NftRowProps) => {
    const { nfts: nftStore, lightbox } = useStore()
    const { selected } = nftStore

    const handleSelection = () => {
      if (selected.includes(nftMint)) {
        nftStore.setSelected(selected.filter((c) => c !== nftMint))
        lightbox.setData(selected)
      } else {
        nftStore.setSelected([...selected, nftMint])
      }
    }

    const handleRemoveNft = async () => {
      try {
        lightbox.setData([nftMint])
        lightbox.setShowRemoveNfts(true)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }

    return (
      <div className='inline-flex odd:bg-slate-800 even:bg-[#34425680] text-sm text-white'>
        <div className='w-1/12 flex-wrap text-center inline-flex items-center justify-center first:border-none border-l-[1px] border-l-solid border-l-slate-600 p-2'>
          <label className='control control-checkbox' htmlFor='select-collection' onClick={() => handleSelection()}>
            <input name='select-collection' type='checkbox' checked={selected.includes(nftMint)} onChange={() => handleSelection()} />
            <div className='control_indicator'></div>
          </label>
        </div>
        <div className='w-6/12 flex-wrap text-center inline-flex items-center justify-center first:border-none border-l-[1px] border-l-solid border-l-slate-600 p-2'>
          <span>{nftMint}</span>
        </div>
        <div className='w-1/12 flex-wrap text-center inline-flex items-center justify-center first:border-none border-l-[1px] border-l-solid border-l-slate-600 p-2'>{proposed}</div>
        <div className='w-1/12 flex-wrap text-center inline-flex items-center justify-center first:border-none border-l-[1px] border-l-solid border-l-slate-600 p-2'>{accepted}</div>
        <div className='w-3/12 flex-wrap text-center inline-flex items-center justify-center first:border-none border-l-[1px] border-l-solid border-l-slate-600 p-2'>
          <Button
            color='red'
            ghost={true}
            className='collections__btn remove-collection'
            onClick={() => handleRemoveNft()}
          >
            Remove NFT from whitelist
          </Button>
        </div>
      </div>
    )
  }
)
