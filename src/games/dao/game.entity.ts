import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { GameStatus } from '../enums/game-status.enum';
import { PlayerEntity } from './player.entity';
import { CurrentDicesInfo } from './current-dices-info.type';

@Entity('games')
export class GameEntity {
    @PrimaryColumn()
    public code: string;

    @CreateDateColumn()
    public createdAt: Date;

    @Column({
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.NEW,
    })
    public status: GameStatus;

    @Column({
        name: 'players_count',
        type: 'int',
        default: 2
    })
    public playersCount?: number;

    @Column({
        name: 'current_order',
        type: 'int'
    })
    public currentOrder: number;

    @Column({
        name: 'current_dices_info',
        type: 'jsonb',
        nullable: true,
    })
    public currentDicesInfo?: CurrentDicesInfo;

    @OneToMany(() => PlayerEntity, (player) => player.game, {
        cascade: true,
    })
    public players: PlayerEntity[];
}
