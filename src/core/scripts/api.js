const TTL_MS = 1000 * 60 * 60;

function toInt(a) {
    return parseInt(a);
}

function getCached(key, fetchFn) {
    try {
        const cached = JSON.parse(localStorage.getItem(key));

        if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
            console.log(`[CACHE HIT] ${key}`);
            return Promise.resolve(cached.data);
        }
    } catch { }

    console.log(`[CACHE MISS] ${key} — fetching...`);

    return fetchFn().then(data => {
        try {
            localStorage.setItem(
                key,
                JSON.stringify({
                    data,
                    fetchedAt: Date.now()
                })
            );
        } catch (err) {
            console.warn(`[CACHE] Failed to save ${key}:`, err);
        }

        return data;
    });
}

export async function getUniverseId(placeId) {
    return getCached(`universe_${placeId}`, async () => {
        const res = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
        if (!res.ok) throw new Error(`Failed to get universeId for placeId ${placeId}`);
        const data = await res.json();
        // return parseInt(data.universeId);

        return Number(data.universeId);
    });
}

export async function fetchGameDetails(universeId) {
    return getCached(`details_${universeId}`, async () => {
        const res = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
        if (!res.ok) throw new Error(`Failed to get game data for universeId ${universeId}`);
        const data = await res.json();
        return data.data[0];
    });
}

export async function fetchThumbnail(universeId) {
    var idToInt = parseInt(universeId)
    return getCached(`thumb_${idToInt}`, async () => {
        const res = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${idToInt}&size=512x512&format=Png&type=Circle`);
        const data = await res.json();
        console.log(data)
        return data.data[0]?.imageUrl || '';
    });
}