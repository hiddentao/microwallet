import { FC, useCallback, useMemo, useState } from 'react'
import { useProgress } from '@rjshooks/use-progress'
import { useSendVerificationEmail, useVerifyEmailCode } from '../hooks/api'
import { useField } from '../hooks/forms'
import { TextInput } from './Form'
import { Button } from './Button'
import { onCancel } from '@/utils'
import { Wallet } from '@uwallet/shared'
import { ErrorMessageBox } from './ErrorMessageBox'
import { useGlobalContext } from '../contexts/global'

const EmailInput: FC<{ onBlob: (blob: string) => void }> = ({ onBlob }) => {
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
        onBlob(data.result.blob)
        progress.setCompleted()
      } catch (err: any) {
        console.error(err)
        progress.setError(err.message)
      }
    },
    [email.value, onBlob, progress, sendVerification],
  )

  const isLoading = useMemo(() => {
    return progress.inProgress
  }, [progress.inProgress])

  return (
    <form onSubmit={handleSubmit}>
      <TextInput field={email} placeholder="Email address" type="email" />
      <Button type="submit" inProgress={isLoading}>
        Send code
      </Button>
      {progress.error ? <ErrorMessageBox>{progress.error}</ErrorMessageBox> : null}
    </form>
  )
}

const VerifyCode: FC<{ 
  blob: string,
  onVerified: (serverKey: string) => void, 
  onCancel: onCancel 
}> = ({ blob, onVerified, onCancel }) => {
  const progress = useProgress()

  const [code] = [
    useField({
      name: 'code',
      initialValue: '',
    }),
  ]

  // const { valid, isValidating, formError, reset } = useForm({
  //   fields: [email],
  // });

  const verifyCode = useVerifyEmailCode()

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      progress.reset()

      try {
        progress.setActiveStep('Sending verification email')
        const data = await verifyCode.mutateAsync({
          blob,
          code: code.value,
          dappKey: 'test-dapp-1',
        })
        onVerified((data.result as Wallet).serverKey)
        progress.setCompleted()
      } catch (err: any) {
        console.error(err)
        progress.setError(err.message)
      }
    },
    [progress, verifyCode, blob, code.value, onVerified],
  )

  const isLoading = useMemo(() => {
    return progress.inProgress
  }, [progress.inProgress])

  return (
    <form onSubmit={handleSubmit}>
      <TextInput field={code} placeholder="Code" type="number" />
      <Button type="submit" inProgress={isLoading}>
        Verify code
      </Button>
      {progress.error ? <ErrorMessageBox>{progress.error}</ErrorMessageBox> : null}
      <Button type="button" onClick={onCancel}>Go back</Button>
    </form>
  )
}

export const Email = () => {
  const [blob, setBlob] = useState<string>()
  const { setServerKey } = useGlobalContext()

  const onVerified = useCallback((serverKey: string) => {
    setServerKey(serverKey)
  }, [setServerKey])

  const onCancel = useCallback(() => {  
    setBlob(undefined)
  }, [])

  return blob ? (
    <VerifyCode blob={blob} onVerified={onVerified} onCancel={onCancel} />
  ) : (
    <EmailInput onBlob={setBlob} />
  )
}
