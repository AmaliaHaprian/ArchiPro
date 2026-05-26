import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777374568707 implements MigrationInterface {
    name = 'InitialSchema1777374568707'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" ADD "userUserId" uuid`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_3c6a09ffdd424f3c528828e06a1" FOREIGN KEY ("userUserId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_3c6a09ffdd424f3c528828e06a1"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "userUserId"`);
    }

}
