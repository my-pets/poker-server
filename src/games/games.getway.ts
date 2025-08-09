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
import { GameStatus } from './enums/game-status.enum';
import { SaveCombinationDto } from './dto/save-combination.dto';
import { saveCombination } from './helpers/save-combination.helper';
import { ShakeDto } from './dto/shake.dto';
import { shake } from './helpers/shake.helper';
import { DEFAULT_COMBS_NUMBER_END } from './constants';

import { OnModuleInit } from '@nestjs/common';
@WebSocketGateway({
    // cors: { origin: '*' },
    cors: { origin: 'https://my-pets.github.io' },
})
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    constructor(
        private readonly gamesService: GamesService,
        private readonly playersService: PlayersService,
    ) {}
    @WebSocketServer()
    server: Server;

    private clients = new Map<string, Socket>();

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

    async getGameAndPlayer(client: Socket, gameCode: string, code: string) {
        let player = this.playersService.getFromCache(code);

        if (!player) {
            this.errorLogger('player not exists');
        }

        if (player.gameCode !== gameCode) {
            this.errorLogger('player in another game');
        }

        if (player.client !== client.id) {
            player = await this.playersService.update({
                code,
                client: client.id,
            });
            this.gamesService.updatePlayersCache(gameCode, player);
        }

        const game = this.gamesService.getFromCache(gameCode);

        return { game, player };
    }

    send(clientIds: string[], name: string, data: unknown) {
        this.logger(`Send ${name} to ${clientIds.join(', ')}`);
        this.server.to(clientIds).emit(name, data);
    }

    @SubscribeMessage('enter-the-game')
    async enterGame(client: Socket, payload: SavePlayerDto) {
        const { gameCode, playersCount } = payload;

        if (!gameCode || !payload.code) return;

        console.time('enter-the-game');
        let game = this.gamesService.getFromCache(gameCode);

        if (!game) {
            game = await this.gamesService.create({
                code: gameCode,
                playersCount,
                currentOrder: 1,
            });
        }

        const player = await this.playersService.save(
            {
                gameCode,
                client: client.id,
                code: payload.code,
            },
            true,
        );

        game = this.gamesService.updatePlayersCache(gameCode, player);

        if ([GameStatus.IN_PROGRESS, GameStatus.ENDED].includes(game.status)) {
            this.send([client.id], 'game', game);
        }

        if (game.status === GameStatus.NEW && game.playersCount === game.players.length) {
            game = await this.gamesService.start(gameCode);

            this.send(
                game.players.map(({ client }) => client),
                'game',
                game,
            );
        }
        console.timeEnd('enter-the-game');
        this.logger(`${client.id} enter the game ${game.code} as ${player.code}`);
    }

    @SubscribeMessage('save-combination')
    async saveCombination(client: Socket, payload: SaveCombinationDto) {
        const { gameCode, code, column, row } = payload;

        if (!gameCode || !payload.code) return;
        console.time('save');
        let { game, player } = await this.getGameAndPlayer(client, gameCode, code);

        if (game.status !== GameStatus.IN_PROGRESS) {
            this.errorLogger('игра не запущена');
        }

        if (player.order !== game.currentOrder) {
            this.errorLogger('не твоя очередь!!1!!!11');
        }

        const { table, currentPlayerInfo, currentDicesInfo } = saveCombination(game, player, { column, row });

        await this.playersService.update(
            {
                code,
                client: client.id,
                table,
                currentPlayerInfo,
            },
            gameCode,
        );

        game = await this.gamesService.update(gameCode, {
            currentOrder: game.currentOrder + 1 > game.playersCount ? 1 : game.currentOrder + 1,
            currentDicesInfo,
        });

        this.send(
            game.players.map(({ client }) => client),
            'game',
            game,
        );
        
        this.logger(`${client.id} save combination`);

        if (game.players.every(({ currentPlayerInfo }) => currentPlayerInfo.combsNumber === DEFAULT_COMBS_NUMBER_END)) {
            await this.gamesService.update(gameCode, {
                status: GameStatus.ENDED,
            });
        }

        console.timeEnd('save');
    }

    @SubscribeMessage('shake')
    async shake(client: Socket, payload: ShakeDto) {
        const { gameCode, code, savedDices } = payload;

        if (!gameCode || !payload.code) return;
        console.time('shake');
        let { game, player } = await this.getGameAndPlayer(client, gameCode, code);

        if (game.status !== GameStatus.IN_PROGRESS) {
            this.errorLogger('игра не запущена');
        }

        if (player.order !== game.currentOrder) {
            this.errorLogger('не твоя очередь!!1!!!11');
        }

        if (game.currentDicesInfo.shakeCount >= 3) {
            this.errorLogger('перебросы закончились');
        }

        const { currentDicesInfo } = shake(game, savedDices);

        this.send(
            game.players.map(({ client }) => client),
            'current-dices-info',
            currentDicesInfo,
        );

        game = await this.gamesService.update(gameCode, {
            currentDicesInfo,
        });

        this.logger(`${client.id} saked dices`);

        console.timeEnd('shake');
    }
}
