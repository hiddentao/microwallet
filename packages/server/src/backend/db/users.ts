import { Prisma, UserAccountProvider } from '@prisma/client';
import { retryTransaction } from './connect';
import { BootstrappedApp } from '../bootstrap';
import { ErrorCode, throwError } from '@microwallet/shared';
import { generateKey } from '../lib/crypto';

export interface Account {
  provider: UserAccountProvider;
  providerAccountId: string;
}

export const createUserIfNotExists = async (
  app: BootstrappedApp,
  account: Account,
) => {
  return retryTransaction(app.log, 3, async () => {
    return await app.db.$transaction(
      async (tx: any) => {
        const props = {
          provider: account.provider,
          providerUserId: account.providerAccountId,
        };

        const user = await tx.user.findFirst({
          where: {
            accounts: {
              some: props,
            },
          },
          include: {
            accounts: true,
          },
        });

        if (user) {
          return user;
        }

        app.log.trace(
          `Creating user with account ${account.provider} - ${account.providerAccountId}`,
        );

        return tx.user.create({
          data: {
            accounts: {
              create: props,
            },
          },
          include: {
            accounts: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  });
};

export interface User {
  id: number;
}

export const getUser = async (app: BootstrappedApp, userId: number) => {
  return app.db.user.findUnique({
    where: {
      id: userId,
    },
  });
};

export const getOrCreateDappWallet = async (
  app: BootstrappedApp,
  user: User,
  dappKey: string,
) => {
  return retryTransaction(app.log, 3, async () => {
    return await app.db.$transaction(
      async (tx: any) => {
        const dapp = await tx.dapp.findFirst({
          where: {
            key: dappKey,
          },
        });

        if (!dapp) {
          throwError(`Dapp not found: ${dappKey}`, ErrorCode.NOT_FOUND);
        }

        app.log.trace(
          `Upserting wallet for user ${user.id} and dapp ${dapp.id}`,
        );

        return await tx.userWallet.upsert({
          where: {
            userId_dappId: {
              userId: user.id,
              dappId: dapp.id,
            },
          },
          update: {},
          create: {
            dappId: dapp.id,
            userId: user.id,
            key: generateKey(32),
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  });
};
