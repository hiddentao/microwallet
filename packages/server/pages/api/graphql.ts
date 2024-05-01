import NextCors from 'nextjs-cors';
import { parse } from 'url';
import { NextApiRequest, NextApiResponse } from 'next';
import { ApolloServer, HeaderMap } from '@apollo/server';

import { bootstrap } from '../../src/backend/bootstrap';
import { ErrorCode, throwError } from '@uwallet/shared';
import { schema } from '@uwallet/shared';
import { createResolvers } from '../../src/backend/graphql/resolvers';
import { directives } from '@uwallet/shared';
import { Context } from '../../src/backend/lib/context';

//
// Code below based on: https://github.com/apollo-server-integrations/apollo-server-integration-next/blob/0df99b74eece9cdba368920b49549855ebb27c1b/src/startServerAndCreateNextHandler.ts
//

const app = bootstrap({ processName: 'graphql-api' });

const server = new ApolloServer({
  csrfPrevention: true,
  resolvers: createResolvers(app),
  typeDefs: schema,
});

server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Run the cors middleware
  // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'OPTIONS', 'POST'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  const headers = new HeaderMap();

  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  }

  const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
    context: async () => {
      const ctx: Context = {};

      // decode logged-in user
      // const session = await getServerSession(req, res, authOptions);
      // if (session && get(session, 'user')) {
      //   ctx = {
      //     user: session.user,
      //   };
      // }

      // route is authenticated?
      if (directives.auth.includes(req.body.operationName) && !ctx.userId) {
        throwError('Not authenticated', ErrorCode.UNAUTHORIZED);
      }

      return ctx;
    },
    httpGraphQLRequest: {
      body: req.body,
      headers,
      method: req.method || 'POST',
      search: req.url ? parse(req.url).search || '' : '',
    },
  });

  // flush logs
  await app.log.flush();

  for (const [key, value] of httpGraphQLResponse.headers) {
    res.setHeader(key, value);
  }

  res.statusCode = httpGraphQLResponse.status || 200;

  if (httpGraphQLResponse.body.kind === 'complete') {
    res.send(httpGraphQLResponse.body.string);
  } else {
    for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
      res.write(chunk);
    }

    res.end();
  }
}
