import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { GameEntity } from './game.entity';
import { CurrentPlayerInfo } from './current-player-info.type';

@Entity('players')
export class PlayerEntity {
    @PrimaryColumn()
    public code: string;

    @Index()
    @Column({
        nullable: true,
    })
    public client?: string;

    @Column({
        type: 'jsonb',
        nullable: true,
    })
    public table?: string[][];

    @Column({ name: 'is_admin' })
    public isAdmin?: boolean;

    @Column({
        nullable: true,
    })
    public order?: number;

    @Column({
        name: 'current_player_info',
        type: 'jsonb',
        nullable: true,
    })
    public currentPlayerInfo?: CurrentPlayerInfo;

    @Index()
    @ManyToOne(() => GameEntity, (item) => item.players, {
        orphanedRowAction: "nullify",
    })
    @JoinColumn({
        name: 'game_code',
        referencedColumnName: 'code',
    })
    public game?: GameEntity;

    @RelationId<PlayerEntity>(({ game }) => game)
    public gameCode?: string;
}
