import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envConfig } from './config';
import { GamesModule } from './games/games.module';
import { RedisModule } from './redis.module';
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: envConfig.pg.host,
            port: Number(envConfig.pg.port),
            username: envConfig.pg.username,
            password: envConfig.pg.password,
            database: envConfig.pg.database,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            ssl: {
                rejectUnauthorized: false,
            },
        }),
        GamesModule,
        RedisModule,
    ],
})
export class AppModule {}
