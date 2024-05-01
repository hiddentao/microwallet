import {
  createUserIfNotExists,
  getOrCreateDappWallet,
  getUser,
} from '../db/users';
import { ONE_MINUTE, defaultResolvers, throwError } from '@uwallet/shared';
import { BootstrappedApp } from '../bootstrap';
import {
  generateVerificationCodeAndBlob,
  verifyCodeWithBlob,
} from '../lib/verifyEmail';
import { Resolvers } from '@uwallet/shared';
import {
  getNotificationsForUser,
  getUnreadNotificationsCountForUser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../db';
import { generateEmail } from '../mailer/mailgen';
import { ErrorCode } from '@uwallet/shared';
import { UserAccountProvider } from '@prisma/client';
import { Context } from '../lib/context';

export const createResolvers = (app: BootstrappedApp) => {
  const log = app.log.create('res');

  return {
    ...defaultResolvers,
    Query: {
      getMyUnreadNotificationsCount: async (_, __, ctx: Context) => {
        log.trace(`getMyUnreadNotificationsCount`);

        const user = await getUser(app, ctx.userId!);

        if (!user) {
          return 0;
        }

        return getUnreadNotificationsCountForUser(app.db, user!.id as number);
      },
      getMyNotifications: async (_, { pageParam }, ctx: Context) => {
        log.trace(`getMyNotifications`);

        const user = await getUser(app, ctx.userId!);

        if (!user) {
          return {
            notifications: [],
            startIndex: 0,
            total: 0,
          };
        }

        const [notifications, total] = await getNotificationsForUser(
          app.db,
          user!.id as number,
          pageParam,
        );

        return {
          notifications,
          startIndex: pageParam.startIndex,
          total,
        };
      },
    },
    Mutation: {
      generateAblyToken: async (_, __, ctx: Context) => {
        log.trace(`generateAblyToken`);

        const user = await getUser(app, ctx.userId!);

        if (user) {
          if (app.ably) {
            const token = await new Promise((resolve, reject) => {
              app.ably!.auth.requestToken(
                {
                  clientId: `${user.id}`,
                  ttl: 60 * ONE_MINUTE,
                },
                (err, token) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(token);
                  }
                },
              );
            });
            return token;
          } else {
            log.warn(`Ably not configured`);
          }
        }

        return undefined;
      },
      markNotificationAsRead: async (_, { id }, ctx: Context) => {
        log.trace(`markNotificationAsRead`);

        const user = await getUser(app, ctx.userId!);

        await markNotificationAsRead(app.db, user!.id as number, id);

        return {
          success: true,
        };
      },
      markAllNotificationsAsRead: async (_: any, __: any, ctx: Context) => {
        log.trace(`markAllNotificationsAsRead`);

        const user = await getUser(app, ctx.userId!);

        await markAllNotificationsAsRead(app.db, user!.id as number);

        return {
          success: true,
        };
      },
      sendVerificationEmail: async (_, { email }) => {
        log.trace(`sendVerificationEmail`);

        const { code, blob } = await generateVerificationCodeAndBlob(
          log,
          email,
        );

        const { html, text } = generateEmail({
          body: {
            name: email,
            signature: 'Thanks',
            intro: [
              'Please verify your email address by entering the following code in the web page:',
              `<strong>${code}</strong>`,
            ],
            outro:
              "Need help, or have questions? Just reply to this email, we'd love to help.",
          },
        });

        await app.mailer.send({
          to: email,
          subject: `Verify your email address with code ${code}`,
          html,
          text,
        });

        return {
          blob,
        };
      },
      verifyEmailCode: async (_, { params }) => {
        log.trace(`verifyEmailCode`);

        const { dappKey, code, blob } = params;

        let email: string;

        try {
          email = await verifyCodeWithBlob(log, code, blob);
        } catch (err: any) {
          throwError(err.message, ErrorCode.VERIFICATION_ERROR)
        }

        const user = await createUserIfNotExists(app, {
          provider: UserAccountProvider.EMAIL,
          providerAccountId: email,
        });

        const wallet = await getOrCreateDappWallet(app, user, dappKey);

        return {
          serverKey: wallet.key,
          clientData: wallet.clientData,
        };
      },
      updateClientChecksum: async (_, { params }, ctx: Context) => {
        log.trace(`updateClientChecksum`);

        // TODO
        // const user = await getUser(app, ctx.userId!);

        // if (!user) {
        //   throwError('User not found', ErrorCode.NOT_FOUND);
        // }

        // const { dappKey, clientChecksum } = params;

        // const wallet = await getOrCreateDappWallet(app, user, dappKey);

        // if (wallet.clientChecksum !== clientChecksum) {
        //   throwError('Client checksum mismatch', ErrorCode.INVALID_INPUT);
        // }

        return {
          success: true,
        };
      }
    },
  } as Resolvers;
};
