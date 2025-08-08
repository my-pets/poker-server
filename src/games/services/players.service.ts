import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlayerEntity } from '../dao/player.entity';

@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(PlayerEntity)
        private readonly repository: Repository<PlayerEntity>,
    ) {}

    public getByClient(client: string): Promise<PlayerEntity | null> {
        return this.repository.findOne({
            where: { client },
            relations: {
                game: true,
            }
        });
    }

    public getList(gameCode: string): Promise<PlayerEntity[]> {
        return this.repository.find({
            where: { game: { code: gameCode } },
        });
    }

    public async save(data: Partial<PlayerEntity>, canBeNew: boolean = true): Promise<PlayerEntity> {
        const { gameCode, code, client } = data;
        let player: Partial<PlayerEntity> | null = await this.get(gameCode, code);

        if (player) {
            await this.repository.update({
                code: player.code,
            }, {
                client,
                currentPlayerInfo: data.currentPlayerInfo,
                isAdmin: data.isAdmin,
                table: data.table,
                game: {
                    code: gameCode,
                }
            })
            return await this.get(gameCode, code);
        }

        if (!canBeNew) {
            throw new ConflictException('больше нет мест :c');
        }

        player = await this.repository.save({
            ...data,
            game: {
                code: gameCode,
            }
        });

        return this.getByClient(client);
    }

    public get(gameCode: string, code: string): Promise<PlayerEntity | null> {
        return this.repository.findOne({
            where: { game: { code: gameCode }, code },
        });
    }
}
