export function getJwtSecret() {
    return process.env.JWT_SECRET || 'dev-jwt-secret-change-me';
}

export function getJwtExpiresIn() {
    const jwtExpiresInRaw = (process.env.JWT_EXPIRES_IN ?? '').trim();
    return /^\d+$/.test(jwtExpiresInRaw)
        ? Number(jwtExpiresInRaw)
        : (jwtExpiresInRaw || '3600s');
}