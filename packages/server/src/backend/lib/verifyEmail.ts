import { LogInterface } from '../logging';
import { decrypt, encrypt } from './crypto';
import { serverConfig } from '@/config/server';
import { ONE_HOUR } from '@microwallet/shared';

export interface VerifyEmailCodeBlob {
  email: string;
  code: string;
  blob: string;
}

const _getCryptoParams = () => {
  const len = serverConfig.SESSION_ENCRYPTION_KEY.length;

  return {
    key: serverConfig.SESSION_ENCRYPTION_KEY.substring(0, 32),
    iv: serverConfig.SESSION_ENCRYPTION_KEY.substring(32, 48),
  };
};

export const generateVerificationCodeAndBlob = async (
  log: LogInterface,
  email: string,
): Promise<VerifyEmailCodeBlob> => {
  log.debug(`Generating verification code and blob for email ${email}`);

  const code = Math.floor((Math.random() * 1000000) / 2 + 100000).toString();
  const deadline = Date.now() + ONE_HOUR;
  const cryptoParams = _getCryptoParams();

  const blob = await encrypt(
    log,
    cryptoParams,
    JSON.stringify({ email, code, deadline }),
  );

  return {
    email,
    code,
    blob,
  };
};

export const verifyCodeWithBlob = async (
  log: LogInterface,
  code: string,
  blob: string,
): Promise<string> => {
  log.debug(`Verifying code ${code} with blob ${blob}`);

  const cryptoParams = _getCryptoParams();

  let orig: { code: string; deadline: number; email: string };

  try {
    orig = JSON.parse(await decrypt(log, cryptoParams, blob));
  } catch (err: any) {
    throw new Error(`Error decrypting blob: ${err.message}`);
  }

  if (orig.code != code) {
    throw new Error(`Code is incorrect`);
  }

  if (orig.deadline < Date.now()) {
    throw new Error(`Code has expired`);
  }

  return orig.email;
};
