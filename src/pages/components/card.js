function renderStars(rating, starSize, { max = 5, gap = 4 } = {}) {
  const stars = Array.from({ length: max }, (_, i) => {
    const fill = Math.min(1, Math.max(0, rating - i));

    if (fill >= 1) {
      return `<img src="../images/star_filled.svg" width="${starSize}" height="${starSize}" draggable="false">`;
    }

    if (fill <= 0) {
      return `<img src="../images/star_blank.svg" width="${starSize}" height="${starSize}" draggable="false">`;
    }

    return `
      <div style="position:relative; width:${starSize}px; height:${starSize}px; flex-shrink:0;">
        <img src="../images/star_blank.svg"  width="${starSize}" height="${starSize}" draggable="false">
        <img src="../images/star_filled.svg" width="${starSize}" height="${starSize}" draggable="false"
             style="position:absolute; top:0; left:0; clip-path:inset(0 ${((1 - fill) * 100).toFixed(1)}% 0 0);">
      </div>`;
  }).join('');

  return `
    <div class="star-rating">
      ${stars}
      <span class="star-label">${rating.toFixed(1)}</span>
    </div>`;
}

export function createCard({
  name,
  description,
  placeId,
  imageUrl,
  author,
  rating = 0,
  verifiedIcon,
  verified
}) {
  const card = document.createElement('div');
  card.classList.add('card');

  const starSize = 35;

  card.innerHTML = `
    <div class="card-header">
      <img src="${imageUrl}" alt="${name}" class="card-img" draggable="false">
      ${renderStars(rating, starSize)}
    </div>

    <div class="card-content">
      <h3 class="card-title">${name}</h3>
      <div class="author-info">
        <p class="card-author">${author}
          <img src=${verifiedIcon} class="verified-badge" style="display: ${verified ? 'inline-block' : 'none'}; height: 15px" />
        </p>
      </div>
      <p class="card-description">${description}</p>
      <div>
        <button class="card-play">Play</button>
      </div>
    </div>
  `;

  card.querySelector('.card-play').addEventListener('click', () => {
    window.electronAPI.openRoblox(placeId);
  });

  return card;
}