import { Expose } from 'class-transformer';
import { IsNumber, IsString, Length } from 'class-validator';

export class SaveCombinationDto {
    @Expose()
    @IsString()
    @Length(5, 5)
    public gameCode: string;

    @Expose()
    @IsString()
    public code: string;

    @Expose()
    @IsNumber()
    public column: number;

    @Expose()
    @IsNumber()
    public row: number;
}
