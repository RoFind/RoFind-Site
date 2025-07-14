export function createCard({
  name,
  description,
  placeId,
  imageUrl,
  author,
  starIcon,
  verifiedIcon,
  verified
}) {
  const card = document.createElement('div');
  card.classList.add('card');

  card.innerHTML = `
    <div class="card-header">
      <img src="${imageUrl}" alt="${name}" class="card-img" draggable="false">
     <svg width="30" height="150">
    <image href="${starIcon}" x="0" y="0" width="30" height="30" />
    <image href="${starIcon}" x="0" y="30" width="30" height="30" />
    <image href="${starIcon}" x="0" y="60" width="30" height="30" />
    <image href="${starIcon}" x="0" y="90" width="30" height="30" />
    <image href="${starIcon}" x="0" y="120" width="30" height="30" />
  </svg>
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