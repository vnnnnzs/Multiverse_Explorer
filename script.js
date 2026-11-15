// Elementos do HTML que serão utilizados pelo JavaScript.
const characterList = document.getElementById("character-list");
const feedback = document.getElementById("feedback");
const totalCount = document.getElementById("total-count");
const loadMoreButton = document.getElementById("load-more");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const searchButton = document.getElementById("search-button");

// Endereço inicial da API. A resposta traz até 20 personagens por página.
const API_URL = "https://rickandmortyapi.com/api/character";

let nextPageUrl = API_URL;

// Traduz o status recebido da API para português.
function translateStatus(status) {
  const translations = {
    Alive: "Vivo",
    Dead: "Morto",
    unknown: "Desconhecido"
  };

  return translations[status] || status;
}

// Cria um card usando os dados de um personagem.
function createCharacterCard(character) {
  // Cada card é criado dinamicamente; não existe card pronto no HTML.
  const card = document.createElement("article");
  card.classList.add("character-card");

  const image = document.createElement("img");
  image.src = character.image;
  image.alt = `Imagem de ${character.name}`;
  image.loading = "lazy";

  const info = document.createElement("div");
  info.classList.add("card-info");

  const name = document.createElement("h3");
  name.textContent = character.name;

  const statusLine = document.createElement("div");
  statusLine.classList.add("card-meta");

  const statusDot = document.createElement("span");
  statusDot.classList.add("status-dot");
  if (character.status === "Alive") statusDot.classList.add("alive");
  if (character.status === "Dead") statusDot.classList.add("dead");

  const statusText = document.createElement("span");
  statusText.textContent = `${translateStatus(character.status)} • ${character.species}`;

  const species = document.createElement("p");
  species.classList.add("card-species");
  species.textContent = `Origem: ${character.origin.name}`;

  statusLine.appendChild(statusDot);
  statusLine.appendChild(statusText);
  info.appendChild(name);
  info.appendChild(statusLine);
  info.appendChild(species);

  card.appendChild(image);
  card.appendChild(info);

  return card;
}

// Busca personagens na API e mostra os resultados na página.
async function loadCharacters(url, append = false) {
  feedback.textContent = "Carregando personagens...";
  loadMoreButton.hidden = true;

  if (!append) {
    characterList.innerHTML = "";
  }

  try {
    // fetch faz a requisição HTTP para a API.
    const response = await fetch(url);

    // Se a resposta não for bem-sucedida, mostramos um erro.
    if (!response.ok) {
      throw new Error("Não foi possível encontrar personagens.");
    }

    // Converte o conteúdo recebido para um objeto JavaScript.
    const data = await response.json();

    totalCount.textContent = data.info.count;
    nextPageUrl = data.info.next;

    if (data.results.length === 0) {
      feedback.textContent = "Nenhum personagem encontrado. Tente outra busca.";
      return;
    }

    // Percorre os personagens e adiciona cada card ao HTML.
    data.results.forEach((character) => {
      const card = createCharacterCard(character);
      characterList.appendChild(card);
    });

    feedback.textContent = `${data.results.length} personagens exibidos nesta página.`;
    loadMoreButton.hidden = !nextPageUrl;
  } catch (error) {
    feedback.textContent = "Ocorreu um erro ao carregar os dados. Tente novamente.";
    console.error("Erro na consulta da API:", error);
  }
}

// Pesquisa por nome e/ou status utilizando os filtros da própria API.
function searchCharacters() {
  const name = searchInput.value.trim();
  const status = statusFilter.value;

  const parameters = new URLSearchParams();

  if (name) parameters.set("name", name);
  if (status) parameters.set("status", status);

  const queryString = parameters.toString();
  const url = queryString ? `${API_URL}/?${queryString}` : API_URL;

  loadCharacters(url);
}

// Eventos dos botões e campos.
searchButton.addEventListener("click", searchCharacters);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchCharacters();
});

statusFilter.addEventListener("change", searchCharacters);

loadMoreButton.addEventListener("click", () => {
  if (nextPageUrl) loadCharacters(nextPageUrl, true);
});

// Carrega a primeira página assim que o JavaScript é executado.
loadCharacters(API_URL);
