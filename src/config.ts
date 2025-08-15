import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// eslint-disable-next-line jest/require-hook
dotenv.config();

const getEnvValue = (envKey: string, defaultValue?: string) => {
    const envValue = process.env[envKey];
    if (envValue === undefined && !defaultValue) {
        throw new Error(`Environment key ${envKey} is undefined.`);
    }
    return envValue ?? String(defaultValue);
}

export const envConfig = {
    server: {
        host: getEnvValue('APP_HOST'),
        port: Number(getEnvValue('APP_PORT')),
    },
    pg: {
        host: getEnvValue('DB_HOST'),
        port: Number(getEnvValue('DB_PORT')),
        database: getEnvValue('DB_NAME'),
        username: getEnvValue('DB_LOGIN'),
        password: getEnvValue('DB_PASSWORD'),
        logging: true,
    },
    redisUrl: getEnvValue('REDIS_URL'),
};

export const typeORMConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: envConfig.pg.host,
    port: Number(envConfig.pg.port),
    username: envConfig.pg.username,
    password: envConfig.pg.password,
    database: envConfig.pg.database,
    logging: envConfig.pg.logging,
    entities: ['./*/dao/entity/*.entity.{ts,js}', './*/dao/*.entity.{ts,js}'],
    migrations: ['dist/**/dao/migrations/*.{ts, js}'],
    autoLoadEntities: true,
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
};

