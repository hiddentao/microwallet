import { request } from 'graphql-request';
import { useMutation } from '@tanstack/react-query';
import {
  sendVerificationEmailMutation,
  verifyEmailCodeMutation,
} from '@uwallet/shared';
import { VerifyEmailCodeInput } from '@uwallet/shared';
import { useGlobalContext } from '../contexts/global';

export const useSendVerificationEmail = () => {
  const { apiEndpoint } = useGlobalContext();

  return useMutation({
    mutationFn: async (email: string) => {
      return request(apiEndpoint, sendVerificationEmailMutation, {
        email,
      });
    },
  });
};

export const useVerifyEmailCode = () => {
  const { apiEndpoint } = useGlobalContext();

  return useMutation({
    mutationFn: async (params: VerifyEmailCodeInput) => {
      return request(apiEndpoint, verifyEmailCodeMutation, { params });
    },
  });
};
