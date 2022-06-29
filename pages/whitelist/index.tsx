import React, { useState, ChangeEvent, FormEvent, useContext } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { AdminContext } from '../_app'
import { addUsersToWhitelist } from '../../functions/api-queries'
import { Button } from '../../components/common/Button'

const WhitelistUsers: React.FC = () => {
  const isAdmin = useContext(AdminContext)
  const [whitelisted, setWhitelisted] = useState('')
  const router = useRouter()

  const handleWhitelistedChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setWhitelisted(event.target.value)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!whitelisted && whitelisted.length === 0) {
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

  if (!isAdmin) {
    router.push('/')
  }

  return (
    <main className='main px-8'>
      <div className='bg-slate-700 p-4 rounded-md'>
        <h1 className='mb-8 text-slate-400'>Add users to whitelist</h1>
        <form className='flex flex-col space-y-2' onSubmit={handleSubmit}>
          <label className='label' htmlFor='mint'>
            Users
            <textarea
              className='input form-input whitelisted-users'
              id='mint'
              value={whitelisted}
              onChange={handleWhitelistedChange}
              rows={3}
              cols={50}
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
    </main>
  )
}

export default WhitelistUsers
