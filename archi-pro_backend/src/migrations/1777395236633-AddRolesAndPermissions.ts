import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRolesAndPermissions1777395236633 implements MigrationInterface {
    name = 'AddRolesAndPermissions1777395236633'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "permission" ("permissionId" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_permission_code" UNIQUE ("code"), CONSTRAINT "PK_permission_id" PRIMARY KEY ("permissionId"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "role" ("roleId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_role_name" UNIQUE ("name"), CONSTRAINT "PK_role_id" PRIMARY KEY ("roleId"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "role_permissions" ("roleId" uuid NOT NULL, "permissionId" uuid NOT NULL, CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_role_permissions_roleId" ON "role_permissions" ("roleId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_role_permissions_permissionId" ON "role_permissions" ("permissionId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "roleId" uuid`);

        const permissionRows = [
            ['PROJECT_VIEW', 'View projects'],
            ['PROJECT_CREATE', 'Create projects'],
            ['PROJECT_UPDATE', 'Update projects'],
            ['PROJECT_DELETE', 'Delete projects'],
            ['USER_MANAGE', 'Manage users'],
            ['ROLE_MANAGE', 'Manage roles'],
            ['PERMISSION_MANAGE', 'Manage permissions'],
        ];

        for (const [code, description] of permissionRows) {
            await queryRunner.query(
                `INSERT INTO "permission" ("permissionId", "code", "description")
                 SELECT uuid_generate_v4(), $1::varchar, $2::varchar
                 WHERE NOT EXISTS (SELECT 1 FROM "permission" WHERE "code" = $1::varchar)`,
                [code, description],
            );
        }

        await queryRunner.query(
            `INSERT INTO "role" ("roleId", "name", "description")
             SELECT uuid_generate_v4(), 'USER', 'Restricted access to project workspace'
             WHERE NOT EXISTS (SELECT 1 FROM "role" WHERE "name" = 'USER')`,
        );

        await queryRunner.query(
            `INSERT INTO "role" ("roleId", "name", "description")
             SELECT uuid_generate_v4(), 'ADMIN', 'Full access to the whole system'
             WHERE NOT EXISTS (SELECT 1 FROM "role" WHERE "name" = 'ADMIN')`,
        );

        await queryRunner.query(`
            INSERT INTO "role_permissions" ("roleId", "permissionId")
            SELECT r."roleId", p."permissionId"
            FROM "role" r
            CROSS JOIN "permission" p
            WHERE r."name" = 'ADMIN'
            ON CONFLICT DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO "role_permissions" ("roleId", "permissionId")
            SELECT r."roleId", p."permissionId"
            FROM "role" r
            INNER JOIN "permission" p ON p."code" IN ('PROJECT_VIEW', 'PROJECT_CREATE', 'PROJECT_UPDATE', 'PROJECT_DELETE')
            WHERE r."name" = 'USER'
            ON CONFLICT DO NOTHING
        `);

        await queryRunner.query(`
            UPDATE "user"
            SET "roleId" = (
                SELECT "roleId" FROM "role" WHERE "name" = 'USER' LIMIT 1
            )
            WHERE "roleId" IS NULL
        `);

        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "roleId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_user_role" FOREIGN KEY ("roleId") REFERENCES "role"("roleId") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("roleId") REFERENCES "role"("roleId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permissionId") REFERENCES "permission"("permissionId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "FK_role_permissions_permission"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "FK_role_permissions_role"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "FK_user_role"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "roleId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_role_permissions_permissionId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_role_permissions_roleId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "role"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "permission"`);
    }
}