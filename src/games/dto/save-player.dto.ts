import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { CurrentPlayerInfo } from '../dao/current-player-info.type';

export class SavePlayerDto {
    @Expose()
    @IsString()
    @Length(5, 5)
    public gameCode: string;

    @Expose()
    @IsString()
    public code: string;

    @Expose()
    @IsOptional()
    @IsString()
    public client?: string;

    @Expose()
    @IsOptional()
    @IsNumber()
    public playersCount?: number;

    @Expose()
    @IsOptional()
    public currentPlayerInfo?: CurrentPlayerInfo;
}
