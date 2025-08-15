import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GameEntity } from '../dao/game.entity';
import { SaveGameDto } from '../dto/save-game.dto';
import { GameStatus } from '../enums/game-status.enum';
import { PlayerEntity } from '../dao/player.entity';
import { PlayersService } from './players.service';
import { GamesService } from './games.service';
import { saveCombination } from '../helpers/save-combination.helper';
import { DEFAULT_COMBS_NUMBER_END } from '../constants';
import { shake } from '../helpers/shake.helper';

type QueryType = {
    gameCode: string;
    code: string;
    playersCount?: number;
    client: string;
};

@Injectable()
export class ProcessService {
    constructor(
        private readonly gamesService: GamesService,
        private readonly playersService: PlayersService,
    ) {}

    errorLogger(msg: string) {
        console.log(msg);
        throw new Error(msg);
    }

    async enterGame({ gameCode, code, playersCount, client }: QueryType) {
        console.time('OF enter-the-game')
        let game = this.gamesService.getFromCache(gameCode);

        if (!game) {
            game = await this.gamesService.get(gameCode);

            if (!game) {
                game = await this.gamesService.create({
                    code: gameCode,
                    playersCount,
                    currentOrder: 1,
                });
            }
        }

        const player = await this.playersService.save(
            {
                gameCode,
                client,
                code,
            },
            true,
        );

        console.log(player);

        game = this.gamesService.updatePlayersCache(gameCode, player);
        console.log(game);

        if (game.status === GameStatus.NEW && game.playersCount === game.players.length) {
            game = await this.gamesService.start(gameCode);

            this.playersService.updateCache(game.players);
        }

        console.timeEnd('OF enter-the-game')
        return game;
    }

    async saveCombination({ gameCode, code, client }: QueryType, { column, row }: { column: number; row: number }) {
        
        console.time('OF save')
        let { game, player } = await this.getGameAndPlayer(gameCode, code, client);

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
                client,
                table,
                currentPlayerInfo,
            },
            gameCode,
        );

        const dataToUpdate: Partial<GameEntity> = {
            currentOrder: game.currentOrder + 1 > game.playersCount ? 1 : game.currentOrder + 1,
            currentDicesInfo,
        };

        if (game.players.every(({ currentPlayerInfo }) => currentPlayerInfo.combsNumber === DEFAULT_COMBS_NUMBER_END)) {
            dataToUpdate.status = GameStatus.ENDED;
        }

        game = await this.gamesService.update(gameCode, dataToUpdate);
        console.timeEnd('OF save')
        return game;
    }

    async shake({ gameCode, code, client }: QueryType, savedDices: boolean[]) {
        
        console.time('OF shake')
        let { game, player } = await this.getGameAndPlayer(gameCode, code, client);

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

        game = await this.gamesService.update(gameCode, {
            currentDicesInfo,
        });

        console.timeEnd('OF shake')
        return game;
    }

    private async getGameAndPlayer(gameCode: string, code: string, client: string) {
        let player = this.playersService.getFromCache(code);

        if (!player) {
            player = await this.playersService.get(code);
            if (!player) {
                this.errorLogger('player not exists');
            }
        }

        if (player.gameCode !== gameCode) {
            this.errorLogger('player in another game');
        }

        if (player.client !== client) {
            player = await this.playersService.update({
                code,
                client,
            });
            this.gamesService.updatePlayersCache(gameCode, player);
        }

        const game = this.gamesService.getFromCache(gameCode);

        return { game, player };
    }
}
