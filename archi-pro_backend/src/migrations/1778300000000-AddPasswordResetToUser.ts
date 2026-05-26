import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPasswordResetToUser1778300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'password_reset_token_hash',
                type: 'varchar',
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'password_reset_expires_at',
                type: 'timestamp',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('user', 'password_reset_expires_at');
        await queryRunner.dropColumn('user', 'password_reset_token_hash');
    }
}