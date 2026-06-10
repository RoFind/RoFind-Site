import * as RobloxApi from "./api.js";
import { createCard } from './card.js';

const cardContainer = document.getElementById('card-container');

function formatCount(n) {
    if (!n || isNaN(n)) return '0';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
}

export const renderCards = async () => {
    const placeIds = await window.firebaseAPI.getGamePlaceIds();

    for (const placeId of placeIds) {
        try {
            let game = window.cacheDB.getGame(placeId);

            if (!game) {
                console.log(`[DB CACHE MISS] placeId: ${placeId} — fetching...`);

                const universeId = await RobloxApi.getUniverseId(Number(placeId));
                if (!universeId) {
                    console.warn(`[SKIP] placeId ${placeId} — no universeId, deleting.`);
                    await window.firebaseAPI.deleteGame(placeId);
                    window.cacheDB.deleteGame(placeId);
                    continue;
                }

                const [gameData, imageUrl, firestoreData] = await Promise.all([
                    RobloxApi.fetchGameDetails(universeId),
                    RobloxApi.fetchThumbnail(universeId),
                    window.firebaseAPI.getGameDetails(placeId),
                ]);

                if (!gameData) {
                    console.warn(`[SKIP] placeId ${placeId} — not found on Roblox, deleting.`);
                    await window.firebaseAPI.deleteGame(placeId);
                    window.cacheDB.deleteGame(placeId);
                    continue;
                }

                const author = gameData.creator?.type === 'User'
                    ? '@' + gameData.creator?.name
                    : gameData.creator?.name;

                await window.cacheDB.saveGame({
                    placeId,
                    universeId,
                    name: gameData.name,
                    description: gameData.description,
                    author: author || 'Unknown',
                    verified: gameData.creator?.hasVerifiedBadge ? 1 : 0,
                    playCount: gameData.visits,
                    rating: firestoreData?.user_rating ?? 0,
                }, imageUrl);

                game = window.cacheDB.getGame(placeId);
            }

            const card = createCard({
                name: game.name,
                description: game.description,
                placeId: game.placeId,
                imageUrl: `file://${game.imagePath}`,
                author: game.author,
                rating: game.rating,
                verifiedIcon: '../assets/verifieduser.png',
                playCount: formatCount(game.playCount ?? 0),
                verified: game.verified === 1,
            });

            const img = card.querySelector('.card-img');
            img.addEventListener('error', async () => {
                console.warn(`[IMAGE MISSING] Re-downloading for placeId ${game.placeId}`);
                const freshUrl = await RobloxApi.fetchThumbnail(game.universeId);
                const newPath = await window.imageAPI.download(freshUrl, game.universeId);
                img.src = `file://${newPath}`;
            });

            cardContainer.appendChild(card);
        } catch (err) {
            console.error(`[ERROR] placeId ${placeId}:`, err);
        }
    }
};