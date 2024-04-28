import { useCallback, useMemo, useState } from 'react'
import { useProgress } from '@rjshooks/use-progress'
import { useSendVerificationEmail } from '../hooks/api'
import { useField } from '../hooks/forms'
import { TextInput } from './Form'
import { Button } from './Button'

export const Email = () => {
  const [blob, setBlob] = useState<string>()
  const progress = useProgress()

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
      progress.reset()

      try {
        progress.setActiveStep('Sending verification email')
        const data = await sendVerification.mutateAsync(email.value)
        setBlob(data.result.blob)
        progress.setCompleted()
      } catch (err: any) {
        console.error(err)
        progress.setError(err.message)
      }
    },
    [email.value, progress, sendVerification],
  )

  const isLoading = useMemo(() => {
    return progress.inProgress
  }, [progress.inProgress])

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
