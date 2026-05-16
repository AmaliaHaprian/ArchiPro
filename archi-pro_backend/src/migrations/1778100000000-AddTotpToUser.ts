import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTotpToUser1778100000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'totp_secret',
                type: 'varchar',
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'totp_enabled',
                type: 'boolean',
                default: false,
            })
        );

        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'totp_backup_codes',
                type: 'text',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('user', 'totp_backup_codes');
        await queryRunner.dropColumn('user', 'totp_enabled');
        await queryRunner.dropColumn('user', 'totp_secret');
    }
}
