import React, { useContext, useEffect } from 'react'
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

const ManageNFTs: React.FC = observer(() => {
  const router = useRouter()
  const { connected } = useWallet()
  const { isAdmin } = useContext(AdminContext)
  const { nfts: nftStore, lightbox } = useStore()
  const { id } = router.query
  const { nfts, nftsData, selected } = nftStore
  const { showAddNft, showRemoveNfts } = lightbox


  const mapNftRows = () =>
    Object.entries(nftsData).map(([nftMint, { proposed, accepted }]) => (
      <NftRow key={nftMint} nftMint={nftMint} proposed={proposed} accepted={accepted} />
    )).sort((a, b) => a.key!.toString().localeCompare(b.key!.toString()))

  const handleAddNft = () => {
    lightbox.setShowAddNft(true)
  }

  const handleRemoveNfts = async () => {
    lightbox.setData(selected)
    lightbox.setShowRemoveNfts(true)
  }

  const handleSelectAll = () => {
    nftStore.setSelected(nfts)
  }

  const handleClearSelection = () => {
    nftStore.setSelected([])
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      await nftStore.fetchNfts(id as string)
      await nftStore.fetchNftsData()
    }

    if (connected) fetchData()
  }, [connected, id, nftStore])

  if (!(isAdmin && connected)) router.push('/')

  return (
    <main className='main grid-content w-full px-8'>
      <header className='header nfts__header text-white'>
        {connected ? (
          <div className='header__buttons'>
            <Button
              color='gray'
              ghost={true}
              className='back-to-collections'
              onClick={() => router.push('/collections')}
            >
              Go back to collection list
            </Button>
            <Button
              color='green'
              className='add-nft'
              onClick={() => handleAddNft()}
            >
              Add NFTs to the whitelisted collection
            </Button>
          </div>
        ) : (
          ''
        )}
        <h1 className='header__title'>
          Manage <span className='underline'>{id}</span>
        </h1>
      </header>

      {connected ? (
        <>
          <div className='nfts__table'>
            <div className='flex flex-col'>
              <div className='py-4 bg-gray-800 font-bold text-white inline-flex'>
                <div className='w-1/12 flex-wrap text-center inline-flex justify-center items-center select'>Select</div>
                <div className='w-5/12 flex-wrap text-center inline-flex justify-center items-center nft-mint'>Mint</div>
                <div className='w-1/12 flex-wrap text-center inline-flex justify-center items-center proposed-count'>Proposed</div>
                <div className='w-1/12 flex-wrap text-center inline-flex justify-center items-center accepted-count'>Accepted</div>
                <div className='w-1/3 flex-wrap text-center inline-flex justify-center items-center actions'>Actions</div>
              </div>
            </div>
            <div className='flex flex-col'>{mapNftRows()}</div>
          </div>

          <footer className='inline-flex justify-end items-center w-full mt-4 space-x-4'>
            <Button
              color='gray'
              ghost={true}
              className='clear-selected'
              disabled={selected.length === 0}
              onClick={() => handleClearSelection()}
            >
              Clear Selection
            </Button>
            <Button
              color='white'
              ghost={true}
              className='select-all'
              disabled={selected.length >= nfts.length}
              onClick={() => handleSelectAll()}
            >
              Select all
            </Button>
            <Button
              color='red'
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
        </>
      ) : (
        <div className='text-slate-500 not-connected'>Please connect your wallet!</div>
      )}
    </main>
  )
})

export default ManageNFTs
