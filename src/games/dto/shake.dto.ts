import { Expose } from 'class-transformer';
import { IsArray, IsString, Length } from 'class-validator';

export class ShakeDto {
    @Expose()
    @IsString()
    @Length(5, 5)
    public gameCode: string;

    @Expose()
    @IsString()
    public code: string;

    @Expose()
    @IsArray()
    public savedDices: boolean[];
}
