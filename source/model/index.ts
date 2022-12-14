import { DataSource } from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { ConnectionOptions, parse } from 'pg-connection-string';

import { Home } from './Home';
import { User } from './User';
import { OauthClient } from './oauth/OauthClient';
import { OauthCode } from './oauth/OauthCode';
import { OauthToken } from './oauth/OauthToken';

export * from './Base';
export * from './Home';
export * from './User';
export * from './oauth/OauthClient';
export * from './oauth/OauthCode';
export * from './oauth/OauthToken';

const { NODE_ENV, DATABASE_URL } = process.env;

export const isProduct = NODE_ENV === 'production';

const { host, port, user, password, database } = isProduct
    ? parse(DATABASE_URL)
    : ({} as ConnectionOptions);

const commonOptions: Pick<
    SqliteConnectionOptions,
    'synchronize' | 'entities' | 'migrations'
> = {
    synchronize: true,
    entities: [Home, User, OauthClient, OauthCode, OauthToken],
    migrations: [`${isProduct ? '.data' : 'migration'}/*.ts`]
};

export default isProduct
    ? new DataSource({
          type: 'postgres',
          host,
          port: +port,
          username: user,
          password,
          database,
          logging: true,
          ...commonOptions
      })
    : new DataSource({
          type: 'sqlite',
          database: '.data/test.db',
          logging: false,
          ...commonOptions
      });
