import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const CACHE_PREFIX = 'saro_api_cache_v1:';

const safeParse = (value) => {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const makeCacheKey = (url, config) => {
    const params = config?.params ? JSON.stringify(config.params) : '';
    return `${CACHE_PREFIX}${url}::${params}`;
};

const readCache = (key) => {
    const entry = safeParse(localStorage.getItem(key));
    if (!entry || typeof entry !== 'object') return null;
    if (typeof entry.t !== 'number') return null;
    return entry;
};

const writeCache = (key, data, ttlMs) => {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), ttlMs, data }));
};

const isFresh = (entry) => {
    const ttlMs = typeof entry.ttlMs === 'number' ? entry.ttlMs : 0;
    if (ttlMs <= 0) return false;
    return Date.now() - entry.t < ttlMs;
};

const inflight = new Map();

api.getCached = async (url, config = {}) => {
    const ttlMs = typeof config.ttlMs === 'number' ? config.ttlMs : 2 * 60 * 1000; // 2 min default
    const cacheKey = makeCacheKey(url, config);
    const cached = readCache(cacheKey);

    const offline = typeof navigator !== 'undefined' ? navigator.onLine === false : false;

    if (cached && (isFresh(cached) || offline)) {
        return { data: cached.data, cached: true };
    }

    if (inflight.has(cacheKey)) {
        return inflight.get(cacheKey);
    }

    const req = api.get(url, config)
        .then((res) => {
            writeCache(cacheKey, res.data, ttlMs);
            return { data: res.data, cached: false };
        })
        .finally(() => {
            inflight.delete(cacheKey);
        });

    inflight.set(cacheKey, req);
    return req;
};

api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
