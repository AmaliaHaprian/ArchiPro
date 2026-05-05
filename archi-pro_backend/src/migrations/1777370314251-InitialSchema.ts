import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777370314251 implements MigrationInterface {
    name = 'InitialSchema1777370314251'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "user" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status_enum') THEN CREATE TYPE "public"."project_status_enum" AS ENUM('NOT_STARTED', 'PLANNING', 'IN_PROGRESS', 'DONE'); END IF; END $$;`);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_category_enum') THEN CREATE TYPE "public"."project_category_enum" AS ENUM('RESIDENTIAL', 'LANDSCAPE', 'URBAN', 'MIXED_USE', 'CULTURAL', 'INFRASTRUCTURE', 'EDUCATIONAL', 'ENTERTAINMENT', 'HISTORIC'); END IF; END $$;`);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_currentstage_enum') THEN CREATE TYPE "public"."project_currentstage_enum" AS ENUM('PROJECT_BRIEF', 'SITE_ANALYSIS', 'RESEARCH', 'DESIGN', 'VISUALIZATION'); END IF; END $$;`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "title" character varying NOT NULL, "status" "public"."project_status_enum" NOT NULL, "category" "public"."project_category_enum" NOT NULL, "progress" integer NOT NULL, "description" character varying NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "createdAt" date NOT NULL, "updatedAt" date NOT NULL, "currentStage" "public"."project_currentstage_enum" NOT NULL, "workingHours" integer NOT NULL, "stageData" jsonb NOT NULL, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"), CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63" FOREIGN KEY ("userId") REFERENCES "user" ("userId") ON DELETE CASCADE)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP TYPE "public"."project_currentstage_enum"`);
        await queryRunner.query(`DROP TYPE "public"."project_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."project_status_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
