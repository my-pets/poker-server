import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SavePlayerDto } from './dto/save-player.dto';
import { GamesService } from './services/games.service';
import { PlayersService } from './services/players.service';
import { SaveCombinationDto } from './dto/save-combination.dto';
import { ShakeDto } from './dto/shake.dto';

import { Inject, OnModuleInit } from '@nestjs/common';
import Redlock from 'redlock';
import { ProcessService } from './services/process.service';
@WebSocketGateway({
    // cors: { origin: '*' },
    cors: { origin: 'https://my-pets.github.io' },
})
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    constructor(
        private readonly gamesService: GamesService,
        private readonly playersService: PlayersService,
        private readonly processService: ProcessService,
        @Inject('REDLOCK') private readonly redlock: Redlock,
    ) {}
    @WebSocketServer()
    server: Server;

    private clients = new Map<string, Socket>();

    async withLock<T>(key: string, callback: () => Promise<T>): Promise<T> {
        const lock = await this.redlock.acquire([`locks:${key}`], 2000);

        let res: T;
        try {
            res = await callback();
        } catch (e) {
            // throw e;
        } finally {
            console.time('release');
            await lock.release();
            console.timeEnd('release');
        }

        return res;
    }

    async onModuleInit() {
        await this.gamesService.loadCache();
        await this.playersService.loadCache();
        this.logger('✅ Кэш игр и игроков загружен');
    }

    logger(msg: string) {
        console.log(msg);
    }

    errorLogger(msg: string) {
        console.log(msg);
        throw new Error(msg);
    }

    handleConnection(client: Socket) {
        this.logger(`Client connected: ${client.id}`);
        this.clients.set(client.id, client);
    }

    handleDisconnect(client: Socket) {
        this.logger(`Client disconnected: ${client.id}`);
        this.clients.delete(client.id);
    }

    send(clientIds: string[], name: string, data: unknown) {
        this.logger(`Send ${name} to ${clientIds.join(', ')}`);
        this.server.to(clientIds).emit(name, data);
    }

    @SubscribeMessage('enter-the-game')
    async enterGame(client: Socket, payload: SavePlayerDto) {
        const { gameCode, playersCount, code } = payload;

        if (!gameCode || !code) return;

        console.time('enter-the-game');

        const game = await this.withLock('game', () =>
            this.processService.enterGame({
                gameCode,
                code,
                playersCount,
                client: client.id,
            }),
        );

        this.send(
            game.players.map(({ client }) => client),
            'game',
            game,
        );
        this.logger(`${client.id} enter the game ${game.code} as ${code}`);

        console.timeEnd('enter-the-game');
    }

    @SubscribeMessage('save-combination')
    async saveCombination(client: Socket, payload: SaveCombinationDto) {
        const { gameCode, code, column, row } = payload;

        if (!gameCode || !payload.code) return;

        console.time('save');

        const game = await this.withLock('game', () =>
            this.processService.saveCombination(
                {
                    gameCode,
                    code,
                    client: client.id,
                },
                { column, row },
            ),
        );

        this.send(
            game.players.map(({ client }) => client),
            'game',
            game,
        );

        this.logger(`${client.id} save combination`);

        console.timeEnd('save');
    }

    @SubscribeMessage('shake')
    async shake(client: Socket, payload: ShakeDto) {
        const { gameCode, code, savedDices } = payload;

        if (!gameCode || !payload.code) return;

        console.time('shake');

        const game = await this.withLock('game', () =>
            this.processService.shake(
                {
                    gameCode,
                    code,
                    client: client.id,
                },
                savedDices,
            ),
        );

        this.send(
            game.players.map(({ client }) => client),
            'current-dices-info',
            game.currentDicesInfo,
        );

        this.logger(`${client.id} saked dices`);

        console.timeEnd('shake');
    }
}
