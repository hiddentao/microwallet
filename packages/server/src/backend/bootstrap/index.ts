import Ably from 'ably';
import { Mailer } from '../mailer';
import { createLog } from '../logging';
import { serverConfig } from '../../config/server';
import { PubSubMessageType } from '@/shared/pubsub';
import { User, connectDb, createNotification } from '../db';

export interface BootstrapParams {
  processName: string;
  logLevel?: string;
}

export interface BootstrappedApp {
  mailer?: Mailer;
  ably?: Ably.Rest & {
    notifyUser: (
      wallet: string,
      type: PubSubMessageType,
      data?: object,
    ) => void;
  };
  db: ReturnType<typeof connectDb>;
  log: ReturnType<typeof createLog>;
  notifyUser: (id: User, data: object) => Promise<void>;
}

export const bootstrap = ({
  processName,
  logLevel = serverConfig.LOG_LEVEL,
}: BootstrapParams): BootstrappedApp => {
  const log = createLog({
    name: processName,
    logLevel,
  });

  let db: ReturnType<typeof connectDb>;
  try {
    db = connectDb({ config: serverConfig, log });
  } catch (err) {
    log.error(`Error connecting to db: ${err}`);
    throw err;
  }

  let ably: any;
  if (serverConfig.ABLY_API_KEY) {
    ably = new Ably.Rest({ key: serverConfig.ABLY_API_KEY });
    ably.notifyUser = (
      wallet: string,
      type: PubSubMessageType,
      data?: object,
    ) => {
      (ably as Ably.Rest).channels
        .get(wallet.toLowerCase())
        .publish('msg', { type, data }, (err) => {
          if (err) {
            log.error(
              `Error publishing notification to Ably for user ${wallet}: ${err}`,
            );
          }
        });
    };
  }

  let mailer: Mailer | undefined;
  if (
    serverConfig.MAILGUN_API_KEY &&
    serverConfig.MAILGUN_API_ENDPOINT &&
    serverConfig.MAILGUN_FROM_ADDRESS
  ) {
    mailer = new Mailer({
      log,
      apiKey: serverConfig.MAILGUN_API_KEY,
      endpoint: serverConfig.MAILGUN_API_ENDPOINT,
      fromAddress: serverConfig.MAILGUN_FROM_ADDRESS,
    });
  }

  const app = {
    db,
    log,
    ably,
    mailer,
    notifyUser: async (user: User, data: object) => {
      await createNotification(db, user.id, data);
      ably?.notifyUser(user.wallet, PubSubMessageType.NEW_NOTIFICATIONS);
    },
  };

  return app;
};
