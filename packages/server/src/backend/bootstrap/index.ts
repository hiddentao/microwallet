import Ably from 'ably';
import { DummyMailer, Mailer, MailgunMailer } from '../mailer';
import { createLog } from '../logging';
import { serverConfig } from '../../config/server';
import { PubSubMessageType } from '@uwallet/shared';
import { User, connectDb, createNotification } from '../db';

export interface BootstrapParams {
  processName: string;
  logLevel?: string;
}

export interface BootstrappedApp {
  mailer: Mailer;
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

  let mailer: Mailer;
  if (
    serverConfig.MAILGUN_API_KEY &&
    serverConfig.MAILGUN_API_ENDPOINT &&
    serverConfig.MAILGUN_FROM_ADDRESS
  ) {
    mailer = new MailgunMailer({
      log,
      apiKey: serverConfig.MAILGUN_API_KEY,
      endpoint: serverConfig.MAILGUN_API_ENDPOINT,
      fromAddress: serverConfig.MAILGUN_FROM_ADDRESS,
    });
  } else {
    log.warn('No mailer configured, using dummy mailer');
    mailer = new DummyMailer(log);
  }

  const app = {
    db,
    log,
    ably,
    mailer,
    notifyUser: async (user: User, data: object) => {
      await createNotification(db, user.id, data);
      ably?.notifyUser(user.id, PubSubMessageType.NEW_NOTIFICATIONS);
    },
  };

  return app;
};
