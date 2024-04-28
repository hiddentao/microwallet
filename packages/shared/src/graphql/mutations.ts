import { graphql } from './generated/gql';

export const markNotificationAsReadMutation = graphql(`
  mutation markNotificationAsRead($id: PositiveInt!) {
    result: markNotificationAsRead(id: $id) {
      ...SuccessFragment
    }
  }
`);

export const markAllNotificationsAsReadMutation = graphql(`
  mutation markAllNotificationsAsRead {
    result: markAllNotificationsAsRead {
      ...SuccessFragment
    }
  }
`);

export const generateAblyTokenMutation = graphql(`
  mutation generateAblyToken {
    result: generateAblyToken
  }
`);

export const sendVerificationEmailMutation = graphql(`
  mutation sendVerificationEmail($email: String!) {
    result: sendVerificationEmail(email: $email) {
      blob
    }
  }
`);

export const verifyEmailCodeMutation = graphql(`
  mutation verifyEmailCode($params: VerifyEmailCodeInput!) {
    result: verifyEmailCode(params: $params) {
      ...WalletFragment
    }
  }
`);

export const updateClientChecksumMutation = graphql(`
  mutation updateClientChecksum($params: UpdateClientChecksumInput!) {
    result: updateClientChecksum(params: $params) {
      ...SuccessFragment
    }
  }
`);
