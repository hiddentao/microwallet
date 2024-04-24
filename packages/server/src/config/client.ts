export interface ClientConfigInterface {
  NEXT_PUBLIC_APP_MODE: string;
  NEXT_PUBLIC_BASE_URL: string;
  NEXT_PUBLIC_DATADOG_APPLICATION_ID?: string;
  NEXT_PUBLIC_DATADOG_CLIENT_TOKEN?: string;
  NEXT_PUBLIC_DATADOG_SITE?: string;
  NEXT_PUBLIC_DATADOG_SERVICE?: string;
}

export const clientConfig = (() => {
  const env = require('env-var').from({
    NEXT_PUBLIC_APP_MODE: process.env.NEXT_PUBLIC_APP_MODE,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_DATADOG_APPLICATION_ID:
      process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN:
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    NEXT_PUBLIC_DATADOG_SITE: process.env.NEXT_PUBLIC_DATADOG_SITE,
    NEXT_PUBLIC_DATADOG_SERVICE: process.env.NEXT_PUBLIC_DATADOG_SERVICE,
  });

  return Object.freeze({
    NEXT_PUBLIC_APP_MODE: env
      .get('NEXT_PUBLIC_APP_MODE')
      .required()
      .asEnum(['development', 'production']),
    NEXT_PUBLIC_BASE_URL: env.get('NEXT_PUBLIC_BASE_URL').required().asString(),
    NEXT_PUBLIC_DATADOG_APPLICATION_ID: env
      .get('NEXT_PUBLIC_DATADOG_APPLICATION_ID')
      .default('')
      .asString(),
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: env
      .get('NEXT_PUBLIC_DATADOG_CLIENT_TOKEN')
      .default('')
      .asString(),
    NEXT_PUBLIC_DATADOG_SITE: env
      .get('NEXT_PUBLIC_DATADOG_SITE')
      .default('')
      .asString(),
    NEXT_PUBLIC_DATADOG_SERVICE: env
      .get('NEXT_PUBLIC_DATADOG_SERVICE')
      .default('')
      .asString(),
  }) as ClientConfigInterface;
})();
