import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLogging1778044917613 implements MigrationInterface {
    name = 'AddLogging1778044917613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_role"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_role_permissions_roleId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_role_permissions_permissionId"`);
        await queryRunner.query(`CREATE TABLE "suspicious_user" ("suspiciousUserId" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "group" character varying NOT NULL, "reason" character varying NOT NULL, "score" integer NOT NULL, "actionCount" integer NOT NULL, "firstSeen" TIMESTAMP NOT NULL, "lastSeen" TIMESTAMP NOT NULL, "resolved" boolean NOT NULL DEFAULT false, "resolvedAt" TIMESTAMP, CONSTRAINT "PK_a2c188cbe4ee502409ca60c91ea" PRIMARY KEY ("suspiciousUserId"))`);
        await queryRunner.query(`CREATE TABLE "log_entry" ("logEntryId" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "group" character varying NOT NULL, "action" character varying, "payload" text, "ipAddress" character varying, "timestamp" TIMESTAMP NOT NULL, CONSTRAINT "PK_e60c3df39791dbf29af8fd7a594" PRIMARY KEY ("logEntryId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON "role_permissions" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("roleId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "role"("roleId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permission"("permissionId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_06792d0c62ce6b0203c03643cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"`);
        await queryRunner.query(`DROP TABLE "log_entry"`);
        await queryRunner.query(`DROP TABLE "suspicious_user"`);
        await queryRunner.query(`CREATE INDEX "IDX_role_permissions_permissionId" ON "role_permissions" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_role_permissions_roleId" ON "role_permissions" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permissionId") REFERENCES "permission"("permissionId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("roleId") REFERENCES "role"("roleId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_user_role" FOREIGN KEY ("roleId") REFERENCES "role"("roleId") ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

}
