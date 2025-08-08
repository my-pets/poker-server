import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInfos1754654006498 implements MigrationInterface {
    name = 'AddInfos1754654006498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "current_count"`);
        await queryRunner.query(`ALTER TABLE "games" ADD "current_order" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "games" ADD "current_dices_info" jsonb`);
        await queryRunner.query(`ALTER TABLE "players" ADD "current_player_info" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "current_player_info"`);
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "current_dices_info"`);
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "current_order"`);
        await queryRunner.query(`ALTER TABLE "games" ADD "current_count" integer NOT NULL`);
    }

}
