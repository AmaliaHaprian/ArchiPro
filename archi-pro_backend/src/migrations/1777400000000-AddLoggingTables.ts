import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoggingTables1777400000000 implements MigrationInterface {
    name = 'AddLoggingTables1777400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "log_entry" ("logEntryId" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying, "group" character varying NOT NULL, "action" character varying NOT NULL, "payload" text, "ipAddress" character varying, "timestamp" timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_log_entry_id" PRIMARY KEY ("logEntryId"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_log_entry_userId" ON "log_entry" ("userId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_log_entry_timestamp" ON "log_entry" ("timestamp")`);

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "suspicious_user" ("suspiciousUserId" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "group" character varying NOT NULL, "reason" character varying NOT NULL, "score" integer NOT NULL, "actionCount" integer NOT NULL, "firstSeen" timestamp NOT NULL, "lastSeen" timestamp NOT NULL, "resolved" boolean NOT NULL DEFAULT false, "resolvedAt" timestamp, CONSTRAINT "PK_suspicious_user_id" PRIMARY KEY ("suspiciousUserId"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_suspicious_user_active" ON "suspicious_user" ("userId") WHERE "resolved" = false`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_suspicious_user_resolved" ON "suspicious_user" ("resolved")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_suspicious_user_lastSeen" ON "suspicious_user" ("lastSeen")`);

        await queryRunner.query(`ALTER TABLE "log_entry" ADD CONSTRAINT "FK_log_entry_user" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "suspicious_user" ADD CONSTRAINT "FK_suspicious_user_user" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suspicious_user" DROP CONSTRAINT IF EXISTS "FK_suspicious_user_user"`);
        await queryRunner.query(`ALTER TABLE "log_entry" DROP CONSTRAINT IF EXISTS "FK_log_entry_user"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suspicious_user_lastSeen"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suspicious_user_resolved"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_suspicious_user_active"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "suspicious_user"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_log_entry_timestamp"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_log_entry_userId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "log_entry"`);
    }
}