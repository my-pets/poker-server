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

@WebSocketGateway({
    cors: { origin: 'https://my-pets.github.io' },
})
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly gamesService: GamesService,
        private readonly playersService: PlayersService,
    ) {}
    @WebSocketServer()
    server: Server;

    private clients = new Map<string, Socket>();

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
        let game = await this.gamesService.get(gameCode);

        let player = await this.playersService.getByClient(client.id);
        if (!player) {
            player = await this.playersService.get(gameCode, code);

            if (!player) {
                this.errorLogger('no such player in this game');
            }

            player = await this.playersService.save({
                code,
                gameCode,
                client: client.id,
            });

            game = await this.gamesService.get(gameCode);
        } else if (player.game.code !== game.code) {
            this.errorLogger('player in another game');
        }

        return { game, player };
    }

    send(clientIds: string[], name: string, data: unknown) {
        const clients = clientIds.map((clientId) => this.clients.get(clientId)).filter(client => !!client);

        if (clients.length !== clientIds.length) {
            this.errorLogger('клиенты старые')
        }

        clients.forEach((client) => client.emit(name, data));
    }

    @SubscribeMessage('enter-the-game')
    async enterGame(client: Socket, payload: SavePlayerDto) {
        const { gameCode, playersCount } = payload;

        let game = await this.gamesService.get(gameCode);

        if (!game) {
            game = await this.gamesService.save({
                code: gameCode,
                playersCount,
                currentOrder: 1,
            });
        }

        let player = await this.playersService.getByClient(client.id);
        if (!player) {
            player = await this.playersService.save(
                {
                    ...payload,
                    client: client.id,
                    isAdmin: game.players.length === 0,
                },
                game.players.length < game.playersCount,
            );
        }

        game = await this.gamesService.get(gameCode);

        if (game.status === GameStatus.NEW && game.playersCount === game.players.length) {
            game = await this.gamesService.start(gameCode);

            this.send(
                game.players.map(({ client }) => client),
                'game',
                game,
            );
        }
        this.logger(`${client.id} enter the game ${game.code} as ${player.code}`);
    }

    @SubscribeMessage('get-game')
    async getGame(client: Socket, payload: SavePlayerDto) {
        const { gameCode, code } = payload;

        const { game } = await this.getGameAndPlayer(client, gameCode, code);

        this.send([client.id], 'game', game);
    }

    @SubscribeMessage('save-combination')
    async saveCombination(client: Socket, payload: SaveCombinationDto) {
        const { gameCode, code, column, row } = payload;

        let { game, player } = await this.getGameAndPlayer(client, gameCode, code);

        if (game.status !== GameStatus.IN_PROGRESS) {
            this.errorLogger('игра не запущена');
        }

        if (player.order !== game.currentOrder) {
            this.errorLogger('не твоя очередь!!1!!!11');
        }

        const { table, currentPlayerInfo, currentDicesInfo } = saveCombination(game, player, { column, row });

        await this.playersService.save({
            code,
            gameCode,
            client: client.id,
            table,
            currentPlayerInfo,
        });

        await this.gamesService.save({
            code: gameCode,
            currentOrder: game.currentOrder + 1 > game.playersCount ? 1 : game.currentOrder + 1,
            currentDicesInfo,
        });

        game = await this.gamesService.get(gameCode);

        this.send(
            game.players.map(({ client }) => client),
            'game',
            game,
        );
        this.logger(`${client.id} save combination`);
    }

    @SubscribeMessage('shake')
    async shake(client: Socket, payload: ShakeDto) {
        const { gameCode, code, savedDices } = payload;

        let { game, player } = await this.getGameAndPlayer(client, gameCode, code);

        if (game.status !== GameStatus.IN_PROGRESS) {
            this.errorLogger('игра не запущена');
        }

        if (player.order !== game.currentOrder) {
            console
            this.errorLogger('не твоя очередь!!1!!!11');
        }

        if (game.currentDicesInfo.shakeCount >= 3) {
            this.errorLogger('перебросы закончились');
        }

        const { currentDicesInfo } = shake(game, savedDices);

        await this.gamesService.save({
            code: gameCode,
            currentDicesInfo,
        });

        game = await this.gamesService.get(gameCode);

        this.send(
            game.players.map(({ client }) => client),
            'game',
            game,
        );
        this.logger(`${client.id} saked dices`);
    }
}
