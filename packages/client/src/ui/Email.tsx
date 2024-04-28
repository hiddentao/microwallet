import { useCallback, useMemo, useState } from 'react'
import { useSendVerificationEmail } from '../hooks/api'
import { useField } from '../hooks/forms'
import { TextInput } from './Form'
import { Button } from './Button'

export const Email = () => {
  const [blob, setBlob] = useState<string>()

  console.log(blob)

  const [email] = [
    useField({
      name: 'email',
      initialValue: '',
    }),
  ]

  // const { valid, isValidating, formError, reset } = useForm({
  //   fields: [email],
  // });

  const sendVerification = useSendVerificationEmail()

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      try {
        const data = await sendVerification.mutateAsync(email.value)
        setBlob(data.result.blob)
      } catch (err) {
        console.error(err)
      }
    },
    [email.value, sendVerification],
  )

  const isLoading = useMemo(() => {
    return sendVerification.isPending
  }, [sendVerification.isPending])

  useMemo(() => {
    return blob + '1'
  }, [blob])

  return (
    <form onSubmit={handleSubmit}>
      <TextInput field={email} placeholder="Email address" type="email" />
      <Button type="submit" inProgress={isLoading}>
        Send code
      </Button>
    </form>
  )
}
