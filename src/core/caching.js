// const CACHE_KEY = 'roblox-cache';
// const TTL_MS = 1000 * 60 * 60;

// function loadCache() {
//     try {
//         return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
//     } catch {
//         return {};
//     }
// }

// export function saveCache(cache) {
//     localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
// }

// export let cache = loadCache();

// export async function getCached(key, fetchFn) {
//     const cached = cache[key];
//     if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached.data;
//     const data = await fetchFn();
//     cache[key] = { data, fetchedAt: Date.now() };
//     saveCache(cache);
//     return data;
// }

// export async function fetchAndCacheImage(universeId, url) {
//     const filename = `thumb_${universeId}.jpg`;

//     if (window.imageAPI.exists(filename)) {
//         console.log(`[IMAGE CACHE HIT] ${filename}`);
//         return `file://${window.imageAPI.getPath(filename)}`;
//     }

//     console.log(`[IMAGE CACHE MISS] ${filename} — downloading...`);
//     const dest = await window.imageAPI.download(url, filename);
//     return `file://${dest}`;
// }