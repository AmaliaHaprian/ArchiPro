import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'suspicious_user' })
export class SuspiciousUser {
    @PrimaryGeneratedColumn('uuid', { name: 'suspiciousUserId' })
    id!: string;

    @Column({ type: 'varchar' })
    userId!: string;

    @Column({ type: 'varchar' })
    group!: 'ADMIN' | 'USER';

    @Column({ type: 'varchar' })
    reason!: string;

    @Column({ type: 'integer' })
    score!: number;

    @Column({ type: 'integer' })
    actionCount!: number;

    @Column({ type: 'timestamp' })
    firstSeen!: Date;

    @Column({ type: 'timestamp' })
    lastSeen!: Date;

    @Column({ type: 'boolean', default: false })
    resolved!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    resolvedAt!: Date | null;

    constructor(userId = '', group: 'ADMIN' | 'USER' = 'USER', reason = '', score = 0, actionCount = 0, firstSeen = new Date(), lastSeen = new Date(), resolved = false, resolvedAt: Date | null = null) {
        this.userId = userId;
        this.group = group;
        this.reason = reason;
        this.score = score;
        this.actionCount = actionCount;
        this.firstSeen = firstSeen;
        this.lastSeen = lastSeen;
        this.resolved = resolved;
        this.resolvedAt = resolvedAt;
    }
}