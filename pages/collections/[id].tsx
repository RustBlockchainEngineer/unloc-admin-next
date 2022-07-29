import React, { useContext, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { observer } from 'mobx-react-lite'
import { NftRow } from '../../components/nftRow'
import { Lightbox } from '../../components/lightboxes/lightbox'
import { LightboxAddNft } from '../../components/lightboxes/lightboxAddNft'
import { LightboxRemoveNfts } from '../../components/lightboxes/lightboxRemoveNfts'
import { AdminContext } from '../_app'
import { useRouter } from 'next/router'
import { useStore } from '../../stores'
import { Button } from '../../components/common/Button'
import { FaSearch } from 'react-icons/fa'

const ManageNFTs: React.FC = observer(() => {
  const router = useRouter()
  const { connected } = useWallet()
  const { isAdmin } = useContext(AdminContext)
  const { nfts: nftStore, lightbox } = useStore()
  const { id } = router.query
  const { nfts, nftsData, selected } = nftStore
  const { showAddNft, showRemoveNfts } = lightbox

  const [filter, setFilter] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false)

  if (!(isAdmin && connected)) router.push('/')

  const mapNftRows = () =>
    Object.entries(nftsData)
    .filter(([nft, { proposed, accepted }]) => nft.toLowerCase().includes(filter) || [proposed, accepted].includes(Number(filter)))
    .map(([nftMint, { proposed, accepted }]) => (
      <NftRow key={nftMint} nftMint={nftMint} proposed={proposed} accepted={accepted} />
    ))
    .sort((a, b) => a.key!.toString().localeCompare(b.key!.toString()))

  const handleAddNfts = () => {
    lightbox.setShowAddNft(true)
  }

  const handleRemoveNfts = async () => {
    lightbox.setData(selected)
    lightbox.setShowRemoveNfts(true)
  }

  const handleSelectAll = () => {
    nftStore.setSelected(checked ? [] : nfts)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      await nftStore.fetchNfts(id as string)
      await nftStore.fetchNftsData()
    }

    if (connected) fetchData()
  }, [connected, id, nftStore])

  useEffect(() => {
    setChecked(selected.length === nfts.length)
  }, [nfts, selected])

  return (
    <main className='main grid-content w-full px-8'>
      <header className='w-full inline-flex justify-between mb-4'>
        <div className='inline-flex'>
          <Button
            color='gray'
            ghost={true}
            className='back-to-collections'
            onClick={() => router.push('/collections')}
          >
            Go back to collection list
          </Button>
          <h1 className='text-slate-500 ml-4 align-middle'>Manage <span className='underline'>{id}</span></h1>
        </div>

        <div className='inline-flex gap-4'>
          <div className='inline-flex relative'>
            <FaSearch className='text-slate-700 absolute top-[14px] left-[10px]' />
            <input
              className='bg-transparent border-solid border-slate-500 border-[1px] rounded-lg pl-8 pr-4 text-slate-500 placeholder:text-slate-700'
              placeholder='Search for collection'
              onChange={(e) => setFilter(e.target.value.toLowerCase())}
            />
          </div>

          <Button
            color='white'
            ghost={true}
            className='w-64'
            onClick={() => handleAddNfts()}
          >
            Add NFTs to the collection
          </Button>
        </div>
      </header>

      <div className='nfts__table'>
      <div className='flex flex-col'>
          <div className='py-4 bg-slate-700 font-bold text-lg text-slate-400 inline-flex rounded-t'>
            <div className='w-1/12 flex-wrap text-center inline-flex justify-center items-center'>
              <label className='control control-checkbox' htmlFor='select-all' onClick={handleSelectAll}>
                <input name='select-all' type='checkbox' onChange={handleSelectAll} checked={checked} />
                <div className='control_indicator border-none bg-slate-800'></div>
              </label>
            </div>
            <div className='w-6/12 flex-wrap text-center inline-flex justify-center items-center'>NFT Mint</div>
            <div className='w-1/12 flex-wrap text-center inline-flex justify-center items-center'>Proposed Count</div>
            <div className='w-1/12 flex-wrap text-center inline-flex justify-center items-center'>Accepted Count</div>
            <div className='w-3/12 flex-wrap text-center inline-flex justify-center items-center'>Actions</div>
          </div>
        </div>
        <div className='flex flex-col'>{mapNftRows()}</div>
      </div>

      <footer className='inline-flex justify-end items-center w-full mt-4 space-x-4'>
        <Button
          color='red'
          ghost={true}
          className='remove-selected'
          disabled={selected.length === 0}
          onClick={() => handleRemoveNfts()}
        >
          Remove Selected
        </Button>
      </footer>

      {id && showAddNft ? (
        <Lightbox>
          <LightboxAddNft collection={id as string} />
        </Lightbox>
      ) : (
        ''
      )}

      {id && showRemoveNfts ? (
        <Lightbox>
          <LightboxRemoveNfts collection={id as string} />
        </Lightbox>
      ) : (
        ''
      )}
    </main>
  )
})

export default ManageNFTs
