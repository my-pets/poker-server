import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GameEntity } from '../dao/game.entity';
import { SaveGameDto } from '../dto/save-game.dto';
import { GameStatus } from '../enums/game-status.enum';
import { DEFAULT_CURRENT_DICES_INFO, DEFAULT_CURRENT_PLAYER_INFO, DEFAULT_TABLE } from '../constants';

@Injectable()
export class GamesService {
    constructor(
        @InjectRepository(GameEntity)
        private readonly repository: Repository<GameEntity>,
    ) {}

    public get(code: string): Promise<GameEntity | null> {
        return this.repository.findOne({
            where: { code },
            relations: {
                players: true,
            },
        });
    }

    public async save(data: SaveGameDto): Promise<GameEntity> {
        const game = await this.repository.save(data);

        return this.get(game.code);
    }

    public async start(code: string): Promise<GameEntity> {
        const existedGame = await this.get(code);

        if (existedGame.status !== GameStatus.NEW) {
            if (existedGame.status === GameStatus.IN_PROGRESS) {
                throw new ConflictException('игра уже запущена');
            }
            throw new ConflictException('игра уже завершена');
        }

        if (existedGame.playersCount !== existedGame.players.length) {
            throw new ConflictException('не хватает людей');
        }

        const game = await this.repository.save({
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

        return this.get(game.code);
    }
}
