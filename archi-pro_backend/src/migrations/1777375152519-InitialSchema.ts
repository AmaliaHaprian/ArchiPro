import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777375152519 implements MigrationInterface {
    name = 'InitialSchema1777375152519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "userId" TO "id"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "PK_d72ea127f30e21753c9e229891e" TO "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "project" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "PK_cace4a159ff9f2512dd42373760" TO "PK_d72ea127f30e21753c9e229891e"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "id" TO "userId"`);
    }

}
