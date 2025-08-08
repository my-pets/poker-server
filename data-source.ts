import { envConfig } from 'src/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: envConfig.pg.host,
    port: Number(envConfig.pg.port),
    username: envConfig.pg.username,
    password: envConfig.pg.password,
    database: envConfig.pg.database,
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/src/_migrations/*{.ts,.js}'],
    synchronize: false,
    ssl: {
        rejectUnauthorized: false,
    },
});
