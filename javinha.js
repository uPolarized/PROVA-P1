let animes = [];
let favoriteAnimes = JSON.parse(localStorage.getItem('favoriteAnimes')) || [];
let currentPage = 1;
const pageSize = 10;

async function fetchAnimes(page = 1) {
    const response = await fetch(`https://api.jikan.moe/v4/anime?page=${page}&limit=${pageSize}`);
    const data = await response.json();
    animes.push(...data.data);
    displayAnimes(animes);
}

function displayAnimes(animeArray) {
    const animeList = document.getElementById('animeList');
    animeList.innerHTML = '';

    animeArray.forEach(anime => {
        const animeItem = document.createElement('div');
        animeItem.className = 'anime-item';
        animeItem.innerHTML = `
            <h2 class="anime-title">${anime.title}</h2>
            <img class="anime-image" src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
            <p>Score: ${anime.score}</p>
            <p>Episodes: ${anime.episodes || 'N/A'}</p>
            <button class="favorite-button" data-anime-id="${anime.mal_id}">Favoritar</button>
        `;

        animeItem.querySelector('.anime-title').addEventListener('click', () => displayAnimeDetails(anime));
        animeItem.querySelector('.anime-image').addEventListener('click', () => displayAnimeDetails(anime));

        animeList.appendChild(animeItem);
    });

    updateFavoriteButtons();
}

function displayAnimeDetails(anime) {
    const animeDescription = document.getElementById('animeDescription');
    animeDescription.innerHTML = `
        <strong>Título:</strong> ${anime.title}<br>
        <strong>Score:</strong> ${anime.score}<br>
        <strong>Episodes:</strong> ${anime.episodes || 'N/A'}<br>
        <strong>Sinopse:</strong> ${anime.synopsis || 'Sem descrição disponível.'}
    `;
}

function displayFavoriteAnimes() {
    const favoriteList = document.getElementById('favorite-list');
    favoriteList.innerHTML = '';

    if (favoriteAnimes.length > 0) {
        favoriteAnimes.forEach((anime) => {
            const animeItem = document.createElement('div');
            animeItem.className = 'anime-item';
            animeItem.innerHTML = `
                <h2>${anime.title}</h2>
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                <p>Score: ${anime.score}</p>
                <p>Episodes: ${anime.episodes || 'N/A'}</p>
            `;

            animeItem.addEventListener('click', () => displayAnimeDetails(anime));

            favoriteList.appendChild(animeItem);
        });
    } else {
        favoriteList.innerHTML = '<p>Nenhum anime favorito encontrado.</p>';
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('favorite-button')) {
        const animeId = e.target.dataset.animeId;
        const anime = animes.find((anime) => anime.mal_id === parseInt(animeId));
        if (anime) {
            if (favoriteAnimes.some(favAnime => favAnime.mal_id === anime.mal_id)) {
                favoriteAnimes = favoriteAnimes.filter((favoriteAnime) => favoriteAnime.mal_id !== anime.mal_id);
            } else {
                favoriteAnimes.push(anime);
            }
            localStorage.setItem('favoriteAnimes', JSON.stringify(favoriteAnimes));
            updateFavoriteButtons();
            if (document.getElementById('favoriteAnimesTab').classList.contains('active')) {
                displayFavoriteAnimes();
            }
        }
    }
});

document.getElementById('allAnimesTab').addEventListener('click', () => {
    document.getElementById('animeListContainer').style.display = 'block';
    document.getElementById('favoriteListContainer').style.display = 'none';
    displayAnimes(animes);
    setActiveTab('allAnimesTab');
});

document.getElementById('favoriteAnimesTab').addEventListener('click', () => {
    document.getElementById('animeListContainer').style.display = 'none';
    document.getElementById('favoriteListContainer').style.display = 'block';
    displayFavoriteAnimes();
    setActiveTab('favoriteAnimesTab');
});

function setActiveTab(activeTabId) {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(activeTabId).classList.add('active');
}

function filterAnimes() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const selectedGenre = document.getElementById('genreSelect').value;

    const filteredAnimes = animes.filter(anime => {
        const titleMatch = anime.title.toLowerCase().includes(searchInput);
        const genreMatch = selectedGenre ? anime.genres.some(genre => genre.name === selectedGenre) : true;

        return titleMatch && genreMatch;
    });

    displayAnimes(filteredAnimes);
}

function updateFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-button');
    favoriteButtons.forEach(button => {
        const animeId = button.dataset.animeId;
        if (favoriteAnimes.some(favAnime => favAnime.mal_id === parseInt(animeId))) {
            button.textContent = 'Remover dos Favoritos';
        } else {
            button.textContent = 'Favoritar';
        }
    });
}

function handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        currentPage++;
        fetchAnimes(currentPage);
    }
}

window.addEventListener('scroll', handleScroll);

fetchAnimes();
