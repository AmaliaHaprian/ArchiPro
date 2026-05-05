import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStoredProcedures1777394236633 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_overall_statistics_for_user(uid uuid)
RETURNS TABLE(
  totalProjects bigint,
  deadlines bigint,
  averageWorkingHours numeric,
  averageProgress numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE "status" = 'DONE'),
    AVG("workingHours"),
    AVG("progress")
  FROM "project"
  WHERE "userId" = uid;
END;
$$ LANGUAGE plpgsql;
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP FUNCTION IF EXISTS get_overall_statistics_for_user;`);
    }

}
