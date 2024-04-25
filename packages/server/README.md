# @monorepo/server

## Developer guide

Pre-requisites:

- [PostgreSQL](https://www.postgresql.org/) 11+
- [Node.js](https://nodejs.org) 20+
- [PNPM](https://pnpm.io)

Ensure your postgres server is running at port `5432`. You should have an admin user called `postgres` with no password enabled. Create a database called `microwallet` and ensure the `postgres` user is the owner.

Install packages:

```shell
$ pnpm i
```

Run the local devnet node in a terminal:

```shell
$ pnpm devnet
```

Reset the db schema and run the seed script:

```shell
$ pnpm dev db reset
```

Now run the dev server:

```shell
$ pnpm dev
```

Visit http://localhost:3000 in the browser to interact.

## License

AGPLv3 - see [../../LICENSE.md]
