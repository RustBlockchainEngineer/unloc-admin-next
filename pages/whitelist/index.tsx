import React, { useState, ChangeEvent, FormEvent, useContext } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { AdminContext } from '../_app'
import { addUsersToWhitelist } from '../../functions/api-queries'
import { Button } from '../../components/common/Button'
import { FaUsers, FaUserCog } from 'react-icons/fa'
import { useWallet } from '@solana/wallet-adapter-react'

const WhitelistUsers: React.FC = () => {
  const { isAdmin } = useContext(AdminContext)
  const { connected } = useWallet()
  const [whitelisted, setWhitelisted] = useState('')
  const [admins, setAdmins] = useState('')
  const router = useRouter()

  const handleWhitelistedChange = (event: ChangeEvent<HTMLTextAreaElement>, mode: 'users' | 'admins') => {
    mode === 'users' ? setWhitelisted(event.target.value) : setAdmins(event.target.value)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>, _mode: 'users' | 'admins') => {
    event.preventDefault()

    if (!whitelisted || whitelisted.length === 0) {
      toast.error('Enter whitelisted users')
      return
    }

    try {
      const response = await addUsersToWhitelist(
        whitelisted
          .split('\n')
          .map((w) => w.trim())
          .filter((w) => w.length)
      )

      // eslint-disable-next-line no-console
      console.log(response)

      if (response instanceof Error) {
        throw response
      }

      toast.success('Users added to the whitelist!')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      toast.error((error as Error).message)
    }
  }

  if (typeof window !== 'undefined' && !(isAdmin && connected)) router.push('/')

  return (
    <main className='main grid-content w-full px-4 space-x-4 inline-flex'>
      <div className='w-1/2 h-max bg-slate-700 p-4 rounded-md'>
        <h2 className='inline-flex mb-8 text-slate-400'><FaUsers className='self-center mr-3 pb-1' /> Add users to whitelist</h2>
        <form className='relative flex flex-col space-y-2 text-sm' onSubmit={(e) => handleSubmit(e, 'users')}>
          <label htmlFor='users'>
            <textarea
              className='w-full rounded-md bg-slate-800 text-white text-sm px-4 py-2'
              id='textarea-users'
              value={whitelisted}
              onChange={(e) => handleWhitelistedChange(e, 'users')}
              rows={3}
              cols={50}
              placeholder='Add users adressess'
            />
          </label>
          <div className='form__buttons'>
            <Button
              color='gray'
              ghost={true}
              type='submit'
            >
              Submit
            </Button>
          </div>
        </form>
      </div>

      <div className='w-1/2 h-max bg-slate-700 p-4 rounded-md'>
        <h2 className='inline-flex mb-8 text-slate-400'><FaUserCog className='self-center mr-3 pb-1' /> Add admins to whitelist</h2>
        <form className='relative flex flex-col space-y-2 text-sm' onSubmit={(e) => handleSubmit(e, 'admins')}>
          <textarea
            className='w-full rounded-md bg-slate-800 text-white text-sm px-4 py-2'
            id='textarea-admin'
            value={admins}
            onChange={(e) => handleWhitelistedChange(e, 'admins')}
            rows={3}
            cols={50}
            placeholder='Add admins adressess'
          />
          <div className='form__buttons'>
            <Button
              color='gray'
              ghost={true}
              type='submit'
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default WhitelistUsers
