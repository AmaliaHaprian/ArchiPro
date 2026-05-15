import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { LogEntry } from './LogEntry';
import { SuspiciousUser } from './SuspiciousUser';

export type LoggedAction = {
    userId?: string | null;
    group?: 'ADMIN' | 'USER';
    action: string;
    payload?: unknown;
    ipAddress?: string | null;
    timestamp?: Date;
};

@Injectable()
export class LoggingService {
    constructor(
        @InjectRepository(LogEntry)
        private readonly logEntryRepository: Repository<LogEntry>,
        @InjectRepository(SuspiciousUser)
        private readonly suspiciousUserRepository: Repository<SuspiciousUser>,
    ) {}

    async recordAction(action: LoggedAction) {
        const entry = new LogEntry(
            action.userId ?? '',
            action.group ?? 'USER',
            action.action,
            action.payload == JSON.stringify(action.payload) ? String(action.payload) : JSON.stringify(action.payload),
            action.ipAddress ?? '',
            action.timestamp ?? new Date(),
        );

        const savedEntry = await this.logEntryRepository.save(entry);
        if (savedEntry.userId) {
            await this.refreshSuspicionForUser(savedEntry.userId, savedEntry.group);
        }

        return savedEntry;
    }

    async getLogs(userId?: string) {
        return userId
            ? this.logEntryRepository.find({ where: { userId }, order: { timestamp: 'DESC' } })
            : this.logEntryRepository.find({ order: { timestamp: 'DESC' } });
    }

    async getObservations(resolved?: boolean) {
        const where = typeof resolved === 'boolean' ? { resolved } : {};
        return this.suspiciousUserRepository.find({ where, order: { lastSeen: 'DESC' } });
    }

    async resolveObservation(id: string) {
        const observation = await this.suspiciousUserRepository.findOne({ where: { id } });
        if (!observation) {
            return null;
        }

        observation.resolved = true;
        observation.resolvedAt = new Date();
        return this.suspiciousUserRepository.save(observation);
    }

    private async refreshSuspicionForUser(userId: string, group: 'ADMIN' | 'USER') {
        // take all the logs for the user in the last 10 minutes
        // we look for patterns like:
        // the total score of actions in the window time is above a threshold of 10
        // there are more than 12 actions in the window time
        // there are more than 3 delete actions in the window time
        // there are more than 2 failed login attempts in the window time
        // there are more than 2 spam-like actions in the window time
        // there are more than 3 IP address changes in the window time and at least 3 logs
        // there are more than 2 large payloads in the window time
        // there are more than 5 permission errors in the window time of a user trying to access resources they don't have permissions for

        const windowStart = new Date(Date.now() - 10 * 60 * 1000);
        const recentLogs = await this.logEntryRepository.find({
            where: { userId, timestamp: Between(windowStart, new Date()) },
            order: { timestamp: 'ASC' },
        });

        const ipAddresses = recentLogs.map(log => log.ipAddress).filter(Boolean);
        const uniqueIPs = new Set(ipAddresses);
        const ipChanges = recentLogs.filter((log, idx) => 
        idx > 0 && log.ipAddress !== recentLogs[idx-1].ipAddress
        ).length;

        const largePayloads = recentLogs.filter(log => 
        log.payload && JSON.stringify(log.payload).length > 10000
        ).length;

        const permissionErrors = recentLogs.filter(log => 
        log.action.includes('ACCESS_DENIED') || log.action.includes('FORBIDDEN')
        ).length;

        const score = recentLogs.reduce((total, log) => total + this.weightForAction(log.action), 0);
        const actionCount = recentLogs.length;
        const deleteCount = recentLogs.filter(log => log.action.includes('DELETE')).length;
        const failedLoginCount = recentLogs.filter(log => log.action.includes('LOGIN_FAILED')).length;
        const spamCount = recentLogs.filter(log => log.action.includes('SPAM') || log.action.includes('FAKE_DATA')).length;

        const isSuspicious = 
            score >= 10 ||
            actionCount >= 12 || 
            deleteCount >= 3 || 
            failedLoginCount >= 2 || 
            spamCount >= 2 ||
            (ipChanges >= 3 && recentLogs.length >= 3) ||
            largePayloads >= 2 ||
            permissionErrors >= 5;
        
        // Check if user has an existing unresolved suspicious flag
        const existing = await this.suspiciousUserRepository.findOne({ where: { userId, resolved: false } });

        // If suspicious, create new flag or update existing
        if (isSuspicious) {
            const reason = this.buildReason(actionCount, score, deleteCount, failedLoginCount, spamCount);
            
            if (!existing) {
                await this.suspiciousUserRepository.save(this.suspiciousUserRepository.create({
                    userId,
                    group,
                    reason,
                    score,
                    actionCount,
                    firstSeen: recentLogs[0]?.timestamp ?? new Date(),
                    lastSeen: recentLogs[recentLogs.length - 1]?.timestamp ?? new Date(),
                    resolved: false,
                    resolvedAt: null,
                }));
            } else {
                existing.group = group;
                existing.reason = reason;
                existing.score = score;
                existing.actionCount = actionCount;
                existing.firstSeen = recentLogs[0]?.timestamp ?? existing.firstSeen;
                existing.lastSeen = recentLogs[recentLogs.length - 1]?.timestamp ?? new Date();
                await this.suspiciousUserRepository.save(existing);
            }
            return;
        }

        // If not suspicious but has existing flag, update lastSeen to track continued activity
        if (existing && recentLogs.length > 0) {
            existing.lastSeen = recentLogs[recentLogs.length - 1]?.timestamp ?? new Date();
            await this.suspiciousUserRepository.save(existing);
        }
    }

    private weightForAction(action: string) {
        if (action.includes('FAILED')) return 5;
        if (action.includes('DELETE')) return 4;
        if (action.includes('SPAM') || action.includes('FAKE_DATA')) return 4;
        if (action.includes('CREATE') || action.includes('UPDATE')) return 2;
        if (action.includes('CHAT')) return 1;
        return 1;
    }

    private buildReason(actionCount: number, score: number, deleteCount: number, failedLoginCount: number, spamCount: number) {
        const reasons = [
            `${actionCount} actions in 10 minutes`,
            `score ${score}`,
        ];

        if (deleteCount > 0) reasons.push(`${deleteCount} delete actions`);
        if (failedLoginCount > 0) reasons.push(`${failedLoginCount} failed login attempts`);
        if (spamCount > 0) reasons.push(`${spamCount} spam-like actions`);

        return reasons.join(', ');
    }
}
