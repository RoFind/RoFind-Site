import * as RobloxApi from "./api.js";
import { createCard } from '../../pages/components/card.js';

const cardContainer = document.getElementById('card-container');

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
                verifiedIcon: '../images/verifieduser.png',
                verified: game.verified === 1,
            });

            // re download if missing
            const img = card.querySelector('.card-img');
            img.addEventListener('error', async () => {
                console.warn(`[IMAGE MISSING] Re-downloading for placeId ${game.placeId}`);
                const freshUrl = await RobloxApi.fetchThumbnail(game.universeId);
                console.log(Number(game.universeId))
                const newPath = await window.imageAPI.download(freshUrl, game.universeId);
                img.src = `file://${newPath}`;
            });

            cardContainer.appendChild(card);
        } catch (err) {
            console.error(`[ERROR] placeId ${placeId}:`, err);
        }
    }
};