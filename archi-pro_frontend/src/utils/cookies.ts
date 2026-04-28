export function getCookieValue(key: string, defaultValue: string) {
    const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, c) => {
        const [k, v] = c.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
    }, {});
    return cookies[key] || defaultValue;
}
