import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1754606829883 implements MigrationInterface {
    name = 'Init1754606829883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "games" ("code" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."games_status_enum" NOT NULL DEFAULT 'new', "players_count" integer NOT NULL DEFAULT '2', "current_count" integer NOT NULL, CONSTRAINT "PK_6048911d5f44406ad25e44eaaed" PRIMARY KEY ("code"))`);
        await queryRunner.query(`CREATE TABLE "players" ("code" character varying NOT NULL, "client" character varying, "table" jsonb, "is_admin" boolean NOT NULL, "order" integer, "game_code" character varying, CONSTRAINT "PK_bf812cf01f74c9d7e77c5d58c98" PRIMARY KEY ("code"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7b5d33afe04bd80b1acb3aa0d5" ON "players" ("client") `);
        await queryRunner.query(`CREATE INDEX "IDX_8875ee624f7b48a6521fcda54c" ON "players" ("game_code") `);
        await queryRunner.query(`ALTER TABLE "players" ADD CONSTRAINT "FK_8875ee624f7b48a6521fcda54c4" FOREIGN KEY ("game_code") REFERENCES "games"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "FK_8875ee624f7b48a6521fcda54c4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8875ee624f7b48a6521fcda54c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7b5d33afe04bd80b1acb3aa0d5"`);
        await queryRunner.query(`DROP TABLE "players"`);
        await queryRunner.query(`DROP TABLE "games"`);
    }

}
