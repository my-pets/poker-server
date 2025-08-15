import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlayerEntity } from '../dao/player.entity';
import { DEFAULT_CURRENT_PLAYER_INFO, DEFAULT_TABLE } from '../constants';

@Injectable()
export class PlayersService {
    private playersCache = new Map<string, PlayerEntity>();

    constructor(
        @InjectRepository(PlayerEntity)
        private readonly repository: Repository<PlayerEntity>,
    ) {}

    async loadCache() {
        const players = await this.repository.find();
        players.forEach((player) => {
            this.playersCache.set(player.code, player);
        });
    }

    public updateCache(playersData: PlayerEntity[]): void {
        playersData.forEach((playerData) => {
            this.playersCache.set(playerData.code, playerData);
        });
    }

    public getFromCache(code: string) {
        return this.playersCache.get(code);
    }

    public getByClient(client: string): Promise<PlayerEntity | null> {
        return this.repository.findOne({
            where: { client },
            relations: {
                game: true,
            },
        });
    }

    public getList(gameCode: string): Promise<PlayerEntity[]> {
        return this.repository.find({
            where: { game: { code: gameCode } },
        });
    }

    public async create(data: Partial<PlayerEntity>, gameCode?: string): Promise<PlayerEntity> {
        await this.repository.save({
            code: data.code,
            client: data.client,
            table: DEFAULT_TABLE,
            currentPlayerInfo: DEFAULT_CURRENT_PLAYER_INFO,
            isAdmin: false,
            game: {
                code: gameCode,
            },
        });

        const player = await this.get(data.code);

        this.playersCache.set(player.code, player);

        return player;
    }

    public async save(data: Partial<PlayerEntity>, createNew: boolean = false): Promise<PlayerEntity> {
        const { gameCode, code } = data;
        let player: Partial<PlayerEntity> | null = await this.get(code);

        if (!player) {
            if (createNew) {
                return this.create(data, gameCode);
            }
            throw new BadRequestException('no player');
        }

        return this.update(data, gameCode);
    }

    public async update(data: Partial<PlayerEntity>, gameCode?: string): Promise<PlayerEntity> {
        await this.repository.update(
            {
                code: data.code,
            },
            {
                client: data.client,
                currentPlayerInfo: data.currentPlayerInfo,
                isAdmin: data.isAdmin,
                table: data.table,
                order: data.order,
                game: {
                    code: gameCode,
                },
            },
        );

        const player = await this.get(data.code);

        this.playersCache.set(player.code, player);

        return player;
    }

    public get(code: string, gameCode?: string, withRelations: boolean = false): Promise<PlayerEntity | null> {
        return this.repository.findOne({
            where: { game: { code: gameCode }, code },
            relations: withRelations
                ? {
                      game: true,
                  }
                : undefined,
        });
    }
}
