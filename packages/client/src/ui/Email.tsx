import { useSendVerificationEmail } from '../hooks/api';
import { useField, useForm } from '../hooks/forms'
import { TextInput } from './Form';

export const Email = () => {
  const [email] = [
    useField({
      name: 'email',
      initialValue: '',
    }),
  ];

  const {
    valid, isValidating, formError, reset,
  } = useForm({
    fields: [email],
  });

  const sendVerification = useSendVerificationEmail();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await sendVerification.mutateAsync(email.value)
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput field={email} placeholder='Email address' type='email' />
      <button type="submit">Submit</button>
    </form>
  );
}