import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GameEntity } from '../dao/game.entity';
import { SaveGameDto } from '../dto/save-game.dto';
import { GameStatus } from '../enums/game-status.enum';
import { DEFAULT_CURRENT_DICES_INFO, DEFAULT_CURRENT_PLAYER_INFO, DEFAULT_TABLE } from '../constants';
import { PlayerEntity } from '../dao/player.entity';

@Injectable()
export class GamesService {
    private gamesCache = new Map<string, GameEntity>();

    constructor(
        @InjectRepository(GameEntity)
        private readonly repository: Repository<GameEntity>,
    ) {}

    async loadCache() {
        const games = await this.repository.find({
            relations: {
                players: true,
            },
        });
        games.forEach((game) => {
            this.gamesCache.set(game.code, game);
        });
    }

    public getFromCache(code: string) {
        return this.gamesCache.get(code);
    }

    public updatePlayersCache(code: string, playerData: PlayerEntity): GameEntity {
        const game = this.gamesCache.get(code);

        const updatedPlayers: PlayerEntity[] = [...game.players];
        let isNew = true;
        for (let i = 0; i < updatedPlayers.length; i++) {
            if (updatedPlayers[i].code === playerData.code) {
                isNew = false;
                updatedPlayers[i] = playerData;
                break;
            }
        }

        if (isNew) {
            updatedPlayers.push(playerData);
        }

        this.gamesCache.set(code, {
            ...game,
            players: updatedPlayers,
        });

        return this.gamesCache.get(code);
    }

    public get(code: string): Promise<GameEntity | null> {
        return this.repository.findOne({
            where: { code },
            relations: {
                players: true,
            },
        });
    }

    public async create(data: SaveGameDto): Promise<GameEntity> {
        await this.repository.save(data);

        const game = await this.get(data.code);

        this.gamesCache.set(game.code, game);

        return game;
    }

    public async update(code: string, data: Partial<GameEntity>): Promise<GameEntity> {
        await this.repository.update({ code }, data);

        const game = await this.get(code);

        this.gamesCache.set(game.code, game);

        return game;
    }

    public async start(code: string): Promise<GameEntity> {
        const existedGame = this.getFromCache(code);

        if (existedGame.status !== GameStatus.NEW) {
            if (existedGame.status === GameStatus.IN_PROGRESS) {
                throw new ConflictException('игра уже запущена');
            }
            throw new ConflictException('игра уже завершена');
        }

        if (existedGame.playersCount !== existedGame.players.length) {
            throw new ConflictException('не хватает людей');
        }

        await this.repository.save({
            code,
            status: GameStatus.IN_PROGRESS,
            currentDicesInfo: DEFAULT_CURRENT_DICES_INFO,
            players: existedGame.players.map((player, i) => ({
                ...player,
                order: i + 1,
                table: DEFAULT_TABLE,
                currentPlayerInfo: DEFAULT_CURRENT_PLAYER_INFO,
            })),
        });

        const game = await this.get(code);

        this.gamesCache.set(game.code, game);

        return game;
    }
}
