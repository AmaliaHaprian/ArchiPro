import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddWebAuthnToUser1778200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'webauthn_credential_id',
                type: 'varchar',
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'webauthn_public_key',
                type: 'text',
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'webauthn_counter',
                type: 'int',
                default: 0,
            })
        );

        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'webauthn_enabled',
                type: 'boolean',
                default: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('user', 'webauthn_enabled');
        await queryRunner.dropColumn('user', 'webauthn_counter');
        await queryRunner.dropColumn('user', 'webauthn_public_key');
        await queryRunner.dropColumn('user', 'webauthn_credential_id');
    }
}
