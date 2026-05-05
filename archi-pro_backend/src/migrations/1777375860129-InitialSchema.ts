import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777375860129 implements MigrationInterface {
    name = 'InitialSchema1777375860129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'userId') THEN ALTER TABLE "user" RENAME COLUMN "userId" TO "id"; END IF; END $$;`);
        await queryRunner.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PK_d72ea127f30e21753c9e229891e') THEN ALTER TABLE "user" RENAME CONSTRAINT "PK_d72ea127f30e21753c9e229891e" TO "PK_cace4a159ff9f2512dd42373760"; END IF; END $$;`);
        await queryRunner.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT IF EXISTS "FK_3c6a09ffdd424f3c528828e06a1"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT IF EXISTS "FK_7c4b0d3b77eaf26f8b4da879e63"`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "PK_cace4a159ff9f2512dd42373760" TO "PK_d72ea127f30e21753c9e229891e"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "id" TO "userId"`);
    }

}
