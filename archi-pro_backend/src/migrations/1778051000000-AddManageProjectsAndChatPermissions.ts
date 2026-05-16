import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManageProjectsAndChatPermissions1778051000000 implements MigrationInterface {
    name = 'AddManageProjectsAndChatPermissions1778051000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const permissionRows = [
            ['MANAGE_PROJECTS', 'Manage projects'],
            ['CHAT', 'Chat'],
        ];

        for (const [code, description] of permissionRows) {
            await queryRunner.query(
                `INSERT INTO "permission" ("permissionId", "code", "description")
                 SELECT uuid_generate_v4(), $1::varchar, $2::varchar
                 WHERE NOT EXISTS (SELECT 1 FROM "permission" WHERE "code" = $1::varchar)`,
                [code, description],
            );
        }

        await queryRunner.query(`
            INSERT INTO "role_permissions" ("roleId", "permissionId")
            SELECT r."roleId", p."permissionId"
            FROM "role" r
            INNER JOIN "permission" p ON p."code" = 'MANAGE_PROJECTS'
            WHERE r."name" = 'ADMIN'
            ON CONFLICT DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO "role_permissions" ("roleId", "permissionId")
            SELECT r."roleId", p."permissionId"
            FROM "role" r
            INNER JOIN "permission" p ON p."code" = 'CHAT'
            WHERE r."name" IN ('USER', 'ADMIN')
            ON CONFLICT DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "role_permissions"
            WHERE "permissionId" IN (
                SELECT "permissionId" FROM "permission" WHERE "code" IN ('MANAGE_PROJECTS', 'CHAT')
            )
        `);

        await queryRunner.query(`DELETE FROM "permission" WHERE "code" IN ('MANAGE_PROJECTS', 'CHAT')`);
    }
}
