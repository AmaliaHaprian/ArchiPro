import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'log_entry' })
export class LogEntry {
    @PrimaryGeneratedColumn('uuid', { name: 'logEntryId' })
    id: string;

    @Column()
    userId: string;

    @Column()
    group: 'ADMIN' | 'USER';

    @Column({ type: 'varchar', nullable: true })
    action: string;

    @Column({ type: 'text', nullable: true })
    payload: string;

    @Column({ type: 'varchar', nullable: true })
    ipAddress: string;

    @Column({ type: 'timestamp' })
    timestamp: Date;

    constructor(userId: string, group: 'ADMIN' | 'USER' = 'USER', action = "", payload: string, ipAddress: string = "", timestamp = new Date()) {
        this.userId = userId;
        this.group = group;
        this.action = action;
        this.payload = payload;
        this.ipAddress = ipAddress;
        this.timestamp = timestamp;
    }
}