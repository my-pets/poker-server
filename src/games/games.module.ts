import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameEntity } from './dao/game.entity';
import { PlayerEntity } from './dao/player.entity';
import { GamesService } from './services/games.service';
import { PlayersService } from './services/players.service';
import { GamesGateway } from './games.getway';

@Module({
    imports: [TypeOrmModule.forFeature([GameEntity, PlayerEntity])],
    providers: [GamesService, PlayersService, GamesGateway],
})
export class GamesModule {}
