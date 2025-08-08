import { Expose } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { GameStatus } from '../enums/game-status.enum';
import { CurrentDicesInfo } from '../dao/current-dices-info.type';

export class SaveGameDto {
    @Expose()
    @IsString()
    @Length(5, 5)
    public code: string;

    @Expose()
    @IsOptional()
    @IsNumber()
    public currentOrder?: number;

    @Expose()
    @IsOptional()
    @IsEnum({ enum: GameStatus })
    public status?: GameStatus;

    @Expose()
    @IsOptional()
    @IsNumber()
    public playersCount?: number;

    @Expose()
    @IsOptional()
    public table?: string[][];

    @Expose()
    @IsOptional()
    public currentDicesInfo?: CurrentDicesInfo;
}
