import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777371513829 implements MigrationInterface {
    name = 'InitialSchema1777371513829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."project_status_enum" AS ENUM('NOT_STARTED', 'PLANNING', 'IN_PROGRESS', 'DONE')`);
        await queryRunner.query(`CREATE TYPE "public"."project_category_enum" AS ENUM('RESIDENTIAL', 'LANDSCAPE', 'URBAN', 'MIXED_USE', 'CULTURAL', 'INFRASTRUCTURE', 'EDUCATIONAL', 'ENTERTAINMENT', 'HISTORIC')`);
        await queryRunner.query(`CREATE TYPE "public"."project_currentstage_enum" AS ENUM('PROJECT_BRIEF', 'SITE_ANALYSIS', 'RESEARCH', 'DESIGN', 'VISUALIZATION')`);
        await queryRunner.query(`CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "status" "public"."project_status_enum" NOT NULL, "category" "public"."project_category_enum" NOT NULL, "progress" integer NOT NULL, "description" character varying NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "createdAt" date NOT NULL, "updatedAt" date NOT NULL, "currentStage" "public"."project_currentstage_enum" NOT NULL, "workingHours" integer NOT NULL, "stageData" jsonb NOT NULL, "userUserId" uuid, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_3c6a09ffdd424f3c528828e06a1" FOREIGN KEY ("userUserId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_3c6a09ffdd424f3c528828e06a1"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP TYPE "public"."project_currentstage_enum"`);
        await queryRunner.query(`DROP TYPE "public"."project_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."project_status_enum"`);
    }

}
