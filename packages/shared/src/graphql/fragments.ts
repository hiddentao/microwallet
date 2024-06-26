import { graphql } from './generated/gql';

export const ErrorFragment = graphql(`
  fragment ErrorFragment on Error {
    error {
      code
      message
    }
  }
`);

export const SuccessFragment = graphql(`
  fragment SuccessFragment on Success {
    success
  }
`);

export const WalletFragment = graphql(`
  fragment WalletFragment on Wallet {
    serverKey
  }
`);

export const NotificationFragment = graphql(`
  fragment NotificationFragment on Notification {
    id
    userId
    data
    createdAt
    read
  }
`);

export const MyNotificationsFragment = graphql(`
  fragment MyNotificationsFragment on MyNotifications {
    notifications {
      ...NotificationFragment
    }
    startIndex
    total
  }
`);

export const EmailCodeVerificationResultFragment = graphql(`
  fragment EmailCodeVerificationResultFragment on EmailCodeVerificationResult {
    ... on Wallet {
      ...WalletFragment
    }
    ... on Error {
      ...ErrorFragment
    }
  }
`);
