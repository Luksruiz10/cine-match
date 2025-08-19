const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";


export async function searchMovies(query) {
  const res = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}`
  );
  const data = await res.json();
  return data.results;
}

export async function popularMovies() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?language=es-ES&page=1&api_key=${TMDB_API_KEY}`
  );
  const data = await res.json();
  return data.results;
}

// Obtener imágenes de una película
export const getMovieImages = async (id) => {
  const res = await fetch(`${TMDB_BASE_URL}/movie/${id}/images?api_key=${TMDB_API_KEY}`);
  return res.json();
};

// Obtener plataformas de streaming
export const getMovieProviders = async (id, countryCode = "ES") => {
  const res = await fetch(`${TMDB_BASE_URL}/movie/${id}/watch/providers?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  return data.results[countryCode]?.flatrate || [];
};


export async function upcomingMovies(limit = 20) {
  const today = new Date();
  let allResults = [];
  let page = 1;
  const totalPages = 10; // Número máximo de páginas que queremos consultar

  while (allResults.length < limit && page <= totalPages) {
    const res = await fetch(
      `${TMDB_BASE_URL}/movie/upcoming?language=es-ES&page=${page}&api_key=${TMDB_API_KEY}`
    );
    const data = await res.json();
    if (!data.results) break;

    // Filtrar solo estrenos futuros y en inglés
    const futureMovies = data.results.filter(
      (movie) =>
        movie.release_date &&
        new Date(movie.release_date) > today &&
        movie.original_language === "en"
    );

    allResults = allResults.concat(futureMovies);
    page++;
  }

  // Ordenar por fecha de estreno próxima
  allResults.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

  // Limitar al número solicitado
  return allResults.slice(0, limit);
}
