export function createCard({
  name,
  description,
  placeId,
  imageUrl,
  author,
  verified
}) {
  const card = document.createElement('div');
  card.classList.add('card');

  card.innerHTML = `
    <div class="card-header">
      <img src="${imageUrl}" alt="${name}" class="card-img" draggable="false">
      <div class="rating">
        <!-- stars here -->
      </div>
    </div>
    <div class="card-content">
      <h3 class="card-title">${name}</h3>
      <div class="author-info">
        <p class="card-author">${author}
          <span class="verified-badge" style="display: ${verified ? 'inline-block' : 'none'};"></span>
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