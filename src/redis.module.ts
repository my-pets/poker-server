import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: () => {
                const client = new Redis(process.env.REDIS_URL, {
                    tls: {},
                    maxRetriesPerRequest: 10,
                });
                return client;
            },
        },
        {
            provide: 'REDLOCK',
            inject: ['REDIS_CLIENT'],
            useFactory: (client: Redis) => {
                return new Redlock([client], {
                    retryCount: 10, // больше попыток
                    retryDelay: 500, // задержка между попытками (мс)
                    retryJitter: 100, // случайная добавка к задержке
                });
            },
        },
    ],
    exports: ['REDIS_CLIENT', 'REDLOCK'],
})
export class RedisModule {}
